import * as vscode from 'vscode';
import SnippetsCompletionProvider from './completionProvider/provider';
import SnippetsManager from './snippets/snippetsManager';
import openFolder from './commands/openFolder';
import createSnippets from './commands/create';
import editSnippets from './commands/editFile';
import refreshSnippets from './commands/refresh';
import { getSnippetsPath } from './snippets/utils';

import { WorkspacePackageProviderFactory } from './packageProvider/provider';
import {
  COMMAND_REFRESH,
  COMMAND_CREATE_SNIPPET,
  COMMAND_OPEN_SNIPPETS_FOLDER,
  COMMAND_EDIT_SNIPPET_FILE
} from './commands';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  console.log(`Contextual Snippets: Extension Activated`);

  const packagePrvoiderFactory = new WorkspacePackageProviderFactory();
  const snippetsManager = new SnippetsManager(getSnippetsPath(), packagePrvoiderFactory);
  const snippets = await snippetsManager.loadSnippets();
  const contextualSnippetsProvider = new SnippetsCompletionProvider(packagePrvoiderFactory, snippets);

  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider({ pattern: '**' }, contextualSnippetsProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_REFRESH, async () =>
      refreshSnippets(snippetsManager, contextualSnippetsProvider)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_CREATE_SNIPPET, () => createSnippets(snippetsManager))
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(COMMAND_EDIT_SNIPPET_FILE, () => editSnippets(snippetsManager))
  );

  context.subscriptions.push(vscode.commands.registerCommand(COMMAND_OPEN_SNIPPETS_FOLDER, () => openFolder()));
}

export function deactivate(): void {
  console.log(`Contextual Snippets: Deactivate extension`);
}
