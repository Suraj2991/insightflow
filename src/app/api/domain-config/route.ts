import { NextResponse } from 'next/server';
import { orgQueries, DEFAULT_ORG } from '../../../lib/db';

export async function GET() {
  try {
    // Use default workflow for demo
    const workflowId = "demo-workflow-001";
    
    // Get domain-aware configuration for all modules
    const domainConfig = await orgQueries.getDomainConfig(DEFAULT_ORG, workflowId);
    
    return NextResponse.json({
      success: true,
      domainConfig,
      message: `Domain-aware configuration loaded for ${domainConfig.domain} domain`
    });
  } catch (error) {
    console.error('Error getting domain config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get domain configuration' },
      { status: 500 }
    );
  }
}

// Example endpoint to get specific module config
export async function POST(request: Request) {
  try {
    const { module } = await request.json();
    const workflowId = "demo-workflow-001";
    
    let config;
    
    switch (module) {
      case 'documents':
        config = await orgQueries.getDocumentConfig(DEFAULT_ORG, workflowId);
        break;
      case 'prompts':
        config = await orgQueries.getPromptConfig(DEFAULT_ORG, workflowId);
        break;
      case 'llm':
        config = await orgQueries.getLLMConfig(DEFAULT_ORG, workflowId);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid module specified' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      module,
      config,
      message: `${module} configuration loaded with domain-aware defaults`
    });
  } catch (error) {
    console.error('Error getting module config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get module configuration' },
      { status: 500 }
    );
  }
} 