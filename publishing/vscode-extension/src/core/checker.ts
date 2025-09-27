import { glob } from 'glob';
import { readFileSync } from 'fs';
import { minimatch } from 'minimatch';
import { parseJavaScript } from './parsers/javascript';
import { parseCSS } from './parsers/css';
import { CompatibilityResult } from './types';
import { ConfigLoader, BaselineConfig } from './config/config-loader';
import { BaselineEngine } from './baseline-engine';

export interface CheckerOptions {
  config?: string;
  format?: 'json' | 'markdown' | 'sarif';
  severity?: 'error' | 'warning' | 'info';
  workspaceRoot?: string;
}

export interface DocumentInput {
  filename: string;
  content: string;
  languageId?: string;
}

export async function checkCompatibility(
  files: string[] | DocumentInput[],
  options: CheckerOptions = {}
): Promise<CompatibilityResult[]> {
  const configLoader = new ConfigLoader();
  const config = configLoader.loadConfig(options.workspaceRoot, options.config);
  
  return await checkCompatibilityWithConfig(files, config, options);
}

/**
 * Discover files based on configuration include/exclude patterns
 */
async function discoverFiles(config: BaselineConfig): Promise<string[]> {
  const includePatterns = config.include || ['**/*.{js,jsx,ts,tsx,css,scss,less}'];
  
  const allFiles: string[] = [];
  for (const pattern of includePatterns) {
    const matchedFiles = await glob(pattern, {
      ignore: config.exclude || []
    });
    allFiles.push(...matchedFiles);
  }
  
  return [...new Set(allFiles)];
}

export async function checkCompatibilityWithConfig(
  files: string[] | DocumentInput[],
  config: BaselineConfig,
  options: CheckerOptions = {}
): Promise<CompatibilityResult[]> {
  const results: CompatibilityResult[] = [];
  
  // Initialize baseline engine with config target
  const baselineEngine = new BaselineEngine({
    year: config.baseline.target,
    customBrowserslist: config.baseline.browserslist
  });
  
  // Handle file paths (CLI usage)
  if (files.length === 0 || (files.length > 0 && typeof files[0] === 'string')) {
    let filePaths = files as string[];
    
    // If no files specified, discover files using config patterns
    if (filePaths.length === 0) {
      filePaths = await discoverFiles(config);
    } else {
      // Filter provided files through exclude patterns using minimatch
      const excludePatterns = config.exclude || [];
      if (excludePatterns.length > 0) {
        filePaths = filePaths.filter(file => !isFileExcluded(file, excludePatterns));
      }
    }

    for (const file of filePaths) {
      try {
        const content = readFileSync(file, 'utf-8');
        const extension = file.split('.').pop()?.toLowerCase();

        let fileResults: CompatibilityResult[] = [];
        
        if (['js', 'jsx', 'ts', 'tsx'].includes(extension || '')) {
          fileResults = await parseJavaScript(content, file);
        } else if (['css', 'scss', 'less'].includes(extension || '')) {
          fileResults = await parseCSS(content, file);
        }

        // Filter and apply configuration
        const configuredResults = applyConfiguration(fileResults, config);
        // Filter by baseline target
        const baselineFilteredResults = baselineEngine.filterResults(configuredResults);
        // Enhance with baseline-aware severity and messaging
        const enhancedResults = baselineEngine.enhanceResults(baselineFilteredResults);
        results.push(...enhancedResults);
      } catch (error) {
        console.warn(`Failed to parse ${file}:`, error);
      }
    }
  } else {
    // Handle in-memory content (VS Code extension usage)
    const documents = files as DocumentInput[];
    
    for (const doc of documents) {
      try {
        let fileResults: CompatibilityResult[] = [];
        
        // Determine file type from languageId or filename extension
        const languageId = doc.languageId?.toLowerCase();
        const extension = doc.filename.split('.').pop()?.toLowerCase();
        
        const isJavaScript = languageId === 'javascript' || languageId === 'typescript' ||
                             languageId === 'javascriptreact' || languageId === 'typescriptreact' ||
                             ['js', 'jsx', 'ts', 'tsx'].includes(extension || '');
        
        const isCSS = languageId === 'css' || languageId === 'scss' || languageId === 'less' ||
                      ['css', 'scss', 'less'].includes(extension || '');
        
        if (isJavaScript) {
          fileResults = await parseJavaScript(doc.content, doc.filename);
        } else if (isCSS) {
          fileResults = await parseCSS(doc.content, doc.filename);
        }

        // Filter and apply configuration
        const configuredResults = applyConfiguration(fileResults, config);
        // Filter by baseline target  
        const baselineFilteredResults = baselineEngine.filterResults(configuredResults);
        // Enhance with baseline-aware severity and messaging
        const enhancedResults = baselineEngine.enhanceResults(baselineFilteredResults);
        results.push(...enhancedResults);
      } catch (error) {
        console.warn(`Failed to parse ${doc.filename}:`, error);
      }
    }
  }

  return results;
}

/**
 * Check if a file should be excluded based on exclude patterns
 */
function isFileExcluded(filePath: string, excludePatterns: string[]): boolean {
  for (const pattern of excludePatterns) {
    if (minimatch(filePath, pattern, { matchBase: true, dot: true })) {
      return true;
    }
  }
  return false;
}

function applyConfiguration(results: CompatibilityResult[], config: BaselineConfig): CompatibilityResult[] {
  const configLoader = new ConfigLoader();
  
  return results
    .filter(result => !configLoader.shouldIgnoreFeature(result.feature, config))
    .map(result => ({
      ...result,
      severity: configLoader.getFeatureSeverity(result.feature, config)
    }));
}