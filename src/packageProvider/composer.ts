import fs from 'fs-extra';
import path from 'path';
import memoize from 'memoizee';
import { PackageProvider, PackageProviderType } from './provider';
import { getActiveWorkspaceRootFolder } from '../utils/workspace';

class Composer implements PackageProvider {
  private hasPackageFn: (name: string) => boolean;

  constructor() {
    this.hasPackageFn = memoize(
      (packageName: string): boolean => {
        return this.getPackages().includes(packageName);
      },
      {
        primitive: true,
        maxAge: 5000
      }
    );
  }

  getType(): PackageProviderType {
    return PackageProviderType.COMPOSER;
  }
  getPackages(): Array<string> {
    const packagesList = new Array<string>();
    const composerFile = this.getComposerFile();

    if (!composerFile) {
      return packagesList;
    }

    const data = fs.readJSONSync(composerFile);

    if (data['require']) {
      packagesList.push(...Object.keys(data['require']));
    }

    if (data['require-dev']) {
      packagesList.push(...Object.keys(data['dependencies']));
    }

    return packagesList.sort();
  }
  hasPackage(packageName: string): boolean {
    return this.hasPackageFn(packageName);
  }

  isAvailableInWorkspace(): boolean {
    const pkgJSONPath = this.getComposerFile();

    if (!pkgJSONPath) {
      return false;
    }
    return fs.existsSync(pkgJSONPath);
  }

  private getComposerFile(): string | undefined {
    const ws = getActiveWorkspaceRootFolder();

    if (ws === undefined) {
      return;
    }

    return path.join(ws.uri.fsPath, 'composer.json');
  }
}

export default Composer;
