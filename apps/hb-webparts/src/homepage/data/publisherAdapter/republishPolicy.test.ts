import { describe, expect, it } from 'vitest';
import type {
  PublisherPageBindingRow,
  PublisherTemplateRegistryRow,
} from './publisherContracts';
import type {
  ComposedPage,
  ComposedPageIdentity,
} from './pageGeneration/pageCompositor';
import { decideRepublishAction } from './republishPolicy';

function identity(over: Partial<ComposedPageIdentity> = {}): ComposedPageIdentity {
  return {
    articleId: 'art-001',
    slug: 'art-001',
    pageName: 'post-001.aspx',
    pageTitle: 'Post 001',
    targetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    shellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    shellVersion: '1.0.0',
    templateKey: 'ps-inprogress-monthly-v1',
    templateVersion: '1.0.0',
    ...over,
  };
}

function composed(over: Partial<ComposedPageIdentity> = {}): ComposedPage {
  return {
    identity: identity(over),
    header: {
      layoutType: 'FullWidthImage',
      showTopicHeader: false,
      showPublishDate: false,
      showBackgroundGradient: false,
      title: 'Post 001',
    },
    controls: [],
    shell: {} as ComposedPage['shell'],
  };
}

function template(
  over: Partial<PublisherTemplateRegistryRow> = {},
): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'ps-inprogress-monthly-v1',
    TemplateName: 'PS Monthly',
    IsActive: true,
    TemplatePriority: 100,
    VersionLabel: '1.0.0',
    ContentTypes: ['monthlySpotlight'],
    Destination: 'projectSpotlight',
    PageShellTemplateKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    HeroProfileKey: 'hbSignatureHero',
    BodyProfileKey: 'oobText',
    ShowHero: true,
    ShowBody: true,
    ShowTeamViewer: true,
    ShowGallery: true,
    ShowSecondaryImage: false,
    RequiredFieldSetKey: 'req',
    ...over,
  };
}

function binding(
  over: Partial<PublisherPageBindingRow> = {},
): PublisherPageBindingRow {
  return {
    BindingId: 'bnd-001',
    ArticleId: 'art-001',
    Title: 'Acme Tower — April',
    PublishStatus: 'published',
    TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    PageName: 'post-001.aspx',
    PageShellVersion: '1.0.0',
    PageTemplateKey: 'ps-inprogress-monthly-v1',
    RenderVersion: '1.0.0',
    ...over,
  };
}

describe('decideRepublishAction', () => {
  it('returns create when no binding exists', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: undefined,
    });
    expect(d.action).toBe('create');
    expect(d.reason).toBe('noExistingBinding');
  });

  it('returns inPlaceUpdate when shell + template versions match', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: binding(),
    });
    expect(d.action).toBe('inPlaceUpdate');
  });

  it('returns noOp when idempotent and nothing changed', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: binding(),
      idempotent: true,
    });
    expect(d.action).toBe('noOp');
    expect(d.reason).toBe('alreadyInSync');
  });

  // Canonical policy (one truth): PageTemplateKey drift is the only
  // hard regeneration trigger. Shell-identity and version drift
  // (shell version, render/template version) are always handled as
  // in-place updates on the same PageId / PageUrl. Tenant templates
  // no longer expose AllowRepublishInPlace /
  // ForceRegenerationOnShellChange flags, so there is no
  // template-flag escape hatch.

  it('updates in place on shell-identity drift because the binding cannot detect PageShellKey drift', () => {
    const d = decideRepublishAction({
      composed: composed({ shellKey: 'ps-shell-new-v1' }),
      template: template({ }),
      existingBinding: binding(),
    });
    expect(d.action).toBe('inPlaceUpdate');
  });

  it('forces regenerate on template key drift', () => {
    const d = decideRepublishAction({
      composed: composed({ templateKey: 'ps-other-template-v1' }),
      template: template(),
      existingBinding: binding(),
    });
    expect(d.action).toBe('regenerate');
    expect(d.reason).toBe('templateKeyDrift');
    expect(d.regenerationCause).toBe('templateKeyDrift');
  });

  it('updates in place on shell version drift (no template-flag escape hatch)', () => {
    const d = decideRepublishAction({
      composed: composed({ shellVersion: '2.0.0' }),
      template: template({ }),
      existingBinding: binding({ PageShellVersion: '1.0.0' }),
    });
    expect(d.action).toBe('inPlaceUpdate');
    expect(d.reason).toBe('shellVersionDrift');
    expect(d.notes.join(' ')).toMatch(/shell version drift/i);
  });

  it('updates in place on template/render version drift', () => {
    const d = decideRepublishAction({
      composed: composed({ templateVersion: '2.0.0' }),
      template: template({ }),
      existingBinding: binding({ RenderVersion: '1.0.0' }),
    });
    expect(d.action).toBe('inPlaceUpdate');
    expect(d.reason).toBe('templateVersionDrift');
  });

  it('blocks republish when the master article is archived', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: binding(),
      article: { WorkflowState: 'archived' } as unknown as import('./publisherContracts').PublisherArticleRow,
    });
    expect(d.action).toBe('blocked');
    expect(d.reason).toBe('articleArchived');
  });

  it('blocks republish when the master article is withdrawn', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: binding(),
      article: { WorkflowState: 'withdrawn' } as unknown as import('./publisherContracts').PublisherArticleRow,
    });
    expect(d.action).toBe('blocked');
    expect(d.reason).toBe('articleWithdrawn');
  });

  it('forces regenerate on page-name drift — filename change does NOT silently rebind', () => {
    // Binding pins an existing page named `post-001.aspx`; the
    // composed page has a new filename (e.g. author renamed the
    // slug). Policy must force regeneration so the orchestrator
    // creates a new page rather than letting the filename-based
    // lookup bind to whatever page happens to share the new name.
    const d = decideRepublishAction({
      composed: composed({ pageName: 'post-001-renamed.aspx' }),
      template: template(),
      existingBinding: binding({ PageName: 'post-001.aspx' }),
    });
    expect(d.action).toBe('regenerate');
    expect(d.reason).toBe('pageNameDrift');
    expect(d.regenerationCause).toBe('pageNameDrift');
  });

  it('retries in-place when previous binding was in error state', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: binding({ PublishStatus: 'error' }),
    });
    expect(d.action).toBe('inPlaceUpdate');
    expect(d.reason).toBe('bindingError');
  });
});
