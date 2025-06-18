'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, FileText, AlertTriangle, CheckCircle, Clock, Shield, HelpCircle, User } from 'lucide-react';
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
    executiveSummary?: string;
    riskBreakdown?: Record<string, number>;
    positiveAspects?: string[];
  };
  questions: Question[];
  confidence: number;
  createdAt: Date;
  metadata?: any;
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

type TabType = 'positive' | 'risks' | 'questions' | 'survey';

function DetailedReportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('risks');
  const [surveyData, setSurveyData] = useState<any>(null);

  useEffect(() => {
    // Get survey data from localStorage
    try {
      const storedResponses = localStorage.getItem('questionnaireResponses');
      if (storedResponses) {
        setSurveyData(JSON.parse(storedResponses));
      }
    } catch (e) {
      console.warn('Could not parse survey responses:', e);
    }

    // First try to get cached analysis from localStorage (to avoid re-running)
    const cachedAnalysis = localStorage.getItem('latestAnalysis');
    if (cachedAnalysis) {
      try {
        const parsed = JSON.parse(cachedAnalysis);
        setAnalysis(parsed);
        setLoading(false);
        return;
      } catch (e) {
        console.warn('Failed to parse cached analysis:', e);
      }
    }

    // Fallback to API if no cache
    const analysisId = searchParams.get('analysisId');
    if (analysisId) {
      fetchAnalysis(analysisId);
    } else {
      setError('No analysis found. Please run analysis first.');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchAnalysis = async (analysisId: string) => {
    try {
      const response = await fetch(`/api/documents/analyze?id=${analysisId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analysis');
      }
      const data = await response.json();
      setAnalysis(data.analysis);
      // Cache the analysis
      localStorage.setItem('latestAnalysis', JSON.stringify(data.analysis));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!analysis) return;
    
    try {
      const response = await fetch('/api/reports/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysisId: analysis.id,
          analysis: analysis
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `property-analysis-detailed-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getFindingColor = (type: string, severity: string) => {
    if (type === 'positive') return 'border-green-200 bg-green-50';
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getFindingIcon = (type: string, severity: string) => {
    if (type === 'positive') return <CheckCircle className="w-5 h-5 text-green-600" />;
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  // Organize findings by type
  const positiveFindings = analysis?.findings?.filter(f => f.type === 'positive') || [];
  const riskFindings = analysis?.findings?.filter(f => f.type !== 'positive') || [];
  const questions = analysis?.questions || [];

  const tabs = [
    // Only show positive tab if there are positive findings
    ...(positiveFindings.length > 0 ? [{
      id: 'positive' as TabType,
      name: 'Positive Aspects',
      icon: <CheckCircle className="w-4 h-4" />,
      count: positiveFindings.length,
      color: 'text-green-600'
    }] : []),
    {
      id: 'risks' as TabType,
      name: 'Risks & Concerns',
      icon: <Shield className="w-4 h-4" />,
      count: riskFindings.length,
      color: 'text-orange-600'
    },
    {
      id: 'questions' as TabType,
      name: 'Professional Questions',
      icon: <HelpCircle className="w-4 h-4" />,
      count: questions.length,
      color: 'text-blue-600'
    },
    {
      id: 'survey' as TabType,
      name: 'Your Survey Info',
      icon: <User className="w-4 h-4" />,
      count: surveyData ? 
        (surveyData.propertyType ? 1 : 0) + 
        (surveyData.riskTolerance ? 1 : 0) + 
        (surveyData.professionalTeam ? 1 : 0) + 
        (surveyData.timeline ? 1 : 0) + 
        (surveyData.specialConsiderations ? 1 : 0) : 0,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading detailed report...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Report</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/review/upload')}
            className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Upload More Documents
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <AppHeader 
        showBackButton={true}
        backPath="/review/upload"
        backLabel="Upload More Documents"
        title="Detailed Property Analysis Report"
      />
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200 print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/review/upload')}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Upload More Documents
                </button>
                <div className="h-6 border-l border-gray-300"></div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detailed Property Analysis Report
                </h1>
              </div>
              <button
                onClick={downloadPDF}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Executive Summary - Always Visible */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Property Analysis Report
            </h1>
            <p className="text-gray-600">
              Generated on {new Date().toLocaleDateString('en-GB', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <div className="mt-4 flex items-center justify-center space-x-6">
              <span className="text-sm text-gray-500">
                Documents: {analysis.summary?.documentsAnalyzed ?? 'N/A'}
              </span>
              <span className="text-sm text-gray-500">
                Confidence: {Math.round(analysis.confidence * 100)}%
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysis.summary?.overallRisk ?? 'low')}`}>
                {(analysis.summary?.overallRisk ?? 'low').toUpperCase()} RISK
              </span>
            </div>
          </div>

          {/* Executive Summary */}
          {analysis.summary?.executiveSummary && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Executive Summary</h2>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 leading-relaxed">
                  {analysis.summary.executiveSummary}
                </p>
              </div>
            </div>
          )}

          {/* Key Recommendations */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Recommendations</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <ul className="space-y-2">
                {(analysis.summary?.recommendedActions ?? []).map((action, index) => (
                  <li key={index} className="flex items-start text-blue-800">
                    <span className="text-blue-600 mr-2 mt-1">•</span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600 bg-teal-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className={activeTab === tab.id ? tab.color : 'text-gray-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    activeTab === tab.id ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'positive' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Positive Aspects</h3>
                {positiveFindings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No specific positive findings identified in this analysis.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {positiveFindings.map((finding, index) => (
                      <FindingCard key={finding.id} finding={finding} index={index} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'risks' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Risks & Concerns</h3>
                {riskFindings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No risks or concerns identified in this analysis.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {riskFindings
                      .sort((a, b) => {
                        const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
                        return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
                      })
                      .map((finding, index) => (
                        <FindingCard key={finding.id} finding={finding} index={index} />
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'questions' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Questions for Professionals</h3>
                {questions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No specific questions generated for this analysis.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions
                      .sort((a, b) => {
                        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
                        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
                      })
                      .map((question, index) => (
                        <div key={question.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-lg font-medium text-gray-900">
                              Q{index + 1}.
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                question.category === 'legal' ? 'bg-purple-100 text-purple-800' :
                                question.category === 'structural' ? 'bg-orange-100 text-orange-800' :
                                question.category === 'financial' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {question.category}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                question.priority === 'high' ? 'bg-red-100 text-red-800' :
                                question.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {question.priority} priority
                              </span>
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-900 text-base">{question.question}</h4>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'survey' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Survey Information</h3>
                {!surveyData ? (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No survey information available.</p>
                    <p className="text-sm mt-2">Complete the questionnaire to see how your responses influenced this analysis.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Property Details */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 text-purple-600 mr-2" />
                        Property Information
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium text-gray-700">Property Type:</span>
                          <p className="text-gray-600 capitalize">{surveyData.propertyType?.replace(/_/g, ' ') || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Risk Tolerance:</span>
                          <p className="text-gray-600 capitalize">{surveyData.riskTolerance || 'Not specified'}</p>
                        </div>
                        {surveyData.location?.postcode && (
                          <div>
                            <span className="font-medium text-gray-700">Location:</span>
                            <p className="text-gray-600">{surveyData.location.postcode}</p>
                          </div>
                        )}
                        {surveyData.timeline?.urgency && (
                          <div>
                            <span className="font-medium text-gray-700">Timeline:</span>
                            <p className="text-gray-600 capitalize">{surveyData.timeline.urgency}</p>
                          </div>
                        )}
                        {surveyData.propertyValue && (
                          <div>
                            <span className="font-medium text-gray-700">Property Value:</span>
                            <p className="text-gray-600">£{surveyData.propertyValue.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Professional Team */}
                    {surveyData.professionalTeam && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <Shield className="w-5 h-5 text-purple-600 mr-2" />
                          Professional Support
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium text-gray-700">Solicitor:</span>
                            <p className="text-gray-600">
                              {surveyData.professionalTeam.hasSolicitor ? '✓ Instructed' : '⚠ Not yet instructed'}
                              {surveyData.professionalTeam.solicitorName && ` (${surveyData.professionalTeam.solicitorName})`}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Surveyor:</span>
                            <p className="text-gray-600">
                              {surveyData.professionalTeam.hasSurveyor ? '✓ Instructed' : '⚠ Not yet instructed'}
                              {surveyData.professionalTeam.surveyorType && ` (${surveyData.professionalTeam.surveyorType.replace(/_/g, ' ')})`}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Special Considerations */}
                    {surveyData.specialConsiderations && Object.keys(surveyData.specialConsiderations).length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <AlertTriangle className="w-5 h-5 text-purple-600 mr-2" />
                          Special Considerations
                        </h4>
                        <div className="space-y-2">
                          {surveyData.specialConsiderations.firstTimeBuyer && (
                            <p className="text-gray-600">• First-time buyer</p>
                          )}
                          {surveyData.specialConsiderations.investmentProperty && (
                            <p className="text-gray-600">• Investment property</p>
                          )}
                          {surveyData.specialConsiderations.accessibility && (
                            <p className="text-gray-600">• Accessibility requirements</p>
                          )}
                          {surveyData.specialConsiderations.familyNeeds?.length > 0 && (
                            <p className="text-gray-600">• Family needs: {surveyData.specialConsiderations.familyNeeds.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Document Availability */}
                    {surveyData.documentsAvailable && surveyData.documentsAvailable.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                          Documents Available
                        </h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {surveyData.documentsAvailable.map((doc: any, index: number) => (
                            <p key={index} className="text-gray-600 text-sm">
                              {doc.available ? '✓' : '⚠'} {doc.type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              {doc.quality && ` (${doc.quality.replace(/_/g, ' ')})`}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Analysis Context */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <HelpCircle className="w-5 h-5 text-purple-600 mr-2" />
                        How This Influenced Your Analysis
                      </h4>
                      <div className="space-y-3 text-sm text-gray-700">
                        <p>
                          <strong>Risk Assessment:</strong> Your "{surveyData.riskTolerance || 'moderate'}" risk tolerance helped us calibrate the analysis sensitivity and prioritize findings accordingly.
                        </p>
                        <p>
                          <strong>Property Focus:</strong> As a {surveyData.propertyType?.replace(/_/g, ' ') || 'property'} purchase, we emphasized relevant legal and structural considerations specific to this property type.
                        </p>
                        {surveyData.timeline?.urgency === 'urgent' && (
                          <p>
                            <strong>Timeline Priority:</strong> Given your urgent timeline, we prioritized identifying critical issues that could delay your transaction.
                          </p>
                        )}
                        {surveyData.specialConsiderations?.firstTimeBuyer && (
                          <p>
                            <strong>First-Time Buyer:</strong> We included additional explanations and flagged issues that might be particularly important for first-time buyers.
                          </p>
                        )}
                        {!surveyData.professionalTeam?.hasSolicitor && (
                          <p>
                            <strong>Legal Support:</strong> Since you haven't instructed a solicitor yet, we've highlighted issues that particularly need professional legal review.
                          </p>
                        )}
                        {!surveyData.professionalTeam?.hasSurveyor && (
                          <p>
                            <strong>Survey Advice:</strong> With no surveyor instructed yet, we've emphasized structural and maintenance issues that need professional assessment.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Report Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            This report was generated by InsightFlow Property Analysis AI. 
            Always consult with qualified legal and property professionals before making decisions.
          </p>
        </div>
      </div>
    </div>
  );
}

// Finding Card Component
function FindingCard({ finding, index }: { finding: Finding; index: number }) {
  const getFindingColor = (type: string, severity: string) => {
    if (type === 'positive') return 'border-green-200 bg-green-50';
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'high': return 'border-orange-200 bg-orange-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getFindingIcon = (type: string, severity: string) => {
    if (type === 'positive') return <CheckCircle className="w-5 h-5 text-green-600" />;
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <FileText className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className={`border rounded-lg p-6 hover:shadow-md transition-shadow ${getFindingColor(finding.type, finding.severity)}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getFindingIcon(finding.type, finding.severity)}
          <h4 className="text-lg font-semibold text-gray-900">
            {finding.title}
          </h4>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            finding.severity === 'critical' ? 'bg-red-100 text-red-800' :
            finding.severity === 'high' ? 'bg-orange-100 text-orange-800' :
            finding.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {finding.severity.toUpperCase()}
          </span>
          <span className="text-xs text-gray-500">
            {Math.round(finding.confidence * 100)}% confidence
          </span>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 leading-relaxed">
        {finding.description}
      </p>
      
      {/* Citations */}
      {finding.citations && finding.citations.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Evidence:</h5>
          <div className="space-y-2">
            {finding.citations.map((citation, citIndex) => (
              <div key={citIndex} className="bg-white border-l-4 border-blue-400 p-3 rounded-r">
                <p className="text-xs font-medium text-blue-800 mb-1">
                  📄 {citation.documentName} - {citation.section}
                </p>
                <p className="text-sm text-gray-700 italic">
                  "{citation.excerpt}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Recommendations */}
      {finding.recommendations && finding.recommendations.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-700 mb-2">Recommended Actions:</h5>
          <ul className="space-y-1">
            {finding.recommendations.map((rec, recIndex) => (
              <li key={recIndex} className="text-sm text-gray-600 flex items-start">
                <span className="text-teal-500 mr-2 mt-0.5">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function DetailedReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DetailedReportContent />
    </Suspense>
  );
} 