import { describe, it, expect } from 'vitest';
import { parseJavaScript } from '../../src/core/parsers/javascript';

describe('JavaScript Parser', () => {
  describe('Optional Chaining Detection', () => {
    it('should detect optional chaining in property access', async () => {
      const code = `
        const user = { profile: { name: 'John' } };
        const name = user?.profile?.name;
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const optionalChaining = results.filter(r => r.feature === 'optional-chaining');
      
      expect(optionalChaining).toHaveLength(1);
      expect(optionalChaining[0].line).toBe(3);
      expect(optionalChaining[0].message).toContain('Optional chaining');
    });

    it('should detect optional chaining in method calls', async () => {
      const code = `
        const api = { getData: () => Promise.resolve() };
        api?.getData?.();
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const optionalChaining = results.filter(r => r.feature === 'optional-chaining');
      
      expect(optionalChaining).toHaveLength(1);
      expect(optionalChaining[0].line).toBe(3);
    });

    it('should detect optional chaining in array access', async () => {
      const code = `
        const items = [{ value: 1 }];
        const value = items?.[0]?.value;
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const optionalChaining = results.filter(r => r.feature === 'optional-chaining');
      
      expect(optionalChaining).toHaveLength(1);
    });
  });

  describe('Nullish Coalescing Detection', () => {
    it('should detect nullish coalescing operator', async () => {
      const code = `
        const config = { timeout: 0 };
        const timeout = config.timeout ?? 5000;
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const nullishCoalescing = results.filter(r => r.feature === 'nullish-coalescing');
      
      expect(nullishCoalescing).toHaveLength(1);
      expect(nullishCoalescing[0].line).toBe(3);
      expect(nullishCoalescing[0].message).toContain('Nullish coalescing');
    });

    it('should not confuse with logical OR', async () => {
      const code = `
        const value = false || 'default';
        const value2 = null ?? 'default';
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const nullishCoalescing = results.filter(r => r.feature === 'nullish-coalescing');
      
      expect(nullishCoalescing).toHaveLength(1);
      expect(nullishCoalescing[0].line).toBe(3);
    });
  });

  describe('Private Class Fields Detection', () => {
    it('should detect private field declarations', async () => {
      const code = `
        class DataManager {
          #privateField = 'secret';
          #anotherPrivate;
          
          constructor() {
            this.#anotherPrivate = 'value';
          }
        }
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const privateFields = results.filter(r => r.feature === 'private-class-fields');
      
      expect(privateFields.length).toBeGreaterThanOrEqual(2);
      expect(privateFields[0].message).toContain('Private class field');
    });

    it('should detect private method declarations', async () => {
      const code = `
        class Calculator {
          #computeInternal() {
            return 42;
          }
          
          public calculate() {
            return this.#computeInternal();
          }
        }
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const privateFields = results.filter(r => r.feature === 'private-class-fields');
      
      expect(privateFields.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Top-Level Await Detection', () => {
    it('should detect top-level await', async () => {
      const code = `
        const config = await fetch('/config.json');
        const data = await config.json();
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const topLevelAwait = results.filter(r => r.feature === 'top-level-await');
      
      expect(topLevelAwait.length).toBeGreaterThanOrEqual(1);
      expect(topLevelAwait[0].message).toContain('Top-level await');
    });

    it('should not detect await inside functions', async () => {
      const code = `
        async function fetchData() {
          const response = await fetch('/api');
          return response.json();
        }
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const topLevelAwait = results.filter(r => r.feature === 'top-level-await');
      
      expect(topLevelAwait).toHaveLength(0);
    });
  });

  describe('Array.at() Detection', () => {
    it('should detect Array.at() method calls', async () => {
      const code = `
        const items = [1, 2, 3, 4, 5];
        const last = items.at(-1);
        const second = items.at(1);
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const arrayAt = results.filter(r => r.feature === 'array-at');
      
      expect(arrayAt.length).toBeGreaterThanOrEqual(2);
      expect(arrayAt[0].message).toContain('Array.at()');
    });

    it('should detect at() on other array-like objects', async () => {
      const code = `
        const nodeList = document.querySelectorAll('.item');
        const firstNode = nodeList.at(0);
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      const arrayAt = results.filter(r => r.feature === 'array-at');
      
      expect(arrayAt.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle syntax errors gracefully', async () => {
      const code = `
        const invalid = {
          missing: quote"
        };
      `;
      
      const results = await parseJavaScript(code, 'test.js');
      
      // Should not throw, should return empty results
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty files', async () => {
      const results = await parseJavaScript('', 'empty.js');
      expect(results).toEqual([]);
    });

    it('should handle comments only', async () => {
      const code = `
        // This is just a comment
        /* Multi-line comment
           with nothing else */
      `;
      
      const results = await parseJavaScript(code, 'comments.js');
      expect(results).toEqual([]);
    });
  });

  describe('Complex Scenarios', () => {
    it('should detect multiple features in one file', async () => {
      const code = `
        class DataManager {
          #apiKey = 'secret';
          
          async fetchData(id) {
            const response = await fetch(\`/api/\${id}\`);
            const data = await response.json();
            return data?.results ?? [];
          }
          
          getLastItem(items) {
            return items.at(-1);
          }
        }
        
        const config = await fetch('/config.json');
      `;
      
      const results = await parseJavaScript(code, 'complex.js');
      
      // Should detect private fields, optional chaining, nullish coalescing, array.at, top-level await
      const features = new Set(results.map(r => r.feature));
      expect(features.size).toBeGreaterThanOrEqual(3);
      expect(features.has('private-class-fields')).toBe(true);
      expect(features.has('top-level-await')).toBe(true);
    });
  });
});