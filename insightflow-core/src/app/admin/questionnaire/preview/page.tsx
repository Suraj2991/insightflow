'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { QuestionnaireConfig, Question } from '@/modules/questionnaire/types';

export default function QuestionnairePreviewPage() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<QuestionnaireConfig | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const configParam = searchParams.get('config');
    if (configParam) {
      try {
        const parsedConfig = JSON.parse(decodeURIComponent(configParam));
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Error parsing config:', error);
      }
    }
  }, [searchParams]);

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (config && currentStep < config.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    setIsCompleted(true);
  };

  const isCurrentQuestionAnswered = () => {
    if (!config) return false;
    const currentQuestion = config.questions[currentStep];
    if (!currentQuestion.required) return true;
    
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'multiple_choice') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return answer !== undefined && answer !== '' && answer !== null;
  };

  const renderQuestion = (question: Question) => {
    const answer = answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={answer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={4}
            placeholder="Enter your answer..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={answer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter a number..."
          />
        );

      case 'boolean':
        return (
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={answer === true || answer === 'true'}
                onChange={() => handleAnswer(question.id, true)}
                className="mr-3 text-blue-600"
              />
              <span className="text-gray-700">Yes</span>
            </label>
            <label className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={answer === false || answer === 'false'}
                onChange={() => handleAnswer(question.id, false)}
                className="mr-3 text-blue-600"
              />
              <span className="text-gray-700">No</span>
            </label>
          </div>
        );

      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-start p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option.value}
                  checked={answer === option.value}
                  onChange={() => handleAnswer(question.id, option.value)}
                  className="mr-3 mt-1 text-blue-600"
                />
                <div>
                  <span className="text-gray-700 font-medium">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        const multipleAnswer = Array.isArray(answer) ? answer : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <label key={option.id} className="flex items-start p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={multipleAnswer.includes(option.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleAnswer(question.id, [...multipleAnswer, option.value]);
                    } else {
                      handleAnswer(question.id, multipleAnswer.filter(v => v !== option.value));
                    }
                  }}
                  className="mr-3 mt-1 text-blue-600"
                />
                <div>
                  <span className="text-gray-700 font-medium">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  )}
                </div>
              </label>
            ))}
          </div>
        );

      default:
        return <div className="text-gray-500">Unknown question type</div>;
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Preview Complete</h1>
            <p className="text-gray-600 mb-6">
              This is how users would see the completion message after submitting the questionnaire.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Collected Answers:</h3>
              <div className="text-left space-y-2">
                {config.questions.map((question, index) => (
                  <div key={question.id} className="text-sm">
                    <span className="font-medium text-gray-700">{index + 1}. {question.title}</span>
                    <div className="text-gray-600 ml-4">
                      {answers[question.id] ? String(answers[question.id]) : '(No answer)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentStep(0);
                  setAnswers({});
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔄 Restart Preview
              </button>
              
              <button
                onClick={() => window.location.href = '/admin/questionnaire'}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Return to Setup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = config.questions[currentStep];
  const progress = ((currentStep + 1) / config.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">📋 Questionnaire Preview</h1>
              <p className="text-sm text-gray-600">This is how your questionnaire will appear to users</p>
            </div>
            <button
              onClick={() => window.location.href = '/admin/questionnaire'}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Return to Setup
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentStep + 1} of {config.questions.length}
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

        {/* Current Question */}
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentQuestion.title}
              {currentQuestion.required && <span className="text-red-500 ml-1">*</span>}
            </h2>
            {currentQuestion.description && (
              <p className="text-gray-600">{currentQuestion.description}</p>
            )}
          </div>

          <div className="mb-8">
            {renderQuestion(currentQuestion)}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                currentStep === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ← Previous
            </button>

            <div className="text-center">
              {currentQuestion.required && !isCurrentQuestionAnswered() && (
                <p className="text-sm text-red-600 mb-2">This question is required</p>
              )}
            </div>

            {currentStep === config.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={currentQuestion.required && !isCurrentQuestionAnswered()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentQuestion.required && !isCurrentQuestionAnswered()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Submit ✓
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentQuestion.required && !isCurrentQuestionAnswered()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentQuestion.required && !isCurrentQuestionAnswered()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Preview Notice */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <span className="text-yellow-600 text-lg mr-3">👁️</span>
            <div>
              <h4 className="font-medium text-yellow-900">Preview Mode</h4>
              <p className="text-yellow-800 text-sm mt-1">
                This is exactly how your questionnaire will appear to users. The progress bar, 
                navigation, and validation all work as they would in the live version.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 