import { window, commands, QuickPick } from 'vscode';
import { NewSnippet } from '../snippets/snippet';
import { PackageProviderType } from '../packageProvider/provider';
import { COMMAND_REFRESH } from './index';
import path from 'path';
import SnippetsManager from '../snippets/snippetsManager';

function getSnippetFile(snippetFiles: string[]): Promise<string> {
  return new Promise((resolve) => {
    const quickPick = window.createQuickPick();
    quickPick.placeholder = 'Select (or create) the file where the new snippet will be saved.';
    quickPick.canSelectMany = false;
    quickPick.items = snippetFiles.map((label) => ({ label }));
    quickPick.onDidAccept(() => {
      const selection = quickPick.activeItems[0];
      let value = selection.label;
      if (!selection.label.endsWith('.json')) {
        value = `${selection.label}.json`;
      }
      resolve(value);
      quickPick.hide();
    });
    quickPick.onDidChangeValue(() => {
      if (!snippetFiles.includes(quickPick.value)) {
        const newItems = [quickPick.value, ...snippetFiles].map((label) => ({ label: label }));
        quickPick.items = newItems;
      }
    });
    quickPick.onDidHide(() => quickPick.dispose());
    quickPick.show();
  });
}

export default async function (snippetsManager: SnippetsManager): Promise<void> {
  const editor = window.activeTextEditor;
  if (editor === undefined) {
    return;
  }
  const selection = editor.selection;

  if (!editor || selection.isEmpty) {
    window.showWarningMessage('Cannot create snippet from empty string. Select some text first.');
    return;
  }

  const selectedText = editor.document.getText(selection);

  const snippet = {} as NewSnippet;
  snippet.languageId = editor.document.languageId;
  snippet.body = selectedText;

  const prefix = await window.showInputBox({
    prompt: `Enter snippet prefix`,
    validateInput: (value) => (value === '' ? 'The prefix is required' : null)
  });

  if (prefix === undefined) {
    return;
  }

  snippet.prefix = prefix;
  const description = await window.showInputBox({
    prompt: 'Snippet Description',
    value: ''
  });

  const patternExpr = await window.showInputBox({
    prompt: 'Pattern to match this file',
    value: `**/**/${path.basename(editor.document.fileName)}`
  });

  if (patternExpr === undefined) {
    return;
  }

  snippet.pattern = patternExpr;
  snippet.description = description || '';

  const snippetFiles = await snippetsManager.getSnippetsFiles();

  const items = snippetFiles.map((f) => path.basename(f)).sort();
  const targetFile = await getSnippetFile(items);

  if (targetFile === undefined) {
    return;
  }

  snippet.filePath = targetFile;

  const providers = snippetsManager.getPackageProviderFactory().getProvidersFromWorkspace();

  if (providers.length > 0) {
    const packagesItems = new Array<string>();
    packagesItems.push('none');
    for (const provider of providers) {
      packagesItems.push(...provider.getPackages().map((p) => `${provider.getType().valueOf()}:${p}`));
    }

    if (packagesItems.length > 0) {
      const selectedPackageItem = await window.showQuickPick(packagesItems, {
        placeHolder: 'Select a package to enable the snippet to be show only when the selectedpackage is present.'
      });

      if (selectedPackageItem && selectedPackageItem !== 'none') {
        const [packageType, packageName] = selectedPackageItem.split(':');
        snippet.packageProvider = packageType as PackageProviderType;
        snippet.packageName = packageName;
      }
    }

    console.log(snippet);
  }

  await snippetsManager.create(snippet);

  window.showInformationMessage('Snippet created!');

  commands.executeCommand(COMMAND_REFRESH);
}
