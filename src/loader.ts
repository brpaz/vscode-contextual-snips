import { Snippet } from './types';
import * as fg from 'fast-glob';
import * as fs from 'fs-extra';
import * as os from 'os';

export default class SnipptsLoader {
  public async load(folderPaths: Array<string>): Promise<Array<Snippet>> {
    let snippets = new Array<Snippet>();

    let snippetFiles = new Array<string>();

    // TODO, find a more cleaer way without using array of promises
    await Promise.all(
      folderPaths.map(async (path) => {
        const entries = await this.parseSnippetFolder(path);
        snippetFiles = [...snippetFiles, ...entries];
      })
    );

    const allSnippets = await Promise.all(snippetFiles.map(async (f) => this.parseSnippetFile(f)));

    snippets = ([] as Snippet[]).concat(...allSnippets);

    return snippets;
  }

  private async parseSnippetFolder(path: string): Promise<Array<string>> {
    path = path.replace('~', os.homedir());
    path = `${path}/**/*.json`;
    return await fg(path);
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
      console.warn(`Cannot parse snippet file ${path} : ${err.message}`);
    }

    return snippetData;
  }
}
