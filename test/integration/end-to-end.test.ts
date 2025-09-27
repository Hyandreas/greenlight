import { describe, it, expect } from 'vitest';
import { checkCompatibility } from '../../src/core/checker';
import { ConfigLoader } from '../../src/core/config/config-loader';

describe('End-to-End Integration Tests', () => {
  describe('Real File Processing', () => {
    it('should process sample project files correctly', async () => {
      const documents = [
        {
          filename: 'modern.js',
          content: `
            class DataManager {
              #apiKey = 'secret';
              
              async getData() {
                const response = await fetch('/api');
                const data = await response.json();
                return data?.results ?? [];
              }
              
              getLastItem(items) {
                return items.at(-1);
              }
            }
            
            const config = await fetch('/config.json');
          `,
          languageId: 'javascript'
        },
        {
          filename: 'modern.css',
          content: `
            @layer base, components;
            
            .card:has(.urgent) {
              border-color: red;
            }
            
            .responsive {
              container-type: inline-size;
            }
            
            @container (min-width: 400px) {
              .content {
                grid-template-columns: subgrid;
              }
            }
            
            .mixed {
              background: color-mix(in srgb, blue, white);
              translate: 10px 20px;
            }
          `,
          languageId: 'css'
        }
      ];

      const results = await checkCompatibility(documents);
      
      // Should detect multiple features across both files
      expect(results.length).toBeGreaterThan(0);
      
      const jsFeatures = results.filter(r => r.file === 'modern.js').map(r => r.feature);
      const cssFeatures = results.filter(r => r.file === 'modern.css').map(r => r.feature);
      
      // Verify some expected JavaScript features
      expect(jsFeatures).toContain('private-class-fields');
      expect(jsFeatures).toContain('optional-chaining');
      expect(jsFeatures).toContain('nullish-coalescing');
      expect(jsFeatures).toContain('top-level-await');
      expect(jsFeatures).toContain('array-at');
      
      // Verify some expected CSS features
      expect(cssFeatures).toContain('css-has-selector');
      expect(cssFeatures).toContain('css-container-queries');
      expect(cssFeatures).toContain('css-cascade-layers');
    });

    it('should handle mixed file types with configuration', async () => {
      const configLoader = new ConfigLoader();
      const config = {
        baseline: { target: '2024' as const },
        severity: {
          default: 'warning' as const,
          features: {
            'optional-chaining': 'info' as const,
            'css-has-selector': 'error' as const
          }
        },
        include: ['**/*.{js,css}'],
        exclude: ['node_modules/**'],
        ignore: { features: ['nullish-coalescing'] }
      };

      const documents = [
        {
          filename: 'test.js',
          content: 'const value = obj?.prop ?? "default";',
          languageId: 'javascript'
        },
        {
          filename: 'test.css',
          content: '.card:has(.urgent) { color: red; }',
          languageId: 'css'
        }
      ];

      const results = await checkCompatibility(documents, { 
        workspaceRoot: process.cwd() 
      });
      
      expect(results.length).toBeGreaterThan(0);
      
      // Should include optional chaining and :has() selector
      const features = results.map(r => r.feature);
      expect(features).toContain('optional-chaining');
      expect(features).toContain('css-has-selector');
    });
  });

  describe('Error Handling', () => {
    it('should handle files with mixed valid and invalid syntax', async () => {
      const documents = [
        {
          filename: 'valid.js',
          content: 'const value = obj?.prop;',
          languageId: 'javascript'
        },
        {
          filename: 'invalid.js',
          content: 'const invalid = {missing: quote"',
          languageId: 'javascript'
        },
        {
          filename: 'valid.css',
          content: '.card:has(.urgent) { color: red; }',
          languageId: 'css'
        }
      ];

      const results = await checkCompatibility(documents);
      
      // Should process valid files and skip invalid ones
      expect(results.length).toBeGreaterThan(0);
      
      const validResults = results.filter(r => r.file === 'valid.js' || r.file === 'valid.css');
      expect(validResults.length).toBeGreaterThan(0);
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of documents efficiently', async () => {
      const documents = Array.from({ length: 50 }, (_, i) => ({
        filename: `file${i}.js`,
        content: `
          const data${i} = obj?.prop${i} ?? defaultValue;
          const items${i} = [1, 2, 3];
          const last${i} = items${i}.at(-1);
        `,
        languageId: 'javascript'
      }));

      const startTime = Date.now();
      const results = await checkCompatibility(documents);
      const endTime = Date.now();
      
      // Should complete within reasonable time (5 seconds for 50 files)
      expect(endTime - startTime).toBeLessThan(5000);
      
      // Should detect features in all files
      expect(results.length).toBeGreaterThan(100); // At least 2 features per file
      
      const uniqueFiles = new Set(results.map(r => r.file));
      expect(uniqueFiles.size).toBe(50);
    });
  });
});