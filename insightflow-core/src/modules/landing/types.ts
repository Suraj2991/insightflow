import { LandingConfig, LandingConfigForm } from '@/types';

// Re-export core types
export type { LandingConfig, LandingConfigForm };

// Module-specific types
export interface LandingPreview {
  config: LandingConfigForm;
  preview_url?: string;
}

// Default configuration
export const defaultLandingConfig: LandingConfigForm = {
  company_name: 'Your Company',
  tagline: 'Professional document review made simple',
  headline: 'Navigate your document review with confidence',
  description: 'Our platform helps you understand complex documents and prepare better questions for professionals.',
  cta_text: 'Get Started',
  disclaimer_text: 'This tool provides decision support only. All findings require professional verification.'
}; 