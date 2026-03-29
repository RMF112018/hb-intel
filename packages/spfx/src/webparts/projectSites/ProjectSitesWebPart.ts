/**
 * SPFx web part entry point for Project Sites.
 *
 * Renders a self-contained year-selector + project-site card grid.
 * Year filtering is user-controlled via the in-UI selector, not
 * driven by hosting page metadata.
 *
 * Follows the HbcDocumentManagerWebPart pattern:
 *   - React 18 createRoot() (not ReactDom.render)
 *   - Auth bootstrap via resolveSpfxPermissions + bootstrapSpfxAuth
 */
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';
import { ProjectSitesRoot } from './ProjectSitesRoot.js';

export default class ProjectSitesWebPart extends BaseClientSideWebPart<Record<string, never>> {
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

    this._root.render(
      createElement(
        QueryClientProvider,
        { client: this._queryClient! },
        createElement(ProjectSitesRoot),
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
}
