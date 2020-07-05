// vscode.ts

const window = {
  createStatusBarItem: jest.fn(() => ({
    show: jest.fn()
  })),
  showErrorMessage: jest.fn(),
  showWarningMessage: jest.fn(),
  createTextEditorDecorationType: jest.fn()
};

const workspace = {
  getConfiguration: jest.fn(),
  workspaceFolders: [],
  getWorkspaceFolder: jest.fn(),
  onDidSaveTextDocument: jest.fn()
};

class SnippetString {
  value?: string;

  constructor(value?: string) {
    this.value = value;
  }
}

enum CompletionItemKind {
  Snippet = 14
}

class CompletionItem {
  private readonly label: string;

  private readonly kind?: CompletionItemKind;

  insertText?: string | SnippetString;

  constructor(label: string, kind?: CompletionItemKind) {
    this.kind = kind;
    this.label = label;
  }
}

export { window, workspace, CompletionItemKind, SnippetString, CompletionItem };
