// Core workflow types
export interface Workflow {
  id: string;
  name: string;
  domain: string;
  created_at: Date;
}

// Module 1: Landing Configurator Types
export interface LandingConfig {
  id: string;
  workflow_id: string;
  company_name: string;
  tagline: string | null;
  headline: string;
  description: string | null;
  cta_text: string;
  disclaimer_text: string | null;
  created_at: Date;
}

// Form data for landing configuration
export interface LandingConfigForm {
  company_name: string;
  tagline: string;
  headline: string;
  description: string;
  cta_text: string;
  disclaimer_text: string;
} 