'use client';

import React, { useState } from 'react';
import { QuestionnaireConfig } from './types';
import { generateQuestionnaire, getDomainOptions, getMaxQuestionsForDomain } from './question-generator';

interface DomainSelectorProps {
  onGenerate: (config: QuestionnaireConfig) => void;
  onCancel: () => void;
}

export default function DomainSelector({ onGenerate, onCancel }: DomainSelectorProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const domainOptions = getDomainOptions();
  const maxQuestions = selectedDomain ? getMaxQuestionsForDomain(selectedDomain) : 0;

  const handleDomainChange = (domain: string) => {
    setSelectedDomain(domain);
    const domainOption = domainOptions.find(opt => opt.value === domain);
    if (domainOption) {
      setTitle(`${domainOption.label} Questionnaire`);
      setDescription(domainOption.description);
    }
    // Reset question count if it exceeds the new domain's max
    const maxForDomain = getMaxQuestionsForDomain(domain);
    if (questionCount > maxForDomain) {
      setQuestionCount(Math.min(5, maxForDomain));
    }
  };

  const handleGenerate = () => {
    if (!selectedDomain || !title) return;

    try {
      const questions = generateQuestionnaire(selectedDomain, questionCount);
      const config: QuestionnaireConfig = {
        title,
        description,
        questions
      };
      onGenerate(config);
    } catch (error) {
      console.error('Error generating questionnaire:', error);
      alert('Error generating questionnaire. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Generate Questionnaire</h2>
        <p className="text-gray-600">
          Choose a domain and specify how many questions you'd like. We'll automatically generate relevant questions for your review process.
        </p>
      </div>

      <div className="space-y-6">
        {/* Domain Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Domain *
          </label>
          <div className="grid grid-cols-1 gap-3">
            {domainOptions.map((option) => (
              <div
                key={option.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedDomain === option.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleDomainChange(option.value)}
              >
                <div className="flex items-start">
                  <input
                    type="radio"
                    name="domain"
                    value={option.value}
                    checked={selectedDomain === option.value}
                    onChange={() => handleDomainChange(option.value)}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{option.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    {selectedDomain === option.value && (
                      <p className="text-xs text-blue-600 mt-2">
                        Up to {getMaxQuestionsForDomain(option.value)} questions available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question Count */}
        {selectedDomain && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Questions: {questionCount}
            </label>
            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max={maxQuestions}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 question</span>
                <span className="font-medium text-blue-600">{questionCount} questions</span>
                <span>{maxQuestions} questions (max)</span>
              </div>
            </div>
          </div>
        )}

        {/* Questionnaire Title */}
        {selectedDomain && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Questionnaire Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Property Review Questionnaire"
            />
          </div>
        )}

        {/* Description */}
        {selectedDomain && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of this questionnaire's purpose"
            />
          </div>
        )}

        {/* Preview */}
        {selectedDomain && (
          <div className="p-4 bg-gray-50 rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-2">Preview</h3>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Domain:</strong> {domainOptions.find(opt => opt.value === selectedDomain)?.label}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Questions:</strong> {questionCount} auto-generated questions
            </p>
            <p className="text-sm text-gray-600">
              <strong>Title:</strong> {title || 'Untitled Questionnaire'}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-6 mt-6 border-t">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleGenerate}
          disabled={!selectedDomain || !title}
          className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Questionnaire
        </button>
      </div>
    </div>
  );
} 