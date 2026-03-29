/**
 * SPFx web part entry point for Project Sites.
 *
 * Renders project-site link cards for all Projects list items whose Year
 * matches the hosting page's Year property in HBCentral/SitePages.
 *
 * Follows the HbcDocumentManagerWebPart pattern:
 *   - React 18 createRoot() (not ReactDom.render)
 *   - Auth bootstrap via resolveSpfxPermissions + bootstrapSpfxAuth
 *   - Property pane for admin override
 *
 * @see .claude/plans/project-sites-webpart-validation-and-architecture-report.md
 */
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';
import type { IProjectSitesWebPartProps } from './types.js';
import { resolvePageYear } from './resolvePageYear.js';
import { ProjectSitesRoot } from './ProjectSitesRoot.js';

export default class ProjectSitesWebPart extends BaseClientSideWebPart<IProjectSitesWebPartProps> {
  private _root: Root | undefined;
  private _queryClient: QueryClient | undefined;

  public async onInit(): Promise<void> {
    await super.onInit();
    const permissionKeys = await resolveSpfxPermissions(this.context);
    await bootstrapSpfxAuth(this.context, permissionKeys);
    this._queryClient = new QueryClient({
      defaultOptions: {
        queries: { refetchOnWindowFocus: false },
      },
    });
  }

  public render(): void {
    if (!this._root) {
      this._root = createRoot(this.domElement);
    }

    const resolvedYear = resolvePageYear(
      this.context,
      this.properties.yearOverride,
    );

    this._root.render(
      createElement(
        QueryClientProvider,
        { client: this._queryClient! },
        createElement(ProjectSitesRoot, { resolvedYear }),
      ),
    );
  }

  protected onDispose(): void {
    this._root?.unmount();
    this._root = undefined;
    this._queryClient?.clear();
    this._queryClient = undefined;
    super.onDispose();
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: { description: 'Project Sites Settings' },
          groups: [
            {
              groupName: 'Year Configuration',
              groupFields: [
                PropertyPaneTextField('yearOverride', {
                  label: 'Year Override',
                  description:
                    'Set a 4-digit year (e.g. 2026) to override page metadata. ' +
                    'Leave as 0 to use the hosting page\'s Year property.',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
