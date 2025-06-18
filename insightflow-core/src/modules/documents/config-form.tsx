'use client';

import React, { useState, useEffect } from 'react';
import { DocumentConfig, DocumentType, DOMAIN_DOCUMENT_TYPES, defaultDocumentConfig } from './types';

interface DocumentConfigFormProps {
  onSave?: (config: DocumentConfig) => void;
  onNext?: () => void;
}

export default function DocumentConfigForm({ onSave, onNext }: DocumentConfigFormProps) {
  const [config, setConfig] = useState<DocumentConfig>({
    ...defaultDocumentConfig,
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
      // Try to detect domain from questionnaire first
      const questionnaireResponse = await fetch('/api/questionnaire');
      const questionnaireData = await questionnaireResponse.json();
      
      if (questionnaireData.questionnaire) {
        const domain = detectDomainFromQuestionnaire(questionnaireData.questionnaire);
        if (domain) {
          setSelectedDomain(domain);
          autoConfigureDocuments(domain);
          setSaveStatus(`✅ Auto-configured for ${domain} domain with ${DOMAIN_DOCUMENT_TYPES[domain as keyof typeof DOMAIN_DOCUMENT_TYPES].length} document types`);
        }
        setConfig(prev => ({
          ...prev,
          organizationId: questionnaireData.organizationId
        }));
      } else {
        // No questionnaire found - this is document-only mode
        // Show domain selection message
        setSaveStatus('ℹ️ Document-only mode: Please select your domain below to auto-configure document types');
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
    
    // Simple domain detection based on question content
    if (questions.some((q: any) => q.title?.toLowerCase().includes('property'))) return 'property';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('legal'))) return 'legal';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('financial'))) return 'financial';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('technical'))) return 'technical';
    
    return null;
  };

  const autoConfigureDocuments = (domain: string) => {
    const domainTypes = DOMAIN_DOCUMENT_TYPES[domain as keyof typeof DOMAIN_DOCUMENT_TYPES];
    if (domainTypes) {
      setConfig(prev => ({
        ...prev,
        title: `${domain.charAt(0).toUpperCase() + domain.slice(1)} Document Requirements`,
        description: `Required documents for ${domain} workflow analysis`,
        documentTypes: domainTypes.map(type => ({ ...type }))
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSaveStatus('💾 Saving document configuration...');
      
      // Simulate save API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('✅ Document configuration saved! Ready for Module 5: LLM Configuration');
      onSave?.(config);
      
      setTimeout(() => {
        setSaveStatus('✅ Configuration saved! Ready to proceed to Module 5: LLM Configuration');
      }, 1000);
      
    } catch (error) {
      console.error('Error saving configuration:', error);
      setSaveStatus('❌ Error saving configuration');
    } finally {
      setLoading(false);
    }
  };

  const updateDocumentType = (index: number, updates: Partial<DocumentType>) => {
    const updatedTypes = config.documentTypes.map((type, i) => 
      i === index ? { ...type, ...updates } : type
    );
    setConfig(prev => ({ ...prev, documentTypes: updatedTypes }));
  };

  const addDocumentType = () => {
    const newType: DocumentType = {
      id: `custom_${Date.now()}`,
      name: 'New Document Type',
      description: 'Description of required document',
      required: false,
      acceptedFormats: ['pdf'],
      maxSizeKB: 5120
    };
    setConfig(prev => ({
      ...prev,
      documentTypes: [...prev.documentTypes, newType]
    }));
  };

  const removeDocumentType = (index: number) => {
    const updatedTypes = config.documentTypes.filter((_, i) => i !== index);
    setConfig(prev => ({ ...prev, documentTypes: updatedTypes }));
  };

  const formatFileSize = (kb: number): string => {
    if (kb >= 1024) {
      return `${(kb / 1024).toFixed(1)}MB`;
    }
    return `${kb}KB`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Document Upload Configuration</h2>
        </div>
        <p className="text-gray-600">
          Configure what types of documents users need to upload for analysis.
        </p>
        {saveStatus && (
          <p className="text-sm mt-2 p-2 bg-gray-50 rounded border">{saveStatus}</p>
        )}
      </div>

      {/* Domain Status */}
      {selectedDomain ? (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
            <div>
              <span className="font-medium text-green-900">
                {selectedDomain.charAt(0).toUpperCase() + selectedDomain.slice(1)} Domain Selected
              </span>
              <p className="text-sm text-green-700 mt-1">
                Auto-configured with {config.documentTypes.length} document types for {selectedDomain} workflows
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Select Your Domain</h3>
          <p className="text-blue-700 mb-4">Choose your industry domain to auto-configure document types:</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries({
              property: { name: "Property", icon: "🏠" },
              legal: { name: "Legal", icon: "⚖️" },
              financial: { name: "Financial", icon: "💼" },
              technical: { name: "Technical", icon: "🔧" }
            }).map(([domain, info]) => (
              <button
                key={domain}
                onClick={() => {
                  setSelectedDomain(domain);
                  autoConfigureDocuments(domain);
                  setSaveStatus(`✅ Auto-configured for ${domain} domain with ${DOMAIN_DOCUMENT_TYPES[domain as keyof typeof DOMAIN_DOCUMENT_TYPES].length} document types`);
                }}
                className="p-4 text-center border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-100 transition-all"
              >
                <div className="text-2xl mb-2">{info.icon}</div>
                <div className="font-medium text-blue-900">{info.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Basic Configuration */}
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Configuration Title *
          </label>
          <input
            type="text"
            value={config.title}
            onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Property Document Requirements"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={config.description || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of document requirements"
          />
        </div>
      </div>

      {/* Document Types */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Document Types ({config.documentTypes.length})</h3>
          <button
            onClick={addDocumentType}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
          >
            + Add Document Type
          </button>
        </div>

        {config.documentTypes.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-gray-400 text-4xl mb-2">📁</div>
            <p className="text-gray-500">No document types configured. Add document types to specify what users need to upload.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {config.documentTypes.map((docType, index) => (
              <div key={docType.id} className="p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                      Document {index + 1}
                    </span>
                    <label className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={docType.required}
                        onChange={(e) => updateDocumentType(index, { required: e.target.checked })}
                        className="mr-2"
                      />
                      Required
                    </label>
                  </div>
                  <button
                    onClick={() => removeDocumentType(index)}
                    className="text-red-600 hover:text-red-800 text-sm px-3 py-1 rounded hover:bg-red-50 border border-red-200"
                  >
                    Remove
                  </button>
                </div>

                {/* Document Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Document Name *
                    </label>
                    <input
                      type="text"
                      value={docType.name}
                      onChange={(e) => updateDocumentType(index, { name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Purchase Contract"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Max File Size
                    </label>
                    <select
                      value={docType.maxSizeKB}
                      onChange={(e) => updateDocumentType(index, { maxSizeKB: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={1024}>1MB</option>
                      <option value={2048}>2MB</option>
                      <option value={5120}>5MB</option>
                      <option value={10240}>10MB</option>
                      <option value={20480}>20MB</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={docType.description}
                    onChange={(e) => updateDocumentType(index, { description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe what this document should contain..."
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Accepted File Formats
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['pdf', 'doc', 'docx', 'txt', 'xlsx', 'xls', 'png', 'jpg', 'dwg', 'dxf'].map(format => (
                      <label key={format} className="flex items-center text-sm bg-gray-50 px-3 py-2 rounded border">
                        <input
                          type="checkbox"
                          checked={docType.acceptedFormats.includes(format)}
                          onChange={(e) => {
                            const formats = e.target.checked 
                              ? [...docType.acceptedFormats, format]
                              : docType.acceptedFormats.filter(f => f !== format);
                            updateDocumentType(index, { acceptedFormats: formats });
                          }}
                          className="mr-2"
                        />
                        .{format}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Preview:</label>
                  <div className="bg-blue-50 p-3 rounded border">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          {docType.name}
                          {docType.required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{docType.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Accepts: {docType.acceptedFormats.join(', ')} • Max: {formatFileSize(docType.maxSizeKB)}
                        </p>
                      </div>
                      <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Upload Area
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
            onClick={() => {
              const previewUrl = `/admin/documents/preview?config=${encodeURIComponent(JSON.stringify(config))}`;
              window.open(previewUrl, '_blank');
            }}
            disabled={!selectedDomain || config.documentTypes.length === 0}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Preview Upload Form
          </button>

          <button
            onClick={handleSave}
            disabled={loading || !config.title || !selectedDomain}
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>

          <button
            onClick={() => window.location.href = '/admin/llm'}
            disabled={!saveStatus.includes('Auto-configured') && !saveStatus.includes('Configuration saved')}
            className={`px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-colors ${
              saveStatus.includes('Auto-configured') || saveStatus.includes('Configuration saved')
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            Next: LLM Configuration
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
} 