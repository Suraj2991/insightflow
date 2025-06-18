'use client';

import React, { useState, useEffect } from 'react';

interface DocumentType {
  type: string;
  description: string;
  formats: string[];
  maxSize: string;
}

interface DocumentsConfig {
  domain: string;
  workflowId: string;
  uploadMode: string;
  required: DocumentType[];
  optional: DocumentType[];
  settings: {
    maxFileSize: string;
    allowedFormats: string[];
    autoExtractText: boolean;
    requireAllDocuments: boolean;
    allowMultipleUploads: boolean;
  };
  validation: {
    enableNameValidation: boolean;
    enableFormatValidation: boolean;
    enableSizeValidation: boolean;
    customValidationRules: string[];
  };
}

export default function DocumentsConfigPage() {
  const [config, setConfig] = useState<DocumentsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'required' | 'optional' | 'settings'>('required');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/documents/config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching documents config:', error);
      showNotification('error', 'Failed to load documents configuration');
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
      const response = await fetch('/api/documents/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Documents configuration saved successfully!');
      } else {
        showNotification('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving documents config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/documents/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Documents configuration saved successfully!');
        // Navigate to the next step in the workflow (Prompts)
        setTimeout(() => {
          window.location.href = '/admin/prompts';
        }, 1000);
      } else {
        showNotification('error', data.error || 'Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving documents config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addDocumentType = (category: 'required' | 'optional') => {
    if (!config) return;
    
    const newDoc: DocumentType = {
      type: 'New Document Type',
      description: 'Document description',
      formats: ['pdf'],
      maxSize: '10MB'
    };

    setConfig({
      ...config,
      [category]: [...config[category], newDoc]
    });
  };

  const updateDocumentType = (category: 'required' | 'optional', index: number, field: keyof DocumentType, value: any) => {
    if (!config) return;
    
    const updatedDocs = [...config[category]];
    updatedDocs[index] = { ...updatedDocs[index], [field]: value };
    
    setConfig({
      ...config,
      [category]: updatedDocs
    });
  };

  const removeDocumentType = (category: 'required' | 'optional', index: number) => {
    if (!config) return;
    
    setConfig({
      ...config,
      [category]: config[category].filter((_, i) => i !== index)
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents configuration...</p>
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Upload Configuration</h1>
            <p className="text-gray-600">Configure document types and upload requirements for your domain</p>
            <div className="mt-1 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
              Domain: {config.domain.charAt(0).toUpperCase() + config.domain.slice(1)} Documents
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Save Changes
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Save & Continue →
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-blue-700">
                <strong>Document types:</strong> Define what files clients need to upload. Required documents must be submitted before analysis. Optional documents provide additional context for better results.
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'required', label: 'Required Documents', count: config.required.length },
                { id: 'optional', label: 'Optional Documents', count: config.optional.length },
                { id: 'settings', label: 'Upload Settings', count: null }
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
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Required Documents Tab */}
            {activeTab === 'required' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Required Documents</h3>
                    <p className="text-sm text-gray-600">Documents that clients must upload before analysis can begin</p>
                  </div>
                  <button
                    onClick={() => addDocumentType('required')}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Add Required
                  </button>
                </div>
                
                <div className="space-y-3">
                  {config.required.map((doc, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {/* Headers Row */}
                      {index === 0 && (
                        <div className="grid grid-cols-5 gap-3 mb-2 text-xs font-medium text-gray-600">
                          <div>Document Type</div>
                          <div>Formats</div>
                          <div>Max Size</div>
                          <div>Description</div>
                          <div className="text-right">Actions</div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-5 gap-3 items-center">
                        <div>
                          <input
                            type="text"
                            value={doc.type}
                            onChange={(e) => updateDocumentType('required', index, 'type', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="Document name"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={doc.formats.join(', ')}
                            onChange={(e) => updateDocumentType('required', index, 'formats', e.target.value.split(', ').filter(f => f.trim()))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="pdf, jpg"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={doc.maxSize}
                            onChange={(e) => updateDocumentType('required', index, 'maxSize', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="10MB"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={doc.description}
                            onChange={(e) => updateDocumentType('required', index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="Brief description"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => removeDocumentType('required', index)}
                            className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded-lg hover:bg-red-50 h-8"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {config.required.length === 0 && (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="font-medium">No required documents configured</p>
                      <p className="text-sm">Add documents that users must upload to proceed</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Optional Documents Tab */}
            {activeTab === 'optional' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Optional Documents</h3>
                    <p className="text-sm text-gray-600">Additional documents that provide extra context for better analysis</p>
                  </div>
                  <button
                    onClick={() => addDocumentType('optional')}
                    className="px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    + Add Optional
                  </button>
                </div>
                
                <div className="space-y-3">
                  {config.optional.map((doc, index) => (
                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      {/* Headers Row */}
                      {index === 0 && (
                        <div className="grid grid-cols-5 gap-3 mb-2 text-xs font-medium text-gray-600">
                          <div>Document Type</div>
                          <div>Formats</div>
                          <div>Max Size</div>
                          <div>Description</div>
                          <div className="text-right">Actions</div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-5 gap-3 items-center">
                        <div>
                          <input
                            type="text"
                            value={doc.type}
                            onChange={(e) => updateDocumentType('optional', index, 'type', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="Document name"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={doc.formats.join(', ')}
                            onChange={(e) => updateDocumentType('optional', index, 'formats', e.target.value.split(', ').filter(f => f.trim()))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="pdf, jpg"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={doc.maxSize}
                            onChange={(e) => updateDocumentType('optional', index, 'maxSize', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="10MB"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={doc.description}
                            onChange={(e) => updateDocumentType('optional', index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="Brief description"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button
                            onClick={() => removeDocumentType('optional', index)}
                            className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded-lg hover:bg-red-50 h-8"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {config.optional.length === 0 && (
                    <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <p className="font-medium">No optional documents configured</p>
                      <p className="text-sm">Add documents that users can optionally upload for better analysis</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-6">Upload Settings</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Mode
                      </label>
                      <select
                        value={config.uploadMode}
                        onChange={(e) => setConfig({...config, uploadMode: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="guided">Guided Upload</option>
                        <option value="bulk">Bulk Upload</option>
                        <option value="hybrid">Hybrid Mode</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Global Formats
                      </label>
                      <input
                        type="text"
                        value={config.settings.allowedFormats.join(', ')}
                        onChange={(e) => setConfig({
                          ...config, 
                          settings: {...config.settings, allowedFormats: e.target.value.split(', ')}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="pdf, jpg, png"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Size
                      </label>
                      <input
                        type="text"
                        value={config.settings.maxFileSize}
                        onChange={(e) => setConfig({
                          ...config, 
                          settings: {...config.settings, maxFileSize: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="10MB"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Upload Options</h4>
                    {[
                      { key: 'autoExtractText', label: 'Auto-extract text from documents' },
                      { key: 'requireAllDocuments', label: 'Require all required documents' },
                      { key: 'allowMultipleUploads', label: 'Allow multiple uploads per document type' }
                    ].map((option) => (
                      <label key={option.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.settings[option.key as keyof typeof config.settings] as boolean}
                          onChange={(e) => setConfig({
                            ...config,
                            settings: {
                              ...config.settings,
                              [option.key]: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Validation Options</h4>
                    {[
                      { key: 'enableNameValidation', label: 'Enable filename validation' },
                      { key: 'enableFormatValidation', label: 'Enable file format validation' },
                      { key: 'enableSizeValidation', label: 'Enable file size validation' }
                    ].map((option) => (
                      <label key={option.key} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={config.validation[option.key as keyof typeof config.validation] as boolean}
                          onChange={(e) => setConfig({
                            ...config,
                            validation: {
                              ...config.validation,
                              [option.key]: e.target.checked
                            }
                          })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Client Preview</h4>
            <p className="text-sm text-gray-600 mb-4">This is how clients will see the document upload interface:</p>
            
            <div className="bg-white rounded-lg border p-6 max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Upload</h3>
              
              {/* Required Documents Preview */}
              {config.required.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    Required Documents ({config.required.length})
                  </h4>
                  <div className="space-y-3">
                    {config.required.map((doc, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{doc.type}</h5>
                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                📎 {doc.formats.join(', ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                📏 Max {doc.maxSize}
                              </span>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                            Choose File
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optional Documents Preview */}
              {config.optional.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
                    Optional Documents ({config.optional.length})
                  </h4>
                  <div className="space-y-3">
                    {config.optional.map((doc, index) => (
                      <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900">{doc.type}</h5>
                            <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                            <div className="flex items-center space-x-4 mt-2">
                              <span className="text-xs text-gray-500">
                                📎 {doc.formats.join(', ')}
                              </span>
                              <span className="text-xs text-gray-500">
                                📏 Max {doc.maxSize}
                              </span>
                            </div>
                          </div>
                          <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                            Choose File
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {config.required.length === 0 && config.optional.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No documents configured yet.</p>
                  <p className="text-sm">Add required or optional documents to see the preview.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 