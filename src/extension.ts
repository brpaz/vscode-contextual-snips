// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import SnippetsProvider from './snippets/provider';
import SnippetsLoader from './snippets/loader';
import { Snippet } from './types';

const snippetsLoader = new SnippetsLoader();

async function loadSnippets(): Promise<Array<Snippet>> {
  const snippetPaths = vscode.workspace.getConfiguration('contextual-snips').get('snippets-paths') as Array<string>;

  return snippetsLoader.load(snippetPaths);
}

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const snippets = await loadSnippets();
  const contextualSnippetsProvider = new SnippetsProvider(snippets);
  const provider = vscode.languages.registerCompletionItemProvider({ pattern: '**' }, contextualSnippetsProvider);

  context.subscriptions.push(provider);

  const refreshSnippetsCommand = vscode.commands.registerCommand('contextual-snips.refresh', async () => {
    const snippets = await loadSnippets();
    contextualSnippetsProvider.setSnippets(snippets);

    vscode.window.showInformationMessage('Snippets Refreshed Successfully!');
  });

  context.subscriptions.push(refreshSnippetsCommand);
}

export function deactivate(): void {}
