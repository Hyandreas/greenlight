import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkCompatibility, checkCompatibilityWithConfig } from '../../src/core/checker';
import { BaselineConfig } from '../../src/core/config/config-loader';
import { CompatibilityResult } from '../../src/core/types';

// Mock the parsers
vi.mock('../../src/core/parsers/javascript', () => ({
  parseJavaScript: vi.fn()
}));

vi.mock('../../src/core/parsers/css', () => ({
  parseCSS: vi.fn()
}));

import { parseJavaScript } from '../../src/core/parsers/javascript';
import { parseCSS } from '../../src/core/parsers/css';

const mockParseJavaScript = vi.mocked(parseJavaScript);
const mockParseCSS = vi.mocked(parseCSS);

describe('Compatibility Checker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkCompatibility with file paths', () => {
    it('should process JavaScript files', async () => {
      const mockResults: CompatibilityResult[] = [
        {
          file: 'test.js',
          line: 1,
          column: 0,
          feature: 'optional-chaining',
          message: 'Optional chaining (?.) requires modern browsers',
          severity: 'warning',
          baseline: 'unknown',
          browserSupport: []
        }
      ];

      mockParseJavaScript.mockResolvedValue(mockResults);

      // Mock fs.readFileSync
      const originalReadFileSync = await import('fs');
      vi.spyOn(originalReadFileSync, 'readFileSync').mockReturnValue('const x = obj?.prop;');

      const results = await checkCompatibility(['test.js']);
      
      expect(mockParseJavaScript).toHaveBeenCalledWith('const x = obj?.prop;', 'test.js');
      expect(results).toEqual(mockResults);
    });

    it('should process CSS files', async () => {
      const mockResults: CompatibilityResult[] = [
        {
          file: 'test.css',
          line: 1,
          column: 0,
          feature: 'css-has-selector',
          message: ':has() selector has limited support',
          severity: 'warning',
          baseline: 'limited',
          browserSupport: ['chrome', 'firefox']
        }
      ];

      mockParseCSS.mockResolvedValue(mockResults);

      // Mock fs.readFileSync
      const originalReadFileSync = await import('fs');
      vi.spyOn(originalReadFileSync, 'readFileSync').mockReturnValue('.card:has(.urgent) { color: red; }');

      const results = await checkCompatibility(['test.css']);
      
      expect(mockParseCSS).toHaveBeenCalledWith('.card:has(.urgent) { color: red; }', 'test.css');
      expect(results).toEqual(mockResults);
    });

    it('should skip unsupported file extensions', async () => {
      // Mock fs.readFileSync
      const originalReadFileSync = await import('fs');
      vi.spyOn(originalReadFileSync, 'readFileSync').mockReturnValue('some content');

      const results = await checkCompatibility(['test.txt', 'README.md']);
      
      expect(mockParseJavaScript).not.toHaveBeenCalled();
      expect(mockParseCSS).not.toHaveBeenCalled();
      expect(results).toEqual([]);
    });
  });

  describe('checkCompatibility with document input', () => {
    it('should process in-memory JavaScript documents', async () => {
      const mockResults: CompatibilityResult[] = [
        {
          file: 'test.js',
          line: 1,
          column: 0,
          feature: 'nullish-coalescing',
          message: 'Nullish coalescing (??) requires modern browsers',
          severity: 'warning',
          baseline: 'unknown',
          browserSupport: []
        }
      ];

      mockParseJavaScript.mockResolvedValue(mockResults);

      const documents = [
        {
          filename: 'test.js',
          content: 'const x = value ?? default;',
          languageId: 'javascript'
        }
      ];

      const results = await checkCompatibility(documents);
      
      expect(mockParseJavaScript).toHaveBeenCalledWith('const x = value ?? default;', 'test.js');
      expect(results).toEqual(mockResults);
    });

    it('should process in-memory CSS documents', async () => {
      const mockResults: CompatibilityResult[] = [
        {
          file: 'styles.css',
          line: 1,
          column: 0,
          feature: 'css-container-queries',
          message: 'Container queries require modern browsers',
          severity: 'warning',
          baseline: 'limited',
          browserSupport: []
        }
      ];

      mockParseCSS.mockResolvedValue(mockResults);

      const documents = [
        {
          filename: 'styles.css',
          content: '@container (min-width: 400px) { .content { display: grid; } }',
          languageId: 'css'
        }
      ];

      const results = await checkCompatibility(documents);
      
      expect(mockParseCSS).toHaveBeenCalledWith(
        '@container (min-width: 400px) { .content { display: grid; } }',
        'styles.css'
      );
      expect(results).toEqual(mockResults);
    });

    it('should handle mixed document types', async () => {
      const jsResults: CompatibilityResult[] = [
        {
          file: 'app.js',
          line: 1,
          column: 0,
          feature: 'optional-chaining',
          message: 'Optional chaining requires modern browsers',
          severity: 'warning',
          baseline: 'unknown',
          browserSupport: []
        }
      ];

      const cssResults: CompatibilityResult[] = [
        {
          file: 'styles.css',
          line: 1,
          column: 0,
          feature: 'css-has-selector',
          message: ':has() selector requires modern browsers',
          severity: 'warning',
          baseline: 'limited',
          browserSupport: []
        }
      ];

      mockParseJavaScript.mockResolvedValue(jsResults);
      mockParseCSS.mockResolvedValue(cssResults);

      const documents = [
        {
          filename: 'app.js',
          content: 'const x = obj?.prop;',
          languageId: 'javascript'
        },
        {
          filename: 'styles.css',
          content: '.card:has(.urgent) { color: red; }',
          languageId: 'css'
        }
      ];

      const results = await checkCompatibility(documents);
      
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(jsResults[0]);
      expect(results[1]).toEqual(cssResults[0]);
    });
  });

  describe('checkCompatibilityWithConfig', () => {
    const baseConfig: BaselineConfig = {
      baseline: {
        target: '2024'
      },
      severity: {
        default: 'warning',
        features: {
          'optional-chaining': 'info',
          'css-has-selector': 'error',
          'nullish-coalescing': 'ignore'
        }
      },
      include: ['**/*.{js,css}'],
      exclude: ['node_modules/**']
    };

    it('should apply configuration to filter ignored features', async () => {
      const mockResults: CompatibilityResult[] = [
        {
          file: 'test.js',
          line: 1,
          column: 0,
          feature: 'optional-chaining',
          message: 'Optional chaining requires modern browsers',
          severity: 'warning',
          baseline: 'unknown',
          browserSupport: []
        },
        {
          file: 'test.js',
          line: 2,
          column: 0,
          feature: 'nullish-coalescing',
          message: 'Nullish coalescing requires modern browsers',
          severity: 'warning',
          baseline: 'unknown',
          browserSupport: []
        }
      ];

      mockParseJavaScript.mockResolvedValue(mockResults);

      const documents = [
        {
          filename: 'test.js',
          content: 'const x = obj?.prop ?? default;',
          languageId: 'javascript'
        }
      ];

      const results = await checkCompatibilityWithConfig(documents, baseConfig);
      
      // Should filter out nullish-coalescing as it's in ignore list
      expect(results).toHaveLength(1);
      expect(results[0].feature).toBe('optional-chaining');
    });

    it('should apply severity overrides', async () => {
      const mockResults: CompatibilityResult[] = [
        {
          file: 'test.css',
          line: 1,
          column: 0,
          feature: 'css-has-selector',
          message: ':has() selector requires modern browsers',
          severity: 'warning',
          baseline: 'limited',
          browserSupport: []
        }
      ];

      mockParseCSS.mockResolvedValue(mockResults);

      const documents = [
        {
          filename: 'test.css',
          content: '.card:has(.urgent) { color: red; }',
          languageId: 'css'
        }
      ];

      const results = await checkCompatibilityWithConfig(documents, baseConfig);
      
      // Should override severity to 'error' based on config
      expect(results).toHaveLength(1);
      expect(results[0].severity).toBe('error');
    });
  });

  describe('Error Handling', () => {
    it('should handle parser errors gracefully', async () => {
      mockParseJavaScript.mockRejectedValue(new Error('Parser error'));

      const documents = [
        {
          filename: 'test.js',
          content: 'invalid syntax',
          languageId: 'javascript'
        }
      ];

      const results = await checkCompatibility(documents);
      
      // Should not throw, should return empty results
      expect(results).toEqual([]);
    });

    it('should handle empty file lists', async () => {
      const results = await checkCompatibility([]);
      expect(results).toEqual([]);
    });

    it('should handle empty document lists', async () => {
      const results = await checkCompatibility([]);
      expect(results).toEqual([]);
    });
  });
});