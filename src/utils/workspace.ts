import { window, workspace, WorkspaceFolder } from 'vscode';

export function getActiveWorkspaceRootFolder(): WorkspaceFolder | undefined {
  const activeEditor = window.activeTextEditor;
  if (activeEditor === undefined) {
    return;
  }
  const currentFile = activeEditor.document.uri;
  const ws = workspace.getWorkspaceFolder(currentFile);

  if (ws === undefined) {
    return;
  }

  return ws;
}
