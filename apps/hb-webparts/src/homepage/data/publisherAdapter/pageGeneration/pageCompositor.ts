/**
 * Pure page compositor.
 *
 * Consumes a `PublishResolutionContext` + a `PageShellManifest` and emits a
 * `ComposedPage` — the structured handle the page-creation service POSTs
 * to SharePoint. No I/O, no date mutation, no DOM.
 *
 * Authority:
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/05-Template-Registry-Schema.md
 *   docs/architecture/plans/MASTER/spfx/publisher/architecture/07-Webpart-Input-Contracts.md
 *
 * Each logical slot produces a strongly-typed payload:
 *   banner  → BannerControlPayload
 *   subhead → TextControlPayload
 *   body    → TextControlPayload
 *   team    → TeamViewerControlPayload (matches the teamViewer JsonControlData shape)
 *   gallery → ImageGalleryControlPayload
 *
 * The compositor respects the template entry's ShowTeamBlock /
 * ShowGalleryBlock flags and the renderer-kind / renderer-none markers —
 * suppressed blocks produce `{ slot, visible:false }` entries so downstream
 * services can either drop the control or render an empty placeholder
 * (SharePoint Pages REST accepts either).
 */

import type { PublisherMediaRow, PublisherPostRow, PublisherTeamMemberRow } from '../publisherContracts';
import type { PublishResolutionContext } from '../publishResolutionContext';
import type { PageShellManifest, PageShellSlot } from './xmlShellManifest';

export interface ComposedControlBase {
  readonly slot: PageShellSlot;
  readonly controlId: string;
  readonly sectionOrder: number;
  readonly orderInSection: number;
  readonly column: number;
  readonly visible: boolean;
}

export interface BannerControlPayload extends ComposedControlBase {
  readonly slot: 'banner';
  readonly visible: true;
  readonly title: string;
  readonly imageUrl: string;
  readonly imageAltText: string;
  readonly eyebrow?: string;
  readonly categoryLabel?: string;
  readonly showPublishDate: boolean;
  readonly showBackgroundGradient: boolean;
  readonly layoutType: 'FullWidthImage';
  readonly themeVariant: 'default' | 'light' | 'dark';
}

export interface TextControlPayload extends ComposedControlBase {
  readonly slot: 'subhead' | 'body';
  readonly visible: true;
  readonly text: string;
}

export interface TeamViewerControlPayload extends ComposedControlBase {
  readonly slot: 'team';
  readonly webPartType: 'Custom';
  readonly properties: {
    readonly heading: string;
    readonly articleId: string;
    readonly destinationKey: 'projectSpotlight';
    readonly listHostOverride?: string;
    readonly layout: 'grid' | 'list';
    readonly density: 'standard' | 'compact' | 'comfortable';
    readonly featureFlags: { readonly profileDetailDrawer: boolean };
  };
}

export interface ImageGalleryControlPayload extends ComposedControlBase {
  readonly slot: 'gallery';
  readonly visible: true;
  readonly images: readonly {
    readonly imageUrl: string;
    readonly altText: string;
    readonly caption?: string;
  }[];
  readonly layoutProfile: 'grid' | 'carousel' | 'shellDefault';
  readonly maxImagesCount: number;
}

export interface HiddenControlPayload extends ComposedControlBase {
  readonly visible: false;
  readonly reason: 'templateDisabled' | 'rendererNone' | 'noContent';
}

export type ComposedControl =
  | BannerControlPayload
  | TextControlPayload
  | TeamViewerControlPayload
  | ImageGalleryControlPayload
  | HiddenControlPayload;

export type VisibleComposedControl =
  | BannerControlPayload
  | TextControlPayload
  | TeamViewerControlPayload
  | ImageGalleryControlPayload;

export function isVisibleControl(
  c: ComposedControl,
): c is VisibleComposedControl {
  return c.visible === true;
}

export interface ComposedPageIdentity {
  readonly postId: string;
  readonly slug: string;
  readonly pageName: string;
  readonly pageTitle: string;
  readonly targetSiteUrl: string;
  readonly shellKey: string;
  readonly shellVersion: string;
  readonly templateKey: string;
  readonly templateVersion: string;
  readonly sourceTemplatePath: string;
}

export interface ComposedPage {
  readonly identity: ComposedPageIdentity;
  readonly header: PageShellManifest['header'] & { readonly title: string };
  readonly controls: readonly ComposedControl[];
  readonly shell: PageShellManifest;
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function sortedTeamMembers(
  rows: readonly PublisherTeamMemberRow[],
): readonly PublisherTeamMemberRow[] {
  return rows
    .filter((r) => r.IncludeInViewer !== false)
    .slice()
    .sort((a, b) => {
      const ao = a.SortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.SortOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.DisplayName.localeCompare(b.DisplayName);
    });
}

function galleryImages(
  rows: readonly PublisherMediaRow[],
): readonly PublisherMediaRow[] {
  return rows
    .filter((r) => r.MediaRole === 'gallery')
    .slice()
    .sort((a, b) => {
      const ao = a.SortOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.SortOrder ?? Number.MAX_SAFE_INTEGER;
      return ao - bo;
    });
}

function resolvePageName(post: PublisherPostRow): string {
  if (post.GeneratedPageName && post.GeneratedPageName.trim().length > 0) {
    return post.GeneratedPageName.trim();
  }
  return `${post.Slug}.aspx`;
}

/* ── Per-slot composers ─────────────────────────────────────────── */

function composeBanner(
  context: PublishResolutionContext,
  shell: PageShellManifest,
): BannerControlPayload {
  const { post } = context;
  const control = shell.controlsBySlot.banner;
  const title =
    (post.BannerTitleOverride && post.BannerTitleOverride.trim().length > 0
      ? post.BannerTitleOverride
      : post.Title) ?? post.Title;
  return {
    slot: 'banner',
    visible: true,
    controlId: control.controlId,
    sectionOrder: control.sectionOrder,
    orderInSection: control.orderInSection,
    column: control.column,
    title,
    imageUrl: post.BannerImageUrl,
    imageAltText: post.BannerImageAltText,
    eyebrow: post.BannerEyebrow,
    categoryLabel: post.BannerCategoryLabel,
    showPublishDate: post.BannerShowPublishDate ?? false,
    showBackgroundGradient: post.BannerShowGradient ?? false,
    layoutType: 'FullWidthImage',
    themeVariant: post.BannerThemeVariant ?? 'default',
  };
}

function composeSubhead(
  context: PublishResolutionContext,
  shell: PageShellManifest,
): TextControlPayload {
  const control = shell.controlsBySlot.subhead;
  return {
    slot: 'subhead',
    visible: true,
    controlId: control.controlId,
    sectionOrder: control.sectionOrder,
    orderInSection: control.orderInSection,
    column: control.column,
    text: `<h3>${context.post.Subhead}</h3>`,
  };
}

function composeBody(
  context: PublishResolutionContext,
  shell: PageShellManifest,
): TextControlPayload {
  const control = shell.controlsBySlot.body;
  return {
    slot: 'body',
    visible: true,
    controlId: control.controlId,
    sectionOrder: control.sectionOrder,
    orderInSection: control.orderInSection,
    column: control.column,
    text: context.post.BodyRichText,
  };
}

function composeTeam(
  context: PublishResolutionContext,
  shell: PageShellManifest,
): TeamViewerControlPayload | HiddenControlPayload {
  const control = shell.controlsBySlot.team;
  const { post, template } = context;

  if (!template.ShowTeamBlock || template.TeamRendererKind === 'none') {
    return {
      slot: 'team',
      visible: false,
      controlId: control.controlId,
      sectionOrder: control.sectionOrder,
      orderInSection: control.orderInSection,
      column: control.column,
      reason: 'templateDisabled',
    };
  }

  if (post.ShowTeamViewer === false) {
    return {
      slot: 'team',
      visible: false,
      controlId: control.controlId,
      sectionOrder: control.sectionOrder,
      orderInSection: control.orderInSection,
      column: control.column,
      reason: 'templateDisabled',
    };
  }

  const visibleMembers = sortedTeamMembers(context.teamMembers);
  if (visibleMembers.length === 0) {
    return {
      slot: 'team',
      visible: false,
      controlId: control.controlId,
      sectionOrder: control.sectionOrder,
      orderInSection: control.orderInSection,
      column: control.column,
      reason: 'noContent',
    };
  }

  return {
    slot: 'team',
    visible: true,
    webPartType: 'Custom',
    controlId: control.controlId,
    sectionOrder: control.sectionOrder,
    orderInSection: control.orderInSection,
    column: control.column,
    properties: {
      heading: post.TeamSectionHeading ?? 'Team',
      articleId: post.PostId,
      destinationKey: 'projectSpotlight',
      listHostOverride: undefined,
      layout: post.TeamViewerLayout ?? 'grid',
      density: post.TeamViewerDensity ?? 'standard',
      featureFlags: {
        profileDetailDrawer: post.TeamViewerEnableProfileDrawer ?? false,
      },
    },
  };
}

function composeGallery(
  context: PublishResolutionContext,
  shell: PageShellManifest,
): ImageGalleryControlPayload | HiddenControlPayload {
  const control = shell.controlsBySlot.gallery;
  const { post, template } = context;

  if (!template.ShowGalleryBlock || template.GalleryRendererKind === 'none') {
    return {
      slot: 'gallery',
      visible: false,
      controlId: control.controlId,
      sectionOrder: control.sectionOrder,
      orderInSection: control.orderInSection,
      column: control.column,
      reason: 'templateDisabled',
    };
  }

  if (post.ShowGallery === false) {
    return {
      slot: 'gallery',
      visible: false,
      controlId: control.controlId,
      sectionOrder: control.sectionOrder,
      orderInSection: control.orderInSection,
      column: control.column,
      reason: 'templateDisabled',
    };
  }

  const images = galleryImages(context.media).map((r) => ({
    imageUrl: r.ImageAssetUrl,
    altText: r.AltText,
    caption: r.Caption,
  }));

  if (images.length === 0) {
    return {
      slot: 'gallery',
      visible: false,
      controlId: control.controlId,
      sectionOrder: control.sectionOrder,
      orderInSection: control.orderInSection,
      column: control.column,
      reason: 'noContent',
    };
  }

  return {
    slot: 'gallery',
    visible: true,
    controlId: control.controlId,
    sectionOrder: control.sectionOrder,
    orderInSection: control.orderInSection,
    column: control.column,
    images,
    layoutProfile: post.GalleryLayoutProfile ?? 'shellDefault',
    maxImagesCount: 10,
  };
}

/* ── Entry point ─────────────────────────────────────────────────── */

export function composeProjectSpotlightPage(
  context: PublishResolutionContext,
  shell: PageShellManifest,
): ComposedPage {
  const { post, template } = context;
  const identity: ComposedPageIdentity = {
    postId: post.PostId,
    slug: post.Slug,
    pageName: resolvePageName(post),
    pageTitle: post.Title,
    targetSiteUrl: post.TargetSiteUrl,
    shellKey: shell.shellKey,
    shellVersion: shell.shellVersion,
    templateKey: template.TemplateKey,
    templateVersion: template.TemplateVersion,
    sourceTemplatePath: post.SourceTemplatePath,
  };

  const controls: ComposedControl[] = [
    composeBanner(context, shell),
    composeSubhead(context, shell),
    composeBody(context, shell),
    composeTeam(context, shell),
    composeGallery(context, shell),
  ];

  return {
    identity,
    header: {
      ...shell.header,
      title: post.Title,
    },
    controls,
    shell,
  };
}

/**
 * Validate that a composed page satisfies the v1 structural expectations
 * documented in arch 05 / prompt-04 spec. Returns a list of human-
 * readable messages; empty list means the page is structurally valid.
 */
export function validateComposedPageStructure(page: ComposedPage): string[] {
  const errors: string[] = [];
  const slots: readonly PageShellSlot[] = ['banner', 'subhead', 'body', 'team', 'gallery'];
  for (const slot of slots) {
    const matches = page.controls.filter((c) => c.slot === slot);
    if (matches.length === 0) {
      errors.push(`missing slot: ${slot}`);
    } else if (matches.length > 1) {
      errors.push(`duplicate slot: ${slot}`);
    }
  }
  const banner = page.controls.find((c) => c.slot === 'banner');
  if (banner && banner.visible) {
    if (!(banner as BannerControlPayload).imageUrl) {
      errors.push('banner imageUrl is empty');
    }
    if (!(banner as BannerControlPayload).imageAltText) {
      errors.push('banner imageAltText is empty');
    }
  }
  const subhead = page.controls.find((c) => c.slot === 'subhead');
  if (subhead?.visible && !(subhead as TextControlPayload).text) {
    errors.push('subhead text is empty');
  }
  const body = page.controls.find((c) => c.slot === 'body');
  if (body?.visible && !(body as TextControlPayload).text) {
    errors.push('body text is empty');
  }
  return errors;
}
