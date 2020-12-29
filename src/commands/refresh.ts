import SnippetsCompletionProvider from '../completionProvider/provider';
import SnippetsManager from '../snippets/snippetsManager';
import { window } from 'vscode';
export default async function (
  snippetsManager: SnippetsManager,
  completionProvider: SnippetsCompletionProvider
): Promise<void> {
  const snippets = await snippetsManager.loadSnippets();
  completionProvider.setSnippets(snippets);

  window.showInformationMessage('Snippets Refreshed Successfully!');
}
