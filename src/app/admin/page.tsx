'use client';

import React, { useState } from 'react';
import QuestionnaireConfigForm from '../../modules/questionnaire/config-form';

export default function AdminPage() {
  const [activeModule, setActiveModule] = useState('questionnaire');

  // Simulate detected domain (in real app, this would come from the questionnaire)
  const detectedDomain = 'property'; // This would be dynamic based on questionnaire

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

  const currentDomain = domainInfo[detectedDomain as keyof typeof domainInfo];

  const modules = [
    { id: 'questionnaire', name: 'Questionnaire Builder', status: 'completed', icon: '📝' },
    { id: 'documents', name: 'Document Upload', status: 'configured', icon: '📄' },
    { id: 'prompts', name: 'Prompt Manager', status: 'configured', icon: '🎯' },
    { id: 'llm', name: 'LLM Engine', status: 'configured', icon: '🤖' },
    { id: 'findings', name: 'Findings Generator', status: 'pending', icon: '🔍' },
    { id: 'reports', name: 'Report Builder', status: 'pending', icon: '📊' },
    { id: 'qa', name: 'Document Q&A', status: 'pending', icon: '💬' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">InsightFlow Admin</h1>
              <p className="text-gray-600">Configure your document review workflow</p>
            </div>
            <div className={`px-4 py-2 bg-${currentDomain.color}-100 text-${currentDomain.color}-800 rounded-lg`}>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="font-medium">{currentDomain.name}</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">Domain auto-detected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Workflow Modules</h3>
              <p className="text-sm text-gray-600 mt-1">
                Modules auto-configured for {currentDomain.name.toLowerCase()}
              </p>
            </div>
            <div className="p-2">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`w-full p-3 rounded-lg mb-2 text-left transition-colors ${
                    activeModule === module.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-3">{module.icon}</span>
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

          {/* Domain-Aware Configuration Info */}
          <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
            <h4 className="font-semibold text-gray-900 mb-3">🪄 Smart Configuration</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✅</span>
                <div>
                  <div className="font-medium">Domain Detection</div>
                  <div className="text-gray-600">Automatically detected "{detectedDomain}" from questionnaire</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">⚙️</span>
                <div>
                  <div className="font-medium">Auto-Configuration</div>
                  <div className="text-gray-600">All modules configured with domain-specific defaults</div>
                </div>
              </div>
              <div className="flex items-start">
                <span className="text-purple-500 mr-2">🎯</span>
                <div>
                  <div className="font-medium">Smart Prompts</div>
                  <div className="text-gray-600">Expert-level prompts for {currentDomain.name.toLowerCase()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeModule === 'questionnaire' && (
            <div className="bg-white rounded-lg shadow-sm border">
              <QuestionnaireConfigForm />
            </div>
          )}

          {activeModule === 'documents' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Document Upload Configuration</h2>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                    Auto-configured for {currentDomain.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    Document types and requirements automatically set based on your domain
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Required Document Types</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
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
                        These document types are automatically configured based on property review best practices. 
                        You can customize them as needed for your specific workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'prompts' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Prompt Manager</h2>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                    Auto-configured for {currentDomain.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    Expert-level prompts automatically generated for your domain
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">System Prompt</h3>
                  <div className="bg-gray-50 p-4 rounded border text-sm">
                    <p className="text-gray-700 leading-relaxed">
                      You are an expert property advisor and conveyancer with extensive experience in UK property law and transactions. 
                      Your role is to analyze property documents, identify potential risks, and provide clear, actionable advice to property buyers...
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="font-medium mb-3">Analysis Prompt</h3>
                  <div className="bg-gray-50 p-4 rounded border text-sm">
                    <p className="text-gray-700 leading-relaxed">
                      Analyze the uploaded property documents and questionnaire responses to identify: 1) Critical Issues, 
                      2) Significant Concerns, 3) Minor Considerations, 4) Positive Factors...
                    </p>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-green-500 text-lg mr-3">🎯</span>
                    <div>
                      <h4 className="font-medium text-green-900">Domain Expertise Applied</h4>
                      <p className="text-green-800 text-sm mt-1">
                        These prompts are crafted by property experts and automatically include UK property law context, 
                        current market conditions, and professional best practices.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModule === 'llm' && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">LLM Engine Configuration</h2>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-3">
                    Auto-configured for {currentDomain.name}
                  </span>
                  <span className="text-sm text-gray-600">
                    Model parameters optimized for property document analysis
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Model Configuration</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Provider</span>
                        <span className="font-medium">OpenAI</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Model</span>
                        <span className="font-medium">GPT-4</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Temperature</span>
                        <span className="font-medium">0.1 <span className="text-xs text-gray-500">(Conservative)</span></span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Max Tokens</span>
                        <span className="font-medium">2000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-3">Function Calling</h3>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <div className="font-medium text-gray-900 mb-2">property_risk_assessment</div>
                      <ul className="text-gray-600 space-y-1 text-xs">
                        <li>• Risk Level: low, medium, high, critical</li>
                        <li>• Category: legal, structural, financial, environmental</li>
                        <li>• Urgency: immediate, before_exchange, etc.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start">
                  <span className="text-purple-500 text-lg mr-3">🤖</span>
                  <div>
                    <h4 className="font-medium text-purple-900">Optimized for Property Analysis</h4>
                    <p className="text-purple-800 text-sm mt-1">
                      Temperature set to 0.1 for consistent legal advice, GPT-4 for complex document understanding, 
                      and specialized function calling for structured property risk assessment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {['findings', 'reports', 'qa'].includes(activeModule) && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🚧</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600 mb-4">
                  This module will be auto-configured based on your {currentDomain.name.toLowerCase()} domain
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-blue-800 text-sm">
                    ✨ Will automatically include domain-specific templates, analysis frameworks, and Q&A contexts
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 