import Npm from './npm';
import Composer from './composer';
import Gomod from './gomod';

export enum PackageProviderType {
  NPM = 'npm',
  COMPOSER = 'composer',
  GOMOD = 'gomod'
}

export interface PackageProvider {
  getType(): PackageProviderType;
  getPackages(): Array<string>;
  hasPackage(pkgName: string): boolean;
  isAvailableInWorkspace(): boolean;
}

export interface PackageProviderFactory {
  getProvidersFromWorkspace(): Array<PackageProvider>;
  getProviderByType(providerType: PackageProviderType): PackageProvider | undefined;
}

/**
 * This class is responsible to manage all the login related to Package Managers discovery in the workspace.
 */
export class WorkspacePackageProviderFactory implements PackageProviderFactory {
  private providers: Array<PackageProvider>;
  constructor() {
    this.providers = new Array<PackageProvider>();
    this.providers.push(new Npm());
    this.providers.push(new Composer());
    this.providers.push(new Gomod());
  }

  getProvidersFromWorkspace(): Array<PackageProvider> {
    const providers = new Array<PackageProvider>();
    for (const provider of this.providers) {
      if (provider.isAvailableInWorkspace()) {
        providers.push(provider);
      }
    }

    return providers;
  }

  getProviderByType(providerType: PackageProviderType): PackageProvider | undefined {
    for (const provider of this.providers) {
      if (provider.getType() === providerType) {
        return provider;
      }
    }

    return undefined;
  }
}
