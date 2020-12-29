import os from 'os';
import path from 'path';
import { window, workspace } from 'vscode';

export function getProjectSnippetsPath(): string | undefined {
  const activeEditor = window.activeTextEditor;
  if (activeEditor === undefined) {
    return;
  }
  const currentFile = activeEditor.document.uri;
  const ws = workspace.getWorkspaceFolder(currentFile);

  if (ws === undefined) {
    return;
  }

  return path.join(ws.uri.fsPath, '.vscode', 'contextual-snippets');
}
/**
 * Returns the location of the Contextual Snippets.
 * It checks the extension confiugration first, if not defined, it falls back to the default in VSCode User Config folder.
 */
export function getSnippetsPath(): string {
  const pathOverride = workspace.getConfiguration('contextual-snips').get('snippets-path');

  if (pathOverride) {
    return pathOverride as string;
  }

  let configDir = '';
  switch (os.platform()) {
    case 'linux':
      configDir = path.join(os.homedir(), '.config', 'Code', 'User', 'contextual-snippets');
      break;
    case 'win32':
      configDir = path.join(os.homedir(), 'AppData', 'Code', 'User', 'contextual-snippets');
      break;
    case 'darwin':
      configDir = path.join(os.homedir(), 'Library', 'Application Support', ' Code', 'User', 'contextual-snippets');
      break;
    default:
      throw new Error(`Unsupported Operating system: ${os.platform()}`);
  }

  return configDir;
}
