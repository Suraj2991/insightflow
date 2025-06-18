import { NextRequest, NextResponse } from 'next/server';
import { RateLimitManager } from '@/lib/server/rateLimitManager';

export async function GET(request: NextRequest) {
  try {
    const rateLimitManager = RateLimitManager.getInstance();
    const status = rateLimitManager.getRateLimitStatus();
    
    // Get user ID from headers or query params (simplified for demo)
    const userId = request.headers.get('x-user-id') || 
                   request.nextUrl.searchParams.get('userId') || 
                   'anonymous';
    
    const queuePosition = rateLimitManager.getQueuePosition(userId);
    
    return NextResponse.json({
      success: true,
      status,
      userQueuePosition: queuePosition,
      recommendations: generateRecommendations(status)
    });
    
  } catch (error) {
    console.error('Rate limit status error:', error);
    return NextResponse.json(
      { error: 'Failed to get rate limit status' },
      { status: 500 }
    );
  }
}

function generateRecommendations(status: any): string[] {
  const recommendations = [];
  
  if (status.requestsPerDay.remaining < 100) {
    recommendations.push('⚠️ Approaching daily limit. Consider upgrading to Developer Tier.');
  }
  
  if (status.queueLength > 10) {
    recommendations.push('🕐 High demand detected. Expected wait time: ' + 
      Math.ceil(status.estimatedWaitTime / 1000 / 60) + ' minutes.');
  }
  
  if (status.requestsPerMinute.remaining === 0) {
    recommendations.push('⏸️ Rate limit reached. Requests are being queued.');
  }
  
  if (status.queueLength === 0 && status.requestsPerMinute.remaining > 0) {
    recommendations.push('✅ API ready for immediate processing.');
  }
  
  return recommendations;
} 