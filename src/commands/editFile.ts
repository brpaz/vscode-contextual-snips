import { window, Uri, commands } from 'vscode';

import SnippetsManager from '../snippets/snippetsManager';

export default async function (snippetsManager: SnippetsManager): Promise<void> {
  const snippetFiles = snippetsManager.getSnippetsFiles();

  const selection = await window.showQuickPick(snippetFiles, {
    placeHolder: 'Select a file to edit'
  });

  if (selection) {
    commands.executeCommand('vscode.open', Uri.parse(selection));
  }
}
