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
declare const __FUNCTION_APP_URL__: string;

interface IAppModule {
  mount(el: HTMLElement, spfxContext?: unknown, config?: Record<string, unknown>): Promise<void>;
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

    console.debug('[HB-Intel ShellWebPart] rawBaseUrl:', rawBaseUrl);
    console.debug('[HB-Intel ShellWebPart] bundleUrl:', bundleUrl);

    // Load the IIFE app bundle. Resolution order:
    //   1. loadScript return value (SPComponentLoader reads globalExportsName)
    //   2. globalThis[globalName]  (explicit publication from mount.tsx)
    //   3. window[globalName]      (legacy / IIFE var fallback)
    const loadScriptResult = await SPComponentLoader.loadScript<IAppModule>(bundleUrl, {
      globalExportsName: __APP_GLOBAL_NAME__,
    });

    const explicitGlobal =
      (globalThis as any)[__APP_GLOBAL_NAME__] ??
      (window as any)[__APP_GLOBAL_NAME__];

    this._appModule = loadScriptResult ?? explicitGlobal;

    // Hard-fail with actionable diagnostics if the module didn't resolve.
    if (!this._appModule?.mount || !this._appModule?.unmount) {
      console.error('[HB-Intel ShellWebPart] Module resolution failed.', {
        bundleUrl,
        globalName: __APP_GLOBAL_NAME__,
        loadScriptResult: typeof loadScriptResult,
        loadScriptKeys: loadScriptResult ? Object.keys(loadScriptResult as object) : null,
        explicitGlobalType: typeof explicitGlobal,
        explicitGlobalKeys: explicitGlobal ? Object.keys(explicitGlobal as object) : null,
        resolvedModule: typeof this._appModule,
        hasMount: typeof this._appModule?.mount,
        hasUnmount: typeof this._appModule?.unmount,
      });
      throw new Error(
        `[HB-Intel] App module did not resolve correctly from ${bundleUrl}. ` +
        `Expected mount/unmount on ${__APP_GLOBAL_NAME__}.`
      );
    }

    console.debug('[HB-Intel ShellWebPart] Module resolved.', {
      source: loadScriptResult ? 'loadScript' : 'globalThis',
      keys: Object.keys(this._appModule as object),
    });
  }

  public render(): void {
    if (this._appModule?.mount) {
      // Inject runtime configuration into the loaded app.
      // __FUNCTION_APP_URL__ is provided at build time via webpack DefinePlugin
      // (set by build-spfx-package.ts from the FUNCTION_APP_URL env var).
      const runtimeConfig: Record<string, unknown> = {};
      try {
        if (typeof __FUNCTION_APP_URL__ === 'string' && __FUNCTION_APP_URL__) {
          runtimeConfig.functionAppUrl = __FUNCTION_APP_URL__;
        }
      } catch {
        // __FUNCTION_APP_URL__ not defined — app will fall back to Vite env or throw ConfigError
      }
      this._appModule.mount(this.domElement, this.context, runtimeConfig);
    } else {
      // This path should be unreachable because onInit throws on missing module,
      // but defend against framework edge cases that skip onInit.
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
