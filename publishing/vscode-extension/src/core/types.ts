export interface CompatibilityResult {
  file: string;
  line: number;
  column: number;
  feature: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  baseline: string;
  browserSupport: string[];
  fixes?: CompatibilityFix[];
}

export interface CompatibilityFix {
  type: 'polyfill' | 'alternative' | 'documentation';
  description: string;
  code?: string;
  url?: string;
}


export interface WebFeature {
  id: string;
  name: string;
  description: string;
  baseline: {
    status: 'limited' | 'newly' | 'widely';
    since?: string;
  };
  browser_support: Record<string, string>;
  mdn_url?: string;
}