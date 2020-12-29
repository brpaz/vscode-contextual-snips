import * as vscode from 'vscode';
import { Snippet } from '../snippets/snippet';

import * as pm from 'picomatch';

import { PackageProviderFactory } from '../packageProvider/provider';

export default class SnippetsCompletionProvider implements vscode.CompletionItemProvider {
  private packageProviderFactory: PackageProviderFactory;

  private snippets: Array<Snippet> = new Array<Snippet>();

  public constructor(packageProviderFactory: PackageProviderFactory, snippets: Array<Snippet>) {
    this.snippets = snippets;
    this.packageProviderFactory = packageProviderFactory;
  }

  public setSnippets(snippets: Array<Snippet>): void {
    this.snippets = snippets;
  }

  public provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
    token: vscode.CancellationToken,
    context: vscode.CompletionContext
  ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
    const rootPath = vscode.workspace.getWorkspaceFolder(document.uri)?.uri.path;

    const filteredSnippets = this.snippets
      .filter((item) => this.filterByLanguage(item, document))
      .filter((item) => this.filterByPattern(item, document.uri.path, rootPath))
      .filter((item) => this.filterByPackage(item, rootPath))
      .filter((item) => this.filterByContent(item, document));

    const completionItems = filteredSnippets.map((snippet) => {
      const snippetCompletion = new vscode.CompletionItem(snippet.id, vscode.CompletionItemKind.Snippet);
      snippetCompletion.insertText = new vscode.SnippetString(snippet.body.join('\n'));
      snippetCompletion.kind = vscode.CompletionItemKind.Snippet;
      snippetCompletion.detail = snippet.description;
      return snippetCompletion;
    });

    return completionItems;
  }

  private filterByLanguage(snippet: Snippet, document: vscode.TextDocument): boolean {
    const snippetLangs = snippet.scope.split(',');

    return snippetLangs.includes(document.languageId);
  }

  private filterByPattern(snippet: Snippet, filePath: string, rootPath: string | undefined): boolean {
    if (!rootPath || !snippet.context || !snippet.context.patterns) {
      return true;
    }

    const currentFile = filePath.replace(rootPath, '');

    return pm.isMatch(currentFile, snippet.context.patterns, {
      dot: true
    });
  }

  private filterByPackage(snippet: Snippet, rootPath: string | undefined): boolean {
    if (!rootPath || !snippet.context || !snippet.context.package) {
      return true;
    }

    const pkgConfig = snippet.context.package;

    const packageProvider = this.packageProviderFactory.getProviderByType(pkgConfig.provider);

    if (!packageProvider) {
      return false;
    }

    return packageProvider.hasPackage(pkgConfig.name);
  }

  private filterByContent(snippet: Snippet, document: vscode.TextDocument): boolean {
    const contentMatchRegex = snippet.context?.contentMatch;

    if (!contentMatchRegex) {
      return true;
    }

    const re = new RegExp(contentMatchRegex);
    return re.test(document.getText());
  }
}
