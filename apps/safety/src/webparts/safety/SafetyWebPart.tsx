/**
 * SPFx webpart entry point for Safety.
 *
 * SharePoint calls onInit() → render() on this class.
 * This is the bridge between SharePoint page context and the React app.
 *
 * @see docs/architecture/plans/PH7-BW-1-SPFx-Entry-Points.md
 * @decision D-PH7-BW-7 — RBAC permission mapping wired
 */
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { mount, unmount } from '../../mount.js';

export interface ISafetyWebPartProps {
  description: string;
  functionAppUrl: string;
  apiAudience: string;
}

/**
 * Safety SPFx webpart.
 *
 * Lifecycle:
 * - onInit(): async bootstrap (auth bridge wired in BW-2)
 * - render(): mounts <App /> into this.domElement via React 18 createRoot
 * - onDispose(): unmounts React tree to prevent memory leaks
 */
export default class SafetyWebPart extends BaseClientSideWebPart<ISafetyWebPartProps> {
  /**
   * Called by SharePoint before render(). Resolves SP group membership
   * into HB Intel permission keys, then bootstraps the auth store.
   *
   * @decision D-PH7-BW-7 — RBAC permission mapping
   */
  public async onInit(): Promise<void> {
    await super.onInit();
  }

  /**
   * Mounts the React application into the SharePoint-provided DOM element.
   * Uses React 18 createRoot for concurrent mode support.
   */
  public render(): void {
    void mount(this.domElement, this.context, {
      functionAppUrl: this.properties.functionAppUrl,
      apiAudience: this.properties.apiAudience,
    }).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.domElement.innerHTML =
        `<div role="alert" style="padding:12px;border:1px solid #d13438;">` +
        `Safety failed to mount: ${message}</div>`;
    });
  }

  /**
   * Cleans up the React root when SharePoint removes the webpart.
   * Prevents memory leaks from orphaned React trees.
   */
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
                }),
                PropertyPaneTextField('apiAudience', {
                  label: 'API Audience',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
