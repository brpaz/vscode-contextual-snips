import { PackageProvider, PackageProviderType } from './provider';

import { window, workspace } from 'vscode';
import fs from 'fs-extra';
import path from 'path';
import memoize from 'memoizee';
class Gomod implements PackageProvider {
  private hasPackageFn: Function;

  constructor() {
    this.hasPackageFn = memoize(
      (packageName: string): boolean => {
        console.log(packageName);
        return this.getPackages().includes(packageName);
      },
      {
        primitive: true,
        maxAge: 5000
      }
    );
  }
  getType(): PackageProviderType {
    return PackageProviderType.GOMOD;
  }
  getPackages(): Array<string> {
    const packagesList = new Array<string>();
    const gomodFile = this.getGomodPath();

    if (!gomodFile) {
      return packagesList;
    }

    const data = fs.readFileSync(gomodFile);

    const re = new RegExp('([a-zA-Z0-9\\/.-]+)\\sv[0-9.-]+', 'gm');

    const str = data.toString();

    let match;
    while ((match = re.exec(str)) !== null) {
      packagesList.push(match[1]);
    }

    return packagesList.sort();
  }
  hasPackage(packageName: string): boolean {
    return this.hasPackageFn(packageName);
  }

  isAvailableInWorkspace(): boolean {
    const goMod = this.getGomodPath();

    if (!goMod) {
      return false;
    }
    return fs.existsSync(goMod);
  }

  private getGomodPath(): string | undefined {
    const activeEditor = window.activeTextEditor;
    if (activeEditor === undefined) {
      return;
    }
    const currentFile = activeEditor.document.uri;
    const ws = workspace.getWorkspaceFolder(currentFile);

    if (ws === undefined) {
      return;
    }

    return path.join(ws.uri.fsPath, 'go.mod');
  }
}

export default Gomod;
