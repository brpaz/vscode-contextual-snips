import { PackageProviderType } from '../packageProvider/provider';

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
  contentMatch?: string;
}

export interface Package {
  provider: PackageProviderType;
  name: string;
}

export interface SnippetsLoader {
  load(paths: Array<string>): Array<Snippet>;
}

export interface NewSnippet {
  languageId: string;
  prefix: string;
  description: string;
  body: string;
  pattern: string;
  filePath: string;
  packageProvider?: PackageProviderType;
  packageName?: string;
}
