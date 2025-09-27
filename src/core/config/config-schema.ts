// JSON Schema for baseline.config.json validation
export const baselineConfigSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Greenlight Configuration",
  description: "Configuration file for Greenlight compatibility checker",
  type: "object",
  properties: {
    $schema: {
      type: "string",
      description: "JSON Schema reference"
    },
    baseline: {
      type: "object",
      description: "Baseline target configuration",
      properties: {
        target: {
          type: "string",
          enum: ["2024", "2025", "custom"],
          description: "Baseline target year or custom browserslist",
          default: "2024"
        },
        browserslist: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Custom browserslist queries (only used when target is 'custom')",
          examples: [
            ["> 1%", "last 2 versions"],
            ["chrome >= 90", "firefox >= 88", "safari >= 14"]
          ]
        }
      },
      required: ["target"],
      additionalProperties: false
    },
    severity: {
      type: "object",
      description: "Severity configuration for compatibility issues",
      properties: {
        default: {
          type: "string",
          enum: ["error", "warning", "info"],
          description: "Default severity level for all features",
          default: "warning"
        },
        features: {
          type: "object",
          description: "Feature-specific severity overrides",
          patternProperties: {
            ".*": {
              type: "string",
              enum: ["error", "warning", "info", "ignore"]
            }
          },
          additionalProperties: false,
          examples: [
            {
              "css-has-selector": "warning",
              "clipboard-api": "error",
              "optional-chaining": "ignore"
            }
          ]
        }
      },
      required: ["default"],
      additionalProperties: false
    },
    include: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Glob patterns for files to include",
      examples: [
        ["src/**/*.{js,ts,jsx,tsx}", "**/*.css"]
      ]
    },
    exclude: {
      type: "array",
      items: {
        type: "string"
      },
      description: "Glob patterns for files to exclude",
      default: [
        "**/node_modules/**",
        "**/dist/**", 
        "**/build/**",
        "**/.git/**"
      ],
      examples: [
        ["**/node_modules/**", "**/dist/**", "**/test/**"]
      ]
    },
    rules: {
      type: "object",
      description: "Feature-specific rule configuration",
      patternProperties: {
        ".*": {
          type: "object",
          properties: {
            severity: {
              type: "string",
              enum: ["error", "warning", "info", "ignore"],
              description: "Severity level for this feature"
            },
            message: {
              type: "string",
              description: "Custom message for this feature"
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false,
      examples: [
        {
          "css-has-selector": {
            "severity": "warning",
            "message": "Consider using a polyfill for :has() selector"
          },
          "clipboard-api": {
            "severity": "error",
            "message": "Clipboard API requires HTTPS and user interaction"
          }
        }
      ]
    }
  },
  required: ["baseline", "severity"],
  additionalProperties: false
};

// Example configuration templates
export const EXAMPLE_CONFIGS = {
  strict: {
    baseline: {
      target: "2024"
    },
    severity: {
      default: "error",
      features: {
        "optional-chaining": "warning",
        "nullish-coalescing": "warning"
      }
    }
  },
  
  modern: {
    baseline: {
      target: "2025"
    },
    severity: {
      default: "warning",
      features: {
        "css-has-selector": "info",
        "intersection-observer": "info"
      }
    }
  },
  
  custom: {
    baseline: {
      target: "custom",
      browserslist: [
        "> 1%",
        "last 2 versions",
        "not dead"
      ]
    },
    severity: {
      default: "warning",
      features: {
        "clipboard-api": "error",
        "file-system-access": "error",
        "view-transitions": "ignore"
      }
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/test/**"
    ]
  }
} as const;