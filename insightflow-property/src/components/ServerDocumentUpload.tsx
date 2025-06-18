'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Tag } from 'lucide-react';

interface UploadedDocument {
  id: string;
  filename: string;
  size: number;
  documentType?: string;
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

// Document type options
const DOCUMENT_TYPES = [
  { value: '', label: 'Select document type...' },
  { value: 'ta6', label: 'TA6 Property Information Form', description: 'Seller\'s property disclosure' },
  { value: 'survey', label: 'Survey Report', description: 'Building survey or homebuyer report' },
  { value: 'search', label: 'Local Authority Search', description: 'LLC1/CON29 search results' },
  { value: 'title', label: 'Title Register', description: 'Official copy of title deeds' },
  { value: 'epc', label: 'Energy Performance Certificate', description: 'Energy efficiency rating' },
  { value: 'lease', label: 'Lease Agreement', description: 'For leasehold properties' },
  { value: 'management', label: 'Management Information', description: 'Service charges, ground rent' },
  { value: 'planning', label: 'Planning Documents', description: 'Planning permissions, building regs' },
  { value: 'mortgage', label: 'Mortgage Documents', description: 'Loan offers, valuations' },
  { value: 'other', label: 'Other', description: 'Other property-related documents' }
];

interface UploadProgress {
  filename: string;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
}

interface ServerDocumentUploadProps {
  onDocumentsUploaded: (documents: UploadedDocument[]) => void;
  onUploadProgress?: (progress: UploadProgress[]) => void;
}

export default function ServerDocumentUpload({ onDocumentsUploaded, onUploadProgress }: ServerDocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);

  const updateUploadProgress = useCallback((filename: string, update: Partial<UploadProgress>) => {
    setUploads(prev => {
      const updated = prev.map(upload => 
        upload.filename === filename ? { ...upload, ...update } : upload
      );
      onUploadProgress?.(updated);
      return updated;
    });
  }, [onUploadProgress]);

  // Auto-suggest document type based on filename
  const suggestDocumentType = (filename: string): string => {
    const lower = filename.toLowerCase();
    if (lower.includes('ta6') || lower.includes('property information')) return 'ta6';
    if (lower.includes('survey') || lower.includes('homebuyer')) return 'survey';
    if (lower.includes('search') || lower.includes('llc1') || lower.includes('con29')) return 'search';
    if (lower.includes('title') || lower.includes('register')) return 'title';
    if (lower.includes('epc') || lower.includes('energy')) return 'epc';
    if (lower.includes('lease')) return 'lease';
    if (lower.includes('planning') || lower.includes('building')) return 'planning';
    if (lower.includes('mortgage') || lower.includes('valuation')) return 'mortgage';
    return '';
  };

  const uploadFile = async (file: File): Promise<UploadedDocument | null> => {
    const filename = file.name;
    
    // Add to upload tracking
    setUploads(prev => [...prev, {
      filename,
      status: 'uploading',
      progress: 0
    }]);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      updateUploadProgress(filename, { status: 'uploading', progress: 30 });

      // Upload to server
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      updateUploadProgress(filename, { status: 'processing', progress: 60 });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Processing failed');
      }

      updateUploadProgress(filename, { status: 'complete', progress: 100 });

      // Add suggested document type
      const documentWithType = {
        ...result.document,
        documentType: suggestDocumentType(filename)
      };

      return documentWithType;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      updateUploadProgress(filename, { 
        status: 'error', 
        progress: 0, 
        error: errorMessage 
      });
      return null;
    }
  };

  const handleDocumentTypeChange = (documentId: string, documentType: string) => {
    setDocuments(prev => {
      const updated = prev.map(doc => 
        doc.id === documentId ? { ...doc, documentType } : doc
      );
      onDocumentsUploaded(updated);
      return updated;
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  }, []);

  const processFiles = async (files: File[]) => {
    const uploadPromises = files.map(uploadFile);
    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter((doc): doc is UploadedDocument => doc !== null);
    
    if (successfulUploads.length > 0) {
      setDocuments(prev => {
        const updated = [...prev, ...successfulUploads];
        onDocumentsUploaded(updated);
        return updated;
      });
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'high': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
    return docType?.label || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Property Documents
        </h3>
        <p className="text-gray-600 mb-4">
          Drag and drop files here, or click to select files
        </p>
        <input
          type="file"
          multiple
          accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.tiff"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 cursor-pointer"
        >
          Select Files
        </label>
        <p className="text-xs text-gray-500 mt-2">
          Supports PDF, DOCX, and image files (max 10MB each)
        </p>
      </div>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Upload Progress</h4>
          {uploads.map((upload) => (
            <div key={upload.filename} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              {getStatusIcon(upload.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{upload.filename}</p>
                <p className="text-xs text-gray-700 font-medium capitalize">{upload.status}</p>
                {upload.error && (
                  <p className="text-xs text-red-600">{upload.error}</p>
                )}
              </div>
              {upload.status === 'uploading' || upload.status === 'processing' ? (
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Documents with Type Selection */}
      {documents.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
          {documents.map((document) => (
            <div key={document.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{document.filename}</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {(document.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getQualityColor(document.quality.quality)}`}>
                  {document.quality.quality} quality
                </span>
              </div>

              {/* Document Type Selection */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <label className="text-sm font-medium text-gray-700">
                    Document Type:
                  </label>
                </div>
                <select
                  value={document.documentType || ''}
                  onChange={(e) => handleDocumentTypeChange(document.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 font-medium bg-white [&>option]:text-gray-900 [&>option]:bg-white [&>option:checked]:bg-teal-50 [&>option:checked]:text-teal-900"
                >
                  {DOCUMENT_TYPES.map((type) => (
                    <option 
                      key={type.value} 
                      value={type.value}
                      className={`${type.value === '' ? 'text-gray-500 italic' : 'text-gray-900 font-medium'}`}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
                {document.documentType && (
                  <p className="text-xs text-gray-700 font-medium">
                    {DOCUMENT_TYPES.find(t => t.value === document.documentType)?.description}
                  </p>
                )}
              </div>

              {/* Quality Issues */}
              {document.quality.issues.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Processing Notes:</p>
                  {document.quality.issues.map((issue, index) => (
                    <p key={index} className="text-xs text-yellow-600">• {issue}</p>
                  ))}
                </div>
              )}

              {/* Recommendations */}
              {document.quality.recommendations.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Recommendations:</p>
                  {document.quality.recommendations.map((rec, index) => (
                    <p key={index} className="text-xs text-blue-600">• {rec}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 