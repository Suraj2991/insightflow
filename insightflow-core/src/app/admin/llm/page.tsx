'use client';

import React, { useState, useEffect } from 'react';

interface LlmConfig {
  domain: string;
  workflowId: string;
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  analysisPrompts: {
    document_review: string;
    risk_assessment: string;
    summary_generation: string;
  };
  advanced: {
    enableFunctionCalling: boolean;
    enableMemory: boolean;
    retryAttempts: number;
    timeoutSeconds: number;
    enableLogging: boolean;
  };
  apiSettings: {
    baseUrl: string;
    apiKey: string;
    organizationId: string;
    enableBatching: boolean;
  };
}

export default function LlmConfigPage() {
  const [config, setConfig] = useState<LlmConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'prompts' | 'advanced' | 'api'>('basic');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/llm/config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching LLM config:', error);
      showNotification('error', 'Failed to load LLM configuration');
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
      const response = await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'LLM configuration saved successfully!');
      } else {
        showNotification('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving LLM config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'LLM configuration saved successfully!');
        // Navigate to the next step in the workflow (Findings)
        setTimeout(() => {
          window.location.href = '/admin/findings';
        }, 1000);
      } else {
        showNotification('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving LLM config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading LLM configuration...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">LLM Engine Configuration</h1>
            <p className="text-gray-600">Configure AI model settings and expert analysis prompts</p>
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
              🤖 Domain: {config.domain.charAt(0).toUpperCase() + config.domain.slice(1)} Expert
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
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save & Continue →'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'basic', label: 'Basic Settings' },
                { id: 'prompts', label: 'Expert Prompts' },
                { id: 'advanced', label: 'Advanced Options' },
                { id: 'api', label: 'API Settings' }
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
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Basic Settings Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provider
                    </label>
                    <select
                      value={config.provider}
                      onChange={(e) => setConfig({...config, provider: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic</option>
                      <option value="azure">Azure OpenAI</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <select
                      value={config.model}
                      onChange={(e) => setConfig({...config, model: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="gpt-4">GPT-4</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                      <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature: {config.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) => setConfig({...config, temperature: parseFloat(e.target.value)})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Focused (0)</span>
                      <span>Balanced (1)</span>
                      <span>Creative (2)</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens
                    </label>
                    <input
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) => setConfig({...config, maxTokens: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="100"
                      max="4000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    System Prompt (Expert Persona)
                  </label>
                  <textarea
                    value={config.systemPrompt}
                    onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Define the AI's expertise and analysis approach..."
                  />
                </div>
              </div>
            )}

            {/* Expert Prompts Tab */}
            {activeTab === 'prompts' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Review Prompt
                  </label>
                  <textarea
                    value={config.analysisPrompts.document_review}
                    onChange={(e) => setConfig({
                      ...config,
                      analysisPrompts: {...config.analysisPrompts, document_review: e.target.value}
                    })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Prompt for general document analysis..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Assessment Prompt
                  </label>
                  <textarea
                    value={config.analysisPrompts.risk_assessment}
                    onChange={(e) => setConfig({
                      ...config,
                      analysisPrompts: {...config.analysisPrompts, risk_assessment: e.target.value}
                    })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Prompt for risk identification and assessment..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Summary Generation Prompt
                  </label>
                  <textarea
                    value={config.analysisPrompts.summary_generation}
                    onChange={(e) => setConfig({
                      ...config,
                      analysisPrompts: {...config.analysisPrompts, summary_generation: e.target.value}
                    })}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Prompt for generating comprehensive summaries..."
                  />
                </div>
              </div>
            )}

            {/* Advanced Options Tab */}
            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Retry Attempts
                    </label>
                    <input
                      type="number"
                      value={config.advanced.retryAttempts}
                      onChange={(e) => setConfig({
                        ...config,
                        advanced: {...config.advanced, retryAttempts: parseInt(e.target.value)}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      max="5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeout (seconds)
                    </label>
                    <input
                      type="number"
                      value={config.advanced.timeoutSeconds}
                      onChange={(e) => setConfig({
                        ...config,
                        advanced: {...config.advanced, timeoutSeconds: parseInt(e.target.value)}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="10"
                      max="300"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Advanced Features</h4>
                  {[
                    { key: 'enableFunctionCalling', label: 'Enable Function Calling', description: 'Allow the AI to call external functions' },
                    { key: 'enableMemory', label: 'Enable Memory', description: 'Maintain context across multiple requests' },
                    { key: 'enableLogging', label: 'Enable Detailed Logging', description: 'Log all AI interactions for debugging' }
                  ].map((option) => (
                    <div key={option.key} className="flex items-start">
                      <input
                        type="checkbox"
                        checked={config.advanced[option.key as keyof typeof config.advanced] as boolean}
                        onChange={(e) => setConfig({
                          ...config,
                          advanced: {
                            ...config.advanced,
                            [option.key]: e.target.checked
                          }
                        })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-700">{option.label}</span>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* API Settings Tab */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Base URL
                  </label>
                  <input
                    type="url"
                    value={config.apiSettings.baseUrl}
                    onChange={(e) => setConfig({
                      ...config,
                      apiSettings: {...config.apiSettings, baseUrl: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={config.apiSettings.apiKey}
                    onChange={(e) => setConfig({
                      ...config,
                      apiSettings: {...config.apiSettings, apiKey: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="sk-..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Your API key is securely stored and never displayed in logs.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={config.apiSettings.organizationId}
                    onChange={(e) => setConfig({
                      ...config,
                      apiSettings: {...config.apiSettings, organizationId: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="org-..."
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.apiSettings.enableBatching}
                    onChange={(e) => setConfig({
                      ...config,
                      apiSettings: {...config.apiSettings, enableBatching: e.target.checked}
                    })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-700">Enable Request Batching</span>
                    <p className="text-sm text-gray-500">Batch multiple requests for better performance</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 