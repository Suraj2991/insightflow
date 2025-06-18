'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ServerDocumentUpload from '@/components/ServerDocumentUpload';
import AppHeader from '@/components/AppHeader';

interface UploadedDocument {
  id: string;
  filename: string;
  size: number;
  documentType?: string; // Add document type field
  quality: {
    confidence: number;
    quality: 'high' | 'medium' | 'low';
    issues: string[];
    recommendations: string[];
  };
  metadata: {
    isDigital: boolean;
    hasOCR: boolean;
    extractionMethod: string;
    processingTime: number;
  };
}

interface UploadPageState {
  uploadedDocuments: UploadedDocument[];
  errors: string[];
  isComplete: boolean;
}

export default function UploadPage() {
  const router = useRouter();
  const [state, setState] = useState<UploadPageState>({
    uploadedDocuments: [],
    errors: [],
    isComplete: false
  });

  // Auto-complete when we have documents
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isComplete: prev.uploadedDocuments.length > 0
    }));
  }, [state.uploadedDocuments.length]);

  const handleDocumentsUploaded = (documents: UploadedDocument[]) => {
    setState(prev => ({
      ...prev,
      uploadedDocuments: documents,
      errors: []
    }));
  };

  const handleError = (error: string) => {
    setState(prev => ({
      ...prev,
      errors: [...prev.errors, error]
    }));
  };

  const handleContinue = () => {
    // Store documents in session/local storage for next step
    if (typeof window !== 'undefined') {
      localStorage.setItem('uploadedDocuments', JSON.stringify(state.uploadedDocuments));
    }
    
    // Pass document IDs via URL parameters for analysis
    const documentIds = state.uploadedDocuments.map(doc => doc.id).join(',');
    router.push(`/review/analysis?docs=${documentIds}`);
  };

  const handleSkip = () => {
    router.push('/review/analysis');
  };

  const clearError = (index: number) => {
    setState(prev => ({
      ...prev,
      errors: prev.errors.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* App Header */}
      <AppHeader 
        title="Upload Your Property Documents"
        subtitle="Upload your property documents for analysis"
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
                <div className="w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-sm font-medium text-gray-900">Document Upload</span>
              </div>
              
              <div className="w-12 h-px bg-gray-300 mx-4"></div>
              
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gray-300 text-gray-500 rounded-full flex items-center justify-center text-sm">
                  3
                </div>
                <span className="text-sm text-gray-500">Analysis</span>
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Upload Your Property Documents
              </h1>
              <p className="text-lg text-gray-600 mt-2">
                Upload your property documents for analysis. We'll assess their quality and extract key information.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          
          {/* Important notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Document Upload is Optional
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    While uploading documents provides the most comprehensive analysis, you can proceed without them. 
                    Our tool will still provide valuable guidance based on your questionnaire responses.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Global errors */}
          {state.errors.length > 0 && (
            <div className="space-y-2">
              {state.errors.map((error, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 text-sm">{error}</span>
                  </div>
                  <button
                    onClick={() => clearError(index)}
                    className="text-red-400 hover:text-red-600 ml-4"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload component */}
          <ServerDocumentUpload
            onDocumentsUploaded={handleDocumentsUploaded}
          />

          {/* Document Gap Analysis */}
          {state.uploadedDocuments.length > 0 && (
            <DocumentGapAnalysis uploadedDocuments={state.uploadedDocuments} />
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-gray-200">
            <button
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Questionnaire
            </button>

            <div className="flex space-x-4">
              <button
                onClick={handleSkip}
                className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Skip for now
              </button>
              
              <button
                onClick={handleContinue}
                disabled={!state.isComplete}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  state.isComplete
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Analysis →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Component to show document gap analysis
function DocumentGapAnalysis({ uploadedDocuments }: { uploadedDocuments: UploadedDocument[] }) {
  const expectedDocuments = [
    { id: 'ta6', name: 'TA6 Property Information Form', critical: true },
    { id: 'survey', name: 'Survey Report', critical: true },
    { id: 'search', name: 'Local Authority Search', critical: false },
    { id: 'title', name: 'Title Register', critical: false },
    { id: 'epc', name: 'Energy Performance Certificate', critical: false },
    { id: 'lease', name: 'Lease Document (if leasehold)', critical: false },
  ];

  const getDocumentStatus = (expectedDoc: typeof expectedDocuments[0]) => {
    // First check by document type, then fallback to filename matching
    const uploaded = uploadedDocuments.find(doc => 
      doc.documentType === expectedDoc.id ||
      doc.filename.toLowerCase().includes(expectedDoc.id.replace('_', '')) ||
      doc.filename.toLowerCase().includes(expectedDoc.name.toLowerCase().slice(0, 3))
    );

    if (uploaded) {
      return { status: 'uploaded', document: uploaded };
    }
    return { status: 'missing' };
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Document Coverage Analysis
      </h3>
      
      <div className="space-y-3">
        {expectedDocuments.map((doc) => {
          const status = getDocumentStatus(doc);
          
          return (
            <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  status.status === 'uploaded' ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                
                <div>
                  <span className="text-sm font-medium text-gray-900">
                    {doc.name}
                  </span>
                  {doc.critical && (
                    <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded">
                      Important
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-sm">
                {status.status === 'uploaded' ? (
                  <span className="text-green-600 font-medium">✓ Uploaded</span>
                ) : (
                  <span className="text-gray-500">Not uploaded</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Analysis quality improves with more documents. 
          Missing documents will be noted in your report with recommendations for obtaining them.
        </p>
      </div>
    </div>
  );
} 