'use client';

import React, { useState, useEffect } from 'react';

interface FindingCategory {
  id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
}

interface FindingsConfig {
  domain: string;
  workflowId: string;
  categories: FindingCategory[];
  extraction: {
    confidenceThreshold: number;
    maxFindingsPerDocument: number;
    enableAutoExtraction: boolean;
  };
  formatting: {
    includeConfidenceScores: boolean;
    groupByCategory: boolean;
    includeSourceReferences: boolean;
  };
  validation: {
    minimumTextLength: number;
    enableDuplicateDetection: boolean;
  };
}

export default function FindingsConfigPage() {
  const [config, setConfig] = useState<FindingsConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [activeTab, setActiveTab] = useState<'categories' | 'settings'>('categories');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/findings/config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error fetching findings config:', error);
      showNotification('error', 'Failed to load findings configuration');
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
      const response = await fetch('/api/findings/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Configuration saved!');
      } else {
        showNotification('error', data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving findings config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!config) return;
    
    try {
      setSaving(true);
      const response = await fetch('/api/findings/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Configuration saved!');
        setTimeout(() => {
          window.location.href = '/admin/reports';
        }, 1000);
      } else {
        showNotification('error', data.error || 'Failed to save');
      }
    } catch (error) {
      console.error('Error saving findings config:', error);
      showNotification('error', 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    if (!config) return;
    
    const newCategory: FindingCategory = {
      id: `category_${Date.now()}`,
      name: 'New Category',
      description: 'Brief description',
      severity: 'medium',
      keywords: []
    };

    setConfig({
      ...config,
      categories: [...config.categories, newCategory]
    });
  };

  const updateCategory = (index: number, field: keyof FindingCategory, value: any) => {
    if (!config) return;
    
    const updatedCategories = [...config.categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    
    setConfig({
      ...config,
      categories: updatedCategories
    });
  };

  const removeCategory = (index: number) => {
    if (!config) return;
    
    setConfig({
      ...config,
      categories: config.categories.filter((_, i) => i !== index)
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-50 border-green-200 text-green-700';
      case 'medium': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'high': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'critical': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getCategoryBackground = (index: number) => {
    const colors = [
      'bg-blue-50 border-blue-100',
      'bg-purple-50 border-purple-100', 
      'bg-green-50 border-green-100',
      'bg-yellow-50 border-yellow-100',
      'bg-pink-50 border-pink-100'
    ];
    return colors[index % colors.length] || 'bg-gray-50 border-gray-100';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Findings Configuration</h1>
            <p className="text-sm text-gray-600">Define what types of issues the AI should identify in documents</p>
            <div className="mt-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full inline-block">
              {config.domain.charAt(0).toUpperCase() + config.domain.slice(1)} Domain
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Dashboard
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Save Changes
            </button>
            <button
              onClick={handleSaveAndContinue}
              disabled={isSaving}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-xs text-blue-700">
                <strong>How it works:</strong> Categories help the AI recognize and classify problems by severity. For example: "Structural Issues" → High severity → keywords: crack, damage, leak
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'categories', label: 'Finding Categories', count: config.categories.length },
                { id: 'settings', label: 'Extraction & Validation Settings' }
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
            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Finding Categories</h3>
                    <p className="text-sm text-gray-600">Define what types of issues the AI should look for and how to classify them</p>
                  </div>
                  <button
                    onClick={addCategory}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Add Category
                  </button>
                </div>
                
                <div className="space-y-3">
                  {config.categories.map((category, index) => (
                    <div key={category.id} className={`border rounded-lg p-3 ${getCategoryBackground(index)}`}>
                      {/* Headers Row */}
                      {index === 0 && (
                        <div className="grid grid-cols-4 gap-3 mb-2 text-xs font-medium text-gray-600">
                          <div>Category Name & Severity</div>
                          <div className="col-span-2">Description & Keywords</div>
                          <div className="text-right">Actions</div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-4 gap-3 items-start">
                        {/* Category Name & Severity */}
                        <div>
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => updateCategory(index, 'name', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="Category name"
                          />
                          <select
                            value={category.severity}
                            onChange={(e) => updateCategory(index, 'severity', e.target.value)}
                            className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-7"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>

                        {/* Description & Keywords */}
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={category.description}
                            onChange={(e) => updateCategory(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-8"
                            placeholder="Brief description of what this category identifies..."
                          />
                          <input
                            type="text"
                            value={(category.keywords || []).join(', ')}
                            onChange={(e) => updateCategory(index, 'keywords', e.target.value.split(', ').filter(k => k.trim()))}
                            className="w-full mt-1 px-2 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 h-7"
                            placeholder="Keywords: risk, concern, issue, problem"
                          />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end items-start">
                          <button
                            onClick={() => removeCategory(index)}
                            className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded-lg hover:bg-red-50 h-8"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {config.categories.length === 0 && (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No categories configured. Add one to start.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Extraction & Validation Settings</h3>
                  <p className="text-sm text-gray-600">Configure how findings are extracted, formatted, and validated</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Extraction Settings */}
                  <div className="bg-gray-50 rounded-lg border p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Extraction Settings</h4>
                      <p className="text-xs text-gray-600">How findings are identified and extracted</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">
                          Confidence Threshold: {config.extraction?.confidenceThreshold || 70}%
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={config.extraction?.confidenceThreshold || 70}
                          onChange={(e) => setConfig({
                            ...config,
                            extraction: {...(config.extraction || {}), confidenceThreshold: parseInt(e.target.value)}
                          })}
                          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max Findings per Document</label>
                        <input
                          type="number"
                          value={config.extraction?.maxFindingsPerDocument || 10}
                          onChange={(e) => setConfig({
                            ...config,
                            extraction: {...(config.extraction || {}), maxFindingsPerDocument: parseInt(e.target.value)}
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="1"
                          max="50"
                        />
                      </div>
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={config.extraction?.enableAutoExtraction || false}
                          onChange={(e) => setConfig({
                            ...config,
                            extraction: {...(config.extraction || {}), enableAutoExtraction: e.target.checked}
                          })}
                          className="h-3 w-3 text-blue-600 mr-2 rounded"
                        />
                        Enable automatic extraction
                      </label>
                    </div>
                  </div>

                  {/* Formatting Settings */}
                  <div className="bg-gray-50 rounded-lg border p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Output Formatting</h4>
                      <p className="text-xs text-gray-600">How findings appear in reports</p>
                    </div>
                    <div className="space-y-2">
                      {[
                        { key: 'includeConfidenceScores', label: 'Show confidence scores' },
                        { key: 'groupByCategory', label: 'Group by category' },
                        { key: 'includeSourceReferences', label: 'Include source references' }
                      ].map((option) => (
                        <label key={option.key} className="flex items-center text-xs">
                          <input
                            type="checkbox"
                            checked={config.formatting?.[option.key as keyof typeof config.formatting] as boolean || false}
                            onChange={(e) => setConfig({
                              ...config,
                              formatting: {
                                ...(config.formatting || {}),
                                [option.key]: e.target.checked
                              }
                            })}
                            className="h-3 w-3 text-blue-600 mr-2 rounded"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Validation Settings */}
                  <div className="bg-gray-50 rounded-lg border p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900">Validation Rules</h4>
                      <p className="text-xs text-gray-600">Quality control for extracted findings</p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Minimum Text Length</label>
                        <input
                          type="number"
                          value={config.validation?.minimumTextLength || 50}
                          onChange={(e) => setConfig({
                            ...config,
                            validation: {...(config.validation || {}), minimumTextLength: parseInt(e.target.value)}
                          })}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="10"
                          max="1000"
                        />
                        <p className="text-xs text-gray-500 mt-1">characters</p>
                      </div>
                      <label className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={config.validation?.enableDuplicateDetection || false}
                          onChange={(e) => setConfig({
                            ...config,
                            validation: {...(config.validation || {}), enableDuplicateDetection: e.target.checked}
                          })}
                          className="h-3 w-3 text-blue-600 mr-2 rounded"
                        />
                        Remove duplicate findings
                      </label>
                    </div>
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