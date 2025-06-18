'use client';

import React, { useState } from 'react';
import { LandingConfigForm, defaultLandingConfig } from './types';

interface LandingConfigFormProps {
  initialConfig?: LandingConfigForm;
  onSave: (config: LandingConfigForm) => void;
  onPreview: (config: LandingConfigForm) => void;
}

export default function LandingConfigFormComponent({
  initialConfig = defaultLandingConfig,
  onSave,
  onPreview
}: LandingConfigFormProps) {
  const [config, setConfig] = useState<LandingConfigForm>(initialConfig);

  const handleChange = (field: keyof LandingConfigForm, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config);
  };

  const handlePreview = () => {
    onPreview(config);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">Landing Page Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name */}
        <div>
          <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <input
            type="text"
            id="company_name"
            value={config.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Tagline */}
        <div>
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-1">
            Tagline
          </label>
          <input
            type="text"
            id="tagline"
            value={config.tagline}
            onChange={(e) => handleChange('tagline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief description of your service"
          />
        </div>

        {/* Headline */}
        <div>
          <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
            Main Headline *
          </label>
          <input
            type="text"
            id="headline"
            value={config.headline}
            onChange={(e) => handleChange('headline', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={config.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of what your platform does"
          />
        </div>

        {/* CTA Text */}
        <div>
          <label htmlFor="cta_text" className="block text-sm font-medium text-gray-700 mb-1">
            Call-to-Action Button Text *
          </label>
          <input
            type="text"
            id="cta_text"
            value={config.cta_text}
            onChange={(e) => handleChange('cta_text', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Disclaimer */}
        <div>
          <label htmlFor="disclaimer_text" className="block text-sm font-medium text-gray-700 mb-1">
            Disclaimer Text
          </label>
          <textarea
            id="disclaimer_text"
            value={config.disclaimer_text}
            onChange={(e) => handleChange('disclaimer_text', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Legal disclaimer or limitations"
          />
        </div>

        {/* Save Button */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={handlePreview}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
          >
            Preview
          </button>
          <button
            type="submit"
            className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all font-semibold shadow-sm"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
} 