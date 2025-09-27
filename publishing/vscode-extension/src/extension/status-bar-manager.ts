import * as vscode from 'vscode';

interface StatusUpdate {
  status: 'ok' | 'issues' | 'checking';
  count?: number;
}

export class StatusBarManager implements vscode.Disposable {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    
    this.statusBarItem.command = 'baselineBuddy.showPanel';
    this.statusBarItem.show();
    
    // Register command handlers
    vscode.commands.registerCommand('baselineBuddy.updateStatus', (update: StatusUpdate) => {
      this.updateStatus(update);
    });

    vscode.commands.registerCommand('baselineBuddy.showPanel', () => {
      this.showOutputPanel();
    });

    // Initial status
    this.updateStatus({ status: 'ok' });
  }

  private updateStatus(update: StatusUpdate) {
    switch (update.status) {
      case 'ok':
        this.statusBarItem.text = '$(check) Baseline: OK';
        this.statusBarItem.tooltip = 'No baseline compatibility issues found';
        this.statusBarItem.backgroundColor = undefined;
        break;

      case 'issues':
        const count = update.count || 0;
        this.statusBarItem.text = `$(warning) Baseline: ${count} issue${count !== 1 ? 's' : ''}`;
        this.statusBarItem.tooltip = `${count} baseline compatibility issue${count !== 1 ? 's' : ''} found. Click to view details.`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        break;

      case 'checking':
        this.statusBarItem.text = '$(sync~spin) Baseline: Checking...';
        this.statusBarItem.tooltip = 'Checking baseline compatibility...';
        this.statusBarItem.backgroundColor = undefined;
        break;
    }
  }

  private showOutputPanel() {
    // Show the Problems panel to display diagnostics
    vscode.commands.executeCommand('workbench.panel.markers.view.focus');
  }

  dispose() {
    this.statusBarItem.dispose();
  }
}