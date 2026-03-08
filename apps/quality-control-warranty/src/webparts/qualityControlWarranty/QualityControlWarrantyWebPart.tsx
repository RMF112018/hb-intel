/**
 * SPFx webpart entry point for Quality Control Warranty.
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
import { createRoot, type Root } from 'react-dom/client';
import { App } from '../../App.js';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';

export interface IQualityControlWarrantyWebPartProps {
  description: string;
}

/**
 * Quality Control Warranty SPFx webpart.
 *
 * Lifecycle:
 * - onInit(): async bootstrap (auth bridge wired in BW-2)
 * - render(): mounts <App /> into this.domElement via React 18 createRoot
 * - onDispose(): unmounts React tree to prevent memory leaks
 */
export default class QualityControlWarrantyWebPart extends BaseClientSideWebPart<IQualityControlWarrantyWebPartProps> {
  private _root: Root | undefined;

  /**
   * Called by SharePoint before render(). Resolves SP group membership
   * into HB Intel permission keys, then bootstraps the auth store.
   *
   * @decision D-PH7-BW-7 — RBAC permission mapping
   */
  public async onInit(): Promise<void> {
    await super.onInit();
    const permissionKeys = await resolveSpfxPermissions(this.context);
    await bootstrapSpfxAuth(this.context, permissionKeys);
  }

  /**
   * Mounts the React application into the SharePoint-provided DOM element.
   * Uses React 18 createRoot for concurrent mode support.
   */
  public render(): void {
    if (!this._root) {
      this._root = createRoot(this.domElement);
    }
    this._root.render(<App />);
  }

  /**
   * Cleans up the React root when SharePoint removes the webpart.
   * Prevents memory leaks from orphaned React trees.
   */
  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
    super.onDispose();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Quality Control Warranty Webpart Settings' },
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
