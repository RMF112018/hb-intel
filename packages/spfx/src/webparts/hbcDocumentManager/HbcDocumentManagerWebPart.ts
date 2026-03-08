/**
 * SPFx webpart entry point for the standalone HBC Document Manager.
 *
 * Gap 5 fix: uses React 18 createRoot() (not ReactDom.render).
 * Gap 6 fix: onInit() bootstraps auth via resolveSpfxPermissions + bootstrapSpfxAuth.
 *
 * @see docs/architecture/plans/shared-features/SF01-T07-SPFx-Integration.md §4
 * @decision D-09 — standalone webpart surface
 */
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneDropdown,
  PropertyPaneToggle,
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { bootstrapSpfxAuth, resolveSpfxPermissions } from '@hbc/auth/spfx';
import type { DocumentContextType } from '@hbc/sharepoint-docs';
import { HbcDocumentManagerRoot } from './HbcDocumentManagerRoot.js';

export interface IHbcDocumentManagerWebPartProps {
  contextId: string;
  contextType: DocumentContextType;
  contextLabel: string;
  allowUpload: boolean;
}

export default class HbcDocumentManagerWebPart extends BaseClientSideWebPart<IHbcDocumentManagerWebPartProps> {
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
    this._root.render(
      createElement(HbcDocumentManagerRoot, {
        contextId: this.properties.contextId,
        contextType: this.properties.contextType,
        contextLabel: this.properties.contextLabel,
        allowUpload: this.properties.allowUpload,
      }),
    );
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
          header: { description: 'Document Manager Settings' },
          groups: [
            {
              groupName: 'Context',
              groupFields: [
                PropertyPaneTextField('contextId', {
                  label: 'Record ID',
                  description:
                    'The ID of the BD lead, pursuit, or project whose documents to show.',
                }),
                PropertyPaneDropdown('contextType', {
                  label: 'Context Type',
                  options: [
                    { key: 'bd-lead', text: 'BD Lead' },
                    { key: 'estimating-pursuit', text: 'Estimating Pursuit' },
                    { key: 'project', text: 'Project' },
                  ],
                }),
                PropertyPaneTextField('contextLabel', {
                  label: 'Display Label',
                  description:
                    'Human-readable name for this context (e.g., "Riverside Medical Center")',
                }),
                PropertyPaneToggle('allowUpload', {
                  label: 'Allow Upload',
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
