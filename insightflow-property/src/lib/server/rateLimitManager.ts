/**
 * Rate Limit Manager for Groq API
 * Handles concurrent users, request queuing, and resource allocation
 */

interface QueuedRequest {
  id: string;
  userId: string;
  priority: 'high' | 'medium' | 'low';
  requestFn: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  createdAt: Date;
  estimatedTokens: number;
}

interface RateLimitConfig {
  requestsPerMinute: number;
  tokensPerMinute: number;
  requestsPerDay: number;
  maxConcurrentRequests: number;
  maxQueueSize: number;
}

interface UserUsage {
  requestsToday: number;
  tokensUsed: number;
  lastRequestTime: Date;
  requestsThisMinute: number;
  minuteWindow: Date;
}

export class RateLimitManager {
  private static instance: RateLimitManager;
  private queue: QueuedRequest[] = [];
  private activeRequests = 0;
  private userUsage = new Map<string, UserUsage>();
  private requestWindow: Date[] = [];
  private tokenWindow: { timestamp: Date; tokens: number }[] = [];
  
  // Groq Free Tier Limits (conservative estimates)
  private config: RateLimitConfig = {
    requestsPerMinute: 3, // Conservative: 4 official, use 3 for safety
    tokensPerMinute: 15000, // Conservative: 18k official, use 15k for safety
    requestsPerDay: 12000, // Conservative: 14.4k official, use 12k for safety
    maxConcurrentRequests: 2, // Prevent overwhelming the queue
    maxQueueSize: 50 // Maximum queued requests
  };

  private constructor() {
    // Start processing queue
    this.processQueue();
    
    // Clean up old usage data every hour
    setInterval(() => this.cleanupUsageData(), 60 * 60 * 1000);
  }

  public static getInstance(): RateLimitManager {
    if (!this.instance) {
      this.instance = new RateLimitManager();
    }
    return this.instance;
  }

  /**
   * Execute a request with rate limiting and queuing
   */
  public async executeWithRateLimit<T>(
    userId: string,
    requestFn: () => Promise<T>,
    options: {
      priority?: 'high' | 'medium' | 'low';
      estimatedTokens?: number;
      maxWaitTime?: number;
    } = {}
  ): Promise<T> {
    const {
      priority = 'medium',
      estimatedTokens = 2000,
      maxWaitTime = 300000 // 5 minutes max wait
    } = options;

    // Check if user has exceeded daily limits
    if (this.hasUserExceededDailyLimit(userId)) {
      throw new Error('Daily rate limit exceeded. Please try again tomorrow or upgrade to Developer Tier.');
    }

    // Check if we can execute immediately
    if (this.canExecuteImmediately(estimatedTokens)) {
      return this.executeRequest(userId, requestFn, estimatedTokens);
    }

    // Add to queue
    return this.queueRequest(userId, requestFn, priority, estimatedTokens, maxWaitTime);
  }

  /**
   * Get current rate limit status
   */
  public getRateLimitStatus() {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Clean windows
    this.requestWindow = this.requestWindow.filter(time => time > oneMinuteAgo);
    this.tokenWindow = this.tokenWindow.filter(entry => entry.timestamp > oneMinuteAgo);

    const requestsLastMinute = this.requestWindow.length;
    const tokensLastMinute = this.tokenWindow.reduce((sum, entry) => sum + entry.tokens, 0);
    const requestsToday = Array.from(this.userUsage.values())
      .reduce((sum, usage) => sum + usage.requestsToday, 0);

    return {
      requestsPerMinute: {
        used: requestsLastMinute,
        limit: this.config.requestsPerMinute,
        remaining: Math.max(0, this.config.requestsPerMinute - requestsLastMinute)
      },
      tokensPerMinute: {
        used: tokensLastMinute,
        limit: this.config.tokensPerMinute,
        remaining: Math.max(0, this.config.tokensPerMinute - tokensLastMinute)
      },
      requestsPerDay: {
        used: requestsToday,
        limit: this.config.requestsPerDay,
        remaining: Math.max(0, this.config.requestsPerDay - requestsToday)
      },
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      estimatedWaitTime: this.getEstimatedWaitTime()
    };
  }

  /**
   * Get queue position for a user
   */
  public getQueuePosition(userId: string): number {
    const userRequests = this.queue.filter(req => req.userId === userId);
    if (userRequests.length === 0) return -1;
    
    const firstUserRequest = userRequests[0];
    return this.queue.indexOf(firstUserRequest) + 1;
  }

  private canExecuteImmediately(estimatedTokens: number): boolean {
    const status = this.getRateLimitStatus();
    
    return (
      this.activeRequests < this.config.maxConcurrentRequests &&
      status.requestsPerMinute.remaining > 0 &&
      status.tokensPerMinute.remaining >= estimatedTokens &&
      status.requestsPerDay.remaining > 0
    );
  }

  private async executeRequest<T>(
    userId: string,
    requestFn: () => Promise<T>,
    estimatedTokens: number
  ): Promise<T> {
    const now = new Date();
    
    // Update rate limit tracking
    this.requestWindow.push(now);
    this.tokenWindow.push({ timestamp: now, tokens: estimatedTokens });
    this.activeRequests++;

    // Update user usage
    this.updateUserUsage(userId, estimatedTokens);

    try {
      const result = await requestFn();
      return result;
    } finally {
      this.activeRequests--;
    }
  }

  private async queueRequest<T>(
    userId: string,
    requestFn: () => Promise<T>,
    priority: 'high' | 'medium' | 'low',
    estimatedTokens: number,
    maxWaitTime: number
  ): Promise<T> {
    
    // Check queue size
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error('Service temporarily overloaded. Please try again in a few minutes.');
    }

    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest = {
        id: this.generateRequestId(),
        userId,
        priority,
        requestFn,
        resolve,
        reject,
        createdAt: new Date(),
        estimatedTokens
      };

      // Insert by priority
      this.insertByPriority(request);

      // Set timeout
      setTimeout(() => {
        const index = this.queue.findIndex(req => req.id === request.id);
        if (index !== -1) {
          this.queue.splice(index, 1);
          reject(new Error('Request timeout. Please try again.'));
        }
      }, maxWaitTime);
    });
  }

  private insertByPriority(request: QueuedRequest) {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const requestPriority = priorityOrder[request.priority];

    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorityOrder[this.queue[i].priority];
      if (requestPriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, request);
  }

  private async processQueue() {
    setInterval(async () => {
      if (this.queue.length === 0) return;

      const request = this.queue[0];
      
      if (this.canExecuteImmediately(request.estimatedTokens)) {
        this.queue.shift();
        
        try {
          const result = await this.executeRequest(
            request.userId,
            request.requestFn,
            request.estimatedTokens
          );
          request.resolve(result);
        } catch (error) {
          request.reject(error);
        }
      }
    }, 1000); // Check every second
  }

  private hasUserExceededDailyLimit(userId: string): boolean {
    const usage = this.userUsage.get(userId);
    if (!usage) return false;

    const today = new Date();
    const usageDate = usage.lastRequestTime;
    
    // Reset daily count if it's a new day
    if (today.toDateString() !== usageDate.toDateString()) {
      usage.requestsToday = 0;
    }

    // Check if user has made too many requests today
    const userDailyLimit = Math.floor(this.config.requestsPerDay / 10); // Limit per user
    return usage.requestsToday >= userDailyLimit;
  }

  private updateUserUsage(userId: string, tokens: number) {
    const now = new Date();
    const usage = this.userUsage.get(userId) || {
      requestsToday: 0,
      tokensUsed: 0,
      lastRequestTime: now,
      requestsThisMinute: 0,
      minuteWindow: now
    };

    // Reset minute window if needed
    if (now.getTime() - usage.minuteWindow.getTime() > 60000) {
      usage.requestsThisMinute = 0;
      usage.minuteWindow = now;
    }

    // Reset daily count if new day
    if (now.toDateString() !== usage.lastRequestTime.toDateString()) {
      usage.requestsToday = 0;
      usage.tokensUsed = 0;
    }

    usage.requestsToday++;
    usage.requestsThisMinute++;
    usage.tokensUsed += tokens;
    usage.lastRequestTime = now;

    this.userUsage.set(userId, usage);
  }

  private getEstimatedWaitTime(): number {
    if (this.queue.length === 0) return 0;

    // Estimate based on current rate and queue size
    const requestsPerSecond = this.config.requestsPerMinute / 60;
    const availableSlots = Math.max(0, this.config.maxConcurrentRequests - this.activeRequests);
    
    if (availableSlots > 0) {
      return Math.ceil(this.queue.length / Math.max(requestsPerSecond, 0.1)) * 1000;
    }

    return Math.ceil(this.queue.length / requestsPerSecond) * 1000;
  }

  private cleanupUsageData() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    for (const [userId, usage] of this.userUsage.entries()) {
      if (usage.lastRequestTime < oneDayAgo) {
        this.userUsage.delete(userId);
      }
    }
  }

  private generateRequestId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Emergency circuit breaker - stop accepting new requests
   */
  public setCircuitBreaker(enabled: boolean) {
    if (enabled) {
      this.config.maxQueueSize = 0;
    } else {
      this.config.maxQueueSize = 50;
    }
  }

  /**
   * Update configuration (for upgrading to paid tiers)
   */
  public updateConfig(newConfig: Partial<RateLimitConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
} 