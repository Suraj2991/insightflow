import { PrismaClient } from '@prisma/client';

// Global prisma instance to avoid multiple connections in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Organization context for multi-tenancy
export interface OrgContext {
  organizationId: string;
  userId?: string;
}

// Default demo organization for MVP
export const DEFAULT_ORG: OrgContext = {
  organizationId: "demo-org-001",
  userId: "demo-user-001"
};

// Initialize demo data if not exists
export async function initializeDemoData() {
  try {
    // Check if demo org exists
    const demoOrg = await prisma.organization.findUnique({
      where: { id: DEFAULT_ORG.organizationId }
    });

    if (!demoOrg) {
      // Create demo organization
      await prisma.organization.create({
        data: {
          id: DEFAULT_ORG.organizationId,
          name: "InsightFlow Demo",
          slug: "demo",
          plan: "free"
        }
      });

      // Create demo user
      await prisma.user.create({
        data: {
          id: DEFAULT_ORG.userId!,
          email: "demo@insightflow.com",
          name: "Demo User",
          organizationId: DEFAULT_ORG.organizationId,
          role: "admin",
          passwordHash: "demo-hash" // In real app, this would be bcrypt hashed
        }
      });

      // Create demo workflow
      await prisma.workflow.create({
        data: {
          id: "demo-workflow-001",
          organizationId: DEFAULT_ORG.organizationId,
          name: "Document Review Workflow",
          domain: "general",
          createdById: DEFAULT_ORG.userId
        }
      });

      console.log("✅ Demo data initialized");
    }
  } catch (error) {
    // Silently handle initialization errors - they're usually due to data already existing
    console.log("Note: Demo data initialization skipped (likely already exists)");
  }
}

// Helper functions for org-scoped queries
export const orgQueries = {
  // Get questionnaire for org
  async getQuestionnaire(orgContext: OrgContext, workflowId: string) {
    try {
      const questionnaire = await prisma.questionnaire.findFirst({
        where: {
          organizationId: orgContext.organizationId,
          workflowId: workflowId
        }
      });

      // Parse JSON config if questionnaire exists
      if (questionnaire) {
        return {
          ...questionnaire,
          config: JSON.parse(questionnaire.config)
        };
      }
      
      return questionnaire;
    } catch (error) {
      console.log("Error fetching questionnaire (likely database not initialized):", error);
      return null;
    }
  },

  // Save questionnaire for org
  async saveQuestionnaire(orgContext: OrgContext, workflowId: string, data: any) {
    // Ensure demo data exists before saving
    await initializeDemoData();
    
    return await prisma.questionnaire.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: orgContext.organizationId,
          workflowId: workflowId
        }
      },
      update: {
        title: data.title,
        description: data.description,
        config: JSON.stringify(data.config), // Convert to JSON string
        isActive: data.isActive
      },
      create: {
        organizationId: orgContext.organizationId,
        workflowId: workflowId,
        title: data.title,
        description: data.description,
        config: JSON.stringify(data.config), // Convert to JSON string
        isActive: data.isActive
      }
    });
  }
};

// Helper function to get default organization
async function getDefaultOrganization() {
  await initializeDemoData();
  return await prisma.organization.findUniqueOrThrow({
    where: { id: DEFAULT_ORG.organizationId }
  });
}

// Questionnaire functions
export async function getQuestionnaire() {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const questionnaire = await prisma.questionnaire.findUnique({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      }
    });

    if (questionnaire) {
      return {
        questionnaire: {
          ...questionnaire,
          config: JSON.parse(questionnaire.config)
        }
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching questionnaire:', error);
    throw error;
  }
}

export async function saveQuestionnaire(title: string, description: string, config: any) {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const questionnaire = await prisma.questionnaire.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      },
      update: {
        title,
        description,
        config: JSON.stringify(config),
        updatedAt: new Date()
      },
      create: {
        organizationId: defaultOrg.id,
        workflowId: 'demo',
        title,
        description,
        config: JSON.stringify(config)
      }
    });

    return questionnaire;
  } catch (error) {
    console.error('Error saving questionnaire:', error);
    throw error;
  }
}

// Document Configuration functions
export async function getDocumentConfig() {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const config = await prisma.documentConfig.findUnique({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      }
    });

    return config;
  } catch (error) {
    console.error('Error fetching document config:', error);
    throw error;
  }
}

export async function saveDocumentConfig(config: string) {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const documentConfig = await prisma.documentConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      },
      update: {
        config,
        updatedAt: new Date()
      },
      create: {
        organizationId: defaultOrg.id,
        workflowId: 'demo',
        config
      }
    });

    return documentConfig;
  } catch (error) {
    console.error('Error saving document config:', error);
    throw error;
  }
}

// LLM Configuration functions
export async function getLlmConfig() {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const config = await prisma.llmConfig.findUnique({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      }
    });

    return config;
  } catch (error) {
    console.error('Error fetching LLM config:', error);
    throw error;
  }
}

export async function saveLlmConfig(config: string) {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const llmConfig = await prisma.llmConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      },
      update: {
        config,
        updatedAt: new Date()
      },
      create: {
        organizationId: defaultOrg.id,
        workflowId: 'demo',
        config
      }
    });

    return llmConfig;
  } catch (error) {
    console.error('Error saving LLM config:', error);
    throw error;
  }
}

// Prompts Configuration functions
export async function getPromptsConfig() {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const config = await prisma.promptConfig.findUnique({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      }
    });

    return config;
  } catch (error) {
    console.error('Error fetching prompts config:', error);
    throw error;
  }
}

export async function savePromptsConfig(config: string) {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const promptConfig = await prisma.promptConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      },
      update: {
        config,
        updatedAt: new Date()
      },
      create: {
        organizationId: defaultOrg.id,
        workflowId: 'demo',
        config
      }
    });

    return promptConfig;
  } catch (error) {
    console.error('Error saving prompts config:', error);
    throw error;
  }
}

// Findings Configuration functions
export async function getFindingsConfig() {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const config = await prisma.findingsConfig.findUnique({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      }
    });

    return config;
  } catch (error) {
    console.error('Error fetching findings config:', error);
    throw error;
  }
}

export async function saveFindingsConfig(config: string) {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const findingsConfig = await prisma.findingsConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      },
      update: {
        config,
        updatedAt: new Date()
      },
      create: {
        organizationId: defaultOrg.id,
        workflowId: 'demo',
        config
      }
    });

    return findingsConfig;
  } catch (error) {
    console.error('Error saving findings config:', error);
    throw error;
  }
}

// Reports Configuration functions (convert from in-memory to database)
export async function getReportConfig() {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const config = await prisma.reportConfig.findUnique({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      }
    });

    return config;
  } catch (error) {
    console.error('Error fetching report config:', error);
    throw error;
  }
}

export async function saveReportConfig(config: string) {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const reportConfig = await prisma.reportConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      },
      update: {
        config,
        updatedAt: new Date()
      },
      create: {
        organizationId: defaultOrg.id,
        workflowId: 'demo',
        config
      }
    });

    return reportConfig;
  } catch (error) {
    console.error('Error saving report config:', error);
    throw error;
  }
}

// QA Configuration functions
export async function getQaConfig() {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const config = await prisma.qaConfig.findUnique({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      }
    });

    return config;
  } catch (error) {
    console.error('Error fetching QA config:', error);
    throw error;
  }
}

export async function saveQaConfig(config: string) {
  try {
    const defaultOrg = await getDefaultOrganization();
    
    const qaConfig = await prisma.qaConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: defaultOrg.id,
          workflowId: 'demo'
        }
      },
      update: {
        config,
        updatedAt: new Date()
      },
      create: {
        organizationId: defaultOrg.id,
        workflowId: 'demo',
        config
      }
    });

    return qaConfig;
  } catch (error) {
    console.error('Error saving QA config:', error);
    throw error;
  }
} 