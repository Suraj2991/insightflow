'use client'

import React, { useState } from 'react'
import { QuestionnaireResponse } from '@/types/questionnaire'
import { propertyQuestionnaireConfig } from '@/lib/questionnaire-config'
import QuestionnaireEngine from '@/components/questionnaire/QuestionnaireEngine'
import AppHeader from '@/components/AppHeader'

export default function ReviewPage() {
  const [isComplete, setIsComplete] = useState(false)
  const [responses, setResponses] = useState<QuestionnaireResponse | null>(null)

  const handleComplete = (response: QuestionnaireResponse) => {
    console.log('Questionnaire completed:', response)
    console.log('Property Type:', response.propertyType)
    console.log('Risk Tolerance:', response.riskTolerance)
    console.log('Professional Team:', response.professionalTeam)
    setResponses(response)
    setIsComplete(true)
    
    // Here you would typically:
    // 1. Save responses to database
    // 2. Trigger document analysis
    // 3. Generate report
    // 4. Redirect to results page
  }

  const handleSave = (partialResponse: Partial<QuestionnaireResponse>) => {
    console.log('Auto-saving progress:', partialResponse)
    
    // Here you would typically save to localStorage or database
    localStorage.setItem('questionnaire-progress', JSON.stringify(partialResponse))
  }

  // Load any saved progress
  const getSavedProgress = (): Partial<QuestionnaireResponse> => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('questionnaire-progress')
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {
          console.error('Failed to parse saved progress:', e)
        }
      }
    }
    return {}
  }

  if (isComplete && responses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <AppHeader 
          title="Questionnaire Complete!"
          subtitle="Ready to proceed to document upload"
        />
        <div className="max-w-4xl mx-auto p-6">
          {/* Success Message */}
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Questionnaire Complete!
              </h1>
              <p className="text-gray-600 mb-6">
                Thank you for providing your property information. We're now ready to help you organize your document review.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-3">What happens next?</h2>
              <div className="text-left space-y-3 text-blue-800">
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">1</span>
                  <p className="text-sm">Upload your property documents (TA6, survey, searches, etc.)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">2</span>
                  <p className="text-sm">We'll analyze them and highlight areas for professional review</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">3</span>
                  <p className="text-sm">Get organized questions to ask your solicitor and surveyor</p>
                </div>
              </div>
            </div>

            {/* Response Summary */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">Your Information Summary:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Property Type:</span>
                  <p className="text-gray-600 capitalize">{responses.propertyType?.replace(/_/g, ' ') || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Risk Tolerance:</span>
                  <p className="text-gray-600 capitalize">{responses.riskTolerance || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Professional Team:</span>
                  <p className="text-gray-600">
                    {responses.professionalTeam?.hasSolicitor ? '✓ Solicitor' : '⚠ No solicitor'} • {' '}
                    {responses.professionalTeam?.hasSurveyor ? '✓ Surveyor' : '⚠ No surveyor'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Session ID:</span>
                  <p className="text-gray-600 font-mono text-xs">{responses.sessionId}</p>
                </div>
                {responses.location?.postcode && (
                  <div>
                    <span className="font-medium text-gray-700">Location:</span>
                    <p className="text-gray-600">{responses.location.postcode}</p>
                  </div>
                )}
                {responses.timeline?.urgency && (
                  <div>
                    <span className="font-medium text-gray-700">Timeline:</span>
                    <p className="text-gray-600 capitalize">{responses.timeline.urgency}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button 
                className="w-full px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-200"
                onClick={() => {
                  // Store questionnaire responses for document upload
                  localStorage.setItem('questionnaireResponses', JSON.stringify(responses))
                  window.location.href = '/review/upload'
                }}
              >
                Continue to Document Upload
              </button>
              
              <button 
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
                onClick={() => {
                  setIsComplete(false)
                  setResponses(null)
                  localStorage.removeItem('questionnaire-progress')
                }}
              >
                Start Over
              </button>
            </div>

            {/* Professional Advice Reminder */}
            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Remember: Professional advice is essential</p>
                  <p>This tool helps organize your questions, but your solicitor and surveyor provide the expert advice you need for this major decision.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <QuestionnaireEngine
      config={propertyQuestionnaireConfig}
      onComplete={handleComplete}
      onSave={handleSave}
      initialData={getSavedProgress()}
    />
  )
} 