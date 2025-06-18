'use client';

import React, { useState, useEffect } from 'react';
import QuestionnaireConfigForm from '@/modules/questionnaire/config-form';
import { QuestionnaireConfig } from '@/modules/questionnaire/types';

export default function AdminPage() {
  const [activeModule, setActiveModule] = useState('');

  // This would be dynamic based on questionnaire domain selection
  const [detectedDomain, setDetectedDomain] = useState<string>(''); 
  const [allModulesConfigured, setAllModulesConfigured] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [showDomainChangeConfirm, setShowDomainChangeConfirm] = useState(false);
  const [savedConfigs, setSavedConfigs] = useState({
    questionnaire: false,
    reports: false,
    documents: false,
    llm: false,
    prompts: false,
    findings: false,
    qa: false
  });

  useEffect(() => {
    checkSetupCompletion();
    checkSavedConfigurations();
    detectDomainFromConfig();
  }, []);

  // Refresh configurations when page becomes visible (e.g., returning from other admin pages)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkSavedConfigurations();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const checkSetupCompletion = () => {
    const isComplete = localStorage.getItem('workflowSetupComplete');
    if (isComplete === 'true') {
      setSetupComplete(true);
    }
  };

  const checkSavedConfigurations = async () => {
    try {
      // Check if questionnaire is configured
      const questionnaireRes = await fetch('/api/questionnaire');
      const questionnaireData = await questionnaireRes.json();
      
      // Check if questionnaire exists and has questions configured
      const hasQuestionnaire = questionnaireData.questionnaire && 
                               questionnaireData.questionnaire.config && 
                               questionnaireData.questionnaire.config.questions &&
                               questionnaireData.questionnaire.config.questions.length > 0;

      // Check if reports are configured
      const reportsRes = await fetch('/api/reports/config');
      const reportsData = await reportsRes.json();
      
      // Use the isDefault flag to determine if user has saved a config
      const hasReports = reportsData.success && 
                        reportsData.config && 
                        !reportsData.isDefault;

      // Check if documents are configured
      let hasDocuments = false;
      try {
        const documentsRes = await fetch('/api/documents/config');
        const documentsData = await documentsRes.json();
        hasDocuments = documentsData.success && documentsData.config && !documentsData.isDefault;
      } catch (e) {
        console.log('Documents API not available yet');
        hasDocuments = false;
      }

      // Check if LLM is configured
      let hasLLM = false;
      try {
        const llmRes = await fetch('/api/llm/config');
        const llmData = await llmRes.json();
        hasLLM = llmData.success && llmData.config && !llmData.isDefault;
      } catch (e) {
        console.log('LLM API not available yet');
        hasLLM = false;
      }

      // Check if prompts are configured
      let hasPrompts = false;
      try {
        const promptsRes = await fetch('/api/prompts/config');
        const promptsData = await promptsRes.json();
        hasPrompts = promptsData.success && promptsData.config && !promptsData.isDefault;
      } catch (e) {
        console.log('Prompts API not available yet');
        hasPrompts = false;
      }

      // Check if findings are configured
      let hasFindings = false;
      try {
        const findingsRes = await fetch('/api/findings/config');
        const findingsData = await findingsRes.json();
        hasFindings = findingsData.success && findingsData.config && !findingsData.isDefault;
      } catch (e) {
        console.log('Findings API not available yet');
        hasFindings = false;
      }

      // Check if QA is configured
      let hasQa = false;
      try {
        const qaRes = await fetch('/api/qa/config');
        const qaData = await qaRes.json();
        hasQa = qaData.success && qaData.config && !qaData.isDefault;
      } catch (e) {
        console.log('QA API not available yet');
        hasQa = false;
      }

      console.log('Checking saved configurations:', {
        questionnaireResponse: questionnaireData,
        reportsResponse: reportsData,
        hasQuestionnaire,
        hasReports,
        hasDocuments,
        hasLLM,
        hasPrompts,
        hasFindings,
        hasQa,
        detectedDomain
      });

      setSavedConfigs({
        questionnaire: hasQuestionnaire,
        reports: hasReports,
        documents: hasDocuments,
        llm: hasLLM,
        prompts: hasPrompts,
        findings: hasFindings,
        qa: hasQa
      });
    } catch (error) {
      console.error('Error checking saved configurations:', error);
    }
  };

  const detectDomainFromConfig = async () => {
    try {
      const response = await fetch('/api/questionnaire');
      const data = await response.json();
      
      if (data.questionnaire?.config?.questions) {
        const questions = data.questionnaire.config.questions;
        if (questions.some((q: any) => q.title?.toLowerCase().includes('property'))) {
          setDetectedDomain('property');
        } else if (questions.some((q: any) => q.title?.toLowerCase().includes('legal'))) {
          setDetectedDomain('legal');
        } else if (questions.some((q: any) => q.title?.toLowerCase().includes('financial'))) {
          setDetectedDomain('financial');
        } else if (questions.some((q: any) => q.title?.toLowerCase().includes('technical'))) {
          setDetectedDomain('technical');
        }
      }
    } catch (error) {
      console.error('Error detecting domain:', error);
    }
  };

  const domainInfo = {
    property: {
      name: "Property Review",
      description: "Comprehensive property purchase and due diligence workflow",
      color: "blue"
    },
    legal: {
      name: "Legal Document Review", 
      description: "Legal document analysis and compliance review",
      color: "purple"
    },
    financial: {
      name: "Financial Analysis",
      description: "Financial document review and due diligence",
      color: "green"
    },
    technical: {
      name: "Technical Review",
      description: "Technical documentation and specification analysis",
      color: "orange"
    }
  };

  const currentDomain = detectedDomain ? domainInfo[detectedDomain as keyof typeof domainInfo] : null;

  const getModuleStatus = (moduleId: string) => {
    // Domain module is completed if we have detected a domain
    if (moduleId === 'domain' && detectedDomain) return 'completed';
    
    // Check if this module has been saved
    if (savedConfigs[moduleId as keyof typeof savedConfigs]) {
      return 'completed';
    }
    
    // If domain is selected but module not saved, it's configured
    if (detectedDomain && ['questionnaire', 'documents', 'prompts', 'llm', 'findings', 'reports', 'qa'].includes(moduleId)) {
      return 'configured';
    }
    
    return 'pending';
  };

  const modules = [
    { 
      id: 'domain', 
      name: 'Domain Selection', 
      status: getModuleStatus('domain'), 
      icon: 'domain',
      description: 'Choose your industry domain (Property, Legal, Financial, Technical)'
    },
    { 
      id: 'questionnaire', 
      name: 'Questionnaire Setup', 
      status: getModuleStatus('questionnaire'), 
      icon: 'questionnaire',
      description: 'Configure client questionnaire (optional)'
    },
    { 
      id: 'documents', 
      name: 'Document Upload', 
      status: getModuleStatus('documents'), 
      icon: 'documents',
      description: 'Document types auto-configured based on domain'
    },
    { 
      id: 'prompts', 
      name: 'Prompt Manager', 
      status: getModuleStatus('prompts'), 
      icon: 'prompts',
      description: 'Expert prompts generated for domain'
    },
    { 
      id: 'llm', 
      name: 'LLM Engine', 
      status: getModuleStatus('llm'), 
      icon: 'llm',
      description: 'Model parameters optimized for domain'
    },
    { 
      id: 'findings', 
      name: 'Findings Generator', 
      status: getModuleStatus('findings'), 
      icon: 'findings',
      description: 'Analysis frameworks for domain'
    },
    { 
      id: 'reports', 
      name: 'Report Builder', 
      status: getModuleStatus('reports'), 
      icon: 'reports',
      description: 'Report templates for domain'
    },
    { 
      id: 'qa', 
      name: 'Document Q&A', 
      status: getModuleStatus('qa'), 
      icon: 'qa',
      description: 'Domain-specific Q&A contexts'
    }
  ];

  const handleQuestionnaireConfigSave = (config: QuestionnaireConfig) => {
    console.log('Questionnaire saved:', config);
  };

  const handleQuestionnairePreview = (config: QuestionnaireConfig) => {
    alert(`Preview questionnaire:\n\nTitle: ${config.title}\nQuestions: ${config.questions.length}\n\nThis would open the questionnaire preview in a real app.`);
  };

  if (activeModule === 'questionnaire') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-6">
            <button
              onClick={() => setActiveModule('')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <QuestionnaireConfigForm
            onSave={handleQuestionnaireConfigSave}
            onPreview={handleQuestionnairePreview}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">InsightFlow Admin</h1>
              <p className="text-gray-600">Configure your document review workflow</p>
              {!detectedDomain && (
                <div className="mt-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                  💡 Start with questionnaire for best results, or skip to document-only analysis
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  checkSavedConfigurations();
                  console.log('Manually refreshing configurations...');
                }}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                title="Refresh configuration status"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
              
              {currentDomain ? (
                <div className={`px-4 py-2 bg-${currentDomain.color}-100 text-${currentDomain.color}-800 rounded-lg`}>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span className="font-medium">{currentDomain.name}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Domain configured</p>
                </div>
              ) : (
                <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                    <span className="font-medium">No Domain Selected</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Select domain to auto-configure</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Left Sidebar - Workflow Modules */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Workflow Modules</h3>
              <p className="text-sm text-gray-600 mt-1">
                {detectedDomain 
                  ? `Auto-configured for ${currentDomain?.name.toLowerCase()}`
                  : 'Select domain to auto-configure all modules'
                }
              </p>
            </div>
            <div className="p-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => {
                    // Navigate to specific module pages
                    if (module.id === 'domain') {
                      setActiveModule('domain');
                    } else if (module.id === 'questionnaire') {
                      setActiveModule('questionnaire');
                    } else if (module.id === 'documents') {
                      window.location.href = '/admin/documents';
                    } else if (module.id === 'prompts') {
                      window.location.href = '/admin/prompts';
                    } else if (module.id === 'llm') {
                      window.location.href = '/admin/llm';
                    } else if (module.id === 'findings') {
                      window.location.href = '/admin/findings';
                    } else if (module.id === 'reports') {
                      window.location.href = '/admin/reports';
                    } else if (module.id === 'qa') {
                      window.location.href = '/admin/qa';
                    } else {
                      // For modules without pages yet, just select them
                      setActiveModule(module.id);
                    }
                  }}
                  className={`w-full p-3 rounded-lg mb-2 text-left transition-colors ${
                    activeModule === module.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div>
                        <div className="font-medium text-gray-900">{module.name}</div>
                        <div className="flex items-center mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            module.status === 'completed' ? 'bg-green-500' :
                            module.status === 'configured' ? 'bg-blue-500' :
                            'bg-gray-300'
                          }`}></span>
                          <span className="text-xs text-gray-600 capitalize">{module.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{module.description}</p>
                      </div>
                    </div>
                    {module.status === 'configured' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Auto-configured
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions when setup is complete - only show if not all modules are completed */}
          {detectedDomain && modules.some(m => m.status === 'configured' || m.status === 'completed') && !modules.every(m => m.status === 'completed') && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900 mb-2 text-sm">🎯 Quick Actions</h4>
              <div className="space-y-2">
                <button
                  onClick={() => window.location.href = '/workflow/questionnaire'}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs"
                >
                  👁️ Preview Workflow
                </button>
                <p className="text-xs text-blue-600">
                  💡 Test your configuration
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Workflow Actions - Show when setup is complete */}
          {!activeModule && detectedDomain && modules.every(m => m.status === 'completed') && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6 mb-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center mb-2">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                    <h3 className="text-lg font-semibold text-gray-900">Workflow Setup Complete!</h3>
                  </div>
                  <p className="text-gray-700 mb-4">
                    Your {currentDomain?.name.toLowerCase()} workflow is fully configured and ready to use.
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                <button
                  onClick={() => window.location.href = '/workflow/questionnaire'}
                  className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-medium">Preview Workflow</div>
                    <div className="text-sm text-blue-100">Test the complete client experience</div>
                  </div>
                </button>
                
                <button
                  onClick={() => {
                    // Generate deployment URL (simplified for demo)
                    const deployUrl = `https://demo.insightflow.com/workflow/${Date.now()}`;
                    navigator.clipboard.writeText(deployUrl);
                    alert(`🚀 Workflow deployed!\n\nClient URL copied to clipboard:\n${deployUrl}\n\nShare this URL with your clients to start receiving document submissions.`);
                  }}
                  className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-medium">Deploy Workflow</div>
                    <div className="text-sm text-green-100">Generate client access URL</div>
                  </div>
                </button>
                
                <button
                  onClick={() => window.location.href = '/admin/setup-complete'}
                  className="flex items-center justify-center px-6 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors group"
                >
                  <div className="text-left">
                    <div className="font-medium">View Summary</div>
                    <div className="text-sm text-purple-100">See complete configuration</div>
                  </div>
                </button>
              </div>
              
              <div className="mt-4 text-sm text-gray-600 bg-white bg-opacity-50 rounded-lg p-3">
                <strong>Next Steps:</strong> Preview your workflow to ensure everything works as expected, then deploy to start receiving client submissions. You can always return here to modify your configuration.
              </div>
            </div>
          )}

          {/* Show setup prompts only if no domain is detected */}
          {!activeModule && !detectedDomain && (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to InsightFlow Admin</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Configure your white-label document review platform. Start by selecting a domain to auto-configure all modules with expert defaults.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">Quick Setup</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Select your domain (Property, Legal, Financial, or Technical) and all modules will be automatically configured with expert settings.
                  </p>
                  <button
                    onClick={() => setActiveModule('domain')}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Select Domain →
                  </button>
                </div>

                <div className="p-6 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">Document-Only Mode</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Skip questionnaires and configure for pure document analysis. You'll still need to select your domain for AI prompts and analysis frameworks.
                  </p>
                  <button
                    onClick={() => {
                      setActiveModule('domain');
                      // Set a flag to indicate this is document-only mode
                      localStorage.setItem('documentOnlyMode', 'true');
                    }}
                    className="text-green-600 hover:text-green-700 font-medium text-sm"
                  >
                    Select Domain for Document Analysis →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show workflow status when domain is detected but not all modules are complete */}
          {!activeModule && detectedDomain && !modules.every(m => m.status === 'completed') && (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentDomain?.name} Workflow Configuration
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Your workflow is being configured with expert defaults. Review and customize each module as needed.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="font-semibold text-blue-900 mb-2">Ready for Testing!</h3>
                <p className="text-blue-700 mb-4">
                  Your {currentDomain?.name.toLowerCase()} modules are auto-configured. Click any module in the sidebar to customize, or test your workflow now.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => window.location.href = '/workflow/questionnaire'}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    👁️ Preview Workflow
                  </button>
                  <button
                    onClick={() => window.location.href = '/admin/setup-complete'}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    📊 View Configuration Summary
                  </button>
                </div>
                <p className="text-xs text-blue-600 mt-3">
                  💡 Save individual module configurations to unlock full deployment
                </p>
              </div>
            </div>
          )}

          {activeModule === 'questionnaire' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <QuestionnaireConfigForm />
            </div>
          )}

          {activeModule === 'domain' && (
            <div className="bg-white rounded-lg shadow-sm border p-8">
              {detectedDomain ? (
                // Show currently selected domain with protection against accidental changes
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Current Domain</h2>
                    <p className="text-gray-600">
                      Your workflow is configured for the domain below. Changing it will reset all module configurations.
                    </p>
                  </div>

                  {/* Current Domain Display */}
                  <div className={`p-6 border-2 border-${currentDomain?.color}-300 bg-${currentDomain?.color}-50 rounded-lg mb-6`}>
                    <div className="flex items-start space-x-4">
                      <div className="text-5xl">{
                        detectedDomain === 'property' ? '🏠' :
                        detectedDomain === 'legal' ? '⚖️' :
                        detectedDomain === 'financial' ? '💼' : '🔧'
                      }</div>
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-xl font-bold text-gray-900 mr-3">
                            {currentDomain?.name}
                          </h3>
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            ✅ Active Domain
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3">
                          {
                            detectedDomain === 'property' ? 'UK property law, conveyancing, surveys, title deeds, local authority searches' :
                            detectedDomain === 'legal' ? 'Contract analysis, compliance review, legal document processing' :
                            detectedDomain === 'financial' ? 'Due diligence, financial statements, audit reports, risk assessment' :
                            'Technical specs, engineering docs, standards compliance, R&D documentation'
                          }
                        </p>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Auto-configured modules:</span> Questionnaire, Documents, Prompts, LLM, Findings, Reports, Q&A
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Warning and Change Option */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <span className="text-yellow-600 text-lg">⚠️</span>
                      <div>
                        <h4 className="font-medium text-yellow-900">Important Notice</h4>
                        <p className="text-yellow-800 text-sm mt-1">
                          Changing your domain will reset all module configurations to match the new domain's defaults. 
                          Any custom settings you've made will be lost.
                        </p>
                      </div>
                    </div>
                  </div>

                  {!showDomainChangeConfirm ? (
                    <div className="text-center">
                      <button
                        onClick={() => setShowDomainChangeConfirm(true)}
                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium"
                      >
                      Change Domain
                      </button>
                      <p className="text-sm text-gray-500 mt-2">
                        Only click if you're sure you want to change domains
                      </p>
                    </div>
                  ) : (
                    <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                      <h4 className="font-medium text-red-900 mb-4 text-center">
                        🚨 Confirm Domain Change
                      </h4>
                      <p className="text-red-800 text-sm mb-6 text-center">
                        This will reset ALL module configurations. Are you absolutely sure?
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        {Object.entries({
                          property: {
                            name: "Property Review",
                            description: "UK property law, conveyancing, surveys",
                            icon: "🏠"
                          },
                          legal: {
                            name: "Legal Document Review", 
                            description: "Contract analysis, compliance review",
                            icon: "⚖️"
                          },
                          financial: {
                            name: "Financial Analysis",
                            description: "Due diligence, financial statements",
                            icon: "💼"
                          },
                          technical: {
                            name: "Technical Review",
                            description: "Technical specs, engineering docs",
                            icon: "🔧"
                          }
                        }).filter(([domain]) => domain !== detectedDomain).map(([domain, info]) => (
                          <button
                            key={domain}
                            onClick={async () => {
                              // Reset all configurations
                              localStorage.clear();
                              setDetectedDomain(domain);
                              setActiveModule('');
                              setShowDomainChangeConfirm(false);
                              
                              // Save new domain
                              localStorage.setItem('selectedDomain', domain);
                              localStorage.setItem('workflowSetupComplete', 'true');
                              console.log(`Changed domain to: ${domain}`);
                              
                              // Auto-create questionnaire configuration for new domain
                              try {
                                const response = await fetch('/api/questionnaire', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    action: 'auto-generate',
                                    domain: domain,
                                    count: 5
                                  })
                                });
                                
                                if (response.ok) {
                                  console.log(`Auto-generated questionnaire for ${domain} domain`);
                                  setTimeout(() => {
                                    checkSavedConfigurations();
                                  }, 500);
                                }
                              } catch (error) {
                                console.error('Error auto-generating questionnaire:', error);
                              }
                            }}
                            className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="text-2xl">{info.icon}</div>
                              <div>
                                <h3 className="font-medium text-gray-900 group-hover:text-blue-900">
                                  {info.name}
                                </h3>
                                <p className="text-gray-600 text-xs">
                                  {info.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setShowDomainChangeConfirm(false)}
                          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Show domain selection for first-time users
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Domain</h2>
                    <p className="text-gray-600">
                      Choose your industry domain to automatically configure all modules with expert defaults.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {Object.entries({
                      property: {
                        name: "Property Review",
                        description: "UK property law, conveyancing, surveys, title deeds, local authority searches",
                        icon: "🏠",
                        examples: ["Purchase contracts", "Property surveys", "Title deeds", "Local searches"]
                      },
                      legal: {
                        name: "Legal Document Review", 
                        description: "Contract analysis, compliance review, legal document processing",
                        icon: "⚖️",
                        examples: ["Contracts", "Compliance docs", "Legal agreements", "Terms & conditions"]
                      },
                      financial: {
                        name: "Financial Analysis",
                        description: "Due diligence, financial statements, audit reports, risk assessment",
                        icon: "💼",
                        examples: ["Financial statements", "Audit reports", "Due diligence", "Risk assessments"]
                      },
                      technical: {
                        name: "Technical Review",
                        description: "Technical specs, engineering docs, standards compliance, R&D documentation",
                        icon: "🔧",
                        examples: ["Technical specs", "Engineering docs", "Standards", "R&D documentation"]
                      }
                    }).map(([domain, info]) => (
                      <button
                        key={domain}
                        onClick={async () => {
                          setDetectedDomain(domain);
                          setActiveModule('');
                          localStorage.setItem('selectedDomain', domain);
                          localStorage.setItem('workflowSetupComplete', 'true');
                          console.log(`Selected domain: ${domain}`);
                          
                          try {
                            const response = await fetch('/api/questionnaire', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                action: 'auto-generate',
                                domain: domain,
                                count: 5
                              })
                            });
                            
                            if (response.ok) {
                              console.log(`Auto-generated questionnaire for ${domain} domain`);
                              setTimeout(() => {
                                checkSavedConfigurations();
                              }, 500);
                            }
                          } catch (error) {
                            console.error('Error auto-generating questionnaire:', error);
                          }
                        }}
                        className="p-6 text-left border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="text-4xl">{info.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 mb-2">
                              {info.name}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {info.description}
                            </p>
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Examples:</span> {info.examples.join(", ")}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <span className="text-blue-600 text-lg">💡</span>
                      <div>
                        <h4 className="font-medium text-blue-900">Auto-Configuration</h4>
                        <p className="text-blue-800 text-sm mt-1">
                          Selecting a domain will automatically configure questionnaires, document types, 
                          expert AI prompts, and analysis frameworks optimized for your industry.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {detectedDomain && activeModule === 'documents' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Document Upload Configuration</h2>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                    Auto-configured for {currentDomain?.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    Document types and requirements automatically set based on your domain
                  </span>
                </div>
              </div>

              {/* Same document configuration UI as before */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Required Document Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {detectedDomain === 'property' && [
                      { name: "Purchase Contract/Offer", required: true, accepts: "PDF, DOC, DOCX" },
                      { name: "Property Survey", required: true, accepts: "PDF" },
                      { name: "Title Deeds/Land Registry", required: false, accepts: "PDF" },
                      { name: "Local Authority Searches", required: false, accepts: "PDF" },
                      { name: "Mortgage Documents", required: false, accepts: "PDF, DOC, DOCX" }
                    ].map((doc, idx) => (
                      <div key={idx} className="flex items-start p-3 border rounded-lg">
                        <input 
                          type="checkbox" 
                          checked={doc.required} 
                          className="mt-1 mr-3"
                          readOnly
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{doc.name}</div>
                          <div className="text-xs text-gray-600 mt-1">Accepts: {doc.accepts}</div>
                        </div>
                        {doc.required && (
                          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Required</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-blue-500 text-lg mr-3">💡</span>
                    <div>
                      <h4 className="font-medium text-blue-900">Smart Defaults Applied</h4>
                      <p className="text-blue-800 text-sm mt-1">
                        These document types are automatically configured based on {detectedDomain} domain best practices. 
                        You can customize them as needed for your specific workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other modules with similar auto-configuration messaging */}
          {detectedDomain && ['prompts', 'llm', 'findings', 'qa'].includes(activeModule) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {modules.find(m => m.id === activeModule)?.name}
                </h2>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                    Auto-configured for {currentDomain?.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    {modules.find(m => m.id === activeModule)?.description}
                  </span>
                </div>
              </div>

              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Auto-Configured & Ready</h3>
                <p className="text-gray-600 mb-4">
                  This module has been automatically configured with expert settings for {currentDomain?.name.toLowerCase()}.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-green-800 text-sm">
                    ✨ Expert defaults applied - no manual configuration needed! You can customize settings here when ready.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Reports Module with Special Configuration */}
          {detectedDomain && activeModule === 'reports' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Report Builder</h2>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                    Auto-configured for {currentDomain?.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    Choose between expert review mode or full report generation
                  </span>
                </div>
              </div>

              <div className="text-center py-8">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Configure Report Generation</h3>
                <p className="text-gray-600 mb-6">
                  Choose how your users receive analysis results - personal follow-up or downloadable reports.
                </p>
                
                <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">🎯</div>
                    <h4 className="font-medium text-gray-900">Expert Review Mode</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Analysis complete message, personal follow-up
                    </p>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="text-3xl mb-2">📋</div>
                    <h4 className="font-medium text-gray-900">Full Report Mode</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Complete InsightFlow-style downloadable reports
                    </p>
                  </div>
                </div>

                <a
                  href="/admin/reports"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Configure Report Generation →
                </a>
                
                <div className="mt-4">
                  <a
                    href="/workflow/questionnaire"
                    className="text-sm text-blue-600 hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Preview Client Experience →
                  </a>
                  <p className="text-xs text-gray-500 mt-1">
                    Experience the full user workflow from questionnaire to analysis results
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Domain Configuration */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Domain-Driven Configuration</h4>
            
            {!detectedDomain ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2"></span>
                  <div>
                    <div className="font-medium">Step 1: Select Domain</div>
                    <div className="text-gray-600">Choose your workflow domain first</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2"></span>
                  <div>
                    <div className="font-medium">Step 2: Auto-Configure</div>
                    <div className="text-gray-600">All modules automatically configured</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3 mt-2"></span>
                  <div>
                    <div className="font-medium">Step 3: Customize</div>
                    <div className="text-gray-600">Fine-tune settings as needed</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></span>
                  <div>
                    <div className="font-medium">Domain Selected</div>
                    <div className="text-gray-600">{currentDomain?.name} configured</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  <div>
                    <div className="font-medium">Modules Auto-Configured</div>
                    <div className="text-gray-600">Expert defaults applied across all modules</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></span>
                  <div>
                    <div className="font-medium">Ready to Customize</div>
                    <div className="text-gray-600">Review and adjust settings as needed</div>
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