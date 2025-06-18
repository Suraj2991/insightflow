import { NextRequest, NextResponse } from 'next/server';
import { orgQueries, DEFAULT_ORG, initializeDemoData } from '@/lib/db';

// GET /api/questionnaire - Get questionnaire for org
export async function GET(request: NextRequest) {
  try {
    // For MVP, we'll use the default demo org
    // In production, this would come from authentication/session
    const orgContext = DEFAULT_ORG;
    const workflowId = "demo-workflow-001";

    // Initialize demo data if needed
    await initializeDemoData();

    const questionnaire = await orgQueries.getQuestionnaire(orgContext, workflowId);
    
    if (!questionnaire) {
      return NextResponse.json({ 
        questionnaire: null,
        message: "No questionnaire found. Create one to get started." 
      });
    }

    return NextResponse.json({ 
      questionnaire,
      organizationId: orgContext.organizationId 
    });
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questionnaire' },
      { status: 500 }
    );
  }
}

// POST /api/questionnaire - Save questionnaire for org
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle auto-generation from domain selection
    if (body.action === 'auto-generate' && body.domain) {
      const { domain, count = 5 } = body;
      
      // Import the domain templates
      const { DOMAIN_TEMPLATES } = await import('@/modules/questionnaire/question-generator');
      
      const domainTemplate = DOMAIN_TEMPLATES[domain];
      if (!domainTemplate) {
        return NextResponse.json(
          { error: 'Invalid domain specified' },
          { status: 400 }
        );
      }
      
      // Create questionnaire config from domain template
      const title = domainTemplate.name;
      const description = domainTemplate.description;
      const config = {
        title,
        description,
        domain,
        questions: domainTemplate.questions.slice(0, count),
        settings: {
          showProgressIndicator: true,
          allowBack: true,
          showQuestionNumbers: true,
          showRequiredIndicator: true
        }
      };
      
      // For MVP, we'll use the default demo org
      const orgContext = DEFAULT_ORG;
      const workflowId = "demo-workflow-001";

      // Initialize demo data if needed
      await initializeDemoData();

      const questionnaire = await orgQueries.saveQuestionnaire(
        orgContext, 
        workflowId, 
        { title, description, config, isActive: true }
      );

      return NextResponse.json({ 
        questionnaire,
        message: `Auto-generated ${domain} questionnaire with ${count} questions`,
        organizationId: orgContext.organizationId,
        domain
      });
    }
    
    // Handle regular questionnaire save
    const { title, description, config, isActive = true } = body;

    // Validate required fields
    if (!title || !config) {
      return NextResponse.json(
        { error: 'Title and config are required' },
        { status: 400 }
      );
    }

    // For MVP, we'll use the default demo org
    // In production, this would come from authentication/session
    const orgContext = DEFAULT_ORG;
    const workflowId = "demo-workflow-001";

    // Initialize demo data if needed
    await initializeDemoData();

    const questionnaire = await orgQueries.saveQuestionnaire(
      orgContext, 
      workflowId, 
      { title, description, config, isActive }
    );

    return NextResponse.json({ 
      questionnaire,
      message: `Questionnaire saved successfully for organization ${orgContext.organizationId}`,
      organizationId: orgContext.organizationId
    });
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    return NextResponse.json(
      { error: 'Failed to save questionnaire' },
      { status: 500 }
    );
  }
} 