import { createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { ReferenceHomepageComposition } from './homepage/ReferenceHomepageComposition.js';

let root: Root | undefined;

export async function mount(el: HTMLElement, spfxContext?: WebPartContext): Promise<void> {
  void spfxContext;

  root = createRoot(el);
  root.render(createElement(ReferenceHomepageComposition));
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as { __hbIntel_hbWebparts?: typeof api }).__hbIntel_hbWebparts = api;
