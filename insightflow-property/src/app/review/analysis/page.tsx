'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProgressiveAnalysis from '@/components/ProgressiveAnalysis';
import AppHeader from '@/components/AppHeader';

interface AnalysisResult {
  id: string;
  findings: Finding[];
  summary: {
    overallRisk: string;
    keyFindings: string[];
    documentsAnalyzed: number;
    completeness: number;
    recommendedActions: string[];
  };
  questions: Question[];
  confidence: number;
}

interface Finding {
  id: string;
  type: 'positive' | 'concern' | 'risk' | 'red_flag';
  title: string;
  description: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  citations: Citation[];
  recommendations: string[];
}

interface Citation {
  documentId: string;
  documentName: string;
  section: string;
  excerpt: string;
  confidence: number;
}

interface Question {
  id: string;
  category: string;
  question: string;
  priority: string;
  context: string;
}

interface AnalysisPageState {
  documentIds: string[];
  userContext: any;
  analysis: AnalysisResult | null;
  error: string | null;
  useProgressiveAnalysis: boolean;
}

function AnalysisPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<AnalysisPageState>({
    documentIds: [],
    userContext: null,
    analysis: null,
    error: null,
    useProgressiveAnalysis: true
  });

  useEffect(() => {
    // Get user context (survey responses) from localStorage
    let userContext = null;
    try {
      const storedResponses = localStorage.getItem('questionnaireResponses');
      if (storedResponses) {
        userContext = JSON.parse(storedResponses);
      }
    } catch (e) {
      console.warn('Could not parse questionnaire responses:', e);
    }

    const documentIds = searchParams.get('docs');
    if (documentIds) {
      const ids = documentIds.split(',');
      setState(prev => ({ 
        ...prev, 
        documentIds: ids, 
        userContext,
        useProgressiveAnalysis: true 
      }));
    } else {
      // Fallback: try to get documents from localStorage
      if (typeof window !== 'undefined') {
        const storedDocuments = localStorage.getItem('uploadedDocuments');
        if (storedDocuments) {
          try {
            const parsedDocuments = JSON.parse(storedDocuments);
            if (parsedDocuments && parsedDocuments.length > 0) {
              const ids = parsedDocuments.map((doc: any) => doc.id);
              setState(prev => ({ 
                ...prev, 
                documentIds: ids, 
                userContext,
                useProgressiveAnalysis: true 
              }));
              return;
            }
          } catch (e) {
            console.error('Error parsing stored documents:', e);
          }
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        error: 'No documents found for analysis. Please upload documents first.' 
      }));
    }
  }, [searchParams]);

  const handleAnalysisComplete = (analysisId: string) => {
    // Analysis completed, could navigate to detailed view or refresh data
    console.log('Analysis completed:', analysisId);
  };

  if (state.error) {
    return <AnalysisErrorScreen error={state.error} onRetry={() => {
      window.location.reload();
    }} />;
  }

  if (state.documentIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Documents Available</h2>
          <p className="text-gray-600 mb-4">Upload documents to generate an analysis report.</p>
          <button
            onClick={() => router.push('/review/upload')}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Upload Documents
          </button>
        </div>
      </div>
    );
  }

  // Use progressive analysis for better UX
  if (state.useProgressiveAnalysis) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* App Header */}
        <AppHeader 
          title="Property Analysis Report"
          subtitle="AI-powered analysis of your property documents with real-time insights"
        />
        
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              {/* Progress indicator */}
              <div className="flex items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="text-sm text-gray-500">Questionnaire</span>
                </div>
                
                <div className="w-12 h-px bg-gray-300 mx-4"></div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    ✓
                  </div>
                  <span className="text-sm text-gray-500">Document Upload</span>
                </div>
                
                <div className="w-12 h-px bg-gray-300 mx-4"></div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <span className="text-sm font-medium text-gray-900">Analysis</span>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Property Analysis Report
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                  AI-powered analysis of your property documents with real-time insights.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progressive Analysis Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProgressiveAnalysis 
            documentIds={state.documentIds}
            userContext={state.userContext}
            onComplete={handleAnalysisComplete}
          />
        </div>
      </div>
    );
  }

  return state.analysis ? <AnalysisReportView analysis={state.analysis} /> : null;
}

function AnalysisLoadingScreen({ progress }: { progress: number }) {
  const getStatusMessage = (progress: number): string => {
    if (progress < 30) return 'Initializing analysis...';
    if (progress < 70) return 'Processing documents...';
    if (progress < 90) return 'Analyzing content...';
    return 'Generating report...';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-teal-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Analyzing Your Property Documents
            </h2>
            <p className="text-gray-600">
              {getStatusMessage(progress)}
            </p>
          </div>

          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">{progress}% complete</p>
          </div>

          <div className="text-sm text-gray-500 space-y-1">
            <p>• Extracting text and analyzing content</p>
            <p>• Identifying potential areas of concern</p>
            <p>• Generating questions for professionals</p>
            <p>• Organizing findings with citations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalysisErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Analysis Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={onRetry}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

function AnalysisReportView({ analysis }: { analysis: AnalysisResult }) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-900 border border-green-200';
      case 'medium': return 'bg-amber-100 text-amber-900 border border-amber-200';
      case 'high': return 'bg-orange-100 text-orange-900 border border-orange-200';
      case 'critical': return 'bg-red-100 text-red-900 border border-red-200';
      default: return 'bg-gray-100 text-gray-900 border border-gray-200';
    }
  };

  const getFindingColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-green-300 bg-green-50 shadow-sm';
      case 'concern': return 'border-amber-300 bg-amber-50 shadow-sm';
      case 'risk': return 'border-orange-300 bg-orange-50 shadow-sm';
      case 'red_flag': return 'border-red-300 bg-red-50 shadow-sm';
      default: return 'border-gray-300 bg-gray-50 shadow-sm';
    }
  };

  const groupedFindings = analysis.findings.reduce((acc, finding) => {
    if (!acc[finding.type]) acc[finding.type] = [];
    acc[finding.type].push(finding);
    return acc;
  }, {} as Record<string, Finding[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Property Analysis Report
              </h1>
              <p className="text-gray-700 mt-1 font-medium flex items-center gap-2">
                Analysis confidence: {Math.round(analysis.confidence * 100)}%
                <span className="group relative">
                  <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="absolute left-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    How confident the AI is in its analysis based on document quality, text clarity, and completeness. Higher = more reliable findings.
                  </div>
                </span>
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.summary.overallRisk)}`}>
                {analysis.summary.overallRisk.toUpperCase()} RISK
              </span>
              <span className="group relative">
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute right-0 top-6 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  Overall risk level for this property purchase. Based on issues found in documents, structural concerns, legal complications, etc.
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main findings */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Summary */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Summary</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-800">Documents Analyzed:</span>
                  <span className="ml-2 text-gray-700 font-medium">{analysis.summary.documentsAnalyzed}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-800">Completeness:</span>
                  <span className="ml-2 text-gray-700 font-medium">{Math.round(analysis.summary.completeness * 100)}%</span>
                  <span className="group relative">
                    <svg className="w-3 h-3 text-gray-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="absolute left-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      Percentage of critical documents analyzed. Missing key documents = lower completeness.
                    </div>
                  </span>
                </div>
              </div>
              
              {analysis.summary.keyFindings.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Key Findings:</h3>
                  <ul className="space-y-1">
                    {analysis.summary.keyFindings.map((finding, index) => (
                      <li key={index} className="text-sm text-gray-700">• {finding}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Findings by type */}
            {Object.entries(groupedFindings).map(([type, findings]) => (
              <div key={type} className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {type.replace('_', ' ')}s ({findings.length})
                </h2>
                
                {findings.map((finding) => (
                  <div key={finding.id} className={`bg-white rounded-lg border p-6 ${getFindingColor(finding.type)}`}>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900">{finding.title}</h3>
                      <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-700 font-medium border">
                        {Math.round(finding.confidence * 100)}% confidence
                      </span>
                    </div>
                    
                    <p className="text-gray-800 mb-4">{finding.description}</p>
                    
                    {finding.citations.length > 0 && (
                      <div className="mb-4">
                        <details className="group">
                          <summary className="text-sm font-medium text-gray-900 cursor-pointer hover:text-gray-700 flex items-center gap-2">
                            <span>📄 Sources ({finding.citations.length})</span>
                            <svg className="w-4 h-4 transform group-open:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </summary>
                          <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                            {finding.citations.map((citation, index) => (
                              <div key={index} className="text-sm bg-gray-50 p-3 rounded-lg border">
                                <div className="flex items-start gap-2">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 shrink-0">
                                    {citation.documentName.replace('.pdf', '').slice(0, 20)}...
                                  </span>
                                  <div className="text-gray-700 italic">"{citation.excerpt}"</div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Section: {citation.section} • Confidence: {Math.round(citation.confidence * 100)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        </details>
                      </div>
                    )}
                    
                    {finding.recommendations.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {finding.recommendations.map((rec, index) => (
                            <li key={index} className="font-medium">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Next Steps */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Recommended Actions</h3>
              <ul className="space-y-2">
                {analysis.summary.recommendedActions.map((action, index) => (
                  <li key={index} className="text-sm text-gray-700 font-medium">• {action}</li>
                ))}
              </ul>
            </div>

            {/* Professional Questions */}
            {analysis.questions.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Questions for Professionals</h3>
                <div className="space-y-3">
                  {analysis.questions.slice(0, 5).map((question) => (
                    <div key={question.id} className="text-sm border-l-2 border-teal-200 pl-3">
                      <div className="font-medium text-gray-900">{question.question}</div>
                      <div className="text-gray-700 mt-1">{question.context}</div>
                      <div className="text-xs text-gray-600 mt-1 capitalize font-medium">
                        {question.category} • {question.priority} priority
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analysis...</p>
        </div>
      </div>
    }>
      <AnalysisPageContent />
    </Suspense>
  );
}