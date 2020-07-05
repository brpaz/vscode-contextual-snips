import * as vscode from 'vscode';
import { Snippet, PackageProvider } from '../types';
import * as pm from 'picomatch';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as memoize from 'memoizee';

export default class SnippetsProvider implements vscode.CompletionItemProvider {
  private snippets: Array<Snippet> = new Array<Snippet>();

  private hasNPMPackageFn: Function;

  public constructor(snippets: Array<Snippet>) {
    this.snippets = snippets;
    this.hasNPMPackageFn = memoize(this.hasNPMPackage, {
      maxAge: 15000,
      primitive: true,
      length: 2
    });
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
      .filter((item) => this.filterByPackage(item, rootPath));

    const completionItems = filteredSnippets.map((snippet) => {
      const snippetCompletion = new vscode.CompletionItem(snippet.id, vscode.CompletionItemKind.Snippet);
      snippetCompletion.insertText = new vscode.SnippetString(snippet.body.join('\n'));
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

    const pkgInfo = snippet.context.package;

    if (pkgInfo.provider == PackageProvider.NPM) {
      return this.hasNPMPackageFn(pkgInfo.name, rootPath);
    }

    return false;
  }

  private hasNPMPackage(pkgName: string, rootPath: string): boolean {
    const pkgJSONPath = path.join(rootPath, 'package.json');
    const pkgJsonExists = fs.existsSync(pkgJSONPath);

    if (!pkgJsonExists) {
      return false;
    }

    const pkgData = fs.readJSONSync(pkgJSONPath);

    if (pkgData['devDependencies'][pkgName] || pkgData['devDependencies'][pkgName]) {
      return true;
    }

    return false;
  }
}
