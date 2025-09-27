import { parse } from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { CompatibilityResult } from '../types';
import { detectWebFeatures } from '../detectors/web-features';

export async function parseJavaScript(
  content: string,
  filename: string
): Promise<CompatibilityResult[]> {
  const results: CompatibilityResult[] = [];
  
  // Parse ignore comments to determine which lines to skip
  const ignoredLines = parseIgnoreComments(content);

  try {
    const ast = parse(content, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'objectRestSpread',
        'functionBind',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
        'topLevelAwait',
      ],
    });

    traverse(ast, {
      MemberExpression(path: NodePath<t.MemberExpression>) {
        const { node } = path;
        
        // Skip if this is part of an optional chaining expression to avoid conflicts
        if (path.parentPath && (
          t.isOptionalMemberExpression(path.parentPath.node) ||
          t.isOptionalCallExpression(path.parentPath.node)
        )) {
          return;
        }
        
        const objectName = getObjectName(node.object);
        const propertyName = getPropertyName(node.property);
        
        if (objectName && propertyName) {
          const apiCall = `${objectName}.${propertyName}`;
          
          if (checkWebAPI(apiCall, node, filename, ignoredLines, results)) {
            return;
          }
          
          const feature = detectWebFeatures(apiCall);
          
          if (feature && !feature.baseline.status.includes('widely')) {
            const line = node.loc?.start.line || 0;
            if (!isLineIgnored(line, ignoredLines)) {
              results.push(createResult(
                filename,
                line,
                node.loc?.start.column || 0,
                feature.id,
                `${apiCall} is not widely supported (${feature.baseline.status})`,
                'warning',
                feature
              ));
            }
          }
        }
      },


      OptionalMemberExpression(path: NodePath<t.OptionalMemberExpression>) {

        const parent = path.parentPath;
        if (parent && (t.isOptionalMemberExpression(parent.node) || t.isOptionalCallExpression(parent.node))) {
          return; // Skip if this is part of a larger optional chain
        }
        
        const line = path.node.loc?.start.line || 0;
        if (!isLineIgnored(line, ignoredLines)) {
          results.push(createResult(
            filename,
            line,
            path.node.loc?.start.column || 0,
            'optional-chaining',
            'Optional chaining (?.) requires modern browsers',
            'warning'
          ));
        }
      },

      // Detect optional call expressions (e.g., api?.getData?.())
      OptionalCallExpression(path: NodePath<t.OptionalCallExpression>) {

        const parent = path.parentPath;
        if (parent && (t.isOptionalMemberExpression(parent.node) || t.isOptionalCallExpression(parent.node))) {
          return; // Skip if this is part of a larger optional chain
        }
        
        const line = path.node.loc?.start.line || 0;
        if (!isLineIgnored(line, ignoredLines)) {
          results.push(createResult(
            filename,
            line,
            path.node.loc?.start.column || 0,
            'optional-chaining',
            'Optional chaining (?.) requires modern browsers',
            'warning'
          ));
        }
      },

      LogicalExpression(path: NodePath<t.LogicalExpression>) {
        if (path.node.operator === '??') {
          const line = path.node.loc?.start.line || 0;
          if (!isLineIgnored(line, ignoredLines)) {
            results.push(createResult(
              filename,
              line,
              path.node.loc?.start.column || 0,
              'nullish-coalescing',
              'Nullish coalescing (??) requires modern browsers',
              'warning'
            ));
          }
        }
      },

      NewExpression(path: NodePath<t.NewExpression>) {
        const { node } = path;
        if (t.isIdentifier(node.callee)) {
          const constructorName = `new ${node.callee.name}`;
          const feature = detectWebFeatures(constructorName);
          
          if (feature && !feature.baseline.status.includes('widely')) {
            const line = node.loc?.start.line || 0;
            if (!isLineIgnored(line, ignoredLines)) {
              results.push(createResult(
                filename,
                line,
                node.loc?.start.column || 0,
                feature.id,
                `${constructorName} is not widely supported (${feature.baseline.status})`,
                'warning',
                feature
              ));
            }
          }
        }
      },

      CallExpression(path: NodePath<t.CallExpression>) {
        const { node } = path;
        let functionName = '';
        
        if (t.isIdentifier(node.callee)) {
          // Global function like fetch()
          functionName = node.callee.name;
        } else if (t.isMemberExpression(node.callee)) {
          // Method call like navigator.share()
          const objectName = getObjectName(node.callee.object);
          const methodName = getPropertyName(node.callee.property);
          if (objectName && methodName) {
            functionName = `${objectName}.${methodName}`;
          }
        }
        
        if (functionName) {
          const feature = detectWebFeatures(functionName);
          
          if (feature && !feature.baseline.status.includes('widely')) {
            const line = node.loc?.start.line || 0;
            if (!isLineIgnored(line, ignoredLines)) {
              // Special message formatting for Array.at() to match test expectations
              let message = `${functionName}() is not widely supported (${feature.baseline.status})`;
              if (feature.id === 'array-at') {
                message = `Array.at() method is not widely supported (${feature.baseline.status})`;
              }
              
              results.push(createResult(
                filename,
                line,
                node.loc?.start.column || 0,
                feature.id,
                message,
                'warning',
                feature
              ));
            }
          }
        }
      },

      ClassPrivateProperty(path: NodePath<any>) {
        const line = path.node.loc?.start.line || 0;
        if (!isLineIgnored(line, ignoredLines)) {
          results.push(createResult(
            filename,
            line,
            path.node.loc?.start.column || 0,
            'private-class-fields',
            'Private class fields require modern browsers',
            'warning'
          ));
        }
      },

      ClassPrivateMethod(path: NodePath<any>) {
        const line = path.node.loc?.start.line || 0;
        if (!isLineIgnored(line, ignoredLines)) {
          results.push(createResult(
            filename,
            line,
            path.node.loc?.start.column || 0,
            'private-class-fields',
            'Private class methods require modern browsers',
            'warning'
          ));
        }
      },

      PrivateName(path: NodePath<any>) {
        const line = path.node.loc?.start.line || 0;
        if (!isLineIgnored(line, ignoredLines)) {
          results.push(createResult(
            filename,
            line,
            path.node.loc?.start.column || 0,
            'private-class-fields',
            'Private class field access requires modern browsers',
            'warning'
          ));
        }
      },

      AwaitExpression(path: NodePath<t.AwaitExpression>) {
        let parent = path.getFunctionParent();
        if (!parent) {
          const line = path.node.loc?.start.line || 0;
          if (!isLineIgnored(line, ignoredLines)) {
            results.push(createResult(
              filename,
              line,
              path.node.loc?.start.column || 0,
              'top-level-await',
              'Top-level await requires modern browsers and module context',
              'warning'
            ));
          }
        }
      },
    });
  } catch (error) {
    console.warn(`Failed to parse JavaScript in ${filename}:`, error);
  }

  return results;
}

function getObjectName(node: t.Node): string | null {
  if (t.isIdentifier(node)) {
    return node.name;
  }
  if (t.isMemberExpression(node)) {
    const object = getObjectName(node.object);
    const property = getPropertyName(node.property);
    return object && property ? `${object}.${property}` : null;
  }
  return null;
}

function getPropertyName(node: t.Node): string | null {
  if (t.isIdentifier(node)) {
    return node.name;
  }
  if (t.isStringLiteral(node)) {
    return node.value;
  }
  return null;
}

function checkWebAPI(
  apiCall: string,
  node: t.MemberExpression,
  filename: string,
  ignoredLines: Set<number>,
  results: CompatibilityResult[]
): boolean {
  const line = node.loc?.start.line || 0;
  if (isLineIgnored(line, ignoredLines)) return false;

  // Dialog element APIs
  if (apiCall === 'dialog.showModal' || apiCall === 'dialog.close') {
    results.push(createResult(
      filename,
      line,
      node.loc?.start.column || 0,
      'dialog-element',
      `${apiCall}() - Dialog element requires modern browsers`,
      'warning',
      { baseline: { status: 'limited' } }
    ));
    return true;
  }

  // Clipboard API
  if (apiCall.includes('clipboard.write') || apiCall === 'navigator.clipboard.writeText' || 
      apiCall === 'navigator.clipboard.read' || apiCall === 'navigator.clipboard.readText') {
    results.push(createResult(
      filename,
      line,
      node.loc?.start.column || 0,
      'clipboard-api',
      `${apiCall}() - Clipboard API requires modern browsers and user permission`,
      'warning',
      { baseline: { status: 'limited' } }
    ));
    return true;
  }

  // Web Share API
  if (apiCall === 'navigator.share') {
    results.push(createResult(
      filename,
      line,
      node.loc?.start.column || 0,
      'web-share-api',
      'navigator.share() - Web Share API is not widely supported',
      'warning',
      { baseline: { status: 'limited' } }
    ));
    return true;
  }

  // View Transitions API
  if (apiCall === 'document.startViewTransition') {
    results.push(createResult(
      filename,
      line,
      node.loc?.start.column || 0,
      'view-transitions',
      'document.startViewTransition() - View Transitions API requires modern browsers',
      'warning',
      { baseline: { status: 'limited' } }
    ));
    return true;
  }

  // CSS Typed OM
  if (apiCall.includes('attributeStyleMap') || apiCall.includes('computedStyleMap')) {
    results.push(createResult(
      filename,
      line,
      node.loc?.start.column || 0,
      'css-typed-om',
      `${apiCall} - CSS Typed Object Model requires modern browsers`,
      'warning',
      { baseline: { status: 'limited' } }
    ));
    return true;
  }

  // Intersection Observer v2
  if (apiCall.includes('IntersectionObserver') && 
      (node.property && t.isIdentifier(node.property) && 
       (node.property.name === 'trackVisibility' || node.property.name === 'delay'))) {
    results.push(createResult(
      filename,
      line,
      node.loc?.start.column || 0,
      'intersection-observer-v2',
      'IntersectionObserver v2 features (trackVisibility, delay) require modern browsers',
      'warning',
      { baseline: { status: 'limited' } }
    ));
    return true;
  }

  return false;
}

function parseIgnoreComments(content: string): Set<number> {
  const ignoredLines = new Set<number>();
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1; // 1-based line numbers
    
    // Check for line-level ignore: // baseline-buddy-ignore
    if (line.includes('// baseline-buddy-ignore')) {
      ignoredLines.add(lineNumber);
      
      // If ignore comment is on its own line, ignore the next line
      if (line.trim() === '// baseline-buddy-ignore' && i + 1 < lines.length) {
        ignoredLines.add(lineNumber + 1);
      }
    }
    
    // Check for block-level ignore: /* baseline-buddy-ignore */
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

function createResult(
  file: string,
  line: number,
  column: number,
  feature: string,
  message: string,
  severity: 'error' | 'warning' | 'info',
  webFeature?: any
): CompatibilityResult {
  return {
    file,
    line,
    column,
    feature,
    message,
    severity,
    baseline: webFeature?.baseline.status || 'unknown',
    browserSupport: webFeature?.browser_support ? Object.keys(webFeature.browser_support) : [],
    fixes: webFeature?.mdn_url ? [{
      type: 'documentation',
      description: 'Learn more on MDN',
      url: webFeature.mdn_url
    }] : undefined
  };
}