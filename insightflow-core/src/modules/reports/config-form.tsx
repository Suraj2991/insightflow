'use client';

import { useState, useEffect } from 'react';
import { ReportConfig, DOMAIN_REPORT_TEMPLATES } from './types';

interface ReportConfigFormProps {
  config?: ReportConfig;
  onSave: (config: ReportConfig) => void;
  domain: string;
}

export default function ReportConfigForm({ config, onSave, domain }: ReportConfigFormProps) {
  const [formData, setFormData] = useState<ReportConfig>({
    domain,
    workflowId: 'demo',
    template: 'professional',
    sections: [],
    styling: {
      primaryColor: '#0d9488',
      secondaryColor: '#f0fdfa', 
      fontFamily: 'inter',
      fontSize: 'medium',
      spacing: 'normal',
      headerStyle: 'standard'
    },
    branding: {
      companyName: '',
      showBranding: false
    },
    disclaimers: [],
    exportFormats: ['pdf'],
    includeExecutiveSummary: true,
    includeTabs: ['positive', 'risks', 'questions', 'survey'],
    // New report mode configuration
    reportMode: 'no_report', // 'no_report' | 'full_report'
    noReportMessage: 'Thank you for uploading your documents. Our experts are reviewing your analysis and will contact you shortly with detailed insights.',
    allowClientDashboard: true,
    ...config
  });

  const [selectedReportMode, setSelectedReportMode] = useState<'no_report' | 'full_report'>(
    formData.reportMode || 'no_report'
  );
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData(prev => ({ ...prev, ...config }));
      setSelectedReportMode(config.reportMode || 'no_report');
    } else {
      // Auto-configure based on domain
      const domainTemplate = DOMAIN_REPORT_TEMPLATES[domain];
      if (domainTemplate) {
        setFormData(prev => ({
          ...prev,
          ...domainTemplate,
          domain,
          workflowId: 'demo'
        }));
      }
    }
  }, [config, domain]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalConfig = {
      ...formData,
      reportMode: selectedReportMode
    };
    onSave(finalConfig);
    setIsSaved(true);

    // If Document Q&A is enabled, redirect to Q&A configuration
    if (finalConfig.includeQA) {
      setTimeout(() => {
        window.location.href = '/admin/qa';
      }, 1000); // Give time for save notification to show
    }
  };

  const handleModeChange = (mode: 'no_report' | 'full_report') => {
    setSelectedReportMode(mode);
    setFormData(prev => ({
      ...prev,
      reportMode: mode
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Report Configuration
        </h3>
        
        {/* Domain Detection */}
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-900">✅ Optimized for {formData.domain.charAt(0).toUpperCase() + formData.domain.slice(1)} Domain</span>
          </div>
          <p className="text-green-700 text-sm">
            All technical settings have been pre-configured for optimal {formData.domain} analysis results.
          </p>
        </div>

        {/* Simplified Report Mode Selection */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-900 mb-4">How should clients receive results?</h4>
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Option 1: Expert Review Mode */}
            <div 
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedReportMode === 'no_report' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleModeChange('no_report')}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={selectedReportMode === 'no_report'}
                  onChange={() => handleModeChange('no_report')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">🎯 Personal Follow-up</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    You contact clients personally with insights (recommended for white-label)
                  </p>
                </div>
              </div>
              
              {selectedReportMode === 'no_report' && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message to show clients after analysis
                  </label>
                  <textarea
                    value={formData.noReportMessage}
                    onChange={(e) => setFormData(prev => ({ ...prev, noReportMessage: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Thank you! We'll contact you shortly with your analysis results."
                  />
                </div>
              )}
            </div>

            {/* Option 2: Automatic Reports */}
            <div 
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedReportMode === 'full_report' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleModeChange('full_report')}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  checked={selectedReportMode === 'full_report'}
                  onChange={() => handleModeChange('full_report')}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">📋 Automatic Reports</h5>
                  <p className="text-sm text-gray-600 mt-1">
                    Clients receive professional PDF reports automatically
                  </p>
                </div>
              </div>

              {selectedReportMode === 'full_report' && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Company Name (for report branding)
                  </label>
                  <input
                    type="text"
                    value={formData.branding.companyName}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      branding: { ...prev.branding, companyName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your Company Name"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Document Q&A Feature */}
        <div className={`p-4 border rounded-lg transition-all ${
          formData.includeQA 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              checked={formData.includeQA || false}
              onChange={(e) => setFormData(prev => ({ ...prev, includeQA: e.target.checked }))}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <h4 className={`font-medium ${
                formData.includeQA ? 'text-green-900' : 'text-blue-900'
              }`}>
                💬 Enable Document Q&A Chat
                {formData.includeQA && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    ✓ Will configure next
                  </span>
                )}
              </h4>
              <p className={`text-sm mt-1 ${
                formData.includeQA ? 'text-green-800' : 'text-blue-800'
              }`}>
                Let clients ask questions about their documents using AI-powered chat.
                {formData.includeQA && (
                  <span className="block mt-2 font-medium text-green-700">
                    📋 After saving, you'll configure the Q&A settings.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Simple Preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">
            Preview: {selectedReportMode === 'no_report' ? 'Personal Follow-up' : 'Automatic Reports'}
          </h4>
          
          {selectedReportMode === 'no_report' ? (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✅</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Analysis Complete</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  {formData.noReportMessage || 'Thank you! We\'ll contact you shortly with your analysis results.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-teal-600">
                  {formData.branding.companyName || 'Your Company'} Analysis Report
                </h3>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">PDF</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div className="bg-green-100 p-2 rounded text-center">Positive</div>
                <div className="bg-red-100 p-2 rounded text-center">Risks</div>
                <div className="bg-blue-100 p-2 rounded text-center">Questions</div>
                <div className="bg-gray-100 p-2 rounded text-center">Survey</div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => window.location.href = '/admin'}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
          >
            ← Dashboard
          </button>

          <div className="flex gap-4">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-semibold"
            >
              Save Configuration
            </button>

            <button
              type="button"
              onClick={() => window.location.href = '/admin/setup-complete'}
              disabled={!isSaved}
              className={`px-6 py-2 rounded-md font-medium flex items-center gap-2 transition-colors ${
                isSaved
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Complete Setup
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
} 