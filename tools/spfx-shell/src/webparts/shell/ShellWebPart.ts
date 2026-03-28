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
    // Note: loaderConfig exists on the runtime manifest but is not in the
    // TS type definition, so we access it via any cast.
    const manifest = this.manifest as any;
    const baseUrls = manifest.loaderConfig?.internalModuleBaseUrls;
    const rawBaseUrl: string = baseUrls && baseUrls.length > 0 ? baseUrls[0] : '';

    // Normalize: ensure exactly one trailing slash between base path and filename.
    // SharePoint may return the base URL with or without a trailing slash depending
    // on the tenant and CDN configuration. Plain concatenation caused the production
    // defect where the solution GUID ran directly into the filename:
    //   ...d01a9600-a68a-4afe-83a5-514339f47dbbestimating-app.js  (broken)
    //   ...d01a9600-a68a-4afe-83a5-514339f47dbb/estimating-app.js (correct)
    const normalizedBase = rawBaseUrl.endsWith('/') ? rawBaseUrl : rawBaseUrl + '/';
    const bundleUrl = normalizedBase + __APP_BUNDLE_NAME__;

    // Diagnostic: log the URL resolution chain for staging/debug validation.
    // These are non-noisy console.debug calls — invisible unless DevTools is
    // open with verbose logging enabled.
    console.debug('[HB-Intel ShellWebPart] rawBaseUrl:', rawBaseUrl);
    console.debug('[HB-Intel ShellWebPart] bundleUrl:', bundleUrl);

    const scriptResult = await SPComponentLoader.loadScript(bundleUrl, {
      globalExportsName: __APP_GLOBAL_NAME__,
    }) as IAppModule | undefined;
    const windowModule = (window as any)[__APP_GLOBAL_NAME__] as IAppModule | undefined;
    this._appModule = scriptResult || windowModule;

    console.debug('[HB-Intel ShellWebPart] loadScript result type:', typeof scriptResult);
    console.debug('[HB-Intel ShellWebPart] loadScript result keys:', scriptResult ? Object.keys(scriptResult as object) : 'null/undefined');
    console.debug('[HB-Intel ShellWebPart] window global type:', typeof windowModule);
    console.debug('[HB-Intel ShellWebPart] window global keys:', windowModule ? Object.keys(windowModule as object) : 'null/undefined');
  }

  public render(): void {
    if (this._appModule?.mount) {
      this._appModule.mount(this.domElement, this.context);
    } else {
      console.error('[HB-Intel ShellWebPart] Mount failed.', {
        bundleName: __APP_BUNDLE_NAME__,
        globalName: __APP_GLOBAL_NAME__,
        moduleExists: !!this._appModule,
        hasMountFn: typeof this._appModule?.mount,
        hasUnmountFn: typeof this._appModule?.unmount,
        windowGlobalExists: !!(window as any)[__APP_GLOBAL_NAME__],
      });
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
