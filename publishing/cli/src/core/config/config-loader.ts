import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import browserslist from 'browserslist';
import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { baselineConfigSchema } from './config-schema';

export interface BaselineConfig {
  // Baseline target configuration
  baseline: {
    target: '2024' | '2025' | 'custom';
    browserslist?: string[];
  };
  
  // Severity configuration
  severity: {
    default: 'error' | 'warning' | 'info';
    features?: Record<string, 'error' | 'warning' | 'info' | 'ignore'>;
  };
  
  // File inclusion/exclusion
  include?: string[];
  exclude?: string[];
  
  // Feature-specific configuration
  rules?: {
    [featureId: string]: {
      severity?: 'error' | 'warning' | 'info' | 'ignore';
      message?: string;
    };
  };
}

const DEFAULT_CONFIG: BaselineConfig = {
  baseline: {
    target: '2024'
  },
  severity: {
    default: 'warning'
  },
  exclude: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**'
  ]
};

export class ConfigLoader {
  private configCache = new Map<string, BaselineConfig>();
  private ajv: Ajv;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(this.ajv);
    this.ajv.addSchema(baselineConfigSchema, 'baseline-config');
  }

  /**
   * Load configuration from baseline.config.json or return defaults
   */
  loadConfig(workspaceRoot?: string, configPath?: string): BaselineConfig {
    const finalConfigPath = configPath || this.findConfigFile(workspaceRoot);
    
    if (!finalConfigPath) {
      return this.mergeWithDefaults({});
    }

    // Check cache first
    const cached = this.configCache.get(finalConfigPath);
    if (cached) {
      return cached;
    }

    try {
      const configContent = readFileSync(finalConfigPath, 'utf-8');
      let userConfig: any;
      
      try {
        userConfig = JSON.parse(configContent);
      } catch (parseError) {
        throw new Error(`Invalid JSON syntax in config file: ${parseError}`);
      }
      
      // Extract config from package.json if needed
      if (finalConfigPath.endsWith('package.json')) {
        userConfig = userConfig.baselineBuddy || {};
      }
      
      // Validate against JSON schema
      this.validateConfigSchema(userConfig, finalConfigPath);
      
      const mergedConfig = this.mergeWithDefaults(userConfig);
      
      // Validate and process browserslist
      if (mergedConfig.baseline.target === 'custom' && mergedConfig.baseline.browserslist) {
        this.validateBrowserslist(mergedConfig.baseline.browserslist);
      }
      
      // Cache the config
      this.configCache.set(finalConfigPath, mergedConfig);
      
      return mergedConfig;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to load config from ${finalConfigPath}: ${error.message}`);
      }
      console.warn(`Failed to load config from ${finalConfigPath}:`, error);
      return this.mergeWithDefaults({});
    }
  }

  /**
   * Get browserslist targets for the current configuration
   */
  getBrowserslistTargets(config: BaselineConfig): string[] {
    if (config.baseline.target === 'custom' && config.baseline.browserslist) {
      return config.baseline.browserslist;
    }

    // Default browserslist for Baseline targets
    switch (config.baseline.target) {
      case '2025':
        return [
          'chrome >= 109',
          'firefox >= 109', 
          'safari >= 16.4',
          'edge >= 109'
        ];
      case '2024':
      default:
        return [
          'chrome >= 105',
          'firefox >= 105',
          'safari >= 15.4', 
          'edge >= 105'
        ];
    }
  }

  /**
   * Check if a feature should be ignored based on config
   */
  shouldIgnoreFeature(featureId: string, config: BaselineConfig): boolean {
    // Check feature-specific rules first
    if (config.rules?.[featureId]?.severity === 'ignore') {
      return true;
    }
    
    // Check feature-specific severity map
    if (config.severity.features?.[featureId] === 'ignore') {
      return true;
    }
    
    return false;
  }

  /**
   * Get severity level for a feature
   */
  getFeatureSeverity(featureId: string, config: BaselineConfig): 'error' | 'warning' | 'info' {
    // Check feature-specific rules first
    const ruleSeverity = config.rules?.[featureId]?.severity;
    if (ruleSeverity && ruleSeverity !== 'ignore') {
      return ruleSeverity;
    }
    
    // Check feature-specific severity map
    const featureSeverity = config.severity.features?.[featureId];
    if (featureSeverity && featureSeverity !== 'ignore') {
      return featureSeverity;
    }
    
    return config.severity.default;
  }

  /**
   * Clear config cache (useful for testing or config file changes)
   */
  clearCache(): void {
    this.configCache.clear();
  }

  private findConfigFile(workspaceRoot?: string): string | null {
    const configFiles = [
      'baseline.config.json',
      '.baseline.json',
      'package.json' // Can embed config in package.json under "baselineBuddy" field
    ];

    const searchPaths = workspaceRoot ? [workspaceRoot] : [process.cwd()];

    for (const searchPath of searchPaths) {
      for (const configFile of configFiles) {
        const fullPath = join(searchPath, configFile);
        if (existsSync(fullPath)) {
          // For package.json, check if it has baselineBuddy config
          if (configFile === 'package.json') {
            try {
              const pkg = JSON.parse(readFileSync(fullPath, 'utf-8'));
              if (pkg.baselineBuddy) {
                return fullPath;
              }
            } catch {
              continue;
            }
          } else {
            return fullPath;
          }
        }
      }
    }

    return null;
  }

  private mergeWithDefaults(userConfig: Partial<BaselineConfig>): BaselineConfig {
    const merged: BaselineConfig = {
      baseline: {
        target: userConfig.baseline?.target || DEFAULT_CONFIG.baseline.target,
        browserslist: userConfig.baseline?.browserslist
      },
      severity: {
        default: userConfig.severity?.default || DEFAULT_CONFIG.severity.default,
        features: userConfig.severity?.features
      },
      include: userConfig.include,
      exclude: userConfig.exclude || DEFAULT_CONFIG.exclude,
      rules: userConfig.rules
    };

    return merged;
  }

  private validateBrowserslist(browsers: string[]): void {
    try {
      browserslist(browsers);
    } catch (error) {
      throw new Error(`Invalid browserslist configuration: ${error}`);
    }
  }

  /**
   * Validate configuration against JSON schema
   */
  private validateConfigSchema(config: any, configPath: string): void {
    const validate = this.ajv.getSchema('baseline-config');
    if (!validate) {
      throw new Error('Schema validation not properly initialized');
    }

    const isValid = validate(config);
    if (!isValid) {
      const errors = validate.errors || [];
      const errorMessages = errors.map((error: ErrorObject) => {
        const path = error.instancePath || 'root';
        const message = error.message || 'unknown error';
        const allowedValues = error.params?.allowedValues 
          ? ` (allowed values: ${error.params.allowedValues.join(', ')})`
          : '';
        return `  - ${path}: ${message}${allowedValues}`;
      });
      
      throw new Error(
        `Configuration validation failed in ${configPath}:\n${errorMessages.join('\n')}`
      );
    }
  }
}