'use client';

import React, { useState, useEffect } from 'react';

interface QaConfig {
  domain: string;
  workflowId: string;
  searchSettings: {
    embeddingModel: string;
    chunkSize: number;
    chunkOverlap: number;
    maxRetrievedChunks: number;
    similarityThreshold: number;
  };
  responseSettings: {
    maxResponseLength: number;
    includeSourceCitations: boolean;
    responseStyle: string;
    confidenceThreshold: number;
  };
  suggestedQuestions: string[];
  domainKnowledge: {
    expertiseLevel: string;
    contextPrompt: string;
  };
  ui: {
    enableSuggestedQuestions: boolean;
    showSourceCitations: boolean;
    enableFollowUpQuestions: boolean;
    maxChatHistory: number;
    placeholderText: string;
  };
  advanced: {
    enableSemanticCaching: boolean;
    enableQueryExpansion: boolean;
    enableContextFiltering: boolean;
    debugMode: boolean;
  };
}

export default function QaConfigPage() {
  const [config, setConfig] = useState<QaConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'questions' | 'advanced'>('basic');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/qa/config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching Q&A config:', error);
      showNotification('error', 'Failed to load Q&A configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSave = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/qa/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Q&A configuration saved successfully!');
      } else {
        showNotification('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving Q&A config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndComplete = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/qa/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Q&A configuration saved and setup completed successfully!');
        // Mark workflow setup as complete
        localStorage.setItem('workflowSetupComplete', 'true');
        // Navigate back to dashboard to show completion status
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1500);
      } else {
        showNotification('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving Q&A config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addSuggestedQuestion = () => {
    if (!config) return;
    
    setConfig({
      ...config,
      suggestedQuestions: [...(config.suggestedQuestions || []), 'New suggested question']
    });
  };

  const updateSuggestedQuestion = (index: number, value: string) => {
    if (!config || !config.suggestedQuestions) return;
    
    const updatedQuestions = [...config.suggestedQuestions];
    updatedQuestions[index] = value;
    
    setConfig({
      ...config,
      suggestedQuestions: updatedQuestions
    });
  };

  const removeSuggestedQuestion = (index: number) => {
    if (!config || !config.suggestedQuestions) return;
    
    setConfig({
      ...config,
      suggestedQuestions: config.suggestedQuestions.filter((_, i) => i !== index)
    });
  };

  // Domain-specific helper functions
  const getDomainPlaceholder = (domain?: string) => {
    const placeholders = {
      property: "Ask about legal issues, property risks, or survey findings...",
      legal: "Ask about contract terms, legal risks, or compliance requirements...",
      financial: "Ask about financial metrics, risks, or performance indicators...",
      technical: "Ask about technical specifications, compliance, or implementation..."
    };
    return placeholders[domain as keyof typeof placeholders] || "Ask a question about the documents...";
  };

  const getDomainContextPrompt = (domain?: string) => {
    const prompts = {
      property: `You are a property analysis expert with 20+ years of experience in UK property law and conveyancing. When answering questions about property documents:

1. Focus on legal compliance, risks, and structural concerns
2. Identify any planning permission or building regulation issues
3. Highlight financial viability and market considerations
4. Provide clear risk assessments (High/Medium/Low)
5. Reference specific document sections when possible
6. Flag critical issues requiring immediate attention

Always maintain professional, accurate guidance focused on practical property transaction implications.`,

      legal: `You are a senior legal counsel with expertise in contract law, compliance, and commercial law. When analyzing legal documents:

1. Identify key contractual obligations and terms
2. Assess legal risks and potential liabilities
3. Check regulatory compliance requirements
4. Highlight ambiguous or problematic clauses
5. Provide specific legal references where applicable
6. Categorize risks (Critical/High/Medium/Low)

Maintain the highest standards of legal accuracy and provide actionable legal insights.`,

      financial: `You are a senior financial analyst and chartered accountant with expertise in financial due diligence and corporate finance. When analyzing financial documents:

1. Calculate and interpret key financial ratios
2. Identify trends and performance indicators
3. Assess financial risks and liquidity concerns
4. Provide benchmarking against industry standards
5. Highlight red flags requiring immediate attention
6. Use quantitative analysis wherever possible

Focus on data-driven insights that inform investment and business decisions.`,

      technical: `You are a senior technical expert with broad expertise across engineering and technical domains. When reviewing technical documents:

1. Assess technical feasibility and implementation challenges
2. Check compliance with industry standards
3. Identify security vulnerabilities and technical risks
4. Evaluate performance and scalability concerns
5. Recommend optimization opportunities
6. Flag critical technical issues requiring specialist attention

Provide practical technical insights that inform business and engineering decisions.`
    };
    return prompts[domain as keyof typeof prompts] || "You are an expert analyst. Provide accurate, professional analysis based on the documents with clear insights and recommendations.";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading Q&A configuration...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load configuration</p>
          <button 
            onClick={fetchConfig}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Q&A Configuration</h1>
            <p className="text-gray-600">Configure intelligent document Q&A for your clients</p>
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
              💬 Domain: {config.domain ? config.domain.charAt(0).toUpperCase() + config.domain.slice(1) : 'Loading'} Q&A
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Back to Dashboard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleSaveAndComplete}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save & Complete Setup'}
            </button>
          </div>
        </div>

        {/* Simplified Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Basic Settings' },
                { id: 'questions', label: 'Suggested Questions', count: config.suggestedQuestions?.length || 0 },
                { id: 'advanced', label: 'Advanced Options' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Settings Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-green-900 font-medium text-sm">Optimized for {config.domain ? config.domain.charAt(0).toUpperCase() + config.domain.slice(1) : 'Your'} Domain</h3>
                      <p className="text-green-700 text-xs">Q&A system pre-configured with recommended settings</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Response Style</label>
                    <select
                      value={config.responseSettings?.responseStyle || 'professional'}
                      onChange={(e) => setConfig({
                        ...config,
                        responseSettings: {...(config.responseSettings || {}), responseStyle: e.target.value}
                      })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="professional">Professional</option>
                      <option value="conversational">Conversational</option>
                      <option value="technical">Technical</option>
                      <option value="brief">Brief</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chat Input Placeholder</label>
                    <input
                      type="text"
                      value={config.ui?.placeholderText || getDomainPlaceholder(config.domain)}
                      onChange={(e) => setConfig({
                        ...config,
                        ui: {...(config.ui || {}), placeholderText: e.target.value}
                      })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ask a question about the documents..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain Context Instructions</label>
                  <textarea
                    value={config.domainKnowledge?.contextPrompt || getDomainContextPrompt(config.domain)}
                    onChange={(e) => setConfig({
                      ...config,
                      domainKnowledge: {...(config.domainKnowledge || {}), contextPrompt: e.target.value}
                    })}
                    rows={3}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Custom instructions to guide AI responses..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Pre-populated with domain-specific expert guidance</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Display Options</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                      { 
                        key: 'enableSuggestedQuestions', 
                        label: 'Show Suggested Questions',
                        checked: config.ui?.enableSuggestedQuestions ?? true
                      },
                      { 
                        key: 'showSourceCitations', 
                        label: 'Show Document References',
                        checked: config.ui?.showSourceCitations ?? true
                      },
                      { 
                        key: 'includeSourceCitations', 
                        label: 'Include Citations in Responses',
                        checked: config.responseSettings?.includeSourceCitations ?? true
                      }
                    ].map((option) => (
                      <label key={option.key} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={option.checked}
                          onChange={(e) => {
                            if (option.key === 'includeSourceCitations') {
                              setConfig({
                                ...config,
                                responseSettings: {...(config.responseSettings || {}), includeSourceCitations: e.target.checked}
                              });
                            } else {
                              setConfig({
                                ...config,
                                ui: {
                                  ...(config.ui || {}),
                                  [option.key]: e.target.checked
                                }
                              });
                            }
                          }}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-xs text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Suggested Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Suggested Questions</h3>
                    <p className="text-sm text-gray-600">Help users get started with relevant questions</p>
                  </div>
                  <button
                    onClick={addSuggestedQuestion}
                    className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + Add Question
                  </button>
                </div>
                <div className="space-y-2">
                  {config.suggestedQuestions?.map((question, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => updateSuggestedQuestion(index, e.target.value)}
                        className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter a suggested question..."
                      />
                      <button
                        onClick={() => removeSuggestedQuestion(index)}
                        className="px-2 py-1.5 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {(!config.suggestedQuestions || config.suggestedQuestions.length === 0) && (
                    <div className="text-center py-6 text-gray-500">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-sm">No suggested questions configured</p>
                      <p className="text-xs text-gray-500">Add questions to help users get started</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Options Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-yellow-900 font-medium text-sm">Advanced Settings</h3>
                      <p className="text-yellow-700 text-xs">Pre-optimized settings. Only modify if needed.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Response Length</label>
                    <input
                      type="number"
                      value={config.responseSettings?.maxResponseLength || 500}
                      onChange={(e) => setConfig({
                        ...config,
                        responseSettings: {...(config.responseSettings || {}), maxResponseLength: parseInt(e.target.value)}
                      })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      min="100"
                      max="2000"
                    />
                    <p className="text-xs text-gray-500 mt-1">Max chars in responses</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Chat History</label>
                    <input
                      type="number"
                      value={config.ui?.maxChatHistory || 20}
                      onChange={(e) => setConfig({
                        ...config,
                        ui: {...(config.ui || {}), maxChatHistory: parseInt(e.target.value)}
                      })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      min="5"
                      max="100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Previous messages</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confidence Threshold</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.responseSettings?.confidenceThreshold || 0.6}
                      onChange={(e) => setConfig({
                        ...config,
                        responseSettings: {...(config.responseSettings || {}), confidenceThreshold: parseFloat(e.target.value)}
                      })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      min="0.1"
                      max="1.0"
                    />
                    <p className="text-xs text-gray-500 mt-1">Answer confidence</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Technical Settings (Domain-Optimized)</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Embedding Model:</span>
                      <span className="font-medium">{config.searchSettings?.embeddingModel || 'ada-002'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chunk Size:</span>
                      <span className="font-medium">{config.searchSettings?.chunkSize || 1000}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Chunks:</span>
                      <span className="font-medium">{config.searchSettings?.maxRetrievedChunks || 5}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Similarity:</span>
                      <span className="font-medium">{config.searchSettings?.similarityThreshold || 0.7}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Automatically optimized for {config.domain} domain analysis
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 