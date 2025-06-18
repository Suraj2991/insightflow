import { NextRequest, NextResponse } from 'next/server';
import { ReportConfig, DOMAIN_REPORT_TEMPLATES } from '@/modules/reports/types';
import { getReportConfig, saveReportConfig } from '@/lib/db';

export async function GET() {
  try {
    const savedConfig = await getReportConfig();
    
    // If no config exists, create default based on domain (defaulting to expert review mode)
    if (!savedConfig) {
      const domain = 'property'; // Default domain for now
      const domainTemplate = DOMAIN_REPORT_TEMPLATES[domain];
      
      const defaultConfig = {
        domain,
        workflowId: 'demo',
        template: 'professional',
        sections: domainTemplate?.sections || [],
        styling: domainTemplate?.styling || {
          primaryColor: '#0d9488',
          secondaryColor: '#f0fdfa',
          fontFamily: 'inter',
          fontSize: 'medium',
          spacing: 'normal',
          headerStyle: 'standard'
        },
        branding: {
          companyName: '',
          showBranding: false
        },
        disclaimers: domainTemplate?.disclaimers || [],
        exportFormats: ['pdf'],
        includeExecutiveSummary: true,
        includeTabs: domainTemplate?.includeTabs || ['positive', 'risks', 'questions', 'survey'],
        // Default to expert review mode (recommended for white-label)
        reportMode: 'no_report',
        noReportMessage: 'Thank you for uploading your documents. Our experts are reviewing your analysis and will contact you shortly with detailed insights.',
        allowClientDashboard: true,
        includeQA: false
      };

      return NextResponse.json({ 
        success: true, 
        config: defaultConfig,
        isDefault: true
      });
    }

    return NextResponse.json({ 
      success: true, 
      config: JSON.parse(savedConfig.config),
      isDefault: false
    });
  } catch (error) {
    console.error('Error getting reports config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle domain propagation from questionnaire
    if (body.propagateFromQuestionnaire && body.domain) {
      const domain = body.domain;
      const domainTemplate = DOMAIN_REPORT_TEMPLATES[domain];
      
      const propagatedConfig = {
        domain,
        workflowId: 'demo',
        template: 'professional',
        sections: domainTemplate?.sections || [],
        styling: domainTemplate?.styling || {
          primaryColor: '#0d9488',
          secondaryColor: '#f0fdfa',
          fontFamily: 'inter',
          fontSize: 'medium',
          spacing: 'normal',
          headerStyle: 'standard'
        },
        branding: {
          companyName: '',
          showBranding: false
        },
        disclaimers: domainTemplate?.disclaimers || [],
        exportFormats: ['pdf'],
        includeExecutiveSummary: true,
        includeTabs: domainTemplate?.includeTabs || ['positive', 'risks', 'questions', 'survey'],
        // Keep existing report mode preferences
        reportMode: 'no_report',
        noReportMessage: 'Thank you for uploading your documents. Our experts are reviewing your analysis and will contact you shortly with detailed insights.',
        allowClientDashboard: true,
        includeQA: false
      };

      await saveReportConfig(JSON.stringify(propagatedConfig));
      
      return NextResponse.json({ 
        success: true, 
        config: propagatedConfig,
        message: `Report configuration auto-updated for ${domain} domain`,
        propagated: true
      });
    }
    
    // Handle regular config updates
    const { config } = body;

    // Validate config
    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid configuration provided' },
        { status: 400 }
      );
    }

    // Ensure domain is supported
    if (!DOMAIN_REPORT_TEMPLATES[config.domain]) {
      return NextResponse.json(
        { success: false, error: `Unsupported domain: ${config.domain}` },
        { status: 400 }
      );
    }

    // Validate report mode
    if (config.reportMode && !['no_report', 'full_report'].includes(config.reportMode)) {
      return NextResponse.json(
        { success: false, error: `Invalid report mode: ${config.reportMode}` },
        { status: 400 }
      );
    }

    // Store config in database
    const configToSave = {
      domain: config.domain,
      workflowId: config.workflowId || 'demo',
      template: config.template || 'professional',
      sections: Array.isArray(config.sections) ? config.sections : [],
      styling: {
        primaryColor: config.styling?.primaryColor || '#0d9488',
        secondaryColor: config.styling?.secondaryColor || '#f0fdfa',
        fontFamily: config.styling?.fontFamily || 'inter',
        fontSize: config.styling?.fontSize || 'medium',
        spacing: config.styling?.spacing || 'normal',
        headerStyle: config.styling?.headerStyle || 'standard'
      },
      branding: {
        companyName: config.branding?.companyName || '',
        logo: config.branding?.logo,
        address: config.branding?.address,
        phone: config.branding?.phone,
        email: config.branding?.email,
        website: config.branding?.website,
        showBranding: Boolean(config.branding?.showBranding)
      },
      disclaimers: Array.isArray(config.disclaimers) ? config.disclaimers : [],
      exportFormats: Array.isArray(config.exportFormats) ? config.exportFormats : ['pdf'],
      includeExecutiveSummary: Boolean(config.includeExecutiveSummary),
      includeTabs: Array.isArray(config.includeTabs) ? config.includeTabs : ['positive', 'risks', 'questions', 'survey'],
      // Report mode configuration
      reportMode: config.reportMode || 'no_report',
      noReportMessage: config.noReportMessage || 'Thank you for uploading your documents. Our experts are reviewing your analysis and will contact you shortly with detailed insights.',
      allowClientDashboard: Boolean(config.allowClientDashboard !== false), // Default to true
      includeQA: Boolean(config.includeQA)
    };

    await saveReportConfig(JSON.stringify(configToSave));

    return NextResponse.json({ 
      success: true, 
      config: configToSave,
      message: 'Configuration saved successfully',
      isDefault: false
    });
  } catch (error) {
    console.error('Error saving reports config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save configuration' },
      { status: 500 }
    );
  }
} 