import { PrismaClient } from '@prisma/client';
import { detectDomainFromQuestionnaire, DomainType, generateDomainModuleConfigs } from './domain-config';

// ... existing code ...

// Helper functions for org-scoped queries
export const orgQueries = {
  // Get questionnaire for org
  async getQuestionnaire(orgContext: OrgContext, workflowId: string) {
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
  },

  // Save questionnaire for org
  async saveQuestionnaire(orgContext: OrgContext, workflowId: string, data: any) {
    const questionnaire = await prisma.questionnaire.upsert({
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

    // Update workflow domain based on questionnaire
    await this.updateWorkflowDomain(orgContext, workflowId, data.config);
    
    return questionnaire;
  },

  // Update workflow domain based on questionnaire content
  async updateWorkflowDomain(orgContext: OrgContext, workflowId: string, questionnaireConfig: any) {
    const detectedDomain = detectDomainFromQuestionnaire(questionnaireConfig);
    
    if (detectedDomain) {
      await prisma.workflow.update({
        where: {
          id: workflowId,
          organizationId: orgContext.organizationId
        },
        data: {
          domain: detectedDomain
        }
      });
    }
  },

  // Get domain-aware configuration for all modules
  async getDomainConfig(orgContext: OrgContext, workflowId: string) {
    // Get workflow to check stored domain
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        organizationId: orgContext.organizationId
      }
    });

    // Get questionnaire to detect domain if workflow doesn't have it
    const questionnaire = await this.getQuestionnaire(orgContext, workflowId);
    
    let domain: DomainType = 'property'; // Default
    
    if (workflow?.domain) {
      domain = workflow.domain as DomainType;
    } else if (questionnaire?.config) {
      const detectedDomain = detectDomainFromQuestionnaire(questionnaire.config);
      if (detectedDomain) {
        domain = detectedDomain;
        // Update workflow with detected domain
        await this.updateWorkflowDomain(orgContext, workflowId, questionnaire.config);
      }
    }

    return {
      domain,
      organizationId: orgContext.organizationId,
      workflowId,
      moduleConfigs: generateDomainModuleConfigs(domain)
    };
  },

  // Get or create domain-aware document config
  async getDocumentConfig(orgContext: OrgContext, workflowId: string) {
    const domainConfig = await this.getDomainConfig(orgContext, workflowId);
    
    // Check if custom config exists
    const existingConfig = await prisma.documentConfig.findFirst({
      where: {
        organizationId: orgContext.organizationId,
        workflowId: workflowId
      }
    });

    if (existingConfig) {
      return {
        ...existingConfig,
        requiredTypes: JSON.parse(existingConfig.requiredTypes)
      };
    }

    // Return domain-based default config
    return {
      organizationId: orgContext.organizationId,
      workflowId: workflowId,
      ...domainConfig.moduleConfigs.documents
    };
  },

  // Save document config
  async saveDocumentConfig(orgContext: OrgContext, workflowId: string, config: any) {
    return await prisma.documentConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: orgContext.organizationId,
          workflowId: workflowId
        }
      },
      update: {
        requiredTypes: JSON.stringify(config.requiredTypes)
      },
      create: {
        organizationId: orgContext.organizationId,
        workflowId: workflowId,
        requiredTypes: JSON.stringify(config.requiredTypes)
      }
    });
  },

  // Get or create domain-aware prompt config
  async getPromptConfig(orgContext: OrgContext, workflowId: string) {
    const domainConfig = await this.getDomainConfig(orgContext, workflowId);
    
    const existingConfig = await prisma.promptConfig.findFirst({
      where: {
        organizationId: orgContext.organizationId,
        workflowId: workflowId
      }
    });

    if (existingConfig) {
      return {
        ...existingConfig,
        prompts: JSON.parse(existingConfig.prompts)
      };
    }

    // Return domain-based default prompts
    return {
      organizationId: orgContext.organizationId,
      workflowId: workflowId,
      prompts: {
        systemPrompt: domainConfig.moduleConfigs.prompts.systemPrompt,
        analysisPrompt: domainConfig.moduleConfigs.prompts.analysisPrompt,
        summaryPrompt: domainConfig.moduleConfigs.prompts.summaryPrompt
      }
    };
  },

  // Save prompt config
  async savePromptConfig(orgContext: OrgContext, workflowId: string, prompts: any) {
    return await prisma.promptConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: orgContext.organizationId,
          workflowId: workflowId
        }
      },
      update: {
        prompts: JSON.stringify(prompts)
      },
      create: {
        organizationId: orgContext.organizationId,
        workflowId: workflowId,
        prompts: JSON.stringify(prompts)
      }
    });
  },

  // Get or create domain-aware LLM config
  async getLLMConfig(orgContext: OrgContext, workflowId: string) {
    const domainConfig = await this.getDomainConfig(orgContext, workflowId);
    
    const existingConfig = await prisma.lLMConfig.findFirst({
      where: {
        organizationId: orgContext.organizationId,
        workflowId: workflowId
      }
    });

    if (existingConfig) {
      return existingConfig;
    }

    // Return domain-based default LLM config
    return {
      organizationId: orgContext.organizationId,
      workflowId: workflowId,
      ...domainConfig.moduleConfigs.llm
    };
  },

  // Save LLM config
  async saveLLMConfig(orgContext: OrgContext, workflowId: string, config: any) {
    return await prisma.lLMConfig.upsert({
      where: {
        organizationId_workflowId: {
          organizationId: orgContext.organizationId,
          workflowId: workflowId
        }
      },
      update: {
        provider: config.provider,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens
      },
      create: {
        organizationId: orgContext.organizationId,
        workflowId: workflowId,
        provider: config.provider,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens
      }
    });
  }
};