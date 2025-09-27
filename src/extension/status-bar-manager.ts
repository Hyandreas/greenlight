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
    
    this.statusBarItem.command = 'greenlight.showPanel';
    this.statusBarItem.show();
    
    // Register command handlers
    vscode.commands.registerCommand('greenlight.updateStatus', (update: StatusUpdate) => {
      this.updateStatus(update);
    });

    vscode.commands.registerCommand('greenlight.showPanel', () => {
      this.showOutputPanel();
    });

    // Initial status
    this.updateStatus({ status: 'ok' });
  }

  private updateStatus(update: StatusUpdate) {
    switch (update.status) {
      case 'ok':
        this.statusBarItem.text = '$(check) Greenlight: OK';
        this.statusBarItem.tooltip = 'No web compatibility issues found';
        this.statusBarItem.backgroundColor = undefined;
        break;

      case 'issues':
        const count = update.count || 0;
        this.statusBarItem.text = `$(warning) Greenlight: ${count} issue${count !== 1 ? 's' : ''}`;
        this.statusBarItem.tooltip = `${count} web compatibility issue${count !== 1 ? 's' : ''} found. Click to view details.`;
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
        break;

      case 'checking':
        this.statusBarItem.text = '$(sync~spin) Greenlight: Checking...';
        this.statusBarItem.tooltip = 'Checking web compatibility...';
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