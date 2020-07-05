import SnippetsProvider from './provider';
import { PackageProvider } from '../types';
import * as vscode from 'vscode';
import { mock } from 'jest-mock-extended';
import * as vscodemock from '../__mocks__/vscode';

const mockSnippets = [
  {
    id: 'test-1',
    body: ['afterAll(() => {\n\t$0\n});'],
    description: 'afterAll function is called once after all specs',
    prefix: 'jest afterall',
    scope: 'javascript,javascriptreact,typescript,typescriptreact',
    context: {
      patterns: ['**/*/*.spec.{ts,js}']
    }
  },
  {
    id: 'test2',
    body: ['test'],
    description: 'test',
    prefix: 'prefix',
    scope: 'php',
    context: {
      patterns: ['**/*/*.spec.{ts,js}']
    }
  }
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Snippets Provider', () => {
  it('returns only snippets that match the document language', async () => {
    const provider = new SnippetsProvider(mockSnippets);

    const document = mock<vscode.TextDocument>({
      fileName: 'test.spec.ts',
      uri: {
        path: '/test/test.spec.ts'
      },
      languageId: 'typescript'
    });

    const position = mock<vscode.Position>();
    const token = mock<vscode.CancellationToken>();
    const context = mock<vscode.CompletionContext>();

    vscodemock.workspace.getWorkspaceFolder.mockReturnValue({ uri: { path: '/test' } });
    const results = provider.provideCompletionItems(document, position, token, context) as Array<vscode.CompletionItem>;

    expect(results.length).toBe(1);
    expect(results[0].kind).toBe(vscode.CompletionItemKind.Snippet);
    expect(results[0].label).toBe('test-1');
    expect(results[0].detail).toBe('afterAll function is called once after all specs');
    //expect(results[0].insertText?.toString()).toBe('afterAll(() => {\n\t$0\n});');
  });
});
