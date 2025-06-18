import React from 'react'
import { QuestionnaireConfig, QuestionnaireResponse } from '@/types/questionnaire'

interface QuestionnaireNavigationProps {
  config: QuestionnaireConfig
  currentStepIndex: number
  completedSteps: string[]
  responses: Partial<QuestionnaireResponse>
  onStepClick: (stepIndex: number) => void
  shouldShowStep: (stepId: string) => boolean
}

export default function QuestionnaireNavigation({
  config,
  currentStepIndex,
  completedSteps,
  responses,
  onStepClick,
  shouldShowStep
}: QuestionnaireNavigationProps) {
  
  const getStepStatus = (stepIndex: number, stepId: string) => {
    if (!shouldShowStep(stepId)) return 'hidden'
    if (stepIndex === currentStepIndex) return 'current'
    if (completedSteps.includes(stepId)) return 'completed'
    if (stepIndex < currentStepIndex) return 'available'
    return 'locked'
  }

  const getStepIcon = (status: string, stepIndex: number) => {
    switch (status) {
      case 'completed':
        return (
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'current':
        return (
          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">{stepIndex + 1}</span>
          </div>
        )
      case 'available':
        return (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-600 text-sm font-bold">{stepIndex + 1}</span>
          </div>
        )
      case 'locked':
        return (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-gray-400 text-sm font-bold">{stepIndex + 1}</span>
          </div>
        )
      default:
        return null
    }
  }

  const getStepDescription = (step: any, status: string) => {
    const baseDescription = step.title
    
    switch (status) {
      case 'completed':
        return `${baseDescription} ✓`
      case 'current':
        return `${baseDescription} (Current)`
      case 'available':
        return baseDescription
      case 'locked':
        return `${baseDescription} (Locked)`
      default:
        return baseDescription
    }
  }

  const visibleSteps = config.steps.filter((step) => shouldShowStep(step.id))

  return (
    <div className="w-80 bg-white border-r border-gray-200 min-h-screen p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Questionnaire Progress</h2>
        <div className="text-sm text-gray-600">
          Step {currentStepIndex + 1} of {visibleSteps.length}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / visibleSteps.length) * 100}%` }}
          />
        </div>
      </div>

      <nav className="space-y-2">
        {config.steps.map((step, index) => {
          const status = getStepStatus(index, step.id)
          
          if (status === 'hidden') return null

          const isClickable = status === 'current' || status === 'completed' || status === 'available'
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={`
                w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-colors duration-200
                ${status === 'current' ? 'bg-primary-50 border border-primary-200' : ''}
                ${status === 'completed' ? 'bg-green-50 border border-green-200' : ''}
                ${status === 'available' ? 'bg-gray-50 border border-gray-200 hover:bg-gray-100' : ''}
                ${status === 'locked' ? 'bg-gray-50 border border-gray-100 opacity-50 cursor-not-allowed' : ''}
                ${isClickable ? 'cursor-pointer' : ''}
              `}
            >
              {getStepIcon(status, index)}
              
              <div className="flex-1 min-w-0">
                <p className={`
                  text-sm font-medium
                  ${status === 'current' ? 'text-primary-900' : ''}
                  ${status === 'completed' ? 'text-green-900' : ''}
                  ${status === 'available' ? 'text-gray-900' : ''}
                  ${status === 'locked' ? 'text-gray-400' : ''}
                `}>
                  {getStepDescription(step, status)}
                </p>
                
                {step.description && (
                  <p className={`
                    text-xs mt-1
                    ${status === 'current' ? 'text-primary-600' : ''}
                    ${status === 'completed' ? 'text-green-600' : ''}
                    ${status === 'available' ? 'text-gray-500' : ''}
                    ${status === 'locked' ? 'text-gray-400' : ''}
                  `}>
                    {step.description}
                  </p>
                )}

                {/* Show response summary for completed steps */}
                {status === 'completed' && responses[step.id as keyof typeof responses] && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600 font-medium">
                      {Array.isArray(responses[step.id as keyof typeof responses]) 
                        ? `${(responses[step.id as keyof typeof responses] as string[]).length} selections`
                        : typeof responses[step.id as keyof typeof responses] === 'boolean'
                        ? responses[step.id as keyof typeof responses] ? 'Confirmed' : 'Not confirmed'
                        : 'Completed'
                      }
                    </p>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </nav>

      {/* Completion Status */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Completion Status</h3>
        <div className="space-y-1 text-xs text-blue-700">
          <div>Completed: {completedSteps.length} steps</div>
          <div>Remaining: {visibleSteps.length - completedSteps.length} steps</div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Navigation Help</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>Completed - Click to review</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary-600 rounded-full"></div>
            <span>Current step</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            <span>Available - Click to jump</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <span>Locked - Complete current step</span>
          </div>
        </div>
      </div>
    </div>
  )
} 