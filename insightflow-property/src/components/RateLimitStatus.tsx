'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, CheckCircle, Users, TrendingUp } from 'lucide-react';

interface RateLimitStatus {
  requestsPerMinute: { used: number; limit: number; remaining: number };
  tokensPerMinute: { used: number; limit: number; remaining: number };
  requestsPerDay: { used: number; limit: number; remaining: number };
  queueLength: number;
  activeRequests: number;
  estimatedWaitTime: number;
}

interface RateLimitStatusProps {
  userId?: string;
  showDetails?: boolean;
  onUpgradePrompt?: () => void;
}

export default function RateLimitStatusComponent({ 
  userId = 'anonymous', 
  showDetails = false,
  onUpgradePrompt 
}: RateLimitStatusProps) {
  const [status, setStatus] = useState<RateLimitStatus | null>(null);
  const [queuePosition, setQueuePosition] = useState(-1);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/documents/rate-limit-status?userId=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
        setQueuePosition(data.userQueuePosition);
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to fetch rate limit status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    );
  }

  if (!status) return null;

  const getStatusColor = () => {
    if (status.requestsPerDay.remaining < 100 || status.queueLength > 10) return 'red';
    if (status.requestsPerMinute.remaining === 0 || status.queueLength > 0) return 'yellow';
    return 'green';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    switch (color) {
      case 'red':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'yellow':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  const getStatusMessage = () => {
    if (status.queueLength > 0) {
      const waitMinutes = Math.ceil(status.estimatedWaitTime / 1000 / 60);
      return `${status.queueLength} requests queued (${waitMinutes}min wait)`;
    }
    if (status.requestsPerDay.remaining < 100) {
      return `${status.requestsPerDay.remaining} requests remaining today`;
    }
    if (status.requestsPerMinute.remaining === 0) {
      return 'Rate limit reached - requests will be queued';
    }
    return 'Ready for immediate processing';
  };

  return (
    <div className="space-y-4">
      {/* Main Status */}
      <div className={`border rounded-lg p-4 ${
        getStatusColor() === 'red' ? 'bg-red-50 border-red-200' :
        getStatusColor() === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
        'bg-green-50 border-green-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-sm font-medium text-gray-900">API Status</h3>
              <p className="text-sm text-gray-600">{getStatusMessage()}</p>
            </div>
          </div>
          
          {queuePosition > 0 && (
            <div className="text-right">
              <span className="text-xs text-gray-500">Your position</span>
              <div className="text-lg font-bold text-blue-600">#{queuePosition}</div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Recommendations</h4>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm text-blue-800">{rec}</li>
            ))}
          </ul>
          
          {recommendations.some(r => r.includes('Developer Tier')) && onUpgradePrompt && (
            <button
              onClick={onUpgradePrompt}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Upgrade to Developer Tier
            </button>
          )}
        </div>
      )}

      {/* Detailed Stats */}
      {showDetails && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Usage Details
          </h4>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Requests per minute */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Requests/minute</span>
                <span>{status.requestsPerMinute.used}/{status.requestsPerMinute.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ 
                    width: `${(status.requestsPerMinute.used / status.requestsPerMinute.limit) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Requests per day */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Requests/day</span>
                <span>{status.requestsPerDay.used}/{status.requestsPerDay.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ 
                    width: `${(status.requestsPerDay.used / status.requestsPerDay.limit) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Active requests */}
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {status.activeRequests} active requests
              </span>
            </div>

            {/* Queue length */}
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {status.queueLength} in queue
              </span>
            </div>
          </div>

          {/* Token usage */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Tokens/minute</span>
              <span>{status.tokensPerMinute.used.toLocaleString()}/{status.tokensPerMinute.limit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ 
                  width: `${(status.tokensPerMinute.used / status.tokensPerMinute.limit) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 