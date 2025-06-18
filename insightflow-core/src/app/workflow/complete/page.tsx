'use client';

import { useState, useEffect } from 'react';
import { ReportConfig } from '@/modules/reports/types';
import { AnalysisResult } from '@/modules/findings/types';

export default function WorkflowCompletePage() {
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [mockAnalysis, setMockAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfiguration();
    generateMockAnalysis();
  }, []);

  const loadConfiguration = async () => {
    try {
      const response = await fetch('/api/reports/config');
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded report config:', data.config);
        setConfig(data.config);
      } else {
        console.error('Failed to load config:', response.status);
        // Set default config if none exists
        setConfig({
          reportMode: 'no_report',
          noReportMessage: 'Thank you for uploading your documents. Our experts are reviewing your analysis and will contact you shortly with detailed insights.',
          allowClientDashboard: true,
          exportFormats: ['pdf']
        } as any);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      // Set default config on error
      setConfig({
        reportMode: 'no_report',
        noReportMessage: 'Thank you for uploading your documents. Our experts are reviewing your analysis and will contact you shortly with detailed insights.',
        allowClientDashboard: true,
        exportFormats: ['pdf']
      } as any);
    }
  };

  const generateMockAnalysis = () => {
    // Mock analysis result for demonstration
    const mockResult: AnalysisResult = {
      id: 'analysis_demo_123',
      sessionId: 'session_demo_456',
      findings: [
        {
          id: 'finding_1',
          type: 'positive',
          title: 'No Contaminated Land Issues',
          description: 'The property has no recorded land contamination, which is a positive aspect.',
          confidence: 0.9,
          severity: 'low',
          citations: [
            {
              documentId: 'doc_1',
              documentName: 'Local Authority Search Report.pdf',
              section: 'Environmental',
              excerpt: 'No recorded land contamination',
              confidence: 0.9
            }
          ],
          recommendations: ['Take advantage of this positive aspect when making an offer.']
        },
        {
          id: 'finding_2',
          type: 'risk',
          title: 'Electrical System Risk',
          description: 'Electrical system requires inspection and potential upgrade.',
          confidence: 0.85,
          severity: 'high',
          citations: [
            {
              documentId: 'doc_2',
              documentName: 'Survey Report.pdf',
              section: 'Electrical Systems',
              excerpt: 'Electrical installation appears outdated and requires professional assessment',
              confidence: 0.85
            }
          ],
          recommendations: ['Arrange electrical inspection before completion.', 'Budget for potential rewiring costs.']
        },
        {
          id: 'finding_3',
          type: 'concern',
          title: 'Roof Maintenance Required',
          description: 'Several roof tiles need attention to prevent water ingress.',
          confidence: 0.75,
          severity: 'medium',
          citations: [
            {
              documentId: 'doc_2',
              documentName: 'Survey Report.pdf',
              section: 'Roof Structure',
              excerpt: 'Some roof tiles showing signs of weathering',
              confidence: 0.75
            }
          ],
          recommendations: ['Schedule roof inspection and maintenance.']
        }
      ],
      summary: {
        overallRisk: 'medium',
        keyFindings: ['Electrical System Risk', 'Roof Maintenance Required'],
        documentsAnalyzed: 3,
        completeness: 0.85,
        recommendedActions: [
          'Arrange electrical inspection',
          'Schedule roof maintenance',
          'Consult with qualified professionals'
        ],
        executiveSummary: 'Analysis of 3 property documents identifies moderate concerns requiring professional guidance. 1 high-priority issue identified. Professional advice recommended before proceeding.',
        riskBreakdown: { low: 1, medium: 1, high: 1 },
        positiveAspects: ['No Contaminated Land Issues']
      },
      questions: [
        {
          id: 'q_1',
          category: 'solicitor',
          question: 'What are the legal implications of the electrical system issues?',
          priority: 'high',
          context: 'Electrical system upgrade may be required'
        },
        {
          id: 'q_2',
          category: 'surveyor',
          question: 'What is the estimated cost for roof repairs?',
          priority: 'medium',
          context: 'Roof tiles need maintenance'
        }
      ],
      confidence: 0.82,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setMockAnalysis(mockResult);
    setLoading(false);
  };

  const downloadReport = () => {
    // Mock report generation
    alert('Report download would start here. In full implementation, this would generate and download the actual report file.');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing analysis...</p>
        </div>
      </div>
    );
  }

  // Expert Review Mode (no_report)
  if (config?.reportMode === 'no_report') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Analysis Complete</h1>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <p className="text-gray-700 leading-relaxed">
                {config.noReportMessage}
              </p>
            </div>

            {config.allowClientDashboard && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Dashboard Access</h3>
                <p className="text-sm text-gray-600 mb-4">
                  As the client, you have access to review the detailed analysis results:
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{mockAnalysis?.findings.length}</div>
                      <div className="text-xs text-blue-800">Findings</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{Math.round((mockAnalysis?.confidence || 0) * 100)}%</div>
                      <div className="text-xs text-blue-800">Confidence</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600 capitalize">{mockAnalysis?.summary.overallRisk}</div>
                      <div className="text-xs text-blue-800">Risk Level</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => alert('Client dashboard would open here with full analysis details')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Detailed Analysis (Client Dashboard)
                  </button>
                  
                  <p className="text-xs text-gray-500">
                    This dashboard shows you exactly what analysis was performed and the findings discovered
                  </p>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-400 mt-6">
              Workflow ID: {mockAnalysis?.sessionId} | Analysis ID: {mockAnalysis?.id}
            </div>

            {/* Admin Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => window.location.href = '/admin'}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Admin Dashboard
              </button>
            </div>

            {/* Debug Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">Debug Info (Expert Review Mode Active)</h4>
              <div className="text-xs text-yellow-800 space-y-1">
                <div>Report Mode: {config?.reportMode || 'undefined'}</div>
                <div>Allow Client Dashboard: {config?.allowClientDashboard ? 'Yes' : 'No'}</div>
                <div>Export Formats: {config?.exportFormats?.join(', ') || 'undefined'}</div>
                <div>No PDF Download section should be visible in this mode ✅</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full Report Mode (full_report)
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Analysis Report Ready</h1>
            <p className="text-gray-600">
              Your comprehensive analysis has been completed and is available for download
            </p>
          </div>
        </div>

        {/* Report Summary */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Summary</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{mockAnalysis?.findings.length}</div>
              <div className="text-sm text-gray-600">Total Findings</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{Math.round((mockAnalysis?.confidence || 0) * 100)}%</div>
              <div className="text-sm text-gray-600">Confidence</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 capitalize">{mockAnalysis?.summary.overallRisk}</div>
              <div className="text-sm text-gray-600">Risk Level</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{mockAnalysis?.summary.documentsAnalyzed}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Executive Summary</h3>
            <p className="text-blue-800 text-sm">
              {mockAnalysis?.summary.executiveSummary}
            </p>
          </div>
        </div>

        {/* Download Options */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Download Report</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {config?.exportFormats.map((format) => (
              <div key={format} className="border border-gray-200 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {format === 'pdf' ? '📄' : format === 'html' ? '🌐' : '📊'}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 uppercase">{format}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {format === 'pdf' && 'Professional PDF report with all findings and recommendations'}
                    {format === 'html' && 'Interactive web report with tabbed navigation'}
                    {format === 'json' && 'Raw data export for further analysis'}
                  </p>
                  <button
                    onClick={downloadReport}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download {format.toUpperCase()}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Client Dashboard Access */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Client Dashboard</h2>
          <p className="text-gray-600 mb-4">
            As the client, you can access the same report that was generated for your users:
          </p>
          
          <div className="flex space-x-4">
            <button
              onClick={() => alert('Client dashboard would open here showing the exact report generated for users')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              View User Report
            </button>
            <button
              onClick={() => alert('Analytics dashboard would open here with usage statistics')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              View Analytics
            </button>
          </div>
          
          <div className="mt-4 text-xs text-gray-500">
            This allows you to see exactly what your users received and monitor report usage
          </div>
        </div>

        {/* Admin Navigation */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mt-6">
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Back to Admin Dashboard
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Return to admin interface to configure more workflows
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Debug Info (Full Report Mode Active)</h4>
          <div className="text-xs text-blue-800 space-y-1">
            <div>Report Mode: {config?.reportMode || 'undefined'}</div>
            <div>Allow Client Dashboard: {config?.allowClientDashboard ? 'Yes' : 'No'}</div>
            <div>Export Formats: {config?.exportFormats?.join(', ') || 'undefined'}</div>
            <div>PDF Download section IS visible in this mode ✅</div>
          </div>
        </div>
      </div>
    </div>
  );
} 