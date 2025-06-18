import { NextRequest, NextResponse } from 'next/server';
import { getQaConfig, saveQaConfig, getQuestionnaire } from '@/lib/db';

// Domain-specific QA templates
const DOMAIN_QA_TEMPLATES = {
  property: {
    searchSettings: {
      embeddingModel: 'text-embedding-ada-002',
      chunkSize: 1000,
      chunkOverlap: 200,
      maxRetrievedChunks: 5,
      similarityThreshold: 0.7
    },
    responseSettings: {
      maxResponseLength: 500,
      includeSourceCitations: true,
      responseStyle: 'professional',
      confidenceThreshold: 0.6
    },
    suggestedQuestions: [
      "What are the key legal issues identified in the property documents?",
      "What is the financial assessment of this property investment?",
      "Are there any structural or maintenance concerns mentioned?",
      "What are the main risks associated with this property?",
      "What recommendations are provided for this property?"
    ],
    domainKnowledge: {
      expertiseLevel: 'property_analysis',
      contextPrompt: 'You are a property analysis expert. Answer questions based on the property documents with focus on legal, financial, and structural aspects.'
    }
  },
  legal: {
    searchSettings: {
      embeddingModel: 'text-embedding-ada-002',
      chunkSize: 800,
      chunkOverlap: 150,
      maxRetrievedChunks: 6,
      similarityThreshold: 0.75
    },
    responseSettings: {
      maxResponseLength: 600,
      includeSourceCitations: true,
      responseStyle: 'legal',
      confidenceThreshold: 0.7
    },
    suggestedQuestions: [
      "What are the main contractual obligations in this document?",
      "What legal risks have been identified?",
      "Are there any compliance requirements mentioned?",
      "What are the liability provisions in the contract?",
      "What legal recommendations are provided?"
    ],
    domainKnowledge: {
      expertiseLevel: 'legal_analysis',
      contextPrompt: 'You are a legal expert. Provide accurate legal analysis based on the documents, focusing on obligations, risks, and compliance matters.'
    }
  },
  financial: {
    searchSettings: {
      embeddingModel: 'text-embedding-ada-002',
      chunkSize: 1200,
      chunkOverlap: 250,
      maxRetrievedChunks: 4,
      similarityThreshold: 0.7
    },
    responseSettings: {
      maxResponseLength: 450,
      includeSourceCitations: true,
      responseStyle: 'analytical',
      confidenceThreshold: 0.65
    },
    suggestedQuestions: [
      "What are the key financial metrics and ratios?",
      "What financial risks have been identified?",
      "What is the overall financial health assessment?",
      "What are the revenue and profitability trends?",
      "What investment recommendations are provided?"
    ],
    domainKnowledge: {
      expertiseLevel: 'financial_analysis',
      contextPrompt: 'You are a financial analyst. Provide data-driven financial insights based on the documents, focusing on metrics, trends, and investment implications.'
    }
  },
  technical: {
    searchSettings: {
      embeddingModel: 'text-embedding-ada-002',
      chunkSize: 1000,
      chunkOverlap: 200,
      maxRetrievedChunks: 5,
      similarityThreshold: 0.7
    },
    responseSettings: {
      maxResponseLength: 500,
      includeSourceCitations: true,
      responseStyle: 'technical',
      confidenceThreshold: 0.6
    },
    suggestedQuestions: [
      "What are the key technical specifications?",
      "What technical risks or challenges are identified?",
      "Are there any quality or compliance issues?",
      "What technical recommendations are provided?",
      "What are the implementation considerations?"
    ],
    domainKnowledge: {
      expertiseLevel: 'technical_analysis',
      contextPrompt: 'You are a technical expert. Provide detailed technical analysis based on the documents, focusing on specifications, risks, and implementation aspects.'
    }
  }
};

export async function GET() {
  try {
    const config = await getQaConfig();
    
    // If no config exists, create default based on domain
    if (!config) {
      // Detect domain from questionnaire
      let domain = 'property'; // Default fallback
      try {
        const questionnaireData = await getQuestionnaire();
        if (questionnaireData?.questionnaire?.config?.domain) {
          domain = questionnaireData.questionnaire.config.domain;
        }
      } catch (error) {
        console.warn('Could not detect domain from questionnaire, using default:', error);
      }
      
      const template = DOMAIN_QA_TEMPLATES[domain as keyof typeof DOMAIN_QA_TEMPLATES] || DOMAIN_QA_TEMPLATES.property;
      
      const defaultConfig = {
        domain,
        workflowId: 'demo',
        ...template,
        ui: {
          enableSuggestedQuestions: true,
          showSourceCitations: true,
          enableFollowUpQuestions: true,
          maxChatHistory: 20,
          placeholderText: 'Ask a question about the documents...'
        },
        advanced: {
          enableSemanticCaching: true,
          enableQueryExpansion: false,
          enableContextFiltering: true,
          debugMode: false
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
    console.error('Error fetching QA config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch QA configuration' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    await saveQaConfig(JSON.stringify(config));
    
    return NextResponse.json({ 
      success: true, 
      config,
      message: 'QA configuration saved successfully',
      isDefault: false
    });
  } catch (error) {
    console.error('Error saving QA config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save QA configuration' 
    }, { status: 500 });
  }
} 