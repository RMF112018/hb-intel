/**
 * SPFx webpart entry point for Project Setup Requests.
 *
 * SharePoint calls onInit() → render() on this class.
 * This is the bridge between SharePoint page context and the React app.
 *
 * Note: The file and class retain the "Estimating" naming because the SPFx
 * manifest references the alias "EstimatingWebPart". Renaming the file/class
 * would require a new webpart ID or manifest update. The package identity
 * has already been updated to @hbc/spfx-project-setup; this is the only
 * residual naming artifact and is safe to leave for backward compatibility.
 */
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { createRoot, type Root } from 'react-dom/client';
import { App } from '../../App.js';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';

export interface IEstimatingWebPartProps {
  description: string;
}

/**
 * Project Setup Requests SPFx webpart.
 *
 * Lifecycle:
 * - onInit(): async bootstrap (auth + RBAC permission mapping)
 * - render(): mounts <App /> into this.domElement via React 18 createRoot
 * - onDispose(): unmounts React tree to prevent memory leaks
 */
export default class EstimatingWebPart extends BaseClientSideWebPart<IEstimatingWebPartProps> {
  private _root: Root | undefined;

  public async onInit(): Promise<void> {
    await super.onInit();
    const permissionKeys = await resolveSpfxPermissions(this.context);
    await bootstrapSpfxAuth(this.context, permissionKeys);
  }

  public render(): void {
    if (!this._root) {
      this._root = createRoot(this.domElement);
    }
    this._root.render(<App spfxContext={this.context} />);
  }

  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
    super.onDispose();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Project Setup Requests Settings' },
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
