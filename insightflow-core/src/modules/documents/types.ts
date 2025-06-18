export interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeKB: number;
}

export interface DocumentConfig {
  id?: string;
  organizationId: string;
  workflowId: string;
  title: string;
  description?: string;
  documentTypes: DocumentType[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UploadedDocument {
  id: string;
  sessionId: string;
  documentTypeId: string;
  filename: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  sizeKB: number;
  extractedText?: string;
  uploadedAt: Date;
}

export interface DocumentUploadSession {
  id: string;
  organizationId: string;
  workflowId: string;
  documents: UploadedDocument[];
  completedAt?: Date;
  createdAt: Date;
}

// Default document types per domain
export const DOMAIN_DOCUMENT_TYPES = {
  property: [
    {
      id: 'purchase_contract',
      name: 'Purchase Contract',
      description: 'Signed agreement to purchase the property',
      required: true,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSizeKB: 5120 // 5MB
    },
    {
      id: 'survey_report',
      name: 'Survey Report',
      description: 'Professional property survey and valuation',
      required: true,
      acceptedFormats: ['pdf'],
      maxSizeKB: 10240 // 10MB
    },
    {
      id: 'property_deeds',
      name: 'Property Deeds/Title',
      description: 'Legal ownership documents',
      required: false,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSizeKB: 2048 // 2MB
    }
  ],
  
  legal: [
    {
      id: 'contract_documents',
      name: 'Contract Documents',
      description: 'Primary contracts and agreements to review',
      required: true,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSizeKB: 5120
    },
    {
      id: 'supporting_docs',
      name: 'Supporting Documents',
      description: 'Related legal documents and correspondence',
      required: false,
      acceptedFormats: ['pdf', 'doc', 'docx', 'txt'],
      maxSizeKB: 10240
    }
  ],
  
  financial: [
    {
      id: 'financial_statements',
      name: 'Financial Statements',
      description: 'P&L, balance sheet, cash flow statements',
      required: true,
      acceptedFormats: ['pdf', 'xlsx', 'xls'],
      maxSizeKB: 5120
    },
    {
      id: 'audit_reports',
      name: 'Audit Reports',
      description: 'Independent audit findings and reports',
      required: false,
      acceptedFormats: ['pdf'],
      maxSizeKB: 10240
    }
  ],
  
  technical: [
    {
      id: 'specifications',
      name: 'Technical Specifications',
      description: 'Detailed technical requirements and specs',
      required: true,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSizeKB: 5120
    },
    {
      id: 'technical_drawings',
      name: 'Technical Drawings',
      description: 'CAD drawings, blueprints, schematics',
      required: false,
      acceptedFormats: ['pdf', 'dwg', 'dxf', 'png', 'jpg'],
      maxSizeKB: 20480 // 20MB for drawings
    }
  ]
};

export const defaultDocumentConfig: Omit<DocumentConfig, 'id' | 'organizationId' | 'workflowId'> = {
  title: 'Document Upload Configuration',
  description: 'Configure required documents for your workflow',
  documentTypes: []
}; 