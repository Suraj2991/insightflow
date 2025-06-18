'use client';

import React, { useEffect, useState } from 'react';

export default function SetupCompletePage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfigurations();
    // Mark setup as complete
    markSetupComplete();
  }, []);

  const loadConfigurations = async () => {
    try {
      const [questionnaireRes, reportsRes] = await Promise.all([
        fetch('/api/questionnaire'),
        fetch('/api/reports/config')
      ]);
      
      const questionnaireData = await questionnaireRes.json();
      const reportsData = await reportsRes.json();
      
      setConfig({
        questionnaire: questionnaireData.questionnaire,
        reports: reportsData
      });
    } catch (error) {
      console.error('Error loading configurations:', error);
    } finally {
      setLoading(false);
    }
  };

  const markSetupComplete = () => {
    // Store completion status in localStorage for dashboard
    localStorage.setItem('workflowSetupComplete', 'true');
    localStorage.setItem('setupCompletedAt', new Date().toISOString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading setup summary...</p>
        </div>
      </div>
    );
  }

  const domain = detectDomain();

  function detectDomain() {
    if (!config?.questionnaire?.config?.questions) return 'Unknown';
    
    const questions = config.questionnaire.config.questions;
    if (questions.some((q: any) => q.title?.toLowerCase().includes('property'))) return 'Property';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('legal'))) return 'Legal';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('financial'))) return 'Financial';
    if (questions.some((q: any) => q.title?.toLowerCase().includes('technical'))) return 'Technical';
    return 'General';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Workflow Setup Complete</h1>
            <p className="text-gray-600">Your {domain} workflow is ready for users</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Configuration Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Configuration Summary</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Domain</span>
                <span className="font-medium text-gray-900">{domain}</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Questionnaire</span>
                <span className="font-medium text-green-600">
                  {config?.questionnaire ? `${config.questionnaire.config?.questions?.length || 0} questions` : 'Not configured'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Document Types</span>
                <span className="font-medium text-green-600">Auto-configured</span>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">LLM Configuration</span>
                <span className="font-medium text-green-600">Expert prompts</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Report Mode</span>
                <span className="font-medium text-green-600">
                  {config?.reports?.reportMode === 'no_report' ? 'Expert Review' : 'Full Reports'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Document Q&A</span>
                <span className={`font-medium ${
                  config?.reports?.config?.includeQA ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {config?.reports?.config?.includeQA ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next</h2>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-medium text-gray-900">Test Your Workflow</h4>
                <p className="text-gray-600 text-sm">Go through the user experience yourself to ensure everything works as expected</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-medium text-gray-900">Share with Users</h4>
                <p className="text-gray-600 text-sm">Distribute the workflow link to your clients or team members</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-medium text-gray-900">Monitor & Optimize</h4>
                <p className="text-gray-600 text-sm">Review usage analytics and adjust configurations as needed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => window.location.href = '/admin'}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Back to Dashboard
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/workflow/questionnaire'}
              className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              Preview Client Experience
            </button>
            
            <button
              onClick={() => {
                // You could implement actual deployment logic here
                alert('Workflow deployment features coming soon!');
              }}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Deploy Workflow
            </button>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <details className="cursor-pointer">
            <summary className="font-medium text-gray-700 hover:text-gray-900">Technical Configuration Details</summary>
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div>Workflow ID: workflow_demo_001</div>
              <div>Organization ID: org_demo_123</div>
              <div>Setup Completed: {new Date().toLocaleString()}</div>
              <div>Version: 1.0.0</div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
} 