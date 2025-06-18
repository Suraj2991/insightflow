'use client';

import { useState, useEffect } from 'react';
import ReportConfigForm from '@/modules/reports/config-form';
import { ReportConfig } from '@/modules/reports/types';

export default function ReportsConfigPage() {
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [detectedDomain, setDetectedDomain] = useState<string>('property');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadConfig();
    detectDomain();
  }, []);

  const detectDomain = async () => {
    try {
      const response = await fetch('/api/questionnaire');
      if (response.ok) {
        const data = await response.json();
        // Simple domain detection based on questionnaire content
        const questionnaire = data.questionnaire;
        if (questionnaire?.config?.domain) {
          setDetectedDomain(questionnaire.config.domain);
        } else {
          // Fallback to property domain
          setDetectedDomain('property');
        }
      }
    } catch (error) {
      console.error('Error detecting domain:', error);
    }
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports/config');
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newConfig: ReportConfig) => {
    try {
      setSaving(true);
      const response = await fetch('/api/reports/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: newConfig }),
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
        setNotification({ message: 'Configuration saved successfully!', type: 'success' });
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setNotification({ message: 'Failed to save configuration. Please try again.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports configuration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Dashboard */}
        <div className="mb-6">
          <button
            onClick={() => window.location.href = '/admin'}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Report Builder</h1>
          <p className="text-gray-600 mt-2">
            Configure report generation and user experience flow
          </p>
        </div>

        {/* Module Status */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Configuration Status</h2>
              <p className="text-gray-600 mt-1">
                {config ? 'Report generation is configured and ready' : 'Setup required'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              config ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {config ? 'Configured' : 'Setup Required'}
            </div>
          </div>

          {config && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {config.reportMode === 'no_report' ? '🎯' : '📋'}
                </div>
                <div className="text-sm text-gray-600">
                  {config.reportMode === 'no_report' ? 'Expert Review' : 'Full Reports'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 capitalize">
                  {config.template}
                </div>
                <div className="text-sm text-gray-600">Template</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {config.exportFormats?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Export Formats</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 capitalize">{config.domain}</div>
                <div className="text-sm text-gray-600">Domain</div>
              </div>
            </div>
          )}
        </div>

        {/* Mode Explanation */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Choose Your Workflow</h3>
          <div className="grid md:grid-cols-2 gap-4 text-blue-800 text-sm">
            <div>
              <span className="font-medium">🎯 Personal Follow-up:</span> You contact clients with insights
            </div>
            <div>
              <span className="font-medium">📋 Automatic Reports:</span> Clients receive PDF reports instantly
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <ReportConfigForm
          config={config || undefined}
          onSave={handleSave}
          domain={detectedDomain}
        />

        {/* Module Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">About Report Builder</h3>
          <div className="text-blue-800 space-y-2">
            <p>• <strong>Expert Review Mode:</strong> Shows completion message, enables personal follow-up</p>
            <p>• <strong>Full Report Mode:</strong> Generates professional reports with InsightFlow structure</p>
            <p>• <strong>Client Dashboard:</strong> Optional access for you to review analysis results</p>
            <p>• <strong>White-Label Ready:</strong> Custom branding and messaging for your clients</p>
            <p>• <strong>Multi-Format:</strong> PDF, HTML, and JSON export options available</p>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg border z-50 ${
            notification.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {notification.type === 'success' ? '✅' : '❌'}
              </span>
              {notification.message}
            </div>
          </div>
        )}

        {saving && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 text-center shadow-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Saving configuration...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 