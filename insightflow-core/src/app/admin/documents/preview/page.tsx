'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeKB: number;
}

interface DocumentConfig {
  title: string;
  description: string;
  documentTypes: DocumentType[];
}

export default function DocumentPreviewPage() {
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<DocumentConfig | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => {
    const configParam = searchParams.get('config');
    if (configParam) {
      try {
        const parsedConfig = JSON.parse(decodeURIComponent(configParam));
        setConfig(parsedConfig);
      } catch (error) {
        console.error('Error parsing config:', error);
        // Fallback to default property config
        setConfig({
          title: 'Property Document Requirements',
          description: 'Required documents for property workflow analysis',
          documentTypes: [
            {
              id: 'purchase_contract',
              name: 'Purchase Contract',
              description: 'Signed agreement to purchase the property',
              required: true,
              acceptedFormats: ['pdf', 'doc', 'docx'],
              maxSizeKB: 5120
            },
            {
              id: 'survey_report',
              name: 'Survey Report',
              description: 'Professional property survey and valuation',
              required: true,
              acceptedFormats: ['pdf'],
              maxSizeKB: 10240
            }
          ]
        });
      }
    }
  }, [searchParams]);

  const handleFileSelect = (docType: DocumentType, file: File) => {
    // Validate file
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !docType.acceptedFormats.includes(fileExtension)) {
      alert(`Please select a valid file format: ${docType.acceptedFormats.join(', ')}`);
      return;
    }

    if (file.size > docType.maxSizeKB * 1024) {
      alert(`File size must be less than ${Math.round(docType.maxSizeKB / 1024)}MB`);
      return;
    }

    // Simulate upload progress
    setUploadProgress(prev => ({ ...prev, [docType.id]: 0 }));
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const current = prev[docType.id] || 0;
        if (current >= 100) {
          clearInterval(interval);
          setUploadedFiles(prevFiles => ({ ...prevFiles, [docType.id]: file }));
          return prev;
        }
        return { ...prev, [docType.id]: current + 10 };
      });
    }, 100);
  };

  const handleDragOver = (e: React.DragEvent, docTypeId: string) => {
    e.preventDefault();
    setDragOver(docTypeId);
  };

  const handleDragLeave = () => {
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, docType: DocumentType) => {
    e.preventDefault();
    setDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(docType, files[0]);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  const requiredDocs = config.documentTypes.filter(doc => doc.required);
  const optionalDocs = config.documentTypes.filter(doc => !doc.required);
  const uploadedCount = Object.keys(uploadedFiles).length;
  const requiredCount = requiredDocs.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">📁 Document Upload Preview</h1>
              <p className="text-sm text-gray-600">This is exactly how users will see the document upload interface</p>
            </div>
            <button
              onClick={() => window.location.href = '/admin/documents'}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Return to Setup
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Indicator */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{config.title}</h2>
            <div className="text-sm text-gray-600">
              {uploadedCount}/{config.documentTypes.length} documents uploaded
            </div>
          </div>
          <p className="text-gray-600 mb-4">{config.description}</p>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(uploadedCount / config.documentTypes.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Required Documents */}
        {requiredDocs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📋 Required Documents ({requiredDocs.filter(doc => uploadedFiles[doc.id]).length}/{requiredDocs.length})
            </h3>
            
            <div className="space-y-4">
              {requiredDocs.map((docType) => (
                <DocumentUploadCard
                  key={docType.id}
                  docType={docType}
                  uploadedFile={uploadedFiles[docType.id]}
                  uploadProgress={uploadProgress[docType.id]}
                  dragOver={dragOver === docType.id}
                  onFileSelect={handleFileSelect}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </div>
        )}

        {/* Optional Documents */}
        {optionalDocs.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              📄 Optional Documents ({optionalDocs.filter(doc => uploadedFiles[doc.id]).length}/{optionalDocs.length})
            </h3>
            
            <div className="space-y-4">
              {optionalDocs.map((docType) => (
                <DocumentUploadCard
                  key={docType.id}
                  docType={docType}
                  uploadedFile={uploadedFiles[docType.id]}
                  uploadProgress={uploadProgress[docType.id]}
                  dragOver={dragOver === docType.id}
                  onFileSelect={handleFileSelect}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                />
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {requiredCount - requiredDocs.filter(doc => uploadedFiles[doc.id]).length > 0 ? (
                <span className="text-amber-600">
                  ⚠️ {requiredCount - requiredDocs.filter(doc => uploadedFiles[doc.id]).length} required documents remaining
                </span>
              ) : (
                <span className="text-green-600">
                  ✅ All required documents uploaded
                </span>
              )}
            </div>
            
            <div className="flex gap-3">
              <button
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setUploadedFiles({});
                  setUploadProgress({});
                }}
              >
                Clear All
              </button>
              
              <button
                disabled={requiredDocs.filter(doc => uploadedFiles[doc.id]).length < requiredCount}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  requiredDocs.filter(doc => uploadedFiles[doc.id]).length >= requiredCount
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue to Analysis →
              </button>
            </div>
          </div>
        </div>

        {/* Preview Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <div className="flex items-start">
            <span className="text-blue-600 text-lg mr-3">👁️</span>
            <div>
              <h4 className="font-medium text-blue-900">Preview Mode</h4>
              <p className="text-blue-800 text-sm mt-1">
                This is exactly how users will see the document upload interface. Files are not actually uploaded in preview mode.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DocumentUploadCardProps {
  docType: DocumentType;
  uploadedFile?: File;
  uploadProgress?: number;
  dragOver: boolean;
  onFileSelect: (docType: DocumentType, file: File) => void;
  onDragOver: (e: React.DragEvent, docTypeId: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, docType: DocumentType) => void;
}

function DocumentUploadCard({ 
  docType, 
  uploadedFile, 
  uploadProgress, 
  dragOver, 
  onFileSelect, 
  onDragOver, 
  onDragLeave, 
  onDrop 
}: DocumentUploadCardProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(docType, file);
    }
  };

  const isUploading = uploadProgress !== undefined && uploadProgress < 100;
  const isUploaded = uploadedFile && !isUploading;

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 transition-all cursor-pointer ${
        dragOver
          ? 'border-blue-500 bg-blue-50'
          : isUploaded
          ? 'border-green-500 bg-green-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onClick={handleClick}
      onDragOver={(e) => onDragOver(e, docType.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, docType)}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={docType.acceptedFormats.map(format => `.${format}`).join(',')}
        onChange={handleFileChange}
      />
      
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="font-medium text-gray-900">{docType.name}</h4>
            {docType.required && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Required</span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2">{docType.description}</p>
          
          <div className="text-xs text-gray-500">
            Accepted formats: {docType.acceptedFormats.map(f => f.toUpperCase()).join(', ')} • 
            Max size: {Math.round(docType.maxSizeKB / 1024)}MB
          </div>

          {isUploading && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {isUploaded && (
            <div className="mt-3 flex items-center text-sm text-green-700">
              <span className="mr-2">✅</span>
              {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)}KB)
            </div>
          )}
        </div>

        <div className="text-2xl text-gray-400 ml-4">
          {isUploaded ? '✅' : isUploading ? '⏳' : '📄'}
        </div>
      </div>

      {!isUploaded && !isUploading && (
        <div className="mt-3 text-center text-sm text-gray-500">
          Click to browse or drag and drop file here
        </div>
      )}
    </div>
  );
}
