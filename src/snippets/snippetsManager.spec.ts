import mock from 'mock-fs';
import { WorkspacePackageProviderFactory } from '../packageProvider/provider';
import SnippetsManager from './snippetsManager';

const testData = {
  testsnippet: {
    prefix: 'snip',
    body: ['test'],
    description: 'some test snippet',
    scrope: 'yaml',
    context: {
      patterns: ['.github/.workflows/.*.yaml']
    }
  },
  testsnippetwithoutscope: {
    prefix: 'snip',
    body: ['test'],
    description: 'some test snippet'
  }
};

let loader: SnippetsManager;

const providerFactory = new WorkspacePackageProviderFactory();

beforeEach(() => {
  mock({
    '/snippets': {
      'test.json': JSON.stringify(testData),
      'parseerror.json': ''
    }
  });
});

describe('Snippets Loader', () => {
  it('loads snippet files', async () => {
    loader = new SnippetsManager('/snippets', providerFactory);
    const snippets = await loader.loadSnippets();
    expect(snippets.length).toBe(2);
    expect(snippets[0].id).toBe('testsnippet');
    expect(snippets[0].prefix).toContain('snip');
    expect(snippets[0].description).toBe('some test snippet');
    expect(snippets[0].body).toContain('test');
    expect(snippets[0].context?.patterns?.includes("'.github/.workflows/.*.yaml'"));
  });

  it('fallback to plaintext language if scope is not defined', async () => {
    loader = new SnippetsManager('/snippets', providerFactory);
    const snippets = await loader.loadSnippets();
    expect(snippets[1].id).toBe('testsnippetwithoutscope');
    expect(snippets[1].scope).toBe('plaintext');
  });

  it('loads empty files if snippet folder was not found', async () => {
    loader = new SnippetsManager('/snippets-not-found', providerFactory);
    const snippets = await loader.loadSnippets();
    expect(snippets.length).toBe(0);
  });

  it('returns empty list if Snippet file is invalid', async () => {
    loader = new SnippetsManager('/parseerror.json', providerFactory);
    const snippets = await loader.loadSnippets();
    expect(snippets.length).toBe(0);
  });
});

afterEach(() => {
  mock.restore();
});
