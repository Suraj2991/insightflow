import { NextRequest, NextResponse } from 'next/server';
import { getLlmConfig, saveLlmConfig } from '@/lib/db';

// Domain-specific LLM templates
const DOMAIN_LLM_TEMPLATES = {
  property: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 2000,
    systemPrompt: 'You are an expert property analyst with 20+ years of experience in real estate evaluation, risk assessment, and due diligence. Analyze documents with attention to legal compliance, financial viability, and potential risks.',
    analysisPrompts: {
      document_review: 'Analyze this property document for key insights, potential issues, and recommendations.',
      risk_assessment: 'Identify potential risks, legal concerns, and financial considerations.',
      summary_generation: 'Generate a comprehensive summary highlighting the most important findings.'
    }
  },
  legal: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.05,
    maxTokens: 2500,
    systemPrompt: 'You are an expert legal analyst specializing in contract review, compliance analysis, and legal risk assessment. Focus on identifying legal issues, obligations, and potential liabilities.',
    analysisPrompts: {
      document_review: 'Analyze this legal document for contractual obligations, potential issues, and compliance requirements.',
      risk_assessment: 'Identify legal risks, liability concerns, and regulatory compliance issues.',
      summary_generation: 'Generate a legal summary highlighting critical clauses, obligations, and recommendations.'
    }
  },
  financial: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.1,
    maxTokens: 2000,
    systemPrompt: 'You are an expert financial analyst with expertise in financial statement analysis, risk assessment, and investment evaluation. Analyze documents for financial health, risks, and opportunities.',
    analysisPrompts: {
      document_review: 'Analyze this financial document for key metrics, trends, and potential concerns.',
      risk_assessment: 'Identify financial risks, liquidity concerns, and performance indicators.',
      summary_generation: 'Generate a financial summary highlighting key metrics and recommendations.'
    }
  },
  technical: {
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.2,
    maxTokens: 2000,
    systemPrompt: 'You are an expert technical analyst with deep knowledge of system architecture, engineering standards, and technical documentation review.',
    analysisPrompts: {
      document_review: 'Analyze this technical document for compliance, feasibility, and potential technical issues.',
      risk_assessment: 'Identify technical risks, implementation challenges, and quality concerns.',
      summary_generation: 'Generate a technical summary highlighting key specifications and recommendations.'
    }
  }
};

export async function GET() {
  try {
    const config = await getLlmConfig();
    
    // If no config exists, create default based on domain
    if (!config) {
      const domain = 'property'; // Default domain for now
      const template = DOMAIN_LLM_TEMPLATES[domain as keyof typeof DOMAIN_LLM_TEMPLATES] || DOMAIN_LLM_TEMPLATES.property;
      
      const defaultConfig = {
        domain,
        workflowId: 'demo',
        ...template,
        advanced: {
          enableFunctionCalling: true,
          enableMemory: false,
          retryAttempts: 3,
          timeoutSeconds: 30,
          enableLogging: true
        },
        apiSettings: {
          baseUrl: 'https://api.openai.com/v1',
          apiKey: process.env.OPENAI_API_KEY || '',
          organizationId: '',
          enableBatching: false
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
    console.error('Error fetching LLM config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch LLM configuration' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    await saveLlmConfig(JSON.stringify(config));
    
    return NextResponse.json({ 
      success: true, 
      config,
      message: 'LLM configuration saved successfully',
      isDefault: false
    });
  } catch (error) {
    console.error('Error saving LLM config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save LLM configuration' 
    }, { status: 500 });
  }
} 