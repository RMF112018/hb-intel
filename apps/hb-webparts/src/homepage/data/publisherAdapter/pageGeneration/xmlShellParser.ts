/**
 * PnP ProvisioningSchema XML → typed `PageShellManifest` parser.
 *
 * Pure, side-effect-free. The engine does not call this at runtime in v1
 * (the manifest is committed in `xmlShellManifest.ts`); the parser exists
 * to (a) unit-test that the committed manifest matches the canonical XML,
 * and (b) support future shell variants without hand-transcribing control
 * IDs into code.
 *
 * Only the fields the v1 generator cares about are parsed: page title,
 * header flags, sections, and canvas controls (webPartType, controlId,
 * section/order/column). JsonControlData payloads inside the XML are
 * intentionally ignored — those are template defaults, not per-post
 * content; the compositor owns per-post control payloads.
 */

import type {
  PageShellControl,
  PageShellManifest,
  PageShellSectionLayout,
  PageShellSlot,
  PageShellWebPartType,
} from './xmlShellManifest';
import {
  PROJECT_SPOTLIGHT_SHELL_KEY_V1,
  PROJECT_SPOTLIGHT_SHELL_SOURCE_PAGE_PATH,
  PROJECT_SPOTLIGHT_SHELL_SOURCE_SITE_URL,
  PROJECT_SPOTLIGHT_SHELL_VERSION_V1,
} from './xmlShellManifest';

export interface ParseShellOptions {
  readonly shellKey?: string;
  readonly shellVersion?: string;
  readonly sourceSiteUrl?: string;
  readonly sourcePagePath?: string;
  /**
   * Ordered control-id → slot map. The parser can't infer semantic
   * slots from PnP XML alone; the caller supplies the mapping (usually
   * from the template registry `ControlMapJson`). Defaults to the v1
   * canonical mapping when omitted.
   */
  readonly controlIdToSlot?: Readonly<Record<string, PageShellSlot>>;
}

export type ParseShellResult =
  | { readonly ok: true; readonly manifest: PageShellManifest }
  | { readonly ok: false; readonly reason: string };

const DEFAULT_CONTROL_ID_TO_SLOT: Record<string, PageShellSlot> = {
  'cbe7b0a9-3504-44dd-a3a3-0e5cacd07788': 'banner',
  '00dbc510-122b-4798-9d90-241e291eedc1': 'subhead',
  'd4061c71-b2b5-4e25-804d-ae92e8a56832': 'body',
  'c2f1b4e7-3a48-4d21-9c5e-7b82d4a6f901': 'team',
  'af8be689-990e-492a-81f7-ba3e4cd3ed9c': 'gallery',
};

function readIntAttr(el: Element, name: string): number | undefined {
  const raw = el.getAttribute(name);
  if (raw === null) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function readBoolAttr(el: Element, name: string): boolean | undefined {
  const raw = el.getAttribute(name);
  if (raw === null) return undefined;
  const n = raw.trim().toLowerCase();
  if (n === 'true') return true;
  if (n === 'false') return false;
  return undefined;
}

const WEBPART_TYPES: readonly PageShellWebPartType[] = [
  'PageTitle',
  'Text',
  'ImageGallery',
  'Custom',
];

const SECTION_LAYOUTS: readonly PageShellSectionLayout[] = [
  'OneColumn',
  'OneColumnFullWidth',
];

/**
 * Parse a PnP ProvisioningSchema XML string that contains exactly one
 * ClientSidePage. Returns a typed manifest or a typed failure.
 */
export function parseProjectSpotlightShellXml(
  xml: string,
  options: ParseShellOptions = {},
): ParseShellResult {
  if (typeof DOMParser === 'undefined') {
    return {
      ok: false,
      reason:
        'DOMParser is unavailable in this runtime. Call the parser from a browser / jsdom environment.',
    };
  }

  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const parserError = doc.getElementsByTagName('parsererror')[0];
  if (parserError) {
    return { ok: false, reason: `XML parse error: ${parserError.textContent ?? 'unknown'}` };
  }

  const pages = doc.getElementsByTagNameNS('*', 'ClientSidePage');
  if (pages.length === 0) {
    return { ok: false, reason: 'No ClientSidePage element found.' };
  }
  if (pages.length > 1) {
    return {
      ok: false,
      reason: `Expected exactly one ClientSidePage, found ${pages.length}.`,
    };
  }
  const page = pages[0]!;

  const headerEl = page.getElementsByTagNameNS('*', 'Header')[0];
  if (!headerEl) {
    return { ok: false, reason: 'ClientSidePage is missing its Header element.' };
  }

  const layoutType = headerEl.getAttribute('LayoutType');
  if (layoutType !== 'FullWidthImage') {
    return {
      ok: false,
      reason: `Unexpected header LayoutType '${layoutType ?? '(missing)'}'; v1 shell requires FullWidthImage.`,
    };
  }

  const sectionEls = Array.from(
    page.getElementsByTagNameNS('*', 'Section'),
  ) as Element[];

  if (sectionEls.length === 0) {
    return { ok: false, reason: 'ClientSidePage has no Section elements.' };
  }

  const controlIdToSlot = options.controlIdToSlot ?? DEFAULT_CONTROL_ID_TO_SLOT;
  const sections = sectionEls
    .map((sectionEl) => {
      const order = readIntAttr(sectionEl, 'Order');
      const layoutRaw = sectionEl.getAttribute('Type');
      const layout =
        layoutRaw && (SECTION_LAYOUTS as readonly string[]).includes(layoutRaw)
          ? (layoutRaw as PageShellSectionLayout)
          : undefined;
      if (order === undefined || !layout) return undefined;

      const controlEls = Array.from(
        sectionEl.getElementsByTagNameNS('*', 'CanvasControl'),
      ) as Element[];
      const controls: PageShellControl[] = [];
      for (const controlEl of controlEls) {
        const webPartTypeRaw = controlEl.getAttribute('WebPartType');
        const controlId = controlEl.getAttribute('ControlId');
        const orderInSection = readIntAttr(controlEl, 'Order');
        const column = readIntAttr(controlEl, 'Column');
        if (
          !webPartTypeRaw ||
          !(WEBPART_TYPES as readonly string[]).includes(webPartTypeRaw) ||
          !controlId ||
          orderInSection === undefined ||
          column === undefined
        ) {
          continue;
        }
        const slot = controlIdToSlot[controlId];
        if (!slot) continue;
        controls.push({
          slot,
          webPartType: webPartTypeRaw as PageShellWebPartType,
          controlId,
          sectionOrder: order,
          orderInSection,
          column,
        });
      }
      return { order, layout, controls };
    })
    .filter((s): s is { order: number; layout: PageShellSectionLayout; controls: PageShellControl[] } => !!s)
    .sort((a, b) => a.order - b.order);

  const allControls = sections.flatMap((s) => s.controls);
  const missingSlots = (Object.keys(controlIdToSlot) as string[])
    .map((id) => controlIdToSlot[id]!)
    .filter((slot) => !allControls.some((c) => c.slot === slot));
  if (missingSlots.length > 0) {
    return {
      ok: false,
      reason: `Shell parse incomplete: missing slots ${missingSlots.join(', ')}.`,
    };
  }

  const controlsBySlot = {
    banner: allControls.find((c) => c.slot === 'banner')!,
    subhead: allControls.find((c) => c.slot === 'subhead')!,
    body: allControls.find((c) => c.slot === 'body')!,
    team: allControls.find((c) => c.slot === 'team')!,
    gallery: allControls.find((c) => c.slot === 'gallery')!,
  };

  return {
    ok: true,
    manifest: {
      shellKey: options.shellKey ?? PROJECT_SPOTLIGHT_SHELL_KEY_V1,
      shellVersion:
        options.shellVersion ?? PROJECT_SPOTLIGHT_SHELL_VERSION_V1,
      sourceSiteUrl:
        options.sourceSiteUrl ?? PROJECT_SPOTLIGHT_SHELL_SOURCE_SITE_URL,
      sourcePagePath:
        options.sourcePagePath ?? PROJECT_SPOTLIGHT_SHELL_SOURCE_PAGE_PATH,
      pageTitle: page.getAttribute('Title') ?? 'Project Spotlight',
      header: {
        layoutType: 'FullWidthImage',
        showTopicHeader: readBoolAttr(headerEl, 'ShowTopicHeader') ?? false,
        showPublishDate: readBoolAttr(headerEl, 'ShowPublishDate') ?? false,
        showBackgroundGradient:
          readBoolAttr(headerEl, 'ShowBackgroundGradient') ?? false,
      },
      sections,
      controlsBySlot,
    },
  };
}
