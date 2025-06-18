import { NextRequest, NextResponse } from 'next/server';
import { getPromptsConfig, savePromptsConfig } from '@/lib/db';

// Simple domain-specific prompt templates
const DOMAIN_PROMPT_TEMPLATES = {
  property: {
    systemPrompt: "You are an expert property analyst. Analyze the provided documents and questionnaire responses to identify key findings for property due diligence.",
    analysisPrompt: "Based on the property documents and buyer questionnaire, identify positive aspects, concerns, risks, and red flags. Focus on legal, structural, and financial implications.",
    findingsPrompt: "Extract specific findings from the analysis, categorizing them by type (positive, concern, risk, red_flag) and severity level."
  },
  legal: {
    systemPrompt: "You are an expert legal document analyst. Review legal documents and identify compliance issues, risks, and recommendations.",
    analysisPrompt: "Analyze the legal documents and questionnaire responses to identify compliance status, legal risks, and areas requiring attention.",
    findingsPrompt: "Extract legal findings, focusing on compliance violations, contract risks, and regulatory concerns."
  },
  financial: {
    systemPrompt: "You are an expert financial analyst. Review financial documents and identify key financial health indicators and risks.",
    analysisPrompt: "Analyze financial statements and documents to assess financial health, identify risks, and provide investment insights.",
    findingsPrompt: "Extract financial findings including performance indicators, risk factors, and areas of concern."
  },
  technical: {
    systemPrompt: "You are an expert technical analyst. Review technical documents and identify compliance, performance, and risk factors.",
    analysisPrompt: "Analyze technical documentation to assess standards compliance, performance characteristics, and technical risks.",
    findingsPrompt: "Extract technical findings including compliance status, performance metrics, and technical risks."
  }
};

export async function GET() {
  try {
    const config = await getPromptsConfig();
    
    if (!config) {
      // Default prompts configuration
      const defaultConfig = {
        domain: 'property',
        workflowId: 'demo',
        ...DOMAIN_PROMPT_TEMPLATES.property,
        customInstructions: '',
        temperature: 0.3,
        includeContext: true
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
    console.error('Error fetching prompts config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch prompts configuration' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle domain propagation from questionnaire
    if (body.propagateFromQuestionnaire && body.domain) {
      const domain = body.domain;
      const template = DOMAIN_PROMPT_TEMPLATES[domain as keyof typeof DOMAIN_PROMPT_TEMPLATES] || DOMAIN_PROMPT_TEMPLATES.property;
      
      const propagatedConfig = {
        domain,
        workflowId: 'demo',
        ...template,
        customInstructions: '',
        temperature: 0.3,
        includeContext: true
      };

      await savePromptsConfig(JSON.stringify(propagatedConfig));
      
      return NextResponse.json({ 
        success: true, 
        config: propagatedConfig,
        message: `Prompts configuration auto-updated for ${domain} domain`,
        propagated: true
      });
    }
    
    // Handle regular config updates
    const { config } = body;
    
    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration provided' },
        { status: 400 }
      );
    }

    await savePromptsConfig(JSON.stringify(config));

    return NextResponse.json({ 
      success: true, 
      config,
      message: 'Prompts configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving prompts config:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to save prompts configuration' 
    }, { status: 500 });
  }
} 