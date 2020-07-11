export interface Snippet {
  id: string;
  prefix: Array<string>;
  description: string;
  body: Array<string>;
  context?: SnippetContext;
  scope: string;
}

export interface SnippetContext {
  patterns?: Array<string>;
  package?: Package;
}

export enum PackageProvider {
  NPM = 'npm'
}

export interface Package {
  provider: PackageProvider;
  name: string;
}

export interface SnippetsLoader {
  load(paths: Array<string>): Array<Snippet>;
}
