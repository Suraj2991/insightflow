'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { QuestionnaireConfig, QuestionnaireResponse, QuestionnaireProgress, PropertyType, RiskTolerance } from '@/types/questionnaire'
import QuestionnaireNavigation from './QuestionnaireNavigation'
import AppHeader from '../AppHeader'

interface QuestionnaireEngineProps {
  config: QuestionnaireConfig
  onComplete: (response: QuestionnaireResponse) => void
  onSave?: (response: Partial<QuestionnaireResponse>) => void
  initialData?: Partial<QuestionnaireResponse>
}

// Create dynamic validation schema based on current step
const createStepSchema = (config: QuestionnaireConfig, currentStepIndex: number) => {
  const currentStep = config.steps[currentStepIndex]
  
  if (!currentStep) {
    return z.object({})
  }

  const schemaFields: Record<string, z.ZodTypeAny> = {}
  
  if (currentStep.required) {
    switch (currentStep.type) {
      case 'boolean':
        schemaFields[currentStep.id] = z.boolean().refine(val => val === true, {
          message: 'You must accept this to continue'
        })
        break
      case 'single_choice':
        schemaFields[currentStep.id] = z.string().min(1, 'Please select an option')
        break
      case 'multiple_choice':
        schemaFields[currentStep.id] = z.array(z.string()).min(1, 'Please select at least one option')
        break
      case 'text':
        schemaFields[currentStep.id] = z.string().min(1, 'This field is required')
        break
      case 'number':
        schemaFields[currentStep.id] = z.number().min(0, 'Please enter a valid number')
        break
      default:
        schemaFields[currentStep.id] = z.any()
    }
  } else {
    // Optional fields
    switch (currentStep.type) {
      case 'boolean':
        schemaFields[currentStep.id] = z.boolean().optional()
        break
      case 'single_choice':
        schemaFields[currentStep.id] = z.string().optional()
        break
      case 'multiple_choice':
        schemaFields[currentStep.id] = z.array(z.string()).optional()
        break
      case 'text':
        schemaFields[currentStep.id] = z.string().optional()
        break
      case 'number':
        schemaFields[currentStep.id] = z.number().optional()
        break
      default:
        schemaFields[currentStep.id] = z.any().optional()
    }
  }

  return z.object(schemaFields)
}

export default function QuestionnaireEngine({ 
  config, 
  onComplete, 
  onSave,
  initialData = {}
}: QuestionnaireEngineProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [responses, setResponses] = useState<Partial<QuestionnaireResponse>>(initialData)
  const [progress, setProgress] = useState<QuestionnaireProgress>({
    currentStep: 0,
    totalSteps: config.steps.length,
    completedSteps: [],
    canProceed: false,
    warnings: [],
    missingCriticalInfo: []
  })

  const currentStep = config.steps[currentStepIndex]
  const stepSchema = createStepSchema(config, currentStepIndex)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
    reset
  } = useForm({
    resolver: zodResolver(stepSchema),
    defaultValues: responses,
    mode: 'onChange'
  })

  // Check if current step should be shown based on conditional logic
  const shouldShowStep = (step: typeof currentStep): boolean => {
    if (!step.conditionalOn) return true
    
    const fieldValue = responses[step.conditionalOn.field as keyof typeof responses]
    const expectedValue = step.conditionalOn.value
    
    if (Array.isArray(expectedValue)) {
      return expectedValue.includes(fieldValue as string)
    }
    
    return fieldValue === expectedValue
  }

  // Update progress tracking
  useEffect(() => {
    const completedSteps = Object.keys(responses).filter(key => 
      responses[key as keyof typeof responses] !== undefined
    )
    
    const warnings: string[] = []
    const missingCriticalInfo: string[] = []

    // Check for missing critical information
    if (!responses.riskTolerance) {
      missingCriticalInfo.push('Risk tolerance assessment')
    }
    if (!responses.professionalTeam) {
      warnings.push('Professional team status not confirmed')
    }

    setProgress({
      currentStep: currentStepIndex,
      totalSteps: config.steps.length,
      completedSteps,
      canProceed: isValid,
      warnings,
      missingCriticalInfo
    })
  }, [currentStepIndex, responses, isValid])

  // Auto-save functionality
  useEffect(() => {
    if (onSave && Object.keys(responses).length > 0) {
      const timeoutId = setTimeout(() => {
        onSave(responses)
      }, 1000) // Auto-save after 1 second of inactivity

      return () => clearTimeout(timeoutId)
    }
  }, [responses, onSave])

  const handleStepSubmit = (data: any) => {
    const updatedResponses = { ...responses, ...data }
    setResponses(updatedResponses)

    // Move to next visible step
    let nextStepIndex = currentStepIndex + 1
    while (nextStepIndex < config.steps.length) {
      if (shouldShowStep(config.steps[nextStepIndex])) {
        break
      }
      nextStepIndex++
    }

    if (nextStepIndex >= config.steps.length) {
      // All steps complete - map snake_case step IDs to camelCase response fields
      const finalResponse: QuestionnaireResponse = {
        // Map step responses to proper response object structure
        propertyType: updatedResponses.property_type as PropertyType,
        riskTolerance: updatedResponses.risk_tolerance as RiskTolerance,
        
        // Build professional team object from array
        professionalTeam: {
          hasSolicitor: updatedResponses.professional_team?.includes('solicitor_instructed') || false,
          hasSurveyor: updatedResponses.professional_team?.includes('survey_booked') || false,
          solicitorName: updatedResponses.professional_team?.includes('solicitor_instructed') ? 'Instructed' : undefined,
          surveyorType: updatedResponses.professional_team?.includes('survey_booked') ? 'homebuyer' : undefined,
          otherProfessionals: updatedResponses.professional_team?.filter((team: string) => 
            !['solicitor_instructed', 'solicitor_researching', 'solicitor_none', 'survey_booked', 'survey_researching', 'survey_none'].includes(team)
          ) || []
        },
        
        // Build timeline object
        timeline: {
          urgency: updatedResponses.timeline?.includes('exchange_within_2_weeks') ? 'urgent' :
                   updatedResponses.timeline?.includes('exchange_2_4_weeks') ? 'normal' : 'relaxed'
        },
        
        // Build location object
        location: {
          floodZone: updatedResponses.location_details?.includes('flood_risk_area') || false,
          conservationArea: updatedResponses.location_details?.includes('conservation_area') || false
        },
        
        // Build special considerations
        specialConsiderations: {
          firstTimeBuyer: updatedResponses.buyer_type?.includes('first_time_buyer') || false,
          investmentProperty: updatedResponses.buyer_type?.includes('investment_property') || false,
          accessibility: updatedResponses.special_needs?.includes('accessibility_needs') || false
        },
        
        // Build professional advice timeline
        professionalAdviceTimeline: {
          solicitorConsultation: updatedResponses.professional_team?.includes('solicitor_instructed') ? new Date() : undefined,
          surveyBooked: updatedResponses.professional_team?.includes('survey_booked') || false
        },
        
        // Document availability - simplified for now
        documentsAvailable: [],
        
        // Required fields
        sessionId: crypto.randomUUID(),
        completedAt: new Date(),
        disclaimerAccepted: updatedResponses.initial_consent || true,
        understandsLimitations: true,
        professionalAdviceRequired: true
      }

      onComplete(finalResponse)
    } else {
      setCurrentStepIndex(nextStepIndex)
      reset() // Reset form for next step
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      let prevStepIndex = currentStepIndex - 1
      while (prevStepIndex >= 0) {
        if (shouldShowStep(config.steps[prevStepIndex])) {
          break
        }
        prevStepIndex--
      }
      if (prevStepIndex >= 0) {
        setCurrentStepIndex(prevStepIndex)
        reset()
      }
    }
  }

  const handleStepJump = (targetStepIndex: number) => {
    if (targetStepIndex >= 0 && targetStepIndex < config.steps.length) {
      setCurrentStepIndex(targetStepIndex)
      reset()
    }
  }

  // Skip step logic handled elsewhere, not in render
  useEffect(() => {
    if (currentStep && !shouldShowStep(currentStep)) {
      handleStepSubmit({})
    }
  }, [currentStep?.id, handleStepSubmit, shouldShowStep])

  if (!currentStep) {
    return <div>Loading...</div>
  }

  if (!shouldShowStep(currentStep)) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* App Header */}
      <AppHeader 
        title="Property Purchase Questionnaire"
        subtitle={`Step ${currentStepIndex + 1} of ${config.steps.length} - ${currentStep.title}`}
      />
      
      <div className="flex">
        {/* Sidebar Navigation */}
        <QuestionnaireNavigation
        config={config}
        currentStepIndex={currentStepIndex}
        completedSteps={progress.completedSteps}
        responses={responses}
        onStepClick={handleStepJump}
        shouldShowStep={(stepId) => shouldShowStep(config.steps.find(s => s.id === stepId) || config.steps[0])}
      />
      
      {/* Main Content */}
      <div className="flex-1 max-w-2xl mx-auto p-6">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStepIndex + 1} of {config.steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStepIndex + 1) / config.steps.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStepIndex + 1) / config.steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Disclaimer (shown on certain steps) */}
        {[0, Math.floor(config.steps.length / 2), config.steps.length - 1].includes(currentStepIndex) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-blue-800">
                <p>{config.disclaimers.intermediate[0]}</p>
              </div>
            </div>
          </div>
        )}

        {/* Question Content */}
        <div className="bg-white rounded-xl shadow-sm border p-8 mb-6">
          <form onSubmit={handleSubmit(handleStepSubmit)} className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStep.title}
              </h2>
              {currentStep.description && (
                <p className="text-gray-600 mb-4">{currentStep.description}</p>
              )}
            </div>

            {/* Question Input */}
            <div className="space-y-4">
              {currentStep.type === 'boolean' && (
                <div className="space-y-3">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(currentStep.id as any)}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        I understand this is a decision support tool only
                      </span>
                      <p className="text-gray-500 mt-1">
                        {currentStep.helpText}
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {currentStep.type === 'single_choice' && currentStep.options && (
                <div className="space-y-3">
                  {currentStep.options.map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        value={option.value}
                        {...register(currentStep.id as any)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{option.label}</span>
                        {option.description && (
                          <p className="text-gray-500 mt-1">{option.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {currentStep.type === 'multiple_choice' && currentStep.options && (
                <div className="space-y-3">
                  {currentStep.options.map((option) => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        value={option.value}
                        {...register(currentStep.id as any)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="text-sm">
                        <span className="font-medium text-gray-900">{option.label}</span>
                        {option.description && (
                          <p className="text-gray-500 mt-1">{option.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {currentStep.type === 'text' && (
                <input
                  type="text"
                  {...register(currentStep.id as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={currentStep.helpText}
                />
              )}

              {currentStep.type === 'number' && (
                <input
                  type="number"
                  {...register(currentStep.id as any, { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={currentStep.helpText}
                />
              )}
            </div>

            {/* Help Text */}
            {currentStep.helpText && currentStep.type !== 'boolean' && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600">{currentStep.helpText}</p>
              </div>
            )}

            {/* Professional Note */}
            {currentStep.professionalNote && (
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Professional insight:</span> {currentStep.professionalNote}
                </p>
              </div>
            )}

            {/* Validation Errors */}
            {(errors as any)[currentStep.id] && (
              <div className="text-red-600 text-sm">
                {(errors as any)[currentStep.id]?.message}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <button
                type="submit"
                disabled={!isValid}
                className="px-6 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStepIndex === config.steps.length - 1 ? 'Complete Review' : 'Continue'}
              </button>
            </div>
          </form>
        </div>

        {/* Progress Summary */}
        {progress.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Reminders:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {progress.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      </div>
    </div>
  )
} 