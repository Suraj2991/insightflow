'use client';

import React, { useState, useEffect } from 'react';
import { QuestionnaireConfig, Question } from '@/modules/questionnaire/types';

type WorkflowStep = 'questionnaire' | 'documents' | 'analysis' | 'results';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeKB: number;
}

export default function ClientWorkflowSimulator() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('questionnaire');
  const [config, setConfig] = useState<QuestionnaireConfig | null>(null);
  const [documentConfig, setDocumentConfig] = useState<DocumentType[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      // Load questionnaire config
      const questionnaireRes = await fetch('/api/questionnaire');
      if (questionnaireRes.ok) {
        const questionnaireData = await questionnaireRes.json();
        setConfig(questionnaireData.questionnaire?.config);
      }

      // Load actual document config from admin configuration
      const documentsRes = await fetch('/api/documents/config');
      if (documentsRes.ok) {
        const documentsData = await documentsRes.json();
        if (documentsData.success && documentsData.config) {
          const docConfig = documentsData.config;
          
          // Convert admin config to preview format
          const convertedDocs: DocumentType[] = [
            // Required documents
            ...docConfig.required.map((doc: any, index: number) => ({
              id: `required_${index}`,
              name: doc.type,
              description: doc.description,
              required: true,
              acceptedFormats: doc.formats || ['pdf'],
              maxSizeKB: parseInt(doc.maxSize?.replace('MB', '')) * 1024 || 10240
            })),
            // Optional documents  
            ...docConfig.optional.map((doc: any, index: number) => ({
              id: `optional_${index}`,
              name: doc.type,
              description: doc.description,
              required: false,
              acceptedFormats: doc.formats || ['pdf'],
              maxSizeKB: parseInt(doc.maxSize?.replace('MB', '')) * 1024 || 10240
            }))
          ];
          
          setDocumentConfig(convertedDocs);
        } else {
          // Fallback to domain-appropriate examples
          setDocumentConfig([
            {
              id: 'example_doc_1',
              name: 'Primary Document',
              description: 'Main document for analysis',
              required: true,
              acceptedFormats: ['pdf', 'doc', 'docx'],
              maxSizeKB: 5120
            },
            {
              id: 'example_doc_2',
              name: 'Supporting Document', 
              description: 'Additional supporting information',
              required: false,
              acceptedFormats: ['pdf'],
              maxSizeKB: 10240
            }
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
      // Fallback to basic examples
      setDocumentConfig([
        {
          id: 'example_doc_1',
          name: 'Primary Document',
          description: 'Main document for analysis',
          required: true,
          acceptedFormats: ['pdf', 'doc', 'docx'],
          maxSizeKB: 5120
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextQuestion = () => {
    if (config && currentQuestionIndex < config.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep('documents');
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const simulateDocumentUpload = (docId: string) => {
    setUploadedDocs(prev => ({ ...prev, [docId]: true }));
  };

  const startAnalysis = () => {
    setCurrentStep('analysis');
    // Simulate analysis time
    setTimeout(() => {
      setCurrentStep('results');
    }, 3000);
  };

  const resetWorkflow = () => {
    setCurrentStep('questionnaire');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setUploadedDocs({});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workflow simulator...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Questionnaire Configured</h1>
          <p className="text-gray-600 mb-6">
            Please configure a questionnaire in the admin dashboard before previewing the client experience.
          </p>
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Client Workflow Preview</h1>
              <p className="text-sm text-gray-600">This is exactly how clients will experience your workflow</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetWorkflow}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Restart
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Return to Admin
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Workflow Progress</span>
            <span className="text-sm text-gray-500">
              {currentStep === 'questionnaire' && 'Answering questions'}
              {currentStep === 'documents' && 'Uploading documents'}
              {currentStep === 'analysis' && 'Analysis in progress'}
              {currentStep === 'results' && 'Results ready'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${
                  currentStep === 'questionnaire' ? 25 :
                  currentStep === 'documents' ? 50 :
                  currentStep === 'analysis' ? 75 : 100
                }%`
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Questionnaire Step */}
        {currentStep === 'questionnaire' && (
          <QuestionnaireStep
            config={config}
            currentQuestionIndex={currentQuestionIndex}
            answers={answers}
            onAnswer={handleAnswer}
            onNext={nextQuestion}
            onPrev={prevQuestion}
          />
        )}

        {/* Document Upload Step */}
        {currentStep === 'documents' && (
          <DocumentUploadStep
            documentTypes={documentConfig}
            uploadedDocs={uploadedDocs}
            onUpload={simulateDocumentUpload}
            onContinue={startAnalysis}
          />
        )}

        {/* Analysis Step */}
        {currentStep === 'analysis' && (
          <AnalysisStep />
        )}

        {/* Results Step */}
        {currentStep === 'results' && (
          <ResultsStep onRestart={resetWorkflow} />
        )}
      </div>
    </div>
  );
}

// Component for questionnaire step
function QuestionnaireStep({ 
  config, 
  currentQuestionIndex, 
  answers, 
  onAnswer, 
  onNext, 
  onPrev 
}: {
  config: QuestionnaireConfig;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  onAnswer: (questionId: string, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  // Add safety checks
  if (!config || !config.questions || config.questions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Questions Available</h2>
        <p className="text-gray-600 mb-4">
          This workflow doesn't have any questions configured yet.
        </p>
        <button
          onClick={() => window.location.href = '/admin'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Return to Admin Dashboard
        </button>
      </div>
    );
  }

  if (currentQuestionIndex >= config.questions.length || currentQuestionIndex < 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-6xl mb-4">🐛</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Question Index Error</h2>
        <p className="text-gray-600 mb-4">
          Question {currentQuestionIndex + 1} not found. Resetting to first question.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reload Preview
        </button>
      </div>
    );
  }

  const currentQuestion = config.questions[currentQuestionIndex];
  
  // Additional safety check for currentQuestion
  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-6xl mb-4">❓</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Question Not Found</h2>
        <p className="text-gray-600 mb-4">
          Unable to load question {currentQuestionIndex + 1}.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reload Preview
        </button>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / config.questions.length) * 100;
  
  // Better answer validation for different question types
  const isAnswered = (() => {
    const answer = answers[currentQuestion.id];
    
    if (!currentQuestion.required) return true;
    
    switch (currentQuestion.type) {
      case 'multiple_choice':
        return Array.isArray(answer) && answer.length > 0;
      case 'boolean':
        return typeof answer === 'boolean';
      case 'number':
        return typeof answer === 'number' && !isNaN(answer);
      case 'text':
      case 'single_choice':
      default:
        return answer !== undefined && answer !== '' && answer !== null;
    }
  })();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {currentQuestionIndex + 1} of {config.questions.length}
          </span>
          <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          {currentQuestion.title}
          {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
        </h2>
        {currentQuestion.description && (
          <p className="text-gray-600 mb-6">{currentQuestion.description}</p>
        )}

        {/* Render question based on type */}
        <div className="space-y-3">
          {currentQuestion.type === 'text' && (
            <input
              type="text"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={currentQuestion.placeholder || "Enter your answer..."}
            />
          )}

          {currentQuestion.type === 'number' && (
            <input
              type="number"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => onAnswer(currentQuestion.id, parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={currentQuestion.placeholder || "Enter a number..."}
              min={currentQuestion.validation?.min}
              max={currentQuestion.validation?.max}
            />
          )}

          {currentQuestion.type === 'single_choice' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <label key={option.id || index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={(e) => onAnswer(currentQuestion.id, e.target.value)}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <label key={option.id || index} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={Array.isArray(answers[currentQuestion.id]) && answers[currentQuestion.id].includes(option.value)}
                    onChange={(e) => {
                      const currentAnswers = Array.isArray(answers[currentQuestion.id]) ? answers[currentQuestion.id] : [];
                      if (e.target.checked) {
                        onAnswer(currentQuestion.id, [...currentAnswers, option.value]);
                      } else {
                        onAnswer(currentQuestion.id, currentAnswers.filter((val: string) => val !== option.value));
                      }
                    }}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <div>
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'boolean' && (
            <div className="flex space-x-4">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value="true"
                  checked={answers[currentQuestion.id] === true}
                  onChange={() => onAnswer(currentQuestion.id, true)}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value="false"
                  checked={answers[currentQuestion.id] === false}
                  onChange={() => onAnswer(currentQuestion.id, false)}
                  className="mr-3 h-4 w-4 text-blue-600"
                />
                <span>No</span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          disabled={currentQuestionIndex === 0}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          onClick={onNext}
          disabled={currentQuestion.required && !isAnswered}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex === config.questions.length - 1 ? 'Continue to Documents' : 'Next'}
        </button>
      </div>
    </div>
  );
}

// Component for document upload step
function DocumentUploadStep({ 
  documentTypes, 
  uploadedDocs, 
  onUpload, 
  onContinue 
}: {
  documentTypes: DocumentType[];
  uploadedDocs: Record<string, boolean>;
  onUpload: (docId: string) => void;
  onContinue: () => void;
}) {
  const requiredDocs = documentTypes.filter(doc => doc.required);
  const optionalDocs = documentTypes.filter(doc => !doc.required);
  const requiredUploaded = requiredDocs.filter(doc => uploadedDocs[doc.id]).length;
  const canContinue = requiredUploaded === requiredDocs.length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Documents</h2>
        <p className="text-gray-600 mb-4">
          Please upload the required documents for analysis. Optional documents can help provide more comprehensive insights.
        </p>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(uploadedDocs).length / documentTypes.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Required Documents Section */}
      {requiredDocs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            Required Documents ({requiredUploaded}/{requiredDocs.length})
          </h3>
          
          <div className="space-y-4">
            {requiredDocs.map((docType) => (
              <div key={docType.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{docType.name}</h4>
                    <p className="text-sm text-gray-600">{docType.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Formats: {docType.acceptedFormats.join(', ').toUpperCase()} • 
                      Max: {Math.round(docType.maxSizeKB / 1024)}MB
                    </div>
                  </div>
                  
                  {uploadedDocs[docType.id] ? (
                    <div className="text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Uploaded</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpload(docType.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Simulate Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Documents Section */}
      {optionalDocs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">
            Optional Documents ({optionalDocs.filter(doc => uploadedDocs[doc.id]).length}/{optionalDocs.length})
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            These documents are optional but can provide additional context for better analysis.
          </p>
          
          <div className="space-y-4">
            {optionalDocs.map((docType) => (
              <div key={docType.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{docType.name}</h4>
                    <p className="text-sm text-gray-600">{docType.description}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Formats: {docType.acceptedFormats.join(', ').toUpperCase()} • 
                      Max: {Math.round(docType.maxSizeKB / 1024)}MB
                    </div>
                  </div>
                  
                  {uploadedDocs[docType.id] ? (
                    <div className="text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm">Uploaded</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onUpload(docType.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Simulate Upload
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Documents Configured */}
      {documentTypes.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
          <div className="text-gray-500 py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No Documents Configured</p>
            <p className="text-sm">Configure document types in the admin panel to see them here</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {requiredDocs.length === 0 ? (
              <span className="text-gray-600">No required documents - ready to continue</span>
            ) : !canContinue ? (
              <span className="text-amber-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {requiredDocs.length - requiredUploaded} required documents remaining
              </span>
            ) : (
              <span className="text-green-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                All required documents uploaded
              </span>
            )}
          </div>
          
          <button
            onClick={onContinue}
            disabled={!canContinue && requiredDocs.length > 0}
            className={`px-6 py-2 rounded-lg font-medium ${
              canContinue || requiredDocs.length === 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Start Analysis →
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for analysis step
function AnalysisStep() {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
      <div className="mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis in Progress</h2>
        <p className="text-gray-600">
          Our AI is analyzing your documents and questionnaire responses...
        </p>
      </div>
      
      <div className="space-y-3 text-sm text-gray-600 max-w-md mx-auto">
        <div className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
          Processing questionnaire responses
        </div>
        <div className="flex items-center justify-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
          Extracting text from uploaded documents
        </div>
        <div className="flex items-center justify-center">
          <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></span>
          Generating insights and recommendations
        </div>
      </div>
    </div>
  );
}

// Component for results step
function ResultsStep({ onRestart }: { onRestart: () => void }) {
  const [activeTab, setActiveTab] = useState<'report' | 'qa'>('report');

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete!</h2>
        <p className="text-gray-600">
          Your document analysis has been completed. Review your results below.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'report'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analysis Report
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'qa'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ask Questions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'report' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Report</h3>
                <p className="text-sm text-gray-600 mb-4">Based on your uploaded documents and questionnaire responses</p>
              </div>

              {/* Sample Report Content */}
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <h4 className="font-medium text-red-900">Critical Finding</h4>
                      <p className="text-sm text-red-700 mt-1">Potential structural concern identified in submitted documentation that requires immediate professional review.</p>
                      <p className="text-xs text-red-600 mt-2">Confidence: 85% • Source: Primary Document</p>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <h4 className="font-medium text-yellow-900">Moderate Finding</h4>
                      <p className="text-sm text-yellow-700 mt-1">Documentation indicates standard compliance requirements that should be verified with qualified professionals.</p>
                      <p className="text-xs text-yellow-600 mt-2">Confidence: 72% • Source: Supporting Document</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                    <div>
                      <h4 className="font-medium text-green-900">Positive Finding</h4>
                      <p className="text-sm text-green-700 mt-1">Documentation shows compliance with standard requirements and best practices.</p>
                      <p className="text-xs text-green-600 mt-2">Confidence: 91% • Source: Primary Document</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Report */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Complete Report</h4>
                    <p className="text-sm text-gray-600">Download the full analysis report with detailed findings and recommendations</p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'qa' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask Questions</h3>
                <p className="text-sm text-gray-600 mb-4">Get specific answers about your documents using AI-powered search</p>
              </div>

              {/* Sample Q&A */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-sm">
                    <div className="font-medium text-blue-900 mb-2">Q: What are the main concerns identified in the analysis?</div>
                    <div className="text-blue-800">
                      Based on your documents, the analysis identified a critical structural concern that requires immediate attention, along with moderate compliance requirements. The structural issue appears in the primary document and should be evaluated by a qualified professional.
                    </div>
                    <div className="text-xs text-blue-600 mt-2">Sources: Primary Document (page 2), Supporting Document (page 1)</div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900 mb-2">Q: Are there any compliance issues mentioned?</div>
                    <div className="text-gray-800">
                      The documents indicate standard compliance requirements that should be verified. While no immediate violations were detected, professional verification is recommended to ensure all current standards are met.
                    </div>
                    <div className="text-xs text-gray-600 mt-2">Sources: Supporting Document (page 3)</div>
                  </div>
                </div>
              </div>

              {/* Question Input */}
              <div className="border border-gray-300 rounded-lg">
                <textarea
                  className="w-full p-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Ask a question about your documents..."
                ></textarea>
                <div className="flex justify-between items-center p-3 bg-gray-50 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Ask specific questions about your uploaded documents
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    Ask Question
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="font-medium text-gray-900">Workflow Complete</h4>
            <p className="text-sm text-gray-600">This is how clients will experience your complete workflow</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onRestart}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Restart Preview
            </button>
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Return to Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 