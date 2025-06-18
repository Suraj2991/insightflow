import React from 'react'
import { DocumentQuality } from '@/lib/server/documentProcessor'

interface ConfidenceIndicatorProps {
  quality: DocumentQuality
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function ConfidenceIndicator({
  quality,
  showDetails = false,
  size = 'md',
  className = ''
}: ConfidenceIndicatorProps) {
  const percentage = Math.round(quality.confidence * 100)
  
  // Determine colors based on quality
  const getQualityColors = () => {
    switch (quality.quality) {
      case 'high':
        return {
          bg: 'bg-green-100',
          border: 'border-green-300',
          text: 'text-green-800',
          icon: '✓',
          progressBg: 'bg-green-500'
        }
      case 'medium':
        return {
          bg: 'bg-amber-100',
          border: 'border-amber-300',
          text: 'text-amber-800',
          icon: '⚠',
          progressBg: 'bg-amber-500'
        }
      case 'low':
        return {
          bg: 'bg-red-100',
          border: 'border-red-300',
          text: 'text-red-800',
          icon: '⚠',
          progressBg: 'bg-red-500'
        }
      default:
        return {
          bg: 'bg-gray-100',
          border: 'border-gray-300',
          text: 'text-gray-800',
          icon: '?',
          progressBg: 'bg-gray-500'
        }
    }
  }

  // Size variants
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-2',
          text: 'text-xs',
          percentage: 'text-sm font-medium',
          progress: 'h-1.5',
          icon: 'text-sm'
        }
      case 'lg':
        return {
          container: 'p-4',
          text: 'text-sm',
          percentage: 'text-lg font-semibold',
          progress: 'h-3',
          icon: 'text-lg'
        }
      default: // md
        return {
          container: 'p-3',
          text: 'text-sm',
          percentage: 'text-base font-medium',
          progress: 'h-2',
          icon: 'text-base'
        }
    }
  }

  const colors = getQualityColors()
  const sizes = getSizeClasses()

  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg ${sizes.container} ${className}`}>
      {/* Main confidence display */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <span className={`${colors.text} ${sizes.icon}`}>
            {colors.icon}
          </span>
          <span className={`${colors.text} ${sizes.text} font-medium`}>
            Quality: {quality.quality.charAt(0).toUpperCase() + quality.quality.slice(1)}
          </span>
        </div>
        <span className={`${colors.text} ${sizes.percentage}`}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`${colors.progressBg} ${sizes.progress} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Detailed information */}
      {showDetails && (quality.issues.length > 0 || quality.recommendations.length > 0) && (
        <div className="mt-3 space-y-2">
          {/* Issues */}
          {quality.issues.length > 0 && (
            <div>
              <h4 className={`${colors.text} ${sizes.text} font-medium mb-1`}>
                Issues:
              </h4>
              <ul className="space-y-1">
                {quality.issues.map((issue, index) => (
                  <li key={index} className={`${colors.text} ${sizes.text} flex items-start`}>
                    <span className="text-xs mr-1 mt-1">•</span>
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {quality.recommendations.length > 0 && (
            <div>
              <h4 className={`${colors.text} ${sizes.text} font-medium mb-1`}>
                Recommendations:
              </h4>
              <ul className="space-y-1">
                {quality.recommendations.map((rec, index) => (
                  <li key={index} className={`${colors.text} ${sizes.text} flex items-start`}>
                    <span className="text-xs mr-1 mt-1">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Compact version for inline display
export function ConfidenceBadge({ quality, className = '' }: { 
  quality: DocumentQuality; 
  className?: string; 
}) {
  const percentage = Math.round(quality.confidence * 100)
  const colors = quality.quality === 'high' 
    ? 'bg-green-100 text-green-800 border-green-300'
    : quality.quality === 'medium'
    ? 'bg-amber-100 text-amber-800 border-amber-300'
    : 'bg-red-100 text-red-800 border-red-300'

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded border text-xs font-medium ${colors} ${className}`}>
      {percentage}% confidence
    </span>
  )
}

// Tooltip version for hover details
export function ConfidenceTooltip({ 
  quality, 
  children 
}: { 
  quality: DocumentQuality; 
  children: React.ReactNode; 
}) {
  const [showTooltip, setShowTooltip] = React.useState(false)
  const percentage = Math.round(quality.confidence * 100)

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {children}
      
      {showTooltip && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64">
          <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Document Quality</span>
              <span className="font-bold">{percentage}%</span>
            </div>
            
            <div className="mb-2">
              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                quality.quality === 'high' ? 'bg-green-400' :
                quality.quality === 'medium' ? 'bg-amber-400' :
                'bg-red-400'
              }`} />
              <span className="capitalize">{quality.quality} quality</span>
            </div>

            {quality.issues.length > 0 && (
              <div className="text-xs">
                <span className="font-medium">Issues:</span>
                <ul className="mt-1 list-disc list-inside">
                  {quality.issues.slice(0, 2).map((issue, index) => (
                    <li key={index} className="truncate">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </div>
        </div>
      )}
    </div>
  )
} 