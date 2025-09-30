import * as vscode from 'vscode';
import { CompatibilityResult } from '../core/types';

export class CodeActionProvider implements vscode.CodeActionProvider {
  
  provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    context: vscode.CodeActionContext,
    token: vscode.CancellationToken
  ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
    
    const actions: vscode.CodeAction[] = [];
    
    // Get Greenlight diagnostics in range
    const baselineDiagnostics = context.diagnostics.filter(
      diagnostic => diagnostic.source === 'Greenlight'
    );

    for (const diagnostic of baselineDiagnostics) {
      const featureId = diagnostic.code as string;
      
      // Add MDN documentation action
      const mdnAction = this.createMdnAction(featureId, diagnostic);
      if (mdnAction) {
        actions.push(mdnAction);
      }

      // Add polyfill/fallback actions based on feature
      const fallbackActions = this.createFallbackActions(featureId, diagnostic, document, range);
      actions.push(...fallbackActions);

      // Add ignore action
      const ignoreAction = this.createIgnoreAction(diagnostic, document, range);
      actions.push(ignoreAction);
    }

    return actions;
  }

  private createMdnAction(featureId: string, diagnostic: vscode.Diagnostic): vscode.CodeAction | null {
    const mdnUrls: Record<string, string> = {
      'css-has-selector': 'https://developer.mozilla.org/en-US/docs/Web/CSS/:has',
      'css-focus-visible': 'https://developer.mozilla.org/en-US/docs/Web/CSS/:focus-visible',
      'clipboard-api': 'https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API',
      'file-system-access': 'https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API',
      'view-transitions': 'https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API',
      'web-share': 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API',
      'dialog-element': 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog',
      'intersection-observer': 'https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API',
      'resize-observer': 'https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API'
    };

    const url = mdnUrls[featureId];
    if (!url) return null;

    const action = new vscode.CodeAction(
      `📖 Learn more about ${featureId} on MDN`,
      vscode.CodeActionKind.QuickFix
    );
    
    action.command = {
      title: 'Open MDN Documentation',
      command: 'vscode.open',
      arguments: [vscode.Uri.parse(url)]
    };
    
    action.diagnostics = [diagnostic];
    return action;
  }

  private createFallbackActions(
    featureId: string, 
    diagnostic: vscode.Diagnostic,
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    // Feature-specific fallback suggestions
    switch (featureId) {
      case 'optional-chaining':
        actions.push(this.createReplaceAction(
          '🔧 Replace with traditional null check',
          diagnostic,
          document,
          range,
          'Replace optional chaining with explicit null checks'
        ));
        break;

      case 'nullish-coalescing':
        actions.push(this.createReplaceAction(
          '🔧 Replace with || operator',
          diagnostic,
          document,
          range,
          'Replace nullish coalescing with logical OR operator'
        ));
        break;

      case 'css-has-selector':
        actions.push(this.createInsertAction(
          '🔧 Add :has() polyfill',
          diagnostic,
          document,
          range,
          '/* Consider using a :has() polyfill like css-has-selector-polyfill */\n'
        ));
        break;

      case 'intersection-observer':
        actions.push(this.createInsertAction(
          '🔧 Add IntersectionObserver polyfill',
          diagnostic,
          document,
          range,
          '// Consider adding intersection-observer polyfill for older browsers\n'
        ));
        break;

      case 'dialog-element':
        actions.push(this.createInsertAction(
          '🔧 Add dialog polyfill suggestion',
          diagnostic,
          document,
          range,
          '/* Consider using dialog-polyfill for older browsers */\n'
        ));
        break;
    }

    return actions;
  }

  private createReplaceAction(
    title: string,
    diagnostic: vscode.Diagnostic,
    document: vscode.TextDocument,
    range: vscode.Range,
    description: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    
    action.edit = new vscode.WorkspaceEdit();
    action.edit.insert(
      document.uri,
      range.start,
      `/* ${description} */\n`
    );
    
    action.diagnostics = [diagnostic];
    return action;
  }

  private createInsertAction(
    title: string,
    diagnostic: vscode.Diagnostic,
    document: vscode.TextDocument,
    range: vscode.Range,
    insertText: string
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
    
    action.edit = new vscode.WorkspaceEdit();
    action.edit.insert(document.uri, range.start, insertText);
    
    action.diagnostics = [diagnostic];
    return action;
  }

  private createIgnoreAction(
    diagnostic: vscode.Diagnostic,
    document: vscode.TextDocument,
    range: vscode.Range
  ): vscode.CodeAction {
    const action = new vscode.CodeAction(
      '🙈 Ignore this baseline issue',
      vscode.CodeActionKind.QuickFix
    );
    
    // Use correct comment syntax based on file type
    const ignoreComment = this.getIgnoreCommentForLanguage(document.languageId);
    
    action.edit = new vscode.WorkspaceEdit();
    action.edit.insert(
      document.uri,
      range.start,
      ignoreComment + '\n'
    );
    
    action.diagnostics = [diagnostic];
    return action;
  }

  private getIgnoreCommentForLanguage(languageId: string): string {
    const cssLanguages = ['css', 'scss', 'less'];
    
    if (cssLanguages.includes(languageId)) {
      return '/* greenlight-ignore */';
    } else {
      return '// greenlight-ignore';
    }
  }
}