/**
 * Generic SPFx shell webpart that loads a Vite-built IIFE app bundle.
 *
 * This is the ONLY TypeScript compiled by the SPFx toolchain. It has zero
 * monorepo imports — all application code lives in the Vite-built bundle.
 *
 * Domain-specific values (__APP_BUNDLE_NAME__, __APP_GLOBAL_NAME__) are
 * injected at build time via webpack DefinePlugin (see gulpfile.js).
 *
 * Lifecycle:
 *  1. onInit() — loads the IIFE bundle via SPComponentLoader
 *  2. render() — calls the bundle's exported mount(el, context) function
 *  3. onDispose() — calls unmount() to clean up the React tree
 *
 * @see tools/build-spfx-package.ts (orchestration)
 * @see apps/{domain}/src/mount.tsx (mount/unmount contract)
 */
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPComponentLoader } from '@microsoft/sp-loader';

declare const __APP_BUNDLE_NAME__: string;
declare const __APP_GLOBAL_NAME__: string;

interface IAppModule {
  mount(el: HTMLElement, spfxContext?: unknown): Promise<void>;
  unmount(): void;
}

export default class ShellWebPart extends BaseClientSideWebPart<{}> {
  private _appModule: IAppModule | undefined;

  public async onInit(): Promise<void> {
    await super.onInit();

    // Resolve the CDN base URL from the SPFx manifest loaderConfig.
    // When includeClientSideAssets is true, SharePoint rewrites the
    // placeholder to the actual CDN path at deployment time.
    const baseUrls = this.manifest.loaderConfig?.internalModuleBaseUrls;
    const baseUrl = baseUrls && baseUrls.length > 0 ? baseUrls[0] : '';
    const bundleUrl = baseUrl + __APP_BUNDLE_NAME__;

    await SPComponentLoader.loadScript(bundleUrl, { globalExportsName: __APP_GLOBAL_NAME__ });
    this._appModule = (window as any)[__APP_GLOBAL_NAME__] as IAppModule | undefined;
  }

  public render(): void {
    if (this._appModule?.mount) {
      this._appModule.mount(this.domElement, this.context);
    } else {
      this.domElement.innerHTML = '<div style="padding:1rem;color:#a4262c;">App bundle failed to load.</div>';
    }
  }

  protected onDispose(): void {
    this._appModule?.unmount();
    this._appModule = undefined;
    super.onDispose();
  }

  protected getPropertyPaneConfiguration(): any {
    return { pages: [] };
  }
}
