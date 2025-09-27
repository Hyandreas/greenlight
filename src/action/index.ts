import * as core from '@actions/core';
import * as github from '@actions/github';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';
import { checkCompatibility } from '../core/checker';
import { CompatibilityResult } from '../core/types';
import { ConfigLoader } from '../core/config/config-loader';
import { generateMarkdownReport, generateSarifReport } from '../core/output/formatters';

/**
 * Expand glob patterns to actual file paths, respecting exclude patterns
 */
async function expandFilePatterns(patterns: string[], excludePatterns: string[]): Promise<string[]> {
  const allFiles: string[] = [];
  
  for (const pattern of patterns) {
    try {
      const matchedFiles = await glob(pattern, {
        ignore: excludePatterns,
        nodir: true
      });
      allFiles.push(...matchedFiles);
    } catch (error) {
      core.warning(`Failed to expand pattern '${pattern}': ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return [...new Set(allFiles)];
}

async function run(): Promise<void> {
  try {
    const files = core.getInput('files') || '';
    const configPath = core.getInput('config') || './greenlight.config.json';
    const outputFormat = core.getInput('output-format') || 'markdown';
    const failOnError = core.getInput('fail-on-error') === 'true';
    const commentPR = core.getInput('comment-pr') === 'true';
    const githubToken = core.getInput('github-token');

    core.info(`Checking baseline compatibility for: ${files || 'default patterns'}`);
    
    const filePatterns = files ? files.split(/\s+/).filter(f => f.length > 0) : [];
    const workspaceRoot = process.cwd();
    
    const configLoader = new ConfigLoader();
    const config = configLoader.loadConfig(workspaceRoot, configPath);
    
    let expandedFiles: string[];
    
    if (filePatterns.length > 0) {
      expandedFiles = await expandFilePatterns(filePatterns, config.exclude || []);
      core.info(`Expanded ${filePatterns.length} pattern(s) to ${expandedFiles.length} file(s)`);
      
      if (expandedFiles.length === 0) {
        core.warning(`No files found matching patterns: ${filePatterns.join(', ')}`);
        core.warning('Consider checking your file patterns or exclude configuration');
      }
    } else {
      expandedFiles = [];
      core.info('No file patterns provided, using configuration-based file discovery');
    }
    
    const results = await checkCompatibility(expandedFiles, { 
      workspaceRoot,
      config: configPath 
    });
    
    core.info(`Found ${results.length} compatibility issues`);
    
    // Generate output file
    const outputFile = generateOutput(results, outputFormat);
    
    // Set outputs
    core.setOutput('results-count', results.length.toString());
    core.setOutput('results-file', outputFile);
    
    // Comment on PR if requested
    if (commentPR && githubToken && github.context.payload.pull_request) {
      await commentOnPR(results, outputFile, githubToken);
    }
    
    // Fail if requested and issues found
    if (failOnError && results.length > 0) {
      const errorCount = results.filter(r => r.severity === 'error').length;
      const warningCount = results.filter(r => r.severity === 'warning').length;
      const infoCount = results.filter(r => r.severity === 'info').length;
      
      const summary = [
        errorCount > 0 ? `${errorCount} errors` : '',
        warningCount > 0 ? `${warningCount} warnings` : '',
        infoCount > 0 ? `${infoCount} info` : ''
      ].filter(s => s).join(', ');
      
      core.setFailed(`Found ${results.length} compatibility issues (${summary})`);
    }
    
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : 'Unknown error');
  }
}

function generateOutput(results: CompatibilityResult[], format: string): string {
  let filename: string;
  
  // Use deterministic filename for SARIF to work with CodeQL upload
  if (format === 'sarif') {
    filename = 'greenlight-results.sarif';
  } else {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    filename = `greenlight-results-${timestamp}.${format === 'markdown' ? 'md' : 'json'}`;
  }
  
  const filepath = join(process.cwd(), filename);
  
  let content: string;
  
  switch (format) {
    case 'markdown':
      content = generateMarkdownReport(results);
      break;
    case 'sarif':
      content = generateSarifReport(results);
      break;
    default:
      content = JSON.stringify(results, null, 2);
  }
  
  writeFileSync(filepath, content, 'utf-8');
  core.info(`Results written to ${filepath}`);
  
  return filepath;
}

async function commentOnPR(results: CompatibilityResult[], outputFile: string, token: string): Promise<void> {
  try {
    const octokit = github.getOctokit(token);
    const context = github.context;
    
    if (!context.payload.pull_request) {
      core.info('Not a pull request, skipping PR comment');
      return;
    }
    
    const prNumber = context.payload.pull_request.number;
    const owner = context.repo.owner;
    const repo = context.repo.repo;
    
    // Read the markdown report
    let comment = '';
    if (existsSync(outputFile) && outputFile.endsWith('.md')) {
      comment = readFileSync(outputFile, 'utf-8');
    } else {
      // Fallback to basic summary
      const errorCount = results.filter(r => r.severity === 'error').length;
      const warningCount = results.filter(r => r.severity === 'warning').length;
      
      if (results.length === 0) {
        comment = '✅ **Web Compatibility**: No issues found!';
      } else {
        comment = `🚨 **Web Compatibility**: Found ${results.length} issues (${errorCount} errors, ${warningCount} warnings)`;
      }
    }
    
    // Check for existing comment
    const comments = await octokit.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber
    });
    
    const existingComment = comments.data.find(c => 
      c.body?.includes('Web Compatibility Report') || 
      c.body?.includes('Greenlight')
    );
    
    if (existingComment) {
      // Update existing comment
      await octokit.rest.issues.updateComment({
        owner,
        repo,
        comment_id: existingComment.id,
        body: comment
      });
      core.info('Updated existing PR comment');
    } else {
      // Create new comment
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: comment
      });
      core.info('Created new PR comment');
    }
    
  } catch (error) {
    core.warning(`Failed to comment on PR: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

run();