'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, FileText } from 'lucide-react';

interface AppHeaderProps {
  showBackButton?: boolean;
  backPath?: string;
  backLabel?: string;
  title?: string;
  subtitle?: string;
}

export default function AppHeader({ 
  showBackButton = false, 
  backPath = '/', 
  backLabel = 'Back',
  title,
  subtitle 
}: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-3 text-teal-600 hover:text-teal-700 transition-colors group"
            >
              <div className="flex items-center justify-center w-8 h-8 bg-teal-600 rounded-lg group-hover:bg-teal-700 transition-colors">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">InsightFlow</h1>
                <p className="text-xs text-gray-500 -mt-1">Property Analysis</p>
              </div>
            </button>

            {/* Back button if needed */}
            {showBackButton && (
              <>
                <div className="h-6 border-l border-gray-300"></div>
                <button
                  onClick={() => router.push(backPath)}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span className="text-sm">{backLabel}</span>
                </button>
              </>
            )}
          </div>

          {/* Center - Page Title if provided */}
          {title && (
            <div className="flex-1 text-center">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </div>
          )}

          {/* Right side - Navigation or additional actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 