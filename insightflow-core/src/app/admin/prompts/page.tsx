'use client';

import React, { useState, useEffect } from 'react';

interface PromptVariable {
  name: string;
  description: string;
  required: boolean;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

interface PromptsConfig {
  domain: string;
  workflowId: string;
  prompts: PromptTemplate[];
  variables: PromptVariable[];
  settings: {
    enableVariableValidation: boolean;
    allowCustomPrompts: boolean;
    maxPromptLength: number;
    enableTemplateLibrary: boolean;
  };
}

export default function PromptsConfigPage() {
  const [config, setConfig] = useState<PromptsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<string>('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/prompts/config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
        if (data.config.prompts?.length > 0) {
          setSelectedPrompt(data.config.prompts[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching prompts config:', error);
      showNotification('error', 'Failed to load prompts configuration');
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
      const response = await fetch('/api/prompts/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Prompts configuration saved successfully!');
      } else {
        showNotification('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving prompts config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/prompts/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Prompts configuration saved successfully!');
        // Navigate to the next step in the workflow (LLM)
        setTimeout(() => {
          window.location.href = '/admin/llm';
        }, 1000);
      } else {
        showNotification('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving prompts config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addNewPrompt = () => {
    if (!config) return;
    
    const newPrompt: PromptTemplate = {
      id: `custom_prompt_${Date.now()}`,
      name: 'New Custom Prompt',
      description: 'Custom analysis prompt',
      template: `Analyze the following document for:

1. **Key Insights**: Identify main points and findings
2. **Risk Assessment**: Highlight potential risks or concerns  
3. **Recommendations**: Provide actionable next steps

Document: {{DOCUMENT_TEXT}}

Please provide a detailed analysis with clear findings.`
    };

    setConfig({
      ...config,
      prompts: [...config.prompts, newPrompt]
    });
    setSelectedPrompt(newPrompt.id);
  };

  const updatePrompt = (promptId: string, field: keyof PromptTemplate, value: string) => {
    if (!config) return;
    
    setConfig({
      ...config,
      prompts: config.prompts.map(prompt => 
        prompt.id === promptId ? { ...prompt, [field]: value } : prompt
      )
    });
  };

  const removePrompt = (promptId: string) => {
    if (!config) return;
    
    setConfig({
      ...config,
      prompts: config.prompts.filter(prompt => prompt.id !== promptId)
    });
    
    if (selectedPrompt === promptId && config.prompts.length > 1) {
      setSelectedPrompt(config.prompts.find(p => p.id !== promptId)?.id || '');
    }
  };

  const selectedPromptData = config?.prompts.find(p => p.id === selectedPrompt);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading prompts configuration...</p>
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
            <h1 className="text-2xl font-bold text-gray-900">Prompt Manager</h1>
            <p className="text-gray-600">Configure expert analysis prompts for your domain</p>
            <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
              📝 Domain: {config.domain.charAt(0).toUpperCase() + config.domain.slice(1)} Analysis
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

        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar - Prompt List */}
          <div className="col-span-4">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Analysis Prompts</h3>
                  <button
                    onClick={addNewPrompt}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    + Add Custom
                  </button>
                </div>
              </div>
              <div className="divide-y">
                {config.prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedPrompt === prompt.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                    }`}
                    onClick={() => setSelectedPrompt(prompt.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{prompt.name}</h4>
                      {prompt.id.startsWith('custom_') && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePrompt(prompt.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                    <div className="text-xs text-gray-500 mt-2">
                      {prompt.template.length} characters
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Variables Reference */}
            <div className="bg-white rounded-lg shadow-sm border mt-6">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900">Available Variables</h3>
              </div>
              <div className="p-4 space-y-3">
                {config.variables.map((variable) => (
                  <div key={variable.name} className="text-sm">
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                      {`{{${variable.name}}}`}
                    </code>
                    <p className="text-gray-600 mt-1">{variable.description}</p>
                    {variable.required && (
                      <span className="text-xs text-red-600">Required</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Prompt Editor */}
          <div className="col-span-8">
            {selectedPromptData ? (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prompt Name
                      </label>
                      <input
                        type="text"
                        value={selectedPromptData.name}
                        onChange={(e) => updatePrompt(selectedPrompt, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={selectedPromptData.description}
                        onChange={(e) => updatePrompt(selectedPrompt, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt Template
                  </label>
                  <textarea
                    value={selectedPromptData.template}
                    onChange={(e) => updatePrompt(selectedPrompt, 'template', e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    placeholder="Enter your prompt template here. Use {{VARIABLE_NAME}} for dynamic content."
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {selectedPromptData.template.length} / {config.settings.maxPromptLength} characters
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <p className="text-gray-600">Select a prompt to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 