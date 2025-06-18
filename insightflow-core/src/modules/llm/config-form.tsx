'use client';

import React, { useState, useEffect } from 'react';
import { LLMConfig, LLM_PROVIDERS, DOMAIN_LLM_CONFIGS, DOCUMENT_ONLY_PROMPTS, defaultLLMConfig, processSystemPrompt } from './types';

interface LLMConfigFormProps {
  onSave?: (config: LLMConfig) => void;
  onNext?: () => void;
}

export default function LLMConfigForm({ onSave, onNext }: LLMConfigFormProps) {
  const [config, setConfig] = useState<LLMConfig>({
    ...defaultLLMConfig,
    organizationId: '',
    workflowId: 'default'
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      
      // Check if questionnaire exists and detect domain
      const questionnaireResponse = await fetch('/api/questionnaire');
      const questionnaireData = await questionnaireResponse.json();
      
      if (questionnaireData.questionnaire && questionnaireData.questionnaire.config?.questions?.length > 0) {
        // Questionnaire exists - configure with questionnaire integration
        const domain = detectDomainFromQuestionnaire(questionnaireData.questionnaire);
        if (domain) {
          setSelectedDomain(domain);
          autoConfigureLLM(domain, true);
          setSaveStatus(`✅ Auto-configured LLM for ${domain} domain with questionnaire integration and expert prompts`);
        }
        setConfig(prev => ({
          ...prev,
          organizationId: questionnaireData.organizationId,
          includeQuestionnaire: true,
          documentOnlyMode: false
        }));
      } else {
        // No questionnaire - offer document-only configuration
        setSaveStatus('ℹ️ No questionnaire detected. Configure for document-only analysis or complete questionnaire first.');
        setConfig(prev => ({
          ...prev,
          organizationId: questionnaireData.organizationId || '',
          includeQuestionnaire: false,
          documentOnlyMode: true,
          description: 'Document-only analysis (no questionnaire integration)'
        }));
      }
    } catch (error) {
      console.error('Error loading configuration:', error);
      setSaveStatus('❌ Error loading configuration');
    } finally {
      setLoading(false);
    }
  };

  const detectDomainFromQuestionnaire = (questionnaire: any): string | null => {
    const questions = questionnaire.config?.questions || [];
    
    if (questions.some((q: any) => q.title?.toLowerCase().includes('property'))) return 'property';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('legal'))) return 'legal';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('financial'))) return 'financial';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('technical'))) return 'technical';
    
    return null;
  };

  const autoConfigureLLM = (domain: string, hasQuestionnaire: boolean = true) => {
    const domainConfig = DOMAIN_LLM_CONFIGS[domain as keyof typeof DOMAIN_LLM_CONFIGS];
    if (domainConfig) {
      const systemPrompt = hasQuestionnaire 
        ? domainConfig.systemPrompt 
        : DOCUMENT_ONLY_PROMPTS[domain as keyof typeof DOCUMENT_ONLY_PROMPTS];
      
      setConfig(prev => ({
        ...prev,
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} LLM Configuration`,
        description: hasQuestionnaire 
          ? `Optimized AI settings for ${domain} document analysis with questionnaire integration`
          : `Optimized AI settings for ${domain} document-only analysis`,
        provider: domainConfig.provider,
        model: domainConfig.model,
        temperature: domainConfig.temperature,
        maxTokens: domainConfig.maxTokens,
        includeQuestionnaire: hasQuestionnaire,
        documentOnlyMode: !hasQuestionnaire,
        systemPrompt: systemPrompt
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSaveStatus('💾 Saving LLM configuration...');
      
      // Simulate save API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('✅ LLM configuration saved! Ready for Module 8: Document Q&A');
      onSave?.(config);
      
      setTimeout(() => {
        setSaveStatus('✅ Configuration saved! Ready to proceed to Module 8: Document Q&A');
      }, 1000);
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('❌ Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const getTemperatureLabel = (temp: number): string => {
    if (temp <= 0.1) return 'Very Conservative (Legal/Compliance)';
    if (temp <= 0.3) return 'Conservative (Analysis)';
    if (temp <= 0.5) return 'Balanced';
    if (temp <= 0.7) return 'Creative';
    return 'Very Creative';
  };

  const getMaxTokensLabel = (tokens: number): string => {
    if (tokens <= 1000) return 'Short responses';
    if (tokens <= 2000) return 'Medium responses';
    if (tokens <= 4000) return 'Detailed responses';
    return 'Very detailed responses';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">LLM Configuration</h2>
        <p className="text-gray-600">
          Configure AI model settings for intelligent document analysis.
        </p>
        {saveStatus && (
          <p className="text-sm mt-2 p-2 bg-gray-50 rounded border">{saveStatus}</p>
        )}
      </div>

      {/* Domain Status */}
      {selectedDomain && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            <div>
              <span className="font-medium text-green-900">
                {selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} Domain Detected
              </span>
              <p className="text-sm text-green-700 mt-1">
                Auto-configured with expert {selectedDomain} prompts and optimized AI settings
              </p>
            </div>
          </div>
        </div>
      )}



      {/* AI Provider & Model */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">AI Provider & Model</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI Provider *
            </label>
            <select
              value={config.provider}
              onChange={(e) => {
                const provider = e.target.value as any;
                const availableModels = LLM_PROVIDERS.find(p => p.id === provider)?.models || [];
                setConfig(prev => ({ 
                  ...prev, 
                  provider,
                  model: availableModels[0] || prev.model
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LLM_PROVIDERS.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {LLM_PROVIDERS.find(p => p.id === config.provider)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Model *
            </label>
            <select
              value={config.model}
              onChange={(e) => setConfig(prev => ({ ...prev, model: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {(LLM_PROVIDERS.find(p => p.id === config.provider)?.models || []).map(model => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* AI Parameters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">AI Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Temperature: {config.temperature}
            </label>
            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.temperature}
                onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Conservative</span>
                <span>Creative</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-1">{getTemperatureLabel(config.temperature)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Response Length
            </label>
            <select
              value={config.maxTokens}
              onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1000}>1,000 tokens</option>
              <option value={2000}>2,000 tokens</option>
              <option value={4000}>4,000 tokens</option>
              <option value={8000}>8,000 tokens</option>
            </select>
            <p className="text-xs text-blue-600 mt-1">{getMaxTokensLabel(config.maxTokens)}</p>
          </div>
        </div>
      </div>

      {/* Workflow Configuration */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Workflow Configuration</h3>
        <div className="space-y-4">
          {/* Questionnaire Integration */}
          <div className="p-4 border rounded-lg bg-gray-50">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="includeQuestionnaire"
                checked={config.includeQuestionnaire}
                onChange={(e) => {
                  const includeQuestionnaire = e.target.checked;
                  setConfig(prev => ({ 
                    ...prev, 
                    includeQuestionnaire,
                    documentOnlyMode: !includeQuestionnaire 
                  }));
                  
                  // Update prompts based on new setting
                  if (selectedDomain) {
                    autoConfigureLLM(selectedDomain, includeQuestionnaire);
                  }
                }}
                className="mt-1"
              />
              <div className="flex-1">
                <label htmlFor="includeQuestionnaire" className="font-medium text-gray-900">
                  Include Questionnaire Data in Analysis
                </label>
                <p className="text-sm text-gray-600 mt-1">
                  {config.includeQuestionnaire 
                    ? "AI will use questionnaire responses to provide contextual, personalized analysis tailored to client needs."
                    : "AI will focus purely on document analysis without questionnaire context."}
                </p>
              </div>
            </div>
          </div>

          {/* Document-Only Mode Warning */}
          {config.documentOnlyMode && (
            <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
              <div className="flex items-start space-x-3">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div>
                  <h4 className="font-medium text-yellow-900">Document-Only Analysis Mode</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    The AI will analyze documents independently without client questionnaire context. 
                    This may result in more generic analysis. Consider completing the questionnaire 
                    for more personalized insights.
                  </p>
                  <button
                    onClick={() => window.location.href = '/admin'}
                    className="mt-2 text-sm bg-yellow-200 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-300"
                  >
                    Complete Questionnaire First
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Questionnaire Integration Benefits */}
          {config.includeQuestionnaire && selectedDomain && (
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-start space-x-3">
                <span className="text-green-600 text-lg">✅</span>
                <div>
                  <h4 className="font-medium text-green-900">Enhanced Analysis with Questionnaire</h4>
                  <p className="text-sm text-green-800 mt-1">
                    The AI will incorporate client questionnaire responses to provide:
                  </p>
                  <ul className="text-sm text-green-800 mt-2 space-y-1">
                    <li>• Personalized analysis based on client concerns</li>
                    <li>• Focus on areas most relevant to client situation</li>
                    <li>• Cross-referencing between documents and questionnaire responses</li>
                    <li>• Identification of any contradictions or missing information</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Domain Selection for Document-Only Mode */}
          {config.documentOnlyMode && !selectedDomain && (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <h4 className="font-medium text-blue-900 mb-3">Select Domain for Document Analysis</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(DOMAIN_LLM_CONFIGS).map(([domain, domainConfig]) => (
                  <button
                    key={domain}
                    onClick={() => {
                      setSelectedDomain(domain);
                      autoConfigureLLM(domain, false);
                      setSaveStatus(`✅ Configured for ${domain} document-only analysis`);
                    }}
                    className="p-3 text-left border border-blue-300 rounded hover:bg-blue-100 transition-colors"
                  >
                    <div className="font-medium text-blue-900 capitalize">{domain}</div>
                    <div className="text-sm text-blue-700">
                      {domain === 'property' && 'Property law, conveyancing, surveys'}
                      {domain === 'legal' && 'Contracts, compliance, legal analysis'}
                      {domain === 'financial' && 'Due diligence, financial analysis'}
                      {domain === 'technical' && 'Technical specs, engineering docs'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* System Prompt */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">System Prompt</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expert Instructions for AI *
            </label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Define the AI's role, expertise, and instructions..."
            />
            <p className="text-xs text-gray-500 mt-1">
              This prompt defines the AI's expertise and behavior. Domain-specific prompts are automatically configured.
            </p>
          </div>

          {/* Quick Actions */}
          {selectedDomain && (
            <div className="flex gap-2">
              <button
                onClick={() => autoConfigureLLM(selectedDomain, config.includeQuestionnaire)}
                className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
              >
                ↻ Reset to {selectedDomain} Expert Prompt
                {config.documentOnlyMode && ' (Document-Only)'}
              </button>
              <button
                onClick={() => setConfig(prev => ({ 
                  ...prev, 
                  systemPrompt: defaultLLMConfig.systemPrompt,
                  includeQuestionnaire: defaultLLMConfig.includeQuestionnaire,
                  documentOnlyMode: defaultLLMConfig.documentOnlyMode
                }))}
                className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
              >
                Reset to Basic Prompt
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={() => window.location.href = '/admin'}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium flex items-center gap-2"
        >
          ← Dashboard
        </button>

        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading || !config.systemPrompt}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>

          <button
            onClick={() => window.location.href = '/admin/reports'}
            disabled={!saveStatus.includes('Configuration saved') && !saveStatus.includes('Configured for')}
            className={`px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-colors ${
              saveStatus.includes('Configuration saved') || saveStatus.includes('Configured for')
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next: Report Builder
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
} 