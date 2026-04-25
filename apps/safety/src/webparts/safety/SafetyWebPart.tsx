/**
 * SPFx webpart entry point for Safety.
 *
 * SharePoint calls onInit() → render() on this class.
 * This is the bridge between SharePoint page context and the React app.
 *
 * Runtime binding is **fully governed** end-to-end. Every value in the
 * Safety runtime contract — including `functionAppUrl` and `apiAudience` —
 * is sourced from build-time governance (`config/runtime-binding.json` →
 * Vite defines → `governedRuntimeBinding.ts`). No SharePoint page-instance
 * value, no property-pane edit, and no manifest preconfigured property can
 * override the governed binding. The only deployment-time knob is the set
 * of `HBC_SAFETY_*` build-time environment variables consumed by
 * `runtimeDefines.ts`.
 *
 * @see docs/how-to/safety-runtime-binding.md
 * @decision D-PH7-BW-7 — RBAC permission mapping wired
 */
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { mount, unmount } from '../../mount.js';
import { hostedSafetyGuidOverlayFingerprint } from '../../runtime/hostedSafetyGuidBinding.js';
import {
  SAFETY_ACCEPTED_BACKEND_ORIGIN,
  SAFETY_DEFAULT_API_AUDIENCE,
  SAFETY_DEFAULT_FUNCTION_APP_URL,
  SAFETY_EXPECTED_API_AUDIENCE,
  SAFETY_PACKAGE_VERSION,
  SAFETY_WEBPART_MANIFEST_ID,
} from '../../runtime/governedRuntimeBinding.js';

export interface ISafetyWebPartProps {
  description: string;
}

/**
 * Safety SPFx webpart.
 */
export default class SafetyWebPart extends BaseClientSideWebPart<ISafetyWebPartProps> {
  public async onInit(): Promise<void> {
    await super.onInit();
  }

  public render(): void {
    void mount(this.domElement, this.context, {
      functionAppUrl: SAFETY_DEFAULT_FUNCTION_APP_URL,
      apiAudience: SAFETY_DEFAULT_API_AUDIENCE,
      acceptedBackendOrigin: SAFETY_ACCEPTED_BACKEND_ORIGIN,
      expectedManifestId: SAFETY_WEBPART_MANIFEST_ID,
      expectedPackageVersion: SAFETY_PACKAGE_VERSION,
      expectedApiAudience: SAFETY_EXPECTED_API_AUDIENCE,
      expectedHostedGuidOverlayFingerprint: hostedSafetyGuidOverlayFingerprint(),
    }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.domElement.innerHTML =
        `<div role="alert" style="padding:12px;border:1px solid #d13438;">` +
        `Safety failed to mount: ${message}</div>`;
    });
  }

  protected onDispose(): void {
    unmount();
    super.onDispose();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Safety Webpart Settings' },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('description', {
                  label: 'Description',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
