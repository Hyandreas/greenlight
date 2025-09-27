#!/usr/bin/env node

import { Command } from 'commander';
import { glob } from 'glob';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { checkCompatibility } from '../core/checker';
import { ConfigLoader } from '../core/config/config-loader';
import { generateMarkdownReport, generateSarifReport, generateHumanReadableOutput } from '../core/output/formatters';

const program = new Command();

program
  .name('baseline-buddy')
  .description('Check web compatibility against Baseline standards')
  .version('1.0.0');

program
  .command('check')
  .description('Check files for baseline compatibility')
  .option('-c, --config <path>', 'Configuration file path', 'baseline.config.json')
  .option('-f, --format <format>', 'Output format (json|markdown|sarif|console)', 'console')
  .option('-o, --output <path>', 'Output file path (defaults to stdout for console format)')
  .option('--fail-on <level>', 'Exit with error code if issues found at level (error|warning|info|any)', 'error')
  .option('--severity <level>', 'Minimum severity level (error|warning|info)', 'warning')
  .option('--quiet', 'Suppress progress messages')
  .argument('[files...]', 'Files to check (supports glob patterns)')
  .action(async (files, options) => {
    try {
      if (!options.quiet) {
      }
      
      // Expand glob patterns if files are provided
      let expandedFiles: string[] = [];
      
      if (files && files.length > 0) {
        // Load config to get exclude patterns
        const configLoader = new ConfigLoader();
        const config = configLoader.loadConfig(process.cwd(), options.config);
        
        // Expand each glob pattern
        for (const pattern of files) {
          try {
            const matchedFiles = await glob(pattern, {
              ignore: config.exclude || [],
              nodir: true
            });
            expandedFiles.push(...matchedFiles);
          } catch (error) {
            if (!options.quiet) {
              console.warn(`Failed to expand pattern '${pattern}':`, error);
            }
          }
        }
        
        // Remove duplicates
        expandedFiles = [...new Set(expandedFiles)];
        
        if (!options.quiet) {
        }
        
        if (expandedFiles.length === 0) {
          if (!options.quiet) {
            console.warn(`No files found matching patterns: ${files.join(', ')}`);
          }
        }
      }
      
      const results = await checkCompatibility(expandedFiles, { 
        workspaceRoot: process.cwd(),
        config: options.config 
      });
      
      // Generate output based on format
      let output: string;
      let fileName: string | undefined;
      
      switch (options.format) {
        case 'markdown':
          output = generateMarkdownReport(results);
          fileName = options.output || 'baseline-results.md';
          break;
        case 'sarif':
          output = generateSarifReport(results);
          fileName = options.output || 'baseline-results.sarif';
          break;
        case 'json':
          output = JSON.stringify(results, null, 2);
          fileName = options.output || 'baseline-results.json';
          break;
        case 'console':
        default:
          output = generateHumanReadableOutput(results);
          fileName = options.output;
          break;
      }
      
      // Output to file or console
      if (fileName && options.format !== 'console') {
        const filePath = join(process.cwd(), fileName);
        writeFileSync(filePath, output, 'utf-8');
        if (!options.quiet) {
          console.log(`Results written to ${filePath}`);
        }
      } else {
        console.log(output);
      }
      
      // Handle exit codes based on fail-on option
      if (results.length > 0) {
        const errorCount = results.filter(r => r.severity === 'error').length;
        const warningCount = results.filter(r => r.severity === 'warning').length;
        const infoCount = results.filter(r => r.severity === 'info').length;
        
        let shouldFail = false;
        
        switch (options.failOn) {
          case 'error':
            shouldFail = errorCount > 0;
            break;
          case 'warning':
            shouldFail = errorCount > 0 || warningCount > 0;
            break;
          case 'info':
            shouldFail = errorCount > 0 || warningCount > 0 || infoCount > 0;
            break;
          case 'any':
            shouldFail = results.length > 0;
            break;
        }
        
        if (shouldFail) {
          if (!options.quiet) {
            console.error(`Compatibility issues found (${errorCount} errors, ${warningCount} warnings, ${infoCount} info)`);
          }
          process.exit(1);
        }
      }
      
      if (!options.quiet && results.length === 0) {
      }
      
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

if (require.main === module) {
  program.parse();
}

export { program };