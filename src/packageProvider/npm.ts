import { PackageProvider, PackageProviderType } from './provider';
import { getActiveWorkspaceRootFolder } from '../utils/workspace';
import fs from 'fs-extra';
import path from 'path';
import memoize from 'memoizee';

class Npm implements PackageProvider {
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
    return PackageProviderType.NPM;
  }
  getPackages(): Array<string> {
    const packagesList = new Array<string>();
    const pkgJSON = this.getPackageJSONPath();

    if (!pkgJSON) {
      return packagesList;
    }

    const data = fs.readJSONSync(pkgJSON);

    if (data['devDependencies']) {
      packagesList.push(...Object.keys(data['devDependencies']));
    }

    if (data['dependencies']) {
      packagesList.push(...Object.keys(data['dependencies']));
    }

    return packagesList.sort();
  }
  hasPackage(packageName: string): boolean {
    return this.hasPackageFn(packageName);
  }

  isAvailableInWorkspace(): boolean {
    const pkgJSONPath = this.getPackageJSONPath();

    if (!pkgJSONPath) {
      return false;
    }
    return fs.existsSync(pkgJSONPath);
  }

  private getPackageJSONPath(): string | undefined {
    const ws = getActiveWorkspaceRootFolder();

    if (ws === undefined) {
      return;
    }

    return path.join(ws.uri.fsPath, 'package.json');
  }
}

export default Npm;
