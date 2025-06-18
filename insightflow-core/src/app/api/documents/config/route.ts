import { NextRequest, NextResponse } from 'next/server';
import { getDocumentConfig, saveDocumentConfig } from '@/lib/db';

// Domain-specific document templates
const DOMAIN_DOCUMENT_TEMPLATES = {
  property: {
    required: [
      { type: 'Property Deed', description: 'Legal ownership document', formats: ['pdf'], maxSize: '10MB' },
      { type: 'Property Survey', description: 'Land boundaries and measurements', formats: ['pdf'], maxSize: '10MB' },
      { type: 'Property Photos', description: 'Current condition photos', formats: ['pdf', 'jpg', 'png'], maxSize: '20MB' }
    ],
    optional: [
      { type: 'Insurance Documents', description: 'Current property insurance', formats: ['pdf'], maxSize: '5MB' },
      { type: 'Tax Records', description: 'Property tax history', formats: ['pdf'], maxSize: '5MB' },
      { type: 'Inspection Reports', description: 'Professional inspection reports', formats: ['pdf'], maxSize: '10MB' }
    ]
  },
  legal: {
    required: [
      { type: 'Contract Document', description: 'Main legal contract', formats: ['pdf'], maxSize: '10MB' },
      { type: 'Supporting Evidence', description: 'Supporting documentation', formats: ['pdf'], maxSize: '10MB' }
    ],
    optional: [
      { type: 'Correspondence', description: 'Email and letter correspondence', formats: ['pdf'], maxSize: '5MB' },
      { type: 'Financial Records', description: 'Relevant financial documents', formats: ['pdf'], maxSize: '5MB' }
    ]
  },
  financial: {
    required: [
      { type: 'Financial Statements', description: 'Balance sheet and income statement', formats: ['pdf'], maxSize: '10MB' },
      { type: 'Bank Statements', description: 'Recent bank statements', formats: ['pdf'], maxSize: '10MB' }
    ],
    optional: [
      { type: 'Tax Returns', description: 'Previous year tax returns', formats: ['pdf'], maxSize: '10MB' },
      { type: 'Audit Reports', description: 'Independent audit reports', formats: ['pdf'], maxSize: '10MB' }
    ]
  },
  technical: {
    required: [
      { type: 'Technical Specifications', description: 'System or product specifications', formats: ['pdf'], maxSize: '10MB' },
      { type: 'Design Documents', description: 'Technical design and architecture', formats: ['pdf'], maxSize: '10MB' }
    ],
    optional: [
      { type: 'Test Results', description: 'Quality assurance test results', formats: ['pdf'], maxSize: '10MB' },
      { type: 'User Manuals', description: 'Operation and maintenance manuals', formats: ['pdf'], maxSize: '10MB' }
    ]
  }
};

export async function GET() {
  try {
    const config = await getDocumentConfig();
    
    // If no config exists, create default based on domain
    if (!config) {
      const domain = 'property'; // Default domain for now
      const template = DOMAIN_DOCUMENT_TEMPLATES[domain as keyof typeof DOMAIN_DOCUMENT_TEMPLATES] || DOMAIN_DOCUMENT_TEMPLATES.property;
      
      const defaultConfig = {
        domain,
        workflowId: 'demo',
        uploadMode: 'guided', // guided, bulk, or hybrid
        required: template.required,
        optional: template.optional,
        settings: {
          maxFileSize: '10MB',
          allowedFormats: ['pdf', 'jpg', 'png', 'docx'],
          autoExtractText: true,
          requireAllDocuments: false,
          allowMultipleUploads: true
        },
        validation: {
          enableNameValidation: true,
          enableFormatValidation: true,
          enableSizeValidation: true,
          customValidationRules: []
        }
      };

      return NextResponse.json({ 
        success: true, 
        config: defaultConfig,
        isDefault: true
      });
    }

    return NextResponse.json({ 
      success: true, 
      config: JSON.parse(config.config),
      isDefault: false
    });
  } catch (error) {
    console.error('Error fetching document config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch document configuration' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle domain propagation from questionnaire
    if (body.propagateFromQuestionnaire && body.domain) {
      const domain = body.domain;
      const template = DOMAIN_DOCUMENT_TEMPLATES[domain as keyof typeof DOMAIN_DOCUMENT_TEMPLATES] || DOMAIN_DOCUMENT_TEMPLATES.property;
      
      const propagatedConfig = {
        domain,
        workflowId: 'demo',
        uploadMode: 'guided',
        required: template.required,
        optional: template.optional,
        settings: {
          maxFileSize: '10MB',
          allowedFormats: ['pdf', 'jpg', 'png', 'docx'],
          autoExtractText: true,
          requireAllDocuments: false,
          allowMultipleUploads: true
        },
        validation: {
          enableNameValidation: true,
          enableFormatValidation: true,
          enableSizeValidation: true,
          customValidationRules: []
        }
      };

      await saveDocumentConfig(JSON.stringify(propagatedConfig));
      
      return NextResponse.json({ 
        success: true, 
        config: propagatedConfig,
        message: `Document configuration auto-updated for ${domain} domain`,
        propagated: true
      });
    }
    
    // Handle regular config saves
    const { config } = body;
    
    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration provided' },
        { status: 400 }
      );
    }

    await saveDocumentConfig(JSON.stringify(config));

    return NextResponse.json({ 
      success: true, 
      config,
      message: 'Document configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving document config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save document configuration' 
    }, { status: 500 });
  }
} 