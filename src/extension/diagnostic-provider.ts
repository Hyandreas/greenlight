import * as vscode from 'vscode';
import { checkCompatibility, DocumentInput } from '../core/checker';
import { CompatibilityResult } from '../core/types';

export class DiagnosticProvider implements vscode.Disposable {
  private diagnosticCollection: vscode.DiagnosticCollection;
  private pendingChecks = new Map<string, NodeJS.Timeout>();

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection('greenlight');
  }

  async checkDocument(document: vscode.TextDocument) {
    if (!this.isEnabled()) {
      return;
    }

    try {
      // Create DocumentInput with in-memory content
      const documentInput: DocumentInput = {
        filename: document.fileName,
        content: document.getText(),
        languageId: document.languageId
      };

      const results = await checkCompatibility([documentInput], {
        format: 'json',
        severity: this.getSeverityLevel()
      });

      const diagnostics = this.convertToDiagnostics(results, document);
      this.diagnosticCollection.set(document.uri, diagnostics);

      // Update status bar
      this.updateStatus(results);
    } catch (error) {
      console.error('Greenlight: Error checking document', error);
      vscode.window.showErrorMessage(`Greenlight: Failed to check ${document.fileName}`);
    }
  }

  scheduleCheck(document: vscode.TextDocument) {
    const uri = document.uri.toString();
    
    // Clear existing timeout
    const existing = this.pendingChecks.get(uri);
    if (existing) {
      clearTimeout(existing);
    }

    // Schedule new check with debounce
    const timeout = setTimeout(() => {
      this.checkDocument(document);
      this.pendingChecks.delete(uri);
    }, 500); // 500ms debounce

    this.pendingChecks.set(uri, timeout);
  }

  async checkWorkspace() {
    if (!this.isEnabled()) {
      return;
    }

    const files = await vscode.workspace.findFiles(
      '**/*.{js,jsx,ts,tsx,css,scss,less}',
      '{**/node_modules/**,**/dist/**,**/build/**,**/.git/**}'
    );

    let totalIssues = 0;
    for (const file of files) {
      try {
        const document = await vscode.workspace.openTextDocument(file);
        await this.checkDocument(document);
        
        const diagnostics = this.diagnosticCollection.get(file);
        if (diagnostics) {
          totalIssues += diagnostics.length;
        }
      } catch (error) {
        console.warn(`Failed to check ${file.fsPath}:`, error);
      }
    }

    vscode.window.showInformationMessage(
      `Greenlight: Checked ${files.length} files, found ${totalIssues} compatibility issues`
    );
  }

  clearDiagnostics() {
    this.diagnosticCollection.clear();
    vscode.window.showInformationMessage('Greenlight: Cleared all diagnostics');
  }

  private convertToDiagnostics(results: CompatibilityResult[], document: vscode.TextDocument): vscode.Diagnostic[] {
    return results
      .filter(result => result.file === document.fileName)
      .map(result => {
        const line = Math.max(0, result.line - 1); // VS Code uses 0-based lines
        const character = Math.max(0, result.column);
        
        const range = new vscode.Range(
          new vscode.Position(line, character),
          new vscode.Position(line, character + 10) // Approximate end position
        );

        const severity = this.mapSeverity(result.severity);
        
        const diagnostic = new vscode.Diagnostic(
          range,
          result.message,
          severity
        );

        diagnostic.source = 'Greenlight';
        diagnostic.code = result.feature;
        
        // Add related information
        if (result.browserSupport && result.browserSupport.length > 0) {
          diagnostic.relatedInformation = [
            new vscode.DiagnosticRelatedInformation(
              new vscode.Location(document.uri, range),
              `Supported in: ${result.browserSupport.join(', ')}`
            )
          ];
        }

        return diagnostic;
      });
  }

  private mapSeverity(severity: string): vscode.DiagnosticSeverity {
    switch (severity) {
      case 'error':
        return vscode.DiagnosticSeverity.Error;
      case 'warning':
        return vscode.DiagnosticSeverity.Warning;
      case 'info':
        return vscode.DiagnosticSeverity.Information;
      default:
        return vscode.DiagnosticSeverity.Warning;
    }
  }

  private isEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('greenlight');
    return config.get<boolean>('enabled', true);
  }

  private getSeverityLevel(): 'error' | 'warning' | 'info' {
    const config = vscode.workspace.getConfiguration('greenlight');
    return config.get<'error' | 'warning' | 'info'>('severity', 'warning');
  }

  private updateStatus(results: CompatibilityResult[]) {
    const issueCount = results.length;
    vscode.commands.executeCommand('greenlight.updateStatus', {
      status: issueCount > 0 ? 'issues' : 'ok',
      count: issueCount
    });
  }

  dispose() {
    this.diagnosticCollection.dispose();
    
    // Clear pending checks
    for (const timeout of this.pendingChecks.values()) {
      clearTimeout(timeout);
    }
    this.pendingChecks.clear();
  }
}