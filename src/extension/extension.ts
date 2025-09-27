import * as vscode from 'vscode';
import { DiagnosticProvider } from './diagnostic-provider';
import { CodeActionProvider } from './code-action-provider';
import { StatusBarManager } from './status-bar-manager';

let diagnosticProvider: DiagnosticProvider;
let statusBarManager: StatusBarManager;

export function activate(context: vscode.ExtensionContext) {

  diagnosticProvider = new DiagnosticProvider();
  context.subscriptions.push(diagnosticProvider);

  statusBarManager = new StatusBarManager();
  context.subscriptions.push(statusBarManager);

  const codeActionProvider = new CodeActionProvider();
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      [
        { language: 'javascript' },
        { language: 'typescript' },
        { language: 'javascriptreact' },
        { language: 'typescriptreact' },
        { language: 'css' },
        { language: 'scss' },
        { language: 'less' }
      ],
      codeActionProvider
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('greenlight.checkFile', () => {
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        diagnosticProvider.checkDocument(activeEditor.document);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('greenlight.checkWorkspace', () => {
      diagnosticProvider.checkWorkspace();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('greenlight.clearDiagnostics', () => {
      diagnosticProvider.clearDiagnostics();
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (isSupported(document)) {
        diagnosticProvider.checkDocument(document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      if (isSupported(document)) {
        diagnosticProvider.checkDocument(document);
      }
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
      if (isSupported(event.document)) {
        diagnosticProvider.scheduleCheck(event.document);
      }
    })
  );

  // Check currently open documents
  vscode.workspace.textDocuments.forEach((document) => {
    if (isSupported(document)) {
      diagnosticProvider.checkDocument(document);
    }
  });
}

export function deactivate() {
  if (diagnosticProvider) {
    diagnosticProvider.dispose();
  }
  if (statusBarManager) {
    statusBarManager.dispose();
  }
}

function isSupported(document: vscode.TextDocument): boolean {
  const supportedLanguages = [
    'javascript',
    'typescript', 
    'javascriptreact',
    'typescriptreact',
    'css',
    'scss',
    'less'
  ];
  return supportedLanguages.includes(document.languageId);
}