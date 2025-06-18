'use client';

import { useState, useEffect } from 'react';
import { Finding, FindingsConfig, DOMAIN_FINDINGS_CONFIG } from './types';

interface FindingsConfigFormProps {
  config?: FindingsConfig;
  onSave: (config: FindingsConfig) => void;
  domain: string;
}

export default function FindingsConfigForm({ config, onSave, domain }: FindingsConfigFormProps) {
  const [formData, setFormData] = useState<FindingsConfig>({
    domain,
    confidenceThreshold: 0.6,
    severityThresholds: {
      low: 0.3,
      medium: 0.6,
      high: 0.8
    },
    enabledTypes: ['positive', 'concern', 'risk', 'red_flag'],
    maxFindingsPerType: 10,
    requireCitations: true,
    generateQuestions: true,
    ...config
  });

  const [previewFindings, setPreviewFindings] = useState<string[]>([]);

  useEffect(() => {
    if (config) {
      setFormData(prev => ({ ...prev, ...config }));
    }
  }, [config]);

  useEffect(() => {
    // Update preview when domain or settings change
    updatePreview();
  }, [formData.domain, formData.enabledTypes]);

  const updatePreview = () => {
    const domainConfig = DOMAIN_FINDINGS_CONFIG[formData.domain];
    if (!domainConfig) return;

    const preview: string[] = [];
    
    formData.enabledTypes.forEach(type => {
      let examples: string[] = [];
      switch (type) {
        case 'positive':
          examples = domainConfig.commonFindings.positive.slice(0, 3);
          break;
        case 'concern':
          examples = domainConfig.commonFindings.concerns.slice(0, 3);
          break;
        case 'risk':
          examples = domainConfig.commonFindings.risks.slice(0, 3);
          break;
        case 'red_flag':
          examples = domainConfig.commonFindings.redFlags.slice(0, 3);
          break;
      }
      preview.push(...examples.map(ex => `${type.charAt(0).toUpperCase() + type.slice(1)}: ${ex}`));
    });

    setPreviewFindings(preview);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleThresholdChange = (threshold: keyof FindingsConfig['severityThresholds'], value: number) => {
    setFormData(prev => ({
      ...prev,
      severityThresholds: {
        ...prev.severityThresholds,
        [threshold]: value
      }
    }));
  };

  const toggleFindingType = (type: 'positive' | 'concern' | 'risk' | 'red_flag') => {
    setFormData(prev => ({
      ...prev,
      enabledTypes: prev.enabledTypes.includes(type)
        ? prev.enabledTypes.filter(t => t !== type)
        : [...prev.enabledTypes, type]
    }));
  };

  const domainConfig = DOMAIN_FINDINGS_CONFIG[formData.domain];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Findings Generation Configuration
        </h3>
        
        {/* Domain Detection */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-blue-900">Domain Detected</span>
          </div>
          <p className="text-blue-800 font-medium capitalize">{formData.domain}</p>
          <p className="text-blue-700 text-sm mt-1">
            Auto-configured with {formData.domain} domain expertise and findings templates
          </p>
        </div>

        {/* Confidence Settings */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Confidence Threshold
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={formData.confidenceThreshold}
                onChange={(e) => setFormData(prev => ({ ...prev, confidenceThreshold: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                {Math.round(formData.confidenceThreshold * 100)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Only include findings above this confidence level
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Findings Per Type
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.maxFindingsPerType}
              onChange={(e) => setFormData(prev => ({ ...prev, maxFindingsPerType: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum findings to generate per category
            </p>
          </div>
        </div>

        {/* Severity Thresholds */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Severity Classification</h4>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.entries(formData.severityThresholds).map(([severity, threshold]) => (
              <div key={severity}>
                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                  {severity} Severity
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={threshold}
                    onChange={(e) => handleThresholdChange(severity as keyof FindingsConfig['severityThresholds'], parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
                    {Math.round(threshold * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finding Types */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Enabled Finding Types</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { type: 'positive', label: 'Positive Aspects', color: 'green' },
              { type: 'concern', label: 'Concerns', color: 'yellow' },
              { type: 'risk', label: 'Risks', color: 'orange' },
              { type: 'red_flag', label: 'Red Flags', color: 'red' }
            ].map(({ type, label, color }) => (
              <label key={type} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.enabledTypes.includes(type as any)}
                  onChange={() => toggleFindingType(type as any)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className={`w-3 h-3 rounded-full bg-${color}-500`}></div>
                <span className="text-sm font-medium text-gray-900">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Options */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.requireCitations}
              onChange={(e) => setFormData(prev => ({ ...prev, requireCitations: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Require document citations for all findings</span>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.generateQuestions}
              onChange={(e) => setFormData(prev => ({ ...prev, generateQuestions: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Generate professional questions for follow-up</span>
          </label>
        </div>

        {/* Preview */}
        {domainConfig && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Preview: {formData.domain} Domain Findings
            </h4>
            <div className="space-y-2">
              {previewFindings.slice(0, 8).map((finding, index) => (
                <div key={index} className="text-sm text-gray-700 bg-white p-2 rounded border">
                  • {finding}
                </div>
              ))}
              {previewFindings.length > 8 && (
                <div className="text-xs text-gray-500">
                  +{previewFindings.length - 8} more finding types...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </form>
  );
} 