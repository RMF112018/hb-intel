import * as React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { HbcAppShell } from '@hbc/app-shell';

interface ITopPlaceholder {
  domElement: HTMLElement;
}

interface IPlaceholderProvider {
  tryCreateContent(name: 'Top'): ITopPlaceholder | undefined;
}

interface IApplicationCustomizerContext {
  placeholderProvider: IPlaceholderProvider;
}

/**
 * SPFx Application Customizer host for HB Intel global shell.
 * PH4.4 §4.2 | Blueprint §1f, §2c
 */
export class HbIntelHeaderApplicationCustomizer {
  private root: Root | null = null;
  private topPlaceholder: ITopPlaceholder | undefined;
  private readonly context: IApplicationCustomizerContext;

  public constructor(context: IApplicationCustomizerContext) {
    this.context = context;
  }

  public onInit(): void {
    this.injectSuiteBarSuppression();
    this.renderShell();
  }

  public onDispose(): void {
    this.root?.unmount();
    this.root = null;
    this.topPlaceholder = undefined;
  }

  private renderShell(): void {
    this.topPlaceholder = this.context.placeholderProvider.tryCreateContent('Top');

    if (!this.topPlaceholder) return;

    const container = document.createElement('div');
    container.setAttribute('data-hbc-spfx', 'global-shell');
    container.style.position = 'relative';
    container.style.zIndex = '10000';

    this.topPlaceholder.domElement.appendChild(container);

    this.root = createRoot(container);
    this.root.render(
      React.createElement(
        HbcAppShell,
        {
          mode: 'spfx',
          sidebarGroups: [],
          user: null,
        },
        React.createElement('div', { 'aria-hidden': true }),
      ),
    );
  }

  private injectSuiteBarSuppression(): void {
    const styleId = 'hbc-spfx-suite-bar-suppression';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = '.o365cs-topBar, #SuiteNavWrapper { display: none !important; }';
    document.head.appendChild(style);
  }
}
