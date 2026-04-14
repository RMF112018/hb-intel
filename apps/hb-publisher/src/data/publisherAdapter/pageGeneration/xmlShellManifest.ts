/**
 * Canonical v1 page-shell manifest for the Article Publisher.
 *
 * Source of truth:
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/
 *     Project-Spotlight-In-Progress.page-template.xml
 *
 * This module is a typed, inert mirror of the canonical XML. The XML
 * file remains authoritative; this manifest is the engine's runtime
 * handle. When the XML is edited in an approved way, run
 * `parseProjectSpotlightShellXml` (see xmlShellParser.ts) against the
 * updated file to regenerate the manifest values here. The
 * control-IDs below exactly match those declared in the XML and in
 * architecture doc 05 §"Suggested logical mapping".
 *
 * v1 shell is locked to:
 *   - OOB Page Title (banner)
 *   - OOB Text (subheading)
 *   - OOB Text (body)
 *   - Custom teamViewer
 *   - OOB Image Gallery
 *
 * Any deviation requires a new PageShellKey and an architecture update
 * per arch doc 05 §"Future shell-family growth".
 */

export const PROJECT_SPOTLIGHT_SHELL_SOURCE_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight' as const;

export const PROJECT_SPOTLIGHT_SHELL_SOURCE_PAGE_PATH =
  'SitePages/Templates/Project-Spotlight---In-Progress.aspx' as const;

export const PROJECT_SPOTLIGHT_SHELL_KEY_V1 =
  'ps-shell-inprogress-oob-banner-team-gallery-v1' as const;

export const PROJECT_SPOTLIGHT_SHELL_VERSION_V1 = '1.0.0' as const;

export type PageShellSlot =
  | 'banner'
  | 'subhead'
  | 'body'
  | 'team'
  | 'gallery';

export type PageShellSectionLayout = 'OneColumn' | 'OneColumnFullWidth';

export type PageShellWebPartType =
  | 'PageTitle'
  | 'Text'
  | 'ImageGallery'
  | 'Custom';

export interface PageShellControl {
  readonly slot: PageShellSlot;
  readonly webPartType: PageShellWebPartType;
  /** Canvas ControlId — stable identifier across page regenerations. */
  readonly controlId: string;
  readonly sectionOrder: number;
  readonly orderInSection: number;
  readonly column: number;
}

export interface PageShellSection {
  readonly order: number;
  readonly layout: PageShellSectionLayout;
  readonly controls: readonly PageShellControl[];
}

export interface PageShellManifest {
  readonly shellKey: string;
  readonly shellVersion: string;
  readonly sourceSiteUrl: string;
  readonly sourcePagePath: string;
  readonly pageTitle: string;
  readonly header: {
    readonly layoutType: 'FullWidthImage';
    readonly showTopicHeader: boolean;
    readonly showPublishDate: boolean;
    readonly showBackgroundGradient: boolean;
  };
  readonly sections: readonly PageShellSection[];
  /** Fast lookup: slot → control metadata. */
  readonly controlsBySlot: Readonly<Record<PageShellSlot, PageShellControl>>;
}

const BANNER: PageShellControl = {
  slot: 'banner',
  webPartType: 'PageTitle',
  controlId: 'cbe7b0a9-3504-44dd-a3a3-0e5cacd07788',
  sectionOrder: 1,
  orderInSection: 1,
  column: 1,
};

const SUBHEAD: PageShellControl = {
  slot: 'subhead',
  webPartType: 'Text',
  controlId: '00dbc510-122b-4798-9d90-241e291eedc1',
  sectionOrder: 2,
  orderInSection: 1,
  column: 1,
};

const BODY: PageShellControl = {
  slot: 'body',
  webPartType: 'Text',
  controlId: 'd4061c71-b2b5-4e25-804d-ae92e8a56832',
  sectionOrder: 2,
  orderInSection: 2,
  column: 1,
};

const TEAM: PageShellControl = {
  slot: 'team',
  webPartType: 'Custom',
  controlId: 'c2f1b4e7-3a48-4d21-9c5e-7b82d4a6f901',
  sectionOrder: 2,
  orderInSection: 3,
  column: 1,
};

const GALLERY: PageShellControl = {
  slot: 'gallery',
  webPartType: 'ImageGallery',
  controlId: 'af8be689-990e-492a-81f7-ba3e4cd3ed9c',
  sectionOrder: 3,
  orderInSection: 1,
  column: 1,
};

export const PROJECT_SPOTLIGHT_V1_SHELL: PageShellManifest = {
  shellKey: PROJECT_SPOTLIGHT_SHELL_KEY_V1,
  shellVersion: PROJECT_SPOTLIGHT_SHELL_VERSION_V1,
  sourceSiteUrl: PROJECT_SPOTLIGHT_SHELL_SOURCE_SITE_URL,
  sourcePagePath: PROJECT_SPOTLIGHT_SHELL_SOURCE_PAGE_PATH,
  pageTitle: 'Project Spotlight - In Progress',
  header: {
    layoutType: 'FullWidthImage',
    showTopicHeader: false,
    showPublishDate: false,
    showBackgroundGradient: false,
  },
  sections: [
    { order: 1, layout: 'OneColumnFullWidth', controls: [BANNER] },
    { order: 2, layout: 'OneColumn', controls: [SUBHEAD, BODY, TEAM] },
    { order: 3, layout: 'OneColumn', controls: [GALLERY] },
  ],
  controlsBySlot: {
    banner: BANNER,
    subhead: SUBHEAD,
    body: BODY,
    team: TEAM,
    gallery: GALLERY,
  },
};
