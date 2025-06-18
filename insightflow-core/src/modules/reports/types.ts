import { AnalysisResult, Finding, Question } from '../findings/types';

export interface ReportConfig {
  id?: string;
  domain: string;
  workflowId: string;
  template: 'professional' | 'executive' | 'detailed';
  sections: ReportSection[];
  styling: ReportStyling;
  branding: ReportBranding;
  disclaimers: string[];
  exportFormats: Array<'pdf' | 'html' | 'json'>;
  includeExecutiveSummary: boolean;
  includeTabs: Array<'positive' | 'risks' | 'questions' | 'survey'>;
  // New report mode configuration
  reportMode?: 'no_report' | 'full_report';
  noReportMessage?: string;
  allowClientDashboard?: boolean;
  includeQA?: boolean;
}

export interface ReportSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
  content: ReportSectionContent;
}

export interface ReportSectionContent {
  type: 'findings' | 'summary' | 'questions' | 'recommendations' | 'custom';
  title: string;
  description?: string;
  filterByType?: Array<'positive' | 'concern' | 'risk' | 'red_flag'>;
  maxItems?: number;
  sortBy?: 'severity' | 'confidence' | 'type' | 'date';
  customContent?: string;
}

export interface ReportStyling {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: 'inter' | 'roboto' | 'arial';
  fontSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'spacious';
  headerStyle: 'minimal' | 'standard' | 'corporate';
}

export interface ReportBranding {
  companyName: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  showBranding: boolean;
}

export interface GeneratedReport {
  id: string;
  sessionId: string;
  analysisId: string;
  config: ReportConfig;
  data: ReportData;
  generatedAt: Date;
  expiresAt?: Date;
  downloads: number;
  files: ReportFile[];
}

export interface ReportFile {
  format: 'pdf' | 'html' | 'json';
  url: string;
  size: number;
  generatedAt: Date;
}

export interface ReportData {
  analysis: AnalysisResult;
  metadata: {
    generatedAt: Date;
    domain: string;
    totalDocuments: number;
    confidence: number;
    overallRisk: string;
  };
  sections: ProcessedReportSection[];
  tabs: ReportTab[];
}

export interface ProcessedReportSection {
  id: string;
  name: string;
  content: any;
  findings?: Finding[];
  questions?: Question[];
}

export interface ReportTab {
  id: 'positive' | 'risks' | 'questions' | 'survey';
  name: string;
  icon: string;
  count: number;
  color: string;
  content: TabContent;
}

export interface TabContent {
  findings?: Finding[];
  questions?: Question[];
  surveyData?: any;
  summary?: string;
}

// Domain-specific report templates
export const DOMAIN_REPORT_TEMPLATES: Record<string, Partial<ReportConfig>> = {
  property: {
    template: 'professional',
    sections: [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        enabled: true,
        order: 1,
        content: {
          type: 'summary',
          title: 'Executive Summary',
          description: 'Overall assessment and key findings'
        }
      },
      {
        id: 'positive_findings',
        name: 'Positive Aspects',
        enabled: true,
        order: 2,
        content: {
          type: 'findings',
          title: 'Positive Aspects',
          filterByType: ['positive'],
          sortBy: 'confidence'
        }
      },
      {
        id: 'risks_concerns',
        name: 'Risks & Concerns',
        enabled: true,
        order: 3,
        content: {
          type: 'findings',
          title: 'Risks & Concerns',
          filterByType: ['concern', 'risk', 'red_flag'],
          sortBy: 'severity'
        }
      },
      {
        id: 'professional_questions',
        name: 'Professional Questions',
        enabled: true,
        order: 4,
        content: {
          type: 'questions',
          title: 'Questions for Professionals'
        }
      }
    ],
    styling: {
      primaryColor: '#0d9488', // teal
      secondaryColor: '#f0fdfa',
      fontFamily: 'inter',
      fontSize: 'medium',
      spacing: 'normal',
      headerStyle: 'standard'
    },
    disclaimers: [
      'This report is for information purposes only and does not constitute professional advice.',
      'Always consult qualified professionals before making any property decisions.',
      'This analysis is based on documents provided and may not reflect the complete picture.'
    ],
    includeTabs: ['positive', 'risks', 'questions', 'survey']
  },
  legal: {
    template: 'professional',
    sections: [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        enabled: true,
        order: 1,
        content: {
          type: 'summary',
          title: 'Legal Analysis Summary'
        }
      },
      {
        id: 'compliance_findings',
        name: 'Compliance Assessment',
        enabled: true,
        order: 2,
        content: {
          type: 'findings',
          title: 'Compliance Assessment',
          filterByType: ['positive', 'concern'],
          sortBy: 'severity'
        }
      },
      {
        id: 'risk_assessment',
        name: 'Risk Assessment',
        enabled: true,
        order: 3,
        content: {
          type: 'findings',
          title: 'Legal Risks',
          filterByType: ['risk', 'red_flag'],
          sortBy: 'severity'
        }
      }
    ],
    styling: {
      primaryColor: '#1f2937', // dark gray
      secondaryColor: '#f9fafb',
      fontFamily: 'roboto',
      fontSize: 'medium',
      spacing: 'normal',
      headerStyle: 'corporate'
    },
    disclaimers: [
      'This analysis does not constitute legal advice.',
      'Consult qualified legal counsel for specific guidance.',
      'Analysis based on documents provided and current regulations.'
    ],
    includeTabs: ['risks', 'questions']
  },
  financial: {
    template: 'executive',
    sections: [
      {
        id: 'executive_summary',
        name: 'Executive Summary',
        enabled: true,
        order: 1,
        content: {
          type: 'summary',
          title: 'Financial Analysis Executive Summary'
        }
      },
      {
        id: 'financial_health',
        name: 'Financial Health',
        enabled: true,
        order: 2,
        content: {
          type: 'findings',
          title: 'Financial Position',
          filterByType: ['positive', 'concern'],
          sortBy: 'severity'
        }
      },
      {
        id: 'risk_factors',
        name: 'Risk Factors',
        enabled: true,
        order: 3,
        content: {
          type: 'findings',
          title: 'Financial Risks',
          filterByType: ['risk', 'red_flag'],
          sortBy: 'severity'
        }
      }
    ],
    styling: {
      primaryColor: '#059669', // green
      secondaryColor: '#f0fdf4',
      fontFamily: 'inter',
      fontSize: 'medium',
      spacing: 'normal',
      headerStyle: 'corporate'
    },
    disclaimers: [
      'This analysis is for due diligence purposes only.',
      'Consult qualified financial advisors and accountants.',
      'Analysis based on financial documents provided.'
    ],
    includeTabs: ['positive', 'risks', 'questions']
  },
  technical: {
    template: 'detailed',
    sections: [
      {
        id: 'technical_overview',
        name: 'Technical Overview',
        enabled: true,
        order: 1,
        content: {
          type: 'summary',
          title: 'Technical Assessment Summary'
        }
      },
      {
        id: 'compliance_standards',
        name: 'Standards Compliance',
        enabled: true,
        order: 2,
        content: {
          type: 'findings',
          title: 'Standards & Compliance',
          filterByType: ['positive', 'concern'],
          sortBy: 'confidence'
        }
      },
      {
        id: 'technical_risks',
        name: 'Technical Risks',
        enabled: true,
        order: 3,
        content: {
          type: 'findings',
          title: 'Technical Risks',
          filterByType: ['risk', 'red_flag'],
          sortBy: 'severity'
        }
      }
    ],
    styling: {
      primaryColor: '#3b82f6', // blue
      secondaryColor: '#eff6ff',
      fontFamily: 'roboto',
      fontSize: 'medium',
      spacing: 'normal',
      headerStyle: 'standard'
    },
    disclaimers: [
      'Technical assessment based on documentation provided.',
      'Consult qualified technical specialists for implementation.',
      'Standards and compliance requirements may vary by jurisdiction.'
    ],
    includeTabs: ['positive', 'risks', 'questions']
  }
}; 