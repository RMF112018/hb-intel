/**
 * SPFx webpart entry point for Safety.
 *
 * SharePoint calls onInit() → render() on this class.
 * This is the bridge between SharePoint page context and the React app.
 *
 * Runtime binding is **governed**: the accepted backend origin and expected
 * API audience come from `governedRuntimeBinding.ts` (baked in at build
 * time from `config/runtime-binding.json` and `config/package-solution.json`),
 * NOT from property-pane input. The property pane still accepts the
 * `functionAppUrl` and `apiAudience` operators configure per site, but the
 * runtime contract validates those against the governed values and fails
 * closed on drift — no operator edit can loosen the allowlist.
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
  functionAppUrl: string;
  apiAudience: string;
}

/**
 * Safety SPFx webpart.
 */
export default class SafetyWebPart extends BaseClientSideWebPart<ISafetyWebPartProps> {
  public async onInit(): Promise<void> {
    await super.onInit();
  }

  public render(): void {
    const functionAppUrl =
      this.properties.functionAppUrl?.trim() || SAFETY_DEFAULT_FUNCTION_APP_URL;
    const apiAudience =
      this.properties.apiAudience?.trim() || SAFETY_DEFAULT_API_AUDIENCE;
    void mount(this.domElement, this.context, {
      functionAppUrl,
      apiAudience,
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
                PropertyPaneTextField('functionAppUrl', {
                  label: 'Function App URL',
                  description:
                    'Operator override. Origin must match the governed accepted backend origin; otherwise the app fails closed.',
                }),
                PropertyPaneTextField('apiAudience', {
                  label: 'API Audience',
                  description:
                    'Operator override. Must match the governed expected API audience; otherwise the app fails closed.',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
