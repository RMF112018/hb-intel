/**
 * SPFx webpart entry point for Business Development.
 *
 * SharePoint calls onInit() → render() on this class.
 * This is the bridge between SharePoint page context and the React app.
 *
 * @see docs/architecture/plans/PH7-BW-1-SPFx-Entry-Points.md
 */
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { createRoot, type Root } from 'react-dom/client';
import { App } from '../../App.js';
// bootstrapSpfxAuth is available from @hbc/auth — wiring deferred to BW-2.
// import { bootstrapSpfxAuth } from '@hbc/auth';

export interface IBusinessDevelopmentWebPartProps {
  description: string;
}

/**
 * Business Development SPFx webpart.
 *
 * Lifecycle:
 * - onInit(): async bootstrap (auth bridge wired in BW-2)
 * - render(): mounts <App /> into this.domElement via React 18 createRoot
 * - onDispose(): unmounts React tree to prevent memory leaks
 */
export default class BusinessDevelopmentWebPart extends BaseClientSideWebPart<IBusinessDevelopmentWebPartProps> {
  private _root: Root | undefined;

  /**
   * Called by SharePoint before render(). This is the ONLY place where
   * `this.context` (WebPartContext) is available for async bootstrapping.
   *
   * TODO [BW-2]: Wire WebPartContext → ISpfxPageContext adapter and call
   * bootstrapSpfxAuth(). The type bridge does not exist yet — BW-2 will
   * create the adapter that extracts fields from this.context.pageContext.
   */
  public async onInit(): Promise<void> {
    await super.onInit();
    // await bootstrapSpfxAuth({ ... }); // BW-2: wire context adapter
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
          header: { description: 'Business Development Webpart Settings' },
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
