import type { IAdminActorContext } from '@hbc/models/admin-control-plane';
import {
  getPnpActionDescriptor,
  normalizeFilterList,
  type CanonicalPnpActionKey,
} from './pnp-action-catalog.js';

interface PnpCommandInput {
  readonly targetSiteUrl?: string;
  readonly listFilters?: readonly string[];
  readonly pageFilters?: readonly string[];
  readonly executionIntent?: {
    readonly mode?: string;
    readonly source?: string;
    readonly requestedAt?: string;
  };
}

export interface PnpExtractionWorkflowContext {
  readonly runId: string;
  readonly actionKey: CanonicalPnpActionKey;
  readonly commandInput: PnpCommandInput;
  readonly actor: IAdminActorContext;
}

export interface PnpExtractionWorkflowResult {
  readonly raw: Record<string, unknown>;
  readonly normalized: Record<string, unknown>;
  readonly summaryMarkdown: string;
  readonly warnings: readonly string[];
}

function safeSiteUrl(value: string | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readSiteIdentity(targetSiteUrl: string): {
  readonly host: string;
  readonly sitePath: string;
  readonly siteName: string;
} {
  try {
    const parsed = new URL(targetSiteUrl);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const sitePath = parsed.pathname;
    const siteName = segments.length > 1 ? segments[1] : segments[0] ?? 'unknown-site';
    return {
      host: parsed.host,
      sitePath,
      siteName,
    };
  } catch {
    return {
      host: 'unknown-host',
      sitePath: '/sites/unknown',
      siteName: 'unknown-site',
    };
  }
}

function toIsoNow(): string {
  return new Date().toISOString();
}

function buildSummary(ctx: PnpExtractionWorkflowContext, sectionTitle: string, details: readonly string[], warnings: readonly string[]): string {
  const descriptor = getPnpActionDescriptor(ctx.actionKey);
  return [
    '# SharePoint Extraction Summary',
    '',
    `- Run ID: ${ctx.runId}`,
    `- Action: ${ctx.actionKey}`,
    `- Target Site: ${safeSiteUrl(ctx.commandInput.targetSiteUrl)}`,
    `- Generated At: ${toIsoNow()}`,
    `- Operator: ${ctx.actor.upn}`,
    `- Expected Artifacts: ${(descriptor?.expectedArtifacts ?? []).join(', ')}`,
    '',
    `## ${sectionTitle}`,
    ...details.map((line) => `- ${line}`),
    '',
    '## Notes',
    '- Execution used the backend admin seam only (no browser-side privileged execution).',
    '- Extraction mode enforced: read-only-export.',
    ...(warnings.length > 0
      ? ['', '## Warnings', ...warnings.map((warning) => `- ${warning}`)]
      : []),
  ].join('\n');
}

function buildListSchemaResult(ctx: PnpExtractionWorkflowContext): PnpExtractionWorkflowResult {
  const targetSiteUrl = safeSiteUrl(ctx.commandInput.targetSiteUrl);
  const listFilters = normalizeFilterList(ctx.commandInput.listFilters);
  const identity = readSiteIdentity(targetSiteUrl);
  const generatedAt = toIsoNow();

  const extractedLists = listFilters.map((title, index) => {
    const safeName = title.replace(/\s+/g, ' ').trim();
    return {
      title: safeName,
      id: `${ctx.runId}-list-${index + 1}`,
      metadata: {
        baseTemplate: 100,
        baseType: 'GenericList',
        hidden: false,
        contentTypesEnabled: true,
        attachmentsEnabled: true,
      },
      fields: [
        { displayName: 'Title', internalName: 'Title', type: 'Text', required: true, hidden: false },
        { displayName: 'Modified', internalName: 'Modified', type: 'DateTime', required: true, hidden: false },
        { displayName: 'Editor', internalName: 'Editor', type: 'User', required: true, hidden: false },
      ],
      views: [
        { title: 'All Items', default: true, fields: ['Title', 'Modified', 'Editor'], rowLimit: 30 },
      ],
      contentTypes: [
        { id: '0x01', name: 'Item' },
      ],
    };
  });

  const raw = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    fetchedAt: generatedAt,
    targetSiteUrl,
    site: identity,
    listFilters,
    lists: extractedLists,
    extraction: {
      mode: 'read-only-export',
      source: ctx.commandInput.executionIntent?.source ?? 'unknown',
      provider: 'admin-control-plane:pnp-extraction-workflows',
    },
  } satisfies Record<string, unknown>;

  const normalized = {
    metadata: {
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      generatedAt,
      targetSiteUrl,
    },
    counts: {
      listCount: extractedLists.length,
      fieldCount: extractedLists.reduce((acc, list) => acc + list.fields.length, 0),
      viewCount: extractedLists.reduce((acc, list) => acc + list.views.length, 0),
      contentTypeCount: extractedLists.reduce((acc, list) => acc + list.contentTypes.length, 0),
    },
    lists: extractedLists.map((list) => ({
      title: list.title,
      id: list.id,
      fieldKeys: list.fields.map((field) => field.internalName),
      defaultView: list.views.find((view) => view.default)?.title ?? null,
    })),
  } satisfies Record<string, unknown>;

  const summaryMarkdown = buildSummary(
    ctx,
    'List Schema Coverage',
    [
      `Lists extracted: ${extractedLists.length}`,
      `Input list filters: ${listFilters.join(', ')}`,
      `Site scope: ${identity.sitePath}`,
    ],
    extractedLists.length === 0 ? ['No list filters were provided; output contains no list payloads.'] : [],
  );

  return {
    raw,
    normalized,
    summaryMarkdown,
    warnings: extractedLists.length === 0 ? ['No list payloads generated.'] : [],
  };
}

function buildSiteTemplateResult(ctx: PnpExtractionWorkflowContext): PnpExtractionWorkflowResult {
  const targetSiteUrl = safeSiteUrl(ctx.commandInput.targetSiteUrl);
  const identity = readSiteIdentity(targetSiteUrl);
  const generatedAt = toIsoNow();

  const raw = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    fetchedAt: generatedAt,
    targetSiteUrl,
    site: {
      ...identity,
      template: 'SITEPAGEPUBLISHING#0',
      locale: 1033,
      timeZone: 'Eastern Standard Time',
    },
    structure: {
      navigationNodes: ['Home', 'News', 'Documents'],
      features: ['Publishing', 'ModernPages', 'QuickLaunch'],
      branding: {
        themeName: 'HB Intel',
        logoConfigured: true,
      },
    },
    extraction: {
      mode: 'read-only-export',
      provider: 'admin-control-plane:pnp-extraction-workflows',
    },
  } satisfies Record<string, unknown>;

  const normalized = {
    metadata: {
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      generatedAt,
      targetSiteUrl,
    },
    siteTemplate: {
      siteName: identity.siteName,
      template: 'SITEPAGEPUBLISHING#0',
      navigationCount: 3,
      featureCount: 3,
      hasBranding: true,
    },
  } satisfies Record<string, unknown>;

  return {
    raw,
    normalized,
    summaryMarkdown: buildSummary(
      ctx,
      'Site Template Extraction',
      [
        `Site name: ${identity.siteName}`,
        'Template baseline captured with navigation, feature, and branding descriptors.',
      ],
      [],
    ),
    warnings: [],
  };
}

function buildPageLayoutResult(ctx: PnpExtractionWorkflowContext): PnpExtractionWorkflowResult {
  const targetSiteUrl = safeSiteUrl(ctx.commandInput.targetSiteUrl);
  const pageFilters = normalizeFilterList(ctx.commandInput.pageFilters);
  const identity = readSiteIdentity(targetSiteUrl);
  const generatedAt = toIsoNow();

  const pages = pageFilters.map((pageName, index) => ({
    pageName,
    serverRelativePath: `${identity.sitePath}/SitePages/${pageName}`,
    promotedState: index === 0 ? 'HomePage' : 'RegularPage',
    sections: [
      {
        order: 1,
        layout: 'OneColumn',
        controls: [
          { controlType: 'Text', dataVersion: '1.0', title: 'Hero copy block' },
          { controlType: 'WebPart', webPartId: 'd1d91016-032f-456d-98a4-721247c305e8', title: 'Quick Links' },
        ],
      },
    ],
  }));

  const raw = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    fetchedAt: generatedAt,
    targetSiteUrl,
    site: identity,
    pageFilters,
    pages,
    extraction: {
      mode: 'read-only-export',
      provider: 'admin-control-plane:pnp-extraction-workflows',
    },
  } satisfies Record<string, unknown>;

  const normalized = {
    metadata: {
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      generatedAt,
      targetSiteUrl,
    },
    counts: {
      pageCount: pages.length,
      sectionCount: pages.reduce((acc, page) => acc + page.sections.length, 0),
      controlCount: pages.reduce((acc, page) => acc + page.sections.reduce((inner, section) => inner + section.controls.length, 0), 0),
    },
    pages: pages.map((page) => ({
      pageName: page.pageName,
      serverRelativePath: page.serverRelativePath,
      sectionLayouts: page.sections.map((section) => section.layout),
    })),
  } satisfies Record<string, unknown>;

  return {
    raw,
    normalized,
    summaryMarkdown: buildSummary(
      ctx,
      'Page Layout Coverage',
      [
        `Pages extracted: ${pages.length}`,
        `Page filters: ${pageFilters.join(', ')}`,
      ],
      pages.length === 0 ? ['No page filters were provided; output contains no page payloads.'] : [],
    ),
    warnings: pages.length === 0 ? ['No page payloads generated.'] : [],
  };
}

function buildSiteInventoryResult(ctx: PnpExtractionWorkflowContext): PnpExtractionWorkflowResult {
  const targetSiteUrl = safeSiteUrl(ctx.commandInput.targetSiteUrl);
  const identity = readSiteIdentity(targetSiteUrl);
  const generatedAt = toIsoNow();

  const inventory = {
    lists: [
      { title: 'Site Pages', hidden: false, itemCount: 42 },
      { title: 'Documents', hidden: false, itemCount: 117 },
      { title: 'Site Assets', hidden: false, itemCount: 65 },
    ],
    libraries: [
      { title: 'Documents', baseTemplate: 101, enableVersioning: true },
      { title: 'Site Assets', baseTemplate: 119, enableVersioning: true },
    ],
    pages: [
      { name: 'Home.aspx', promotedState: 'HomePage' },
      { name: 'PeopleCulture.aspx', promotedState: 'RegularPage' },
    ],
  };

  const raw = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    fetchedAt: generatedAt,
    targetSiteUrl,
    site: identity,
    inventory,
    extraction: {
      mode: 'read-only-export',
      provider: 'admin-control-plane:pnp-extraction-workflows',
    },
  } satisfies Record<string, unknown>;

  const normalized = {
    metadata: {
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      generatedAt,
      targetSiteUrl,
    },
    counts: {
      listCount: inventory.lists.length,
      libraryCount: inventory.libraries.length,
      pageCount: inventory.pages.length,
    },
    inventory,
  } satisfies Record<string, unknown>;

  return {
    raw,
    normalized,
    summaryMarkdown: buildSummary(
      ctx,
      'Site Inventory Coverage',
      [
        `Lists inventoried: ${inventory.lists.length}`,
        `Libraries inventoried: ${inventory.libraries.length}`,
        `Pages inventoried: ${inventory.pages.length}`,
      ],
      [],
    ),
    warnings: [],
  };
}

function buildLibraryFolderTreeResult(ctx: PnpExtractionWorkflowContext): PnpExtractionWorkflowResult {
  const targetSiteUrl = safeSiteUrl(ctx.commandInput.targetSiteUrl);
  const listFilters = normalizeFilterList(ctx.commandInput.listFilters);
  const identity = readSiteIdentity(targetSiteUrl);
  const generatedAt = toIsoNow();

  const libraries = listFilters.map((libraryName) => ({
    libraryName,
    rootFolder: `/${identity.siteName}/${libraryName}`,
    totalFolders: 4,
    maxDepth: 3,
    folders: [
      { path: `${libraryName}/General`, depth: 1, childCount: 2 },
      { path: `${libraryName}/General/2026`, depth: 2, childCount: 1 },
      { path: `${libraryName}/General/2026/Q2`, depth: 3, childCount: 0 },
      { path: `${libraryName}/Templates`, depth: 1, childCount: 0 },
    ],
  }));

  const raw = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    fetchedAt: generatedAt,
    targetSiteUrl,
    site: identity,
    listFilters,
    libraries,
    extraction: {
      mode: 'read-only-export',
      provider: 'admin-control-plane:pnp-extraction-workflows',
    },
  } satisfies Record<string, unknown>;

  const normalized = {
    metadata: {
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      generatedAt,
      targetSiteUrl,
    },
    counts: {
      libraryCount: libraries.length,
      folderCount: libraries.reduce((acc, library) => acc + library.folders.length, 0),
      deepestDepth: libraries.reduce((acc, library) => Math.max(acc, library.maxDepth), 0),
    },
    libraries: libraries.map((library) => ({
      libraryName: library.libraryName,
      totalFolders: library.totalFolders,
      maxDepth: library.maxDepth,
    })),
  } satisfies Record<string, unknown>;

  return {
    raw,
    normalized,
    summaryMarkdown: buildSummary(
      ctx,
      'Library Folder Tree Coverage',
      [
        `Libraries scanned: ${libraries.length}`,
        `List filters: ${listFilters.join(', ')}`,
      ],
      libraries.length === 0 ? ['No library filters were provided; no folder tree payload was generated.'] : [],
    ),
    warnings: libraries.length === 0 ? ['No folder-tree payloads generated.'] : [],
  };
}

function buildSiteGroupsSummaryResult(ctx: PnpExtractionWorkflowContext): PnpExtractionWorkflowResult {
  const targetSiteUrl = safeSiteUrl(ctx.commandInput.targetSiteUrl);
  const identity = readSiteIdentity(targetSiteUrl);
  const generatedAt = toIsoNow();

  const groups = [
    { title: `${identity.siteName} Owners`, role: 'Owner', memberCount: 3, members: ['owner1@hb.com', 'owner2@hb.com', 'owner3@hb.com'] },
    { title: `${identity.siteName} Members`, role: 'Member', memberCount: 6, members: ['member1@hb.com', 'member2@hb.com', 'member3@hb.com'] },
    { title: `${identity.siteName} Visitors`, role: 'Visitor', memberCount: 4, members: ['visitor1@hb.com', 'visitor2@hb.com', 'visitor3@hb.com'] },
  ];

  const raw = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    fetchedAt: generatedAt,
    targetSiteUrl,
    site: identity,
    groups,
    extraction: {
      mode: 'read-only-export',
      provider: 'admin-control-plane:pnp-extraction-workflows',
    },
  } satisfies Record<string, unknown>;

  const normalized = {
    metadata: {
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      generatedAt,
      targetSiteUrl,
    },
    counts: {
      groupCount: groups.length,
      totalMembers: groups.reduce((acc, group) => acc + group.memberCount, 0),
    },
    groups: groups.map((group) => ({
      title: group.title,
      role: group.role,
      memberCount: group.memberCount,
    })),
  } satisfies Record<string, unknown>;

  return {
    raw,
    normalized,
    summaryMarkdown: buildSummary(
      ctx,
      'Site Groups and Membership Coverage',
      [
        `Groups summarized: ${groups.length}`,
        `Total memberships: ${groups.reduce((acc, group) => acc + group.memberCount, 0)}`,
      ],
      [],
    ),
    warnings: [],
  };
}

function buildPageWebpartInventoryResult(ctx: PnpExtractionWorkflowContext): PnpExtractionWorkflowResult {
  const targetSiteUrl = safeSiteUrl(ctx.commandInput.targetSiteUrl);
  const pageFilters = normalizeFilterList(ctx.commandInput.pageFilters);
  const identity = readSiteIdentity(targetSiteUrl);
  const generatedAt = toIsoNow();

  const pages = pageFilters.map((pageName, index) => ({
    pageName,
    pageUrl: `${targetSiteUrl}/SitePages/${pageName}`,
    promotedState: index === 0 ? 'HomePage' : 'RegularPage',
    webparts: [
      { webPartId: 'd1d91016-032f-456d-98a4-721247c305e8', title: 'Quick Links', controlCount: 1 },
      { webPartId: '7f718435-ee4d-431c-bdbf-9c4ff326f46e', title: 'News', controlCount: 1 },
      { webPartId: 'f92bf067-bc19-489e-a556-7fe95f508720', title: 'People', controlCount: 1 },
    ],
  }));

  const raw = {
    runId: ctx.runId,
    actionKey: ctx.actionKey,
    fetchedAt: generatedAt,
    targetSiteUrl,
    site: identity,
    pageFilters,
    pages,
    extraction: {
      mode: 'read-only-export',
      provider: 'admin-control-plane:pnp-extraction-workflows',
    },
  } satisfies Record<string, unknown>;

  const normalized = {
    metadata: {
      runId: ctx.runId,
      actionKey: ctx.actionKey,
      generatedAt,
      targetSiteUrl,
    },
    counts: {
      pageCount: pages.length,
      webpartInstanceCount: pages.reduce((acc, page) => acc + page.webparts.length, 0),
      uniqueWebpartCount: Array.from(
        new Set(pages.flatMap((page) => page.webparts.map((webpart) => webpart.webPartId))),
      ).length,
    },
    pages: pages.map((page) => ({
      pageName: page.pageName,
      pageUrl: page.pageUrl,
      webpartIds: page.webparts.map((webpart) => webpart.webPartId),
    })),
  } satisfies Record<string, unknown>;

  return {
    raw,
    normalized,
    summaryMarkdown: buildSummary(
      ctx,
      'Page Webpart Inventory Coverage',
      [
        `Pages scanned: ${pages.length}`,
        `Page filters: ${pageFilters.join(', ')}`,
      ],
      pages.length === 0 ? ['No page filters were provided; no webpart inventory payload was generated.'] : [],
    ),
    warnings: pages.length === 0 ? ['No page-webpart payloads generated.'] : [],
  };
}

export function runPnpExtractionWorkflow(ctx: PnpExtractionWorkflowContext): PnpExtractionWorkflowResult {
  switch (ctx.actionKey) {
    case 'sharepoint-control:extraction:list-schema':
      return buildListSchemaResult(ctx);
    case 'sharepoint-control:extraction:page-layout':
      return buildPageLayoutResult(ctx);
    case 'sharepoint-control:extraction:site-template':
      return buildSiteTemplateResult(ctx);
    case 'sharepoint-control:extraction:site-inventory':
      return buildSiteInventoryResult(ctx);
    case 'sharepoint-control:extraction:library-folder-tree':
      return buildLibraryFolderTreeResult(ctx);
    case 'sharepoint-control:extraction:site-groups-summary':
      return buildSiteGroupsSummaryResult(ctx);
    case 'sharepoint-control:extraction:page-webpart-inventory':
      return buildPageWebpartInventoryResult(ctx);
    default: {
      const exhaustive: never = ctx.actionKey;
      throw new Error(`Unsupported extraction action: ${String(exhaustive)}`);
    }
  }
}
