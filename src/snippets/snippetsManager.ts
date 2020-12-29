import { NewSnippet, Snippet, SnippetContext } from './snippet';
import fg from 'fast-glob';
import fs from 'fs-extra';
import path from 'path';
import { PackageProviderFactory } from '../packageProvider/provider';
import { getActiveWorkspaceRootFolder } from '../utils/workspace';

/**
 * Main class responsible for Managing the Snippets load and creation.
 */
export default class SnippetsManager {
  private snippetsDir: string;

  private packageProviderFactory: PackageProviderFactory;

  public constructor(snippetsPath: string, packageProviderFactory: PackageProviderFactory) {
    this.snippetsDir = snippetsPath;
    this.packageProviderFactory = packageProviderFactory;
    this.ensureSnippetsDirExists();
  }

  public getPackageProviderFactory(): PackageProviderFactory {
    return this.packageProviderFactory;
  }

  public getDefaultSnippetsFilePath(): string {
    return path.join(this.snippetsDir, 'global.json');
  }

  private ensureSnippetsDirExists(): void {
    if (!fs.pathExistsSync(this.snippetsDir)) {
      fs.mkdirpSync(this.snippetsDir);
    }
  }
  /**
   * Loads the snippets from Snippets Folder.
   * @param snippetsPath The path to the snippets folder
   */
  public async loadSnippets(): Promise<Array<Snippet>> {
    let snippets = new Array<Snippet>();

    const entries = await this.getSnippetsFiles();

    const allSnippets = await Promise.all(entries.map(async (f) => this.parseSnippetFile(f)));

    snippets = ([] as Snippet[]).concat(...allSnippets);

    return snippets;
  }

  public async create(newSnippetData: NewSnippet): Promise<boolean> {
    const snippet = {} as Snippet;
    snippet.prefix = new Array<string>();
    snippet.body = new Array<string>();
    snippet.context = {} as SnippetContext;
    snippet.context.patterns = new Array<string>();
    snippet.id = newSnippetData.description;
    snippet.scope = newSnippetData.languageId;
    snippet.description = newSnippetData.description;
    snippet.context.patterns.push(newSnippetData.pattern);
    snippet.prefix.push(newSnippetData.prefix);

    if (newSnippetData.packageProvider && newSnippetData.packageName) {
      snippet.context.package = {
        name: newSnippetData.packageName,
        provider: newSnippetData.packageProvider
      };
    }

    snippet.body = newSnippetData.body.split('\n');

    const snippetFile = path.join(this.snippetsDir, newSnippetData.filePath);

    if (!fs.existsSync(snippetFile)) {
      fs.writeJSONSync(snippetFile, {});
    }

    const data = fs.readJSONSync(snippetFile);

    data[snippet.id] = snippet;

    fs.writeJSONSync(snippetFile, data, {
      spaces: 2
    });
    return true;
  }

  public async getSnippetsFiles(): Promise<Array<string>> {
    const globalSnippetsPath = `${this.snippetsDir}/**/*.json`;

    const files = await fg(globalSnippetsPath);

    const workspaceFolder = getActiveWorkspaceRootFolder();
    if (workspaceFolder) {
      const projectSnippetsPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'contextual-snippets');

      const projectFiles = await fg(`${projectSnippetsPath}/**/*.json`);

      files.push(...projectFiles);
    }

    return files;
  }

  private async parseSnippetFile(path: string): Promise<Array<Snippet>> {
    const snippetData = new Array<Snippet>();

    try {
      const fileContents = await fs.readJSON(path);

      const keys = Object.keys(fileContents);

      for (const key of keys) {
        const data = fileContents[key];

        let prefixes = new Array<string>();
        if (Array.isArray(data['prefix'])) {
          prefixes = data['prefix'];
        } else {
          prefixes = [data['prefix']];
        }

        snippetData.push({
          id: key,
          scope: data['scope'] || 'plaintext',
          body: data['body'],
          description: data['description'],
          context: data['context'] || {},
          prefix: prefixes
        });
      }

      return snippetData;
    } catch (err) {
      console.warn(`Contextual Snippets: Cannot parse snippet file ${path} : ${err.message}`);
    }

    return snippetData;
  }
}
