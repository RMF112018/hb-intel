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
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneLabel,
  PropertyPaneTextField,
  PropertyPaneSlider,
  PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import {
  applyFoleonRuntimeConfigBridge,
  type IShellFoleonRuntimeConfigProperties,
} from './foleonRuntimeConfigBridge';
import {
  buildFoleonRegistryBootstrap,
  buildFoleonRegistryConfig,
  buildFoleonRegistryItemsUrl,
  buildFoleonRegistryUnavailableConfig,
} from './foleonRegistryShellBridge';

declare const __APP_BUNDLE_NAME__: string;
declare const __APP_GLOBAL_NAME__: string;
declare const __APP_CSS_NAME__: string;
declare const __FUNCTION_APP_URL__: string;
declare const __BACKEND_MODE__: string;
declare const __ALLOW_BACKEND_MODE_SWITCH__: string;
declare const __API_AUDIENCE__: string;
declare const __SAFETY_ACCEPTED_BACKEND_ORIGIN__: string;
declare const __SAFETY_EXPECTED_MANIFEST_ID__: string;
declare const __SAFETY_EXPECTED_PACKAGE_VERSION__: string;
declare const __SAFETY_EXPECTED_API_AUDIENCE__: string;
declare const __SAFETY_EXPECTED_HOSTED_GUID_OVERLAY_FINGERPRINT__: string;

interface IAppModule {
  mount(el: HTMLElement, spfxContext?: unknown, config?: Record<string, unknown>): Promise<void>;
  unmount(): void;
}

/** Webpart IDs that expose property-pane configuration. */
const HERO_WEBPART_ID = '28acd6a7-2582-4d8a-86d4-b52bfbeb375c';
const KUDOS_WEBPART_ID = 'f14e59a3-4d6b-43b2-952e-ba02dea11dad';
const KUDOS_COMPANION_WEBPART_ID = 'a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97';
const PNP_OPS_WEBPART_ID = '9e2dd84a-a121-4fb3-a964-f43a94abf9fd';
const PROJECT_SITES_WEBPART_ID = 'e7b3c4a2-8f1d-4e6a-b952-1d0a7f3e8c5b';
const FOLEON_WEBPART_ID = '2160edb3-675e-4451-92bb-8345f9d1c71e';
const HB_HOMEPAGE_WEBPART_ID = 'e0a11c44-e6d7-45d1-9af5-09ba0b68f5cf';
const FOLEON_EXPECTED_PACKAGE_VERSION = '1.0.25.0';

// Hero Banner domain webparts (public 39762a4d-… and admin
// 23d22f2d-…) deliberately expose no property-pane fields. The
// authoring path is the Hero Banner Admin app itself, hosted on
// `/sites/HBCentral/SitePages/Homepage-Admin.aspx`, which writes
// the canonical `Hero Banner Config` list that the public banner
// reads. The property-pane switch below intentionally has no cases
// for those IDs so no misleading pane controls appear.

interface IShellWebPartProperties extends IShellFoleonRuntimeConfigProperties {
  /** Optional project-year override for the Project Sites webpart. */
  yearOverride?: number;
  /** Author-configurable background image URL for the Signature Hero homepage branch. */
  backgroundImageUrl?: string;
  /**
   * Signature Hero article-mode inputs. Only consumed on non-HBCentral
   * sites; the hero's mode resolver hard-locks homepage mode on
   * HBCentral so these fields are ignored there. All three required
   * fields (title, author, publishedDate) must be populated before the
   * article render path engages — partial configuration yields an
   * empty (author-safe) hero rather than a half-rendered article.
   */
  articleTitle?: string;
  articleSubheading?: string;
  articleLabels?: string;
  articleDestinationUrl?: string;
  articlePrimaryImageUrl?: string;
  articleAuthor?: string;
  articleAuthorUpn?: string;
  articleAuthorPhotoUrl?: string;
  articlePublishedDate?: string;
  articlePublishedTime?: string;
  /** Optional display heading override for the Kudos Companion. */
  heading?: string;
  /** Number of days before standard approved kudos age off the homepage. */
  homepageAgeOffDays?: number;
  /** Days before pending/revision items are flagged overdue in the companion. */
  pendingOverdueDays?: number;
  /** Days before admin-review items are flagged overdue in the companion. */
  adminReviewOverdueDays?: number;
  /** PnP execution mode selection. */
  executionMode?: 'local-runner' | 'remote-runner' | 'mock' | 'legacy-admin-api';
  /** Runner service base URL for local/remote mode. */
  runnerBaseUrl?: string;
  /** Shared secret for remote-runner auth. */
  runnerApiKey?: string;
  /** Optional prefilled target site URL in PnP UI. */
  defaultTargetSiteUrl?: string;
  /** Explicit legacy admin API base URL. */
  legacyAdminApiBaseUrl?: string;
  /** @deprecated Legacy compatibility only. */
  backendUrl?: string;
  /** @deprecated Legacy compatibility only. */
  backendAudience?: string;
  /** Homepage-embedded Foleon Content Registry list ID. */
  foleonContentRegistryListId?: string;
  /** Homepage-embedded Foleon Homepage Placements list ID. */
  foleonPlacementsListId?: string;
  /** Homepage-embedded Foleon Interaction Events list ID. */
  foleonEventsListId?: string;
  /** Homepage-embedded Foleon accepted origins list. */
  foleonAcceptedOrigins?: string;
  /** Homepage-embedded Foleon preview URL allowance. */
  foleonAllowPreview?: boolean;
  /** Homepage-embedded Foleon expected manifest ID. */
  foleonExpectedManifestId?: string;
  /** Homepage-embedded Foleon expected package version. */
  foleonExpectedPackageVersion?: string;
  /** Homepage-embedded Foleon API base URL. */
  foleonApiBaseUrl?: string;
  /** Homepage-embedded Foleon API resource for optional SPFx token acquisition. */
  foleonApiResource?: string;
  /**
   * Safety Field Excellence dynamic activation — flat property-pane fields.
   * The runtime-side `safetyFieldExcellenceDynamicConfigBridge` normalizes
   * these into the nested `safetyFieldExcellenceDynamic` block consumed by
   * `SafetyFieldExcellenceZone`. Operators may instead author the nested
   * block directly via raw JSON; nested explicit values win when both
   * shapes are present.
   */
  safetyFieldExcellenceSourceMode?:
    | ''
    | 'curated-only'
    | 'dynamic-preview'
    | 'dynamic-with-curated-fallback'
    | 'dynamic-only';
  /** Safety Function App base URL (preferred top-level field). */
  safetyFieldExcellenceFunctionAppBaseUrl?: string;
  /** Safety Function App audience for delegated SPFx token acquisition (preferred over backendAudience). */
  safetyFieldExcellenceFunctionAppAudience?: string;
  /** Optional Safety Hub deep-link surfaced in the curated/preview fallback CTAs. */
  safetyFieldExcellenceSafetyHubUrl?: string;
  /** When true, request stale homepage payloads from the Function App. */
  safetyFieldExcellenceIncludeStale?: boolean;
  /** When true, expose verbose runtime-proof diagnostics. */
  safetyFieldExcellenceDiagnosticsEnabled?: boolean;
  /** Operator emergency switch — fall back to curated copy on dynamic failure. */
  safetyFieldExcellenceEmergencyUseCuratedFallback?: boolean;
  /** Top-level Function App URL. May also be derived from the flat Safety field above. */
  functionAppBaseUrl?: string;
  /** Top-level preferred Function App audience. May also be derived from the flat Safety field above. */
  functionAppAudience?: string;
}

export default class ShellWebPart extends BaseClientSideWebPart<IShellWebPartProperties> {
  private _appModule: IAppModule | undefined;
  private _assetBaseUrl = '';
  private _diagnosticId = '';
  private _foleonRegistryConfigPromise: Promise<Record<string, unknown>> | undefined;

  private getModeSpecificGuidance(): string {
    const mode = this.properties.executionMode ?? 'local-runner';
    if (mode === 'local-runner') {
      return 'Verify runnerBaseUrl is configured, reachable over HTTPS, and its certificate is trusted by the browser.';
    }
    if (mode === 'remote-runner') {
      return 'Verify runnerBaseUrl is HTTPS, reachable from this page origin, and runnerApiKey matches the remote host configuration.';
    }
    if (mode === 'legacy-admin-api') {
      return 'Verify legacyAdminApiBaseUrl/backendUrl is configured and backendAudience is set so SPFx can acquire a bearer token.';
    }
    return 'Mock mode bypasses live execution and is intended for non-production diagnostics only.';
  }

  private buildDiagnostics(bundleUrl: string): Record<string, unknown> {
    const mode = this.properties.executionMode ?? 'local-runner';
    return {
      diagnosticId: this._diagnosticId,
      webPartId: (this.manifest as any).id,
      globalName: __APP_GLOBAL_NAME__,
      bundleUrl,
      executionMode: mode,
      hasRunnerBaseUrl: Boolean(this.properties.runnerBaseUrl?.trim()),
      hasLegacyEndpoint: Boolean(this.properties.legacyAdminApiBaseUrl?.trim() || this.properties.backendUrl?.trim()),
      hasRunnerApiKey: Boolean(this.properties.runnerApiKey?.trim()),
      hasBackendAudience: Boolean(this.properties.backendAudience?.trim()),
    };
  }

  private parseYearCandidate(value: unknown): number | undefined {
    const minYear = 1900;
    const maxYear = 2100;
    if (typeof value === 'number' && Number.isInteger(value) && value >= minYear && value <= maxYear) {
      return value;
    }
    if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) {
      const parsed = Number.parseInt(value.trim(), 10);
      if (parsed >= minYear && parsed <= maxYear) {
        return parsed;
      }
    }
    return undefined;
  }

  private resolveHostPageYear(): number | undefined {
    const pageContext = this.context?.pageContext as any;
    const candidates: unknown[] = [
      pageContext?.listItem?.getValueByName?.('Year'),
      pageContext?.listItem?.fieldValues?.Year,
      pageContext?.listItem?.fieldValuesAsText?.Year,
      pageContext?.listItem?.Year,
      pageContext?.legacyPageContext?.Year,
      pageContext?.legacyPageContext?.year,
    ];

    for (const candidate of candidates) {
      const parsed = this.parseYearCandidate(candidate);
      if (parsed !== undefined) {
        return parsed;
      }
    }
    return undefined;
  }

  private renderErrorState(title: string, detail: string, diagnostics: Record<string, unknown>): void {
    const guidance = this.getModeSpecificGuidance();
    this.domElement.innerHTML = `
      <div style="border:1px solid #d13438;background:#fdf3f4;color:#242424;padding:12px;border-radius:4px;">
        <div style="font-weight:600;margin-bottom:6px;">${title}</div>
        <div style="margin-bottom:6px;">${detail}</div>
        <div style="margin-bottom:6px;">${guidance}</div>
        <div style="font-family:Consolas,Menlo,monospace;font-size:12px;color:#605e5c;">
          Diagnostic ID: ${(diagnostics.diagnosticId as string) || 'n/a'}
        </div>
      </div>
    `;
  }

  public async onInit(): Promise<void> {
    await super.onInit();
    this._diagnosticId = `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;

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
    this._assetBaseUrl = normalizedBase;
    const bundleUrl = normalizedBase + __APP_BUNDLE_NAME__;

    // Load companion CSS asset if one was provided at build time.
    // Vite extracts CSS to a separate file that the JS bundle does not self-inject.
    // Without this, the app renders with correct markup but no styling.
    if (typeof __APP_CSS_NAME__ === 'string' && __APP_CSS_NAME__) {
      const cssUrl = normalizedBase + __APP_CSS_NAME__;
      console.debug('[HB-Intel ShellWebPart] cssUrl:', cssUrl);
      SPComponentLoader.loadCss(cssUrl);
    }

    console.debug('[HB-Intel ShellWebPart] rawBaseUrl:', rawBaseUrl);
    console.debug('[HB-Intel ShellWebPart] bundleUrl:', bundleUrl);

    // Load the IIFE app bundle. Resolution order:
    //   1. loadScript return value (SPComponentLoader reads globalExportsName)
    //   2. globalThis[globalName]  (explicit publication from mount.tsx)
    //   3. window[globalName]      (legacy / IIFE var fallback)
    const diagnostics = this.buildDiagnostics(bundleUrl);
    let loadScriptResult: IAppModule | undefined;
    try {
      loadScriptResult = await SPComponentLoader.loadScript<IAppModule>(bundleUrl, {
        globalExportsName: __APP_GLOBAL_NAME__,
      });
    } catch (error) {
      console.error('[HB-Intel ShellWebPart] Bundle load failed.', {
        ...diagnostics,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(
        `[HB-Intel] Failed to load app bundle ${bundleUrl}. ` +
        `Diagnostic ID: ${this._diagnosticId}. ${this.getModeSpecificGuidance()}`,
      );
    }

    const explicitGlobal =
      (globalThis as any)[__APP_GLOBAL_NAME__] ??
      (window as any)[__APP_GLOBAL_NAME__];

    this._appModule = loadScriptResult ?? explicitGlobal;

    // Hard-fail with actionable diagnostics if the module didn't resolve.
    if (!this._appModule?.mount || !this._appModule?.unmount) {
      console.error('[HB-Intel ShellWebPart] Module resolution failed.', {
        ...diagnostics,
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
    void this.renderApp();
  }

  private async renderApp(): Promise<void> {
    if (this._appModule?.mount) {
      // Inject runtime configuration into the loaded app.
      // The app-host mount contract is intentionally idempotent: repeated
      // SharePoint render() calls should update the existing tree instead of
      // recreating root/query runtime state.
      // __FUNCTION_APP_URL__ is provided at build time via webpack DefinePlugin
      // (set by build-spfx-package.ts from the FUNCTION_APP_URL env var).
      const runtimeConfig: Record<string, unknown> = {};
      try {
        const hasFunctionAppUrl = typeof __FUNCTION_APP_URL__ === 'string' && __FUNCTION_APP_URL__;
        // P7-02: Pass the build-time backend mode as-is. Do not silently inject
        // 'ui-review' when Function App URL is missing — the app's own runtime
        // config defaults to 'production' and its readiness check will surface
        // actionable diagnostics if production prerequisites are unmet.
        const injectedBackendMode =
          typeof __BACKEND_MODE__ === 'string' && __BACKEND_MODE__
            ? __BACKEND_MODE__
            : '';

        if (hasFunctionAppUrl) {
          runtimeConfig.functionAppUrl = __FUNCTION_APP_URL__;
        }
        if (injectedBackendMode) {
          runtimeConfig.backendMode = injectedBackendMode;
        }
        if (typeof __ALLOW_BACKEND_MODE_SWITCH__ === 'string' && __ALLOW_BACKEND_MODE_SWITCH__) {
          runtimeConfig.allowBackendModeSwitch = __ALLOW_BACKEND_MODE_SWITCH__ === 'true';
        }
        if (typeof __API_AUDIENCE__ === 'string' && __API_AUDIENCE__) {
          runtimeConfig.apiAudience = __API_AUDIENCE__;
        }
        const webPartId = (this.manifest as any).id;
        runtimeConfig.webPartId = webPartId;
        // Per-domain Safety governance — only populated when the orchestrator
        // built this shell with the Safety env vars set. Each define carries
        // an empty string for non-Safety domains, so the conditional guards
        // skip these assignments and Foleon/Hero/Kudos/etc. mount paths
        // never see Safety contract fields.
        if (typeof __SAFETY_ACCEPTED_BACKEND_ORIGIN__ === 'string' && __SAFETY_ACCEPTED_BACKEND_ORIGIN__) {
          runtimeConfig.acceptedBackendOrigin = __SAFETY_ACCEPTED_BACKEND_ORIGIN__;
        }
        if (typeof __SAFETY_EXPECTED_MANIFEST_ID__ === 'string' && __SAFETY_EXPECTED_MANIFEST_ID__) {
          runtimeConfig.expectedManifestId = __SAFETY_EXPECTED_MANIFEST_ID__;
        }
        if (typeof __SAFETY_EXPECTED_PACKAGE_VERSION__ === 'string' && __SAFETY_EXPECTED_PACKAGE_VERSION__) {
          runtimeConfig.expectedPackageVersion = __SAFETY_EXPECTED_PACKAGE_VERSION__;
        }
        if (typeof __SAFETY_EXPECTED_API_AUDIENCE__ === 'string' && __SAFETY_EXPECTED_API_AUDIENCE__) {
          runtimeConfig.expectedApiAudience = __SAFETY_EXPECTED_API_AUDIENCE__;
        }
        if (
          typeof __SAFETY_EXPECTED_HOSTED_GUID_OVERLAY_FINGERPRINT__ === 'string' &&
          __SAFETY_EXPECTED_HOSTED_GUID_OVERLAY_FINGERPRINT__
        ) {
          runtimeConfig.expectedHostedGuidOverlayFingerprint =
            __SAFETY_EXPECTED_HOSTED_GUID_OVERLAY_FINGERPRINT__;
        }
        runtimeConfig.webPartProperties = this.properties as Record<string, unknown>;
        applyFoleonRuntimeConfigBridge(runtimeConfig, webPartId, this.properties, FOLEON_WEBPART_ID);
        Object.assign(runtimeConfig, await this.resolveFoleonRegistryConfig(webPartId));
        runtimeConfig.assetBaseUrl = this._assetBaseUrl;
        const hostPageYear = this.resolveHostPageYear();
        if (hostPageYear !== undefined) {
          runtimeConfig.hostPageYear = hostPageYear;
        }
      } catch {
        // Runtime constants not defined — app will fall back to Vite env or defaults
      }
      const diagnostics = this.buildDiagnostics(this._assetBaseUrl + __APP_BUNDLE_NAME__);
      void this._appModule.mount(this.domElement, this.context, runtimeConfig).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error('[HB-Intel ShellWebPart] mount() failed.', {
          ...diagnostics,
          runtimeConfig,
          error: message,
        });
        this.renderErrorState(
          'PnP/Webpart runtime mount failed.',
          `The bundle loaded but mount() threw an error: ${message}`,
          diagnostics,
        );
      });
    } else {
      // This path should be unreachable because onInit throws on missing module,
      // but defend against framework edge cases that skip onInit.
      const diagnostics = this.buildDiagnostics(this._assetBaseUrl + __APP_BUNDLE_NAME__);
      console.error('[HB-Intel ShellWebPart] render() called without resolved app module.', diagnostics);
      this.renderErrorState(
        'App bundle failed to initialize.',
        'The app module did not expose mount/unmount at render time.',
        diagnostics,
      );
    }
  }

  private async resolveFoleonRegistryConfig(webPartId: string | undefined): Promise<Record<string, unknown>> {
    if (webPartId !== FOLEON_WEBPART_ID) {
      return {};
    }
    const bootstrap = buildFoleonRegistryBootstrap(this.properties);
    if (!this._foleonRegistryConfigPromise) {
      this._foleonRegistryConfigPromise = (async (): Promise<Record<string, unknown>> => {
        try {
          const response = await fetch(buildFoleonRegistryItemsUrl(bootstrap), {
            credentials: 'include',
            headers: { Accept: 'application/json;odata=nometadata' },
          });
          if (!response.ok) {
            return buildFoleonRegistryUnavailableConfig(bootstrap, `Registry fetch returned HTTP ${response.status}.`);
          }
          const payload = await response.json() as { readonly value?: ReadonlyArray<Record<string, unknown>> };
          return buildFoleonRegistryConfig(bootstrap, payload.value ?? []);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          return buildFoleonRegistryUnavailableConfig(bootstrap, message);
        }
      })();
    }
    return this._foleonRegistryConfigPromise;
  }

  protected onDispose(): void {
    this._appModule?.unmount();
    this._appModule = undefined;
    super.onDispose();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const webPartId = (this.manifest as any).id;

    // Show hero-specific property pane fields only for the Signature Hero webpart.
    // The hero mode resolver is authoritative: HBCentral always renders the
    // homepage branch (backgroundImageUrl applies), and non-HBCentral sites
    // render the article branch when all required article fields are set.
    // There is no editor toggle to force article mode on HBCentral.
    if (webPartId === HERO_WEBPART_ID) {
      return {
        pages: [
          {
            header: {
              description:
                'Signature Hero — homepage locked on HBCentral; article mode on other sites when the required article fields are set.',
            },
            groups: [
              {
                groupName: 'Homepage background (HBCentral only)',
                groupFields: [
                  PropertyPaneTextField('backgroundImageUrl', {
                    label: 'Background image URL',
                    description:
                      'HBCentral-only override for the flagship hero background photograph. Leave blank to use the default banner image. Ignored on non-HBCentral sites.',
                    placeholder: 'https://your-tenant.sharepoint.com/sites/.../image.jpg',
                  }),
                ],
              },
              {
                groupName: 'Article content (non-HBCentral)',
                groupFields: [
                  PropertyPaneTextField('articleTitle', {
                    label: 'Title (required)',
                    description: 'Primary article headline. Required — leave blank to render nothing on non-HBCentral sites.',
                  }),
                  PropertyPaneTextField('articleSubheading', {
                    label: 'Subheading',
                    description: 'Optional deck / standfirst sentence beneath the title.',
                    multiline: true,
                  }),
                  PropertyPaneTextField('articleLabels', {
                    label: 'Labels',
                    description: 'Optional comma- or pipe-separated tags (e.g. "Project, Field").',
                    placeholder: 'Project, Field',
                  }),
                  PropertyPaneTextField('articleDestinationUrl', {
                    label: 'Destination URL',
                    description: 'Optional canonical article URL. When set, the title renders as a link.',
                    placeholder: 'https://intranet.example/articles/...',
                  }),
                ],
              },
              {
                groupName: 'Article media',
                groupFields: [
                  PropertyPaneTextField('articlePrimaryImageUrl', {
                    label: 'Primary image URL',
                    description: 'Optional full-bleed hero image. When empty, the shared surface renders on its brand gradient.',
                    placeholder: 'https://your-tenant.sharepoint.com/sites/.../article-hero.jpg',
                  }),
                ],
              },
              {
                groupName: 'Author',
                groupFields: [
                  PropertyPaneTextField('articleAuthor', {
                    label: 'Display name (required)',
                    description: 'Byline display name. Required when publishing an article-mode hero.',
                  }),
                  PropertyPaneTextField('articleAuthorUpn', {
                    label: 'UPN / email',
                    description: 'Optional. Used to resolve a Microsoft Graph profile photo via the shared people seam.',
                    placeholder: 'author@your-tenant.onmicrosoft.com',
                  }),
                  PropertyPaneTextField('articleAuthorPhotoUrl', {
                    label: 'Explicit photo URL',
                    description: 'Optional. When set, this image is used as-is and Graph lookup is skipped.',
                  }),
                ],
              },
              {
                groupName: 'Publish metadata',
                groupFields: [
                  PropertyPaneTextField('articlePublishedDate', {
                    label: 'Published date (required)',
                    description: 'Required. ISO date (YYYY-MM-DD) or pre-formatted display string.',
                    placeholder: '2026-04-13',
                  }),
                  PropertyPaneTextField('articlePublishedTime', {
                    label: 'Published time',
                    description: 'Optional time-of-day suffix rendered after the date (e.g. 09:15 AM).',
                    placeholder: '09:15 AM',
                  }),
                ],
              },
            ],
          },
        ],
      };
    }

    // Show homepage/age-off property pane for the HB Kudos employee webpart.
    if (webPartId === KUDOS_WEBPART_ID) {
      return {
        pages: [
          {
            header: { description: 'HB Kudos Settings' },
            groups: [
              {
                groupName: 'Homepage Visibility',
                groupFields: [
                  PropertyPaneSlider('homepageAgeOffDays', {
                    label: 'Age-off duration (days)',
                    min: 7,
                    max: 90,
                    step: 1,
                    value: 14,
                  }),
                ],
              },
            ],
          },
        ],
      };
    }

    // HB Kudos Companion property pane — product configuration only.
    // Permission authority comes from Entra security group membership
    // (HB Kudos Admins / HB Kudos Reviewers), not from property-pane fields.
    if (webPartId === KUDOS_COMPANION_WEBPART_ID) {
      return {
        pages: [
          {
            header: { description: 'HB Kudos Companion Settings' },
            groups: [
              {
                groupName: 'Overdue Thresholds',
                groupFields: [
                  PropertyPaneSlider('pendingOverdueDays', {
                    label: 'Pending / revision overdue (days)',
                    min: 1,
                    max: 14,
                    step: 1,
                    value: 3,
                  }),
                  PropertyPaneSlider('adminReviewOverdueDays', {
                    label: 'Admin review overdue (days)',
                    min: 1,
                    max: 14,
                    step: 1,
                    value: 2,
                  }),
                ],
              },
              {
                groupName: 'Display',
                groupFields: [
                  PropertyPaneTextField('heading', {
                    label: 'Webpart heading',
                    description: 'Override the default heading displayed above the governance workspace.',
                    placeholder: 'HB Kudos Approval Companion',
                  }),
                ],
              },
            ],
          },
        ],
      };
    }

    if (webPartId === PROJECT_SITES_WEBPART_ID) {
      return {
        pages: [
          {
            header: { description: 'Project Sites scope settings' },
            groups: [
              {
                groupName: 'Year context',
                groupFields: [
                  PropertyPaneTextField('yearOverride', {
                    label: 'Year override',
                    description:
                      'Optional explicit year scope. Leave blank or set 0 to follow the host page Year context.',
                    placeholder: '0',
                  }),
                ],
              },
            ],
          },
        ],
      };
    }

    if (webPartId === FOLEON_WEBPART_ID) {
      return {
        pages: [
          {
            header: { description: 'HB Intel Foleon Connector Settings' },
            groups: [
              {
                groupName: 'Required SharePoint lists',
                groupFields: [
                  PropertyPaneTextField('contentRegistryListId', {
                    label: 'Content Registry list ID',
                    description: 'GUID of HB_FoleonContentRegistry. Required for all hosted routes.',
                    placeholder: '00000000-0000-0000-0000-000000000000',
                  }),
                  PropertyPaneTextField('placementsListId', {
                    label: 'Homepage Placements list ID',
                    description: 'GUID of HB_FoleonHomepagePlacements. Required for the Highlights route.',
                    placeholder: '00000000-0000-0000-0000-000000000000',
                  }),
                  PropertyPaneTextField('eventsListId', {
                    label: 'Interaction Events list ID',
                    description: 'GUID of HB_FoleonInteractionEvents. Optional, but required for telemetry writes.',
                    placeholder: '00000000-0000-0000-0000-000000000000',
                  }),
                ],
              },
              {
                groupName: 'Foleon governance',
                groupFields: [
                  PropertyPaneTextField('acceptedFoleonOrigins', {
                    label: 'Accepted Foleon origins',
                    description:
                      'One origin per line or comma-separated. The runtime bridge normalizes this into the governed origin allowlist.',
                    multiline: true,
                    placeholder: 'https://viewer.us.foleon.com',
                  }),
                  PropertyPaneToggle('allowPreview', {
                    label: 'Allow preview URLs',
                    onText: 'Preview URLs allowed',
                    offText: 'Production viewer URLs only',
                  }),
                  PropertyPaneTextField('expectedManifestId', {
                    label: 'Expected manifest ID',
                    description: 'Governance proof value. Leave as the packaged Foleon webpart ID unless directed.',
                    placeholder: FOLEON_WEBPART_ID,
                  }),
                  PropertyPaneTextField('expectedPackageVersion', {
                    label: 'Expected package version',
                    description: 'Governance proof value for the deployed Foleon package.',
                    placeholder: '1.0.16.0',
                  }),
                ],
              },
              {
                groupName: 'Advanced route and backend',
                groupFields: [
                  PropertyPaneLabel('foleonRouteGuidance', {
                    text:
                      'The toolbox entry normally sets the Foleon route. Change it only to repair a stale page instance or intentionally customize a page.',
                  }),
                  PropertyPaneDropdown('foleonRoute', {
                    label: 'Foleon route',
                    options: [
                      { key: 'highlights', text: 'highlights' },
                      { key: 'manage', text: 'manage' },
                      { key: 'hub', text: 'hub' },
                      { key: 'reader', text: 'reader' },
                      { key: 'projectSpotlight', text: 'projectSpotlight' },
                      { key: 'companyPulse', text: 'companyPulse' },
                      { key: 'leadershipMessage', text: 'leadershipMessage' },
                    ],
                    selectedKey: this.properties.foleonRoute ?? 'highlights',
                  }),
                  PropertyPaneTextField('foleonDocId', {
                    label: 'Pinned Foleon document ID',
                    description: 'Optional. Used when a reader-route page is pinned to one Foleon document.',
                  }),
                  PropertyPaneTextField('foleonReaderRoutePath', {
                    label: 'Reader route path',
                    description: 'Optional SitePage path that hosts the reader route.',
                    placeholder: '/sites/HBCentral/SitePages/Foleon-Reader.aspx',
                  }),
                  PropertyPaneTextField('foleonApiBaseUrl', {
                    label: 'Foleon API base URL',
                    description: 'Optional existing HB Intel Functions base URL. Omit for same-origin /api.',
                    placeholder: 'https://<functions-app>.azurewebsites.net/api',
                  }),
                  PropertyPaneTextField('foleonApiResource', {
                    label: 'Foleon API resource',
                    description: 'Optional Entra resource/application ID URI for SPFx token acquisition.',
                    placeholder: 'api://<application-id-or-uri>',
                  }),
                ],
              },
            ],
          },
        ],
      };
    }

    if (webPartId === HB_HOMEPAGE_WEBPART_ID) {
      return {
        pages: [
          {
            header: { description: 'HB Homepage Settings' },
            groups: [
              {
                groupName: 'Embedded Foleon lists',
                groupFields: [
                  PropertyPaneTextField('foleonContentRegistryListId', {
                    label: 'Foleon Content Registry list ID',
                    description: 'GUID of HB_FoleonContentRegistry. Required for embedded Project Spotlight and Company Pulse lanes.',
                    placeholder: '00000000-0000-0000-0000-000000000000',
                  }),
                  PropertyPaneTextField('foleonPlacementsListId', {
                    label: 'Foleon Homepage Placements list ID',
                    description: 'GUID of HB_FoleonHomepagePlacements. Used to resolve active lane placements when available.',
                    placeholder: '00000000-0000-0000-0000-000000000000',
                  }),
                  PropertyPaneTextField('foleonEventsListId', {
                    label: 'Foleon Interaction Events list ID',
                    description: 'GUID of HB_FoleonInteractionEvents. Optional, but required for telemetry writes.',
                    placeholder: '00000000-0000-0000-0000-000000000000',
                  }),
                ],
              },
              {
                groupName: 'Embedded Foleon governance',
                groupFields: [
                  PropertyPaneTextField('foleonAcceptedOrigins', {
                    label: 'Accepted Foleon origins',
                    description: 'One origin per line or comma-separated. Used by the embedded reader origin policy.',
                    multiline: true,
                    placeholder: 'https://viewer.us.foleon.com',
                  }),
                  PropertyPaneToggle('foleonAllowPreview', {
                    label: 'Allow Foleon preview URLs',
                    onText: 'Preview URLs allowed',
                    offText: 'Production viewer URLs only',
                  }),
                  PropertyPaneTextField('foleonExpectedManifestId', {
                    label: 'Expected Foleon manifest ID',
                    description: 'Governance proof value for the deployed Foleon package.',
                    placeholder: FOLEON_WEBPART_ID,
                  }),
                  PropertyPaneTextField('foleonExpectedPackageVersion', {
                    label: 'Expected Foleon package version',
                    description: 'Governance proof value for the deployed Foleon package.',
                    placeholder: FOLEON_EXPECTED_PACKAGE_VERSION,
                  }),
                ],
              },
              {
                groupName: 'Embedded Foleon backend',
                groupFields: [
                  PropertyPaneTextField('foleonApiBaseUrl', {
                    label: 'Foleon API base URL',
                    description: 'Optional existing HB Intel Functions base URL. Omit for SharePoint public reader resolution.',
                    placeholder: 'https://<functions-app>.azurewebsites.net/api',
                  }),
                  PropertyPaneTextField('foleonApiResource', {
                    label: 'Foleon API resource',
                    description: 'Optional Entra resource/application ID URI for SPFx token acquisition.',
                    placeholder: 'api://<application-id-or-uri>',
                  }),
                ],
              },
              {
                groupName: 'Safety Field Excellence — dynamic activation',
                groupFields: [
                  PropertyPaneLabel('safetyFieldExcellenceActivationGuidance', {
                    text:
                      'Leave Source mode blank to keep curated-only (the safe default). Choose a dynamic mode and supply the Function App URL and audience to activate live Safety Field Excellence content.',
                  }),
                  PropertyPaneDropdown('safetyFieldExcellenceSourceMode', {
                    label: 'Source mode',
                    options: [
                      { key: '', text: '(curated-only — default)' },
                      { key: 'curated-only', text: 'curated-only' },
                      { key: 'dynamic-preview', text: 'dynamic-preview' },
                      { key: 'dynamic-with-curated-fallback', text: 'dynamic-with-curated-fallback' },
                      { key: 'dynamic-only', text: 'dynamic-only' },
                    ],
                    selectedKey: this.properties.safetyFieldExcellenceSourceMode ?? '',
                  }),
                  PropertyPaneTextField('safetyFieldExcellenceFunctionAppBaseUrl', {
                    label: 'Function App base URL',
                    description:
                      'HTTPS base URL of the Safety Function App (no trailing path). Required for any dynamic mode.',
                    placeholder: 'https://<safety-function-app>.azurewebsites.net',
                  }),
                  PropertyPaneTextField('safetyFieldExcellenceFunctionAppAudience', {
                    label: 'Function App audience',
                    description:
                      'Preferred Entra resource / application ID URI used to acquire a delegated Function App token. Falls back to legacy backendAudience if blank.',
                    placeholder: 'api://<safety-function-app-id-or-uri>',
                  }),
                  PropertyPaneTextField('safetyFieldExcellenceSafetyHubUrl', {
                    label: 'Safety Hub URL',
                    description:
                      'Optional deep-link surfaced in the preview / curated fallback. Leave blank for the default Safety hub link.',
                    placeholder: '/sites/<tenant-safety-site>',
                  }),
                  PropertyPaneToggle('safetyFieldExcellenceIncludeStale', {
                    label: 'Include stale homepage payloads',
                    onText: 'Include stale payloads',
                    offText: 'Fresh payloads only',
                  }),
                  PropertyPaneToggle('safetyFieldExcellenceDiagnosticsEnabled', {
                    label: 'Verbose runtime-proof diagnostics',
                    onText: 'Verbose diagnostics on',
                    offText: 'Standard diagnostics',
                  }),
                  PropertyPaneToggle('safetyFieldExcellenceEmergencyUseCuratedFallback', {
                    label: 'Emergency curated fallback',
                    onText: 'Fall back to curated on failure',
                    offText: 'Use preview fallback on failure',
                  }),
                ],
              },
            ],
          },
        ],
      };
    }

    if (webPartId === PNP_OPS_WEBPART_ID) {
      return {
        pages: [
          {
            header: { description: 'PnP Operations Settings' },
            groups: [
              {
                groupName: 'Execution Mode',
                groupFields: [
                  PropertyPaneDropdown('executionMode', {
                    label: 'Execution mode',
                    options: [
                      { key: 'local-runner', text: 'local-runner (preferred live path)' },
                      { key: 'remote-runner', text: 'remote-runner (fallback)' },
                      { key: 'mock', text: 'mock (no live execution)' },
                      { key: 'legacy-admin-api', text: 'legacy-admin-api (deprecated compatibility)' },
                    ],
                    selectedKey: this.properties.executionMode ?? 'local-runner',
                  }),
                  PropertyPaneTextField('runnerBaseUrl', {
                    label: 'Runner base URL',
                    description: 'Absolute URL for local/remote runner endpoints (for example https://127.0.0.1:5010).',
                    placeholder: 'https://127.0.0.1:5010',
                  }),
                  PropertyPaneTextField('runnerApiKey', {
                    label: 'Runner API key',
                    description: 'Required for remote-runner mode; passed as runner auth header.',
                  }),
                  PropertyPaneTextField('defaultTargetSiteUrl', {
                    label: 'Default target site URL',
                    description: 'Optional SharePoint site URL prefilled in the PnP Operations form.',
                    placeholder: 'https://<tenant>.sharepoint.com/sites/<site>',
                  }),
                ],
              },
              {
                groupName: 'Legacy Compatibility (Deprecated)',
                groupFields: [
                  PropertyPaneTextField('legacyAdminApiBaseUrl', {
                    label: 'Legacy admin API base URL',
                    description: 'Deprecated. Use only for controlled legacy /api/admin/* compatibility.',
                  }),
                  PropertyPaneTextField('backendUrl', {
                    label: 'backendUrl (deprecated)',
                    description: 'Deprecated compatibility field. Prefer legacyAdminApiBaseUrl.',
                  }),
                  PropertyPaneTextField('backendAudience', {
                    label: 'backendAudience (deprecated)',
                    description: 'Deprecated compatibility field used for SPFx bearer token acquisition in legacy mode.',
                  }),
                ],
              },
            ],
          },
        ],
      };
    }

    return { pages: [] };
  }
}
