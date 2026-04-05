/**
 * Generic SPFx Application Customizer that loads a Vite-built IIFE app bundle
 * and renders into supported SharePoint placeholder regions (Top / Bottom).
 *
 * This is the Lane B equivalent of ShellWebPart.ts (Lane A). It has zero
 * monorepo imports — all application code lives in the Vite-built bundle.
 *
 * Domain-specific values (__APP_BUNDLE_NAME__, __APP_GLOBAL_NAME__) are
 * injected at build time via webpack DefinePlugin (see gulpfile.js).
 *
 * Lifecycle:
 *  1. onInit()    — loads the IIFE bundle, acquires placeholders, mounts React
 *  2. onDispose() — unmounts React trees and releases placeholders
 *
 * @see tools/build-spfx-package.ts (orchestration)
 * @see apps/hb-shell-extension/src/mount.tsx (mountTop/mountBottom contract)
 */
import { BaseApplicationCustomizer, PlaceholderName } from '@microsoft/sp-application-base';
import type { PlaceholderContent } from '@microsoft/sp-application-base';
import { SPComponentLoader } from '@microsoft/sp-loader';

declare const __APP_BUNDLE_NAME__: string;
declare const __APP_GLOBAL_NAME__: string;

interface IExtensionModule {
  mountTop(el: HTMLElement | null | undefined): void;
  mountBottom(el: HTMLElement | null | undefined): void;
  unmountTop(): void;
  unmountBottom(): void;
}

export default class ShellExtensionCustomizer extends BaseApplicationCustomizer<{}> {
  private _appModule: IExtensionModule | undefined;
  private _topPlaceholder: PlaceholderContent | undefined;
  private _bottomPlaceholder: PlaceholderContent | undefined;

  public async onInit(): Promise<void> {
    await super.onInit();

    // Resolve the CDN base URL from the SPFx manifest loaderConfig.
    const manifest = this.manifest as any;
    const baseUrls = manifest.loaderConfig?.internalModuleBaseUrls;
    const rawBaseUrl: string = baseUrls && baseUrls.length > 0 ? baseUrls[0] : '';
    const normalizedBase = rawBaseUrl.endsWith('/') ? rawBaseUrl : rawBaseUrl + '/';
    const bundleUrl = normalizedBase + __APP_BUNDLE_NAME__;

    console.debug('[HB-Intel ShellExtensionCustomizer] bundleUrl:', bundleUrl);

    // Load the IIFE app bundle.
    const loadScriptResult = await SPComponentLoader.loadScript<IExtensionModule>(bundleUrl, {
      globalExportsName: __APP_GLOBAL_NAME__,
    });

    const explicitGlobal =
      (globalThis as any)[__APP_GLOBAL_NAME__] ??
      (window as any)[__APP_GLOBAL_NAME__];

    this._appModule = loadScriptResult ?? explicitGlobal;

    if (!this._appModule?.mountTop || !this._appModule?.mountBottom) {
      console.error('[HB-Intel ShellExtensionCustomizer] Module resolution failed.', {
        bundleUrl,
        globalName: __APP_GLOBAL_NAME__,
        resolvedModule: typeof this._appModule,
        hasMountTop: typeof this._appModule?.mountTop,
        hasMountBottom: typeof this._appModule?.mountBottom,
      });
      throw new Error(
        `[HB-Intel] Extension module did not resolve correctly from ${bundleUrl}. ` +
        `Expected mountTop/mountBottom on ${__APP_GLOBAL_NAME__}.`
      );
    }

    console.debug('[HB-Intel ShellExtensionCustomizer] Module resolved.', {
      keys: Object.keys(this._appModule as object),
    });

    // Acquire and mount placeholders.
    this._renderPlaceholders();
  }

  private _renderPlaceholders(): void {
    if (!this._appModule) {
      return;
    }

    // Top placeholder
    if (!this._topPlaceholder) {
      this._topPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Top,
        { onDispose: () => this._onTopPlaceholderDispose() },
      );
    }
    if (this._topPlaceholder?.domElement) {
      this._appModule.mountTop(this._topPlaceholder.domElement);
      console.debug('[HB-Intel ShellExtensionCustomizer] Top placeholder mounted.');
    } else {
      console.debug('[HB-Intel ShellExtensionCustomizer] Top placeholder not available — skipping.');
    }

    // Bottom placeholder
    if (!this._bottomPlaceholder) {
      this._bottomPlaceholder = this.context.placeholderProvider.tryCreateContent(
        PlaceholderName.Bottom,
        { onDispose: () => this._onBottomPlaceholderDispose() },
      );
    }
    if (this._bottomPlaceholder?.domElement) {
      this._appModule.mountBottom(this._bottomPlaceholder.domElement);
      console.debug('[HB-Intel ShellExtensionCustomizer] Bottom placeholder mounted.');
    } else {
      console.debug('[HB-Intel ShellExtensionCustomizer] Bottom placeholder not available — skipping.');
    }
  }

  private _onTopPlaceholderDispose(): void {
    this._appModule?.unmountTop();
    this._topPlaceholder = undefined;
  }

  private _onBottomPlaceholderDispose(): void {
    this._appModule?.unmountBottom();
    this._bottomPlaceholder = undefined;
  }

  protected onDispose(): void {
    this._appModule?.unmountTop();
    this._appModule?.unmountBottom();
    this._appModule = undefined;
    this._topPlaceholder = undefined;
    this._bottomPlaceholder = undefined;
    super.onDispose();
  }
}
