import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';
import { CompatibilityResult } from '../types';
import { detectCSSFeatures } from '../detectors/css-features';

export async function parseCSS(
  content: string,
  filename: string
): Promise<CompatibilityResult[]> {
  const results: CompatibilityResult[] = [];
  
  // Parse ignore comments to determine which lines to skip
  const ignoredLines = parseIgnoreComments(content);

  try {
    const ast = postcss.parse(content, { from: filename });

    ast.walkAtRules('layer', (atRule) => {
      const line = atRule.source?.start?.line || 0;
      if (!isLineIgnored(line, ignoredLines)) {
        results.push({
          file: filename,
          line,
          column: atRule.source?.start?.column || 0,
          feature: 'css-cascade-layers',
          message: '@layer cascade layers are not widely supported',
          severity: 'warning',
          baseline: 'limited',
          browserSupport: ['chrome', 'firefox', 'safari']
        });
      }
    });

    ast.walkAtRules('container', (atRule) => {
      const line = atRule.source?.start?.line || 0;
      if (!isLineIgnored(line, ignoredLines)) {
        results.push({
          file: filename,
          line,
          column: atRule.source?.start?.column || 0,
          feature: 'css-container-queries',
          message: '@container queries are not widely supported',
          severity: 'warning',
          baseline: 'limited',
          browserSupport: ['chrome', 'firefox']
        });
      }
    });

    ast.walkRules((rule) => {
      try {
        if (rule.selector.includes(':has(')) {
          const line = rule.source?.start?.line || 0;
          if (!isLineIgnored(line, ignoredLines)) {
            results.push({
              file: filename,
              line,
              column: rule.source?.start?.column || 0,
              feature: 'css-has-selector',
              message: ':has() selector is not widely supported',
              severity: 'warning',
              baseline: 'limited',
              browserSupport: ['chrome', 'firefox', 'safari']
            });
          }
        }

        if (rule.selector.includes(':is(')) {
          const line = rule.source?.start?.line || 0;
          if (!isLineIgnored(line, ignoredLines)) {
            results.push({
              file: filename,
              line,
              column: rule.source?.start?.column || 0,
              feature: 'css-is-selector',
              message: ':is() selector is not widely supported',
              severity: 'warning',
              baseline: 'limited',
              browserSupport: ['chrome', 'firefox', 'safari']
            });
          }
        }

        if (rule.selector.includes(':where(')) {
          const line = rule.source?.start?.line || 0;
          if (!isLineIgnored(line, ignoredLines)) {
            results.push({
              file: filename,
              line,
              column: rule.source?.start?.column || 0,
              feature: 'css-where-selector',
              message: ':where() selector is not widely supported',
              severity: 'warning',
              baseline: 'limited',
              browserSupport: ['chrome', 'firefox', 'safari']
            });
          }
        }
      } catch (error) {
        console.warn(`Failed to parse selector: ${rule.selector}`);
      }
    });

    ast.walkDecls((decl) => {
      const line = decl.source?.start?.line || 0;
      if (isLineIgnored(line, ignoredLines)) return;

      if (['container-type', 'container-name', 'container'].includes(decl.prop)) {
        results.push({
          file: filename,
          line,
          column: decl.source?.start?.column || 0,
          feature: 'css-container-queries',
          message: `Container query property '${decl.prop}' is not widely supported`,
          severity: 'warning',
          baseline: 'limited',
          browserSupport: ['chrome', 'firefox']
        });
      }

      if (['translate', 'rotate', 'scale'].includes(decl.prop)) {
        results.push({
          file: filename,
          line,
          column: decl.source?.start?.column || 0,
          feature: 'css-individual-transform-properties',
          message: `Individual transform property '${decl.prop}' is not widely supported`,
          severity: 'warning',
          baseline: 'limited',
          browserSupport: ['chrome', 'firefox', 'safari']
        });
      }

      if (decl.value.includes('subgrid')) {
        results.push({
          file: filename,
          line,
          column: decl.source?.start?.column || 0,
          feature: 'css-subgrid',
          message: 'subgrid is not widely supported',
          severity: 'warning',
          baseline: 'limited',
          browserSupport: ['firefox']
        });
      }

      if (decl.value.includes('color-mix(')) {
        results.push({
          file: filename,
          line,
          column: decl.source?.start?.column || 0,
          feature: 'css-color-mix',
          message: 'color-mix() function is not widely supported',
          severity: 'warning',
          baseline: 'limited',
          browserSupport: ['chrome', 'firefox', 'safari']
        });
      }

      const feature = detectCSSFeatures(`property:${decl.prop}`) || 
                    detectCSSFeatures(`value:${decl.value}`);
      
      if (feature && !feature.baseline.status.includes('widely')) {
        results.push({
          file: filename,
          line,
          column: decl.source?.start?.column || 0,
          feature: feature.id,
          message: `${decl.prop}: ${decl.value} is not widely supported`,
          severity: 'warning',
          baseline: feature.baseline.status,
          browserSupport: Object.keys(feature.browser_support),
          fixes: feature.mdn_url ? [{
            type: 'documentation',
            description: 'Learn more on MDN',
            url: feature.mdn_url
          }] : undefined
        });
      }
    });
  } catch (error) {
    console.warn(`Failed to parse CSS in ${filename}:`, error);
  }

  return results;
}

function parseIgnoreComments(content: string): Set<number> {
  const ignoredLines = new Set<number>();
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1; // 1-based line numbers
    
    if (line.includes('/* baseline-buddy-ignore */')) {
      ignoredLines.add(lineNumber);
      
      // If ignore comment is on its own line, ignore the next line
      if (line.trim() === '/* baseline-buddy-ignore */' && i + 1 < lines.length) {
        ignoredLines.add(lineNumber + 1);
      }
    }
  }
  
  return ignoredLines;
}

function isLineIgnored(line: number, ignoredLines: Set<number>): boolean {
  return ignoredLines.has(line) || ignoredLines.has(line - 1);
}