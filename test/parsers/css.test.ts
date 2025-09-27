import { describe, it, expect } from 'vitest';
import { parseCSS } from '../../src/core/parsers/css';

describe('CSS Parser', () => {
  describe(':has() Selector Detection', () => {
    it('should detect :has() pseudo-class selector', async () => {
      const css = `
        .card:has(.urgent) {
          border-color: red;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const hasSelector = results.filter(r => r.feature === 'css-has-selector');
      
      expect(hasSelector).toHaveLength(1);
      expect(hasSelector[0].message).toContain(':has()');
    });

    it('should detect complex :has() selectors', async () => {
      const css = `
        .form-group:has(input:invalid) {
          background-color: #ffeaea;
        }
        
        .container:has(> .child:first-child) {
          padding-top: 0;
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const hasSelector = results.filter(r => r.feature === 'css-has-selector');
      
      expect(hasSelector.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Container Queries Detection', () => {
    it('should detect container-type property', async () => {
      const css = `
        .responsive-component {
          container-type: inline-size;
          container-name: component;
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const containerQueries = results.filter(r => r.feature === 'css-container-queries');
      
      expect(containerQueries.length).toBeGreaterThanOrEqual(1);
      expect(containerQueries[0].message).toContain('container');
    });

    it('should detect @container at-rule', async () => {
      const css = `
        @container component (min-width: 300px) {
          .title {
            font-size: 1.5rem;
          }
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const containerQueries = results.filter(r => r.feature === 'css-container-queries');
      
      expect(containerQueries.length).toBeGreaterThanOrEqual(1);
    });

    it('should detect container shorthand property', async () => {
      const css = `
        .container {
          container: sidebar / inline-size;
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const containerQueries = results.filter(r => r.feature === 'css-container-queries');
      
      expect(containerQueries.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('CSS Cascade Layers Detection', () => {
    it('should detect @layer at-rule', async () => {
      const css = `
        @layer base, components, utilities;
        
        @layer base {
          .reset {
            margin: 0;
            padding: 0;
          }
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const cascadeLayers = results.filter(r => r.feature === 'css-cascade-layers');
      
      expect(cascadeLayers.length).toBeGreaterThanOrEqual(1);
      expect(cascadeLayers[0].message).toContain('@layer');
    });
  });

  describe('CSS Subgrid Detection', () => {
    it('should detect subgrid value in grid properties', async () => {
      const css = `
        .subgrid-item {
          display: grid;
          grid-template-columns: subgrid;
          grid-template-rows: subgrid;
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const subgrid = results.filter(r => r.feature === 'css-subgrid');
      
      expect(subgrid.length).toBeGreaterThanOrEqual(1);
      expect(subgrid[0].message).toContain('subgrid');
    });
  });

  describe('CSS color-mix() Function Detection', () => {
    it('should detect color-mix() function', async () => {
      const css = `
        .mixed-colors {
          background-color: color-mix(in srgb, blue 50%, white);
          border-color: color-mix(in srgb, red 25%, transparent);
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const colorMix = results.filter(r => r.feature === 'css-color-mix');
      
      expect(colorMix.length).toBeGreaterThanOrEqual(2);
      expect(colorMix[0].message).toContain('color-mix()');
    });
  });

  describe('CSS Individual Transform Properties Detection', () => {
    it('should detect individual transform properties', async () => {
      const css = `
        .transform-individual {
          translate: 10px 20px;
          rotate: 45deg;
          scale: 1.2;
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const individualTransforms = results.filter(r => r.feature === 'css-individual-transform-properties');
      
      expect(individualTransforms.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('CSS :is() and :where() Detection', () => {
    it('should detect :is() pseudo-class', async () => {
      const css = `
        :is(.button, .link, .tab):hover {
          transform: scale(1.05);
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const isSelector = results.filter(r => r.feature === 'css-is-selector');
      
      expect(isSelector.length).toBeGreaterThanOrEqual(1);
      expect(isSelector[0].message).toContain(':is()');
    });

    it('should detect :where() pseudo-class', async () => {
      const css = `
        :where(.reset-margins) * {
          margin: 0;
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      const whereSelector = results.filter(r => r.feature === 'css-where-selector');
      
      expect(whereSelector.length).toBeGreaterThanOrEqual(1);
      expect(whereSelector[0].message).toContain(':where()');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid CSS gracefully', async () => {
      const css = `
        .invalid {
          color: ;
          background-color
        }
      `;
      
      const results = await parseCSS(css, 'test.css');
      
      // Should not throw, should return results for what it can parse
      expect(Array.isArray(results)).toBe(true);
    });

    it('should handle empty CSS files', async () => {
      const results = await parseCSS('', 'empty.css');
      expect(results).toEqual([]);
    });

    it('should handle CSS with only comments', async () => {
      const css = `
        /* This is just a comment */
        /*
         * Multi-line comment
         * with nothing else
         */
      `;
      
      const results = await parseCSS(css, 'comments.css');
      expect(results).toEqual([]);
    });
  });

  describe('Complex Scenarios', () => {
    it('should detect multiple features in one CSS file', async () => {
      const css = `
        @layer base, components;
        
        @layer base {
          .card:has(.urgent) {
            border-color: red;
          }
        }
        
        .responsive {
          container-type: inline-size;
        }
        
        @container (min-width: 400px) {
          .content {
            display: grid;
            grid-template-columns: subgrid;
          }
        }
        
        .mixed {
          background: color-mix(in srgb, blue, white);
          translate: 10px 20px;
        }
        
        :is(.button, .link):hover {
          scale: 1.1;
        }
      `;
      
      const results = await parseCSS(css, 'complex.css');
      
      // Should detect multiple modern CSS features
      const features = new Set(results.map(r => r.feature));
      expect(features.size).toBeGreaterThanOrEqual(4);
      expect(features.has('css-has-selector')).toBe(true);
      expect(features.has('css-container-queries')).toBe(true);
      expect(features.has('css-cascade-layers')).toBe(true);
    });
  });
});