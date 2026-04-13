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
    postId: 'post-001',
    slug: 'post-001',
    pageName: 'post-001.aspx',
    pageTitle: 'Post 001',
    targetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    shellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    shellVersion: '1.0.0',
    templateKey: 'ps-inprogress-monthly-v1',
    templateVersion: '1.0.0',
    sourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
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
    TemplateDisplayName: 'PS Monthly',
    TemplateStatus: 'active',
    TemplateVersion: '1.0.0',
    PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    PageShellVersion: '1.0.0',
    ShellSourceSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    ShellSourcePagePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
    PostFamily: ['monthlySpotlight'],
    BannerRendererKind: 'oobPageTitle',
    BodyRendererKind: 'oobText',
    ShowTeamBlock: true,
    ShowGalleryBlock: true,
    RequiredFieldSetKey: 'req',
    ValidationProfileKey: 'val',
    RenderProfileKey: 'render',
    AllowRepublishInPlace: true,
    ForceRegenerationOnShellChange: false,
    ...over,
  };
}

function binding(
  over: Partial<PublisherPageBindingRow> = {},
): PublisherPageBindingRow {
  return {
    BindingId: 'bnd-001',
    PostId: 'post-001',
    TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
    TargetSiteKey: 'projectSpotlight',
    PageName: 'post-001.aspx',
    SourceTemplatePath: 'SitePages/Templates/Project-Spotlight---In-Progress.aspx',
    PageShellKey: 'ps-shell-inprogress-oob-banner-team-gallery-v1',
    PageShellVersion: '1.0.0',
    TemplateKey: 'ps-inprogress-monthly-v1',
    TemplateVersion: '1.0.0',
    BindingStatus: 'published',
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

  it('forces regenerate on shell key drift regardless of template flags', () => {
    const d = decideRepublishAction({
      composed: composed({ shellKey: 'ps-shell-new-v1' }),
      template: template({ AllowRepublishInPlace: true, ForceRegenerationOnShellChange: false }),
      existingBinding: binding(),
    });
    expect(d.action).toBe('regenerate');
    expect(d.reason).toBe('shellKeyDrift');
    expect(d.regenerationCause).toBe('shellKeyDrift');
  });

  it('forces regenerate on template key drift', () => {
    const d = decideRepublishAction({
      composed: composed({ templateKey: 'ps-other-template-v1' }),
      template: template(),
      existingBinding: binding(),
    });
    expect(d.action).toBe('regenerate');
    expect(d.reason).toBe('templateKeyDrift');
  });

  it('regenerates on shell version drift when template demands regeneration', () => {
    const d = decideRepublishAction({
      composed: composed({ shellVersion: '2.0.0' }),
      template: template({ ForceRegenerationOnShellChange: true }),
      existingBinding: binding({ PageShellVersion: '1.0.0' }),
    });
    expect(d.action).toBe('regenerate');
    expect(d.regenerationCause).toBe('shellVersionDrift');
  });

  it('in-place updates on shell version drift when template allows it', () => {
    const d = decideRepublishAction({
      composed: composed({ shellVersion: '1.1.0' }),
      template: template({ ForceRegenerationOnShellChange: false }),
      existingBinding: binding({ PageShellVersion: '1.0.0' }),
    });
    expect(d.action).toBe('inPlaceUpdate');
    expect(d.notes.join(' ')).toMatch(/shell version drift/i);
  });

  it('regenerates on template version drift when republish-in-place is disallowed', () => {
    const d = decideRepublishAction({
      composed: composed({ templateVersion: '2.0.0' }),
      template: template({ AllowRepublishInPlace: false }),
      existingBinding: binding({ TemplateVersion: '1.0.0' }),
    });
    expect(d.action).toBe('regenerate');
    expect(d.reason).toBe('templateVersionDrift');
  });

  it('blocks republish when binding is archived', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: binding({ BindingStatus: 'archived' }),
    });
    expect(d.action).toBe('blocked');
    expect(d.reason).toBe('bindingArchived');
  });

  it('blocks republish when binding is withdrawn', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: binding({ BindingStatus: 'withdrawn' }),
    });
    expect(d.action).toBe('blocked');
    expect(d.reason).toBe('bindingWithdrawn');
  });

  it('retries in-place when previous binding was in error state', () => {
    const d = decideRepublishAction({
      composed: composed(),
      template: template(),
      existingBinding: binding({ BindingStatus: 'error' }),
    });
    expect(d.action).toBe('inPlaceUpdate');
    expect(d.reason).toBe('bindingError');
  });
});
