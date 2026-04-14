import { describe, expect, it } from 'vitest';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherArticleRow,
  PublisherTeamMemberRow,
  PublisherTemplateRegistryRow,
} from '../publisherContracts';
import type { PublishResolutionContext } from '../publishResolutionContext';
import { PROJECT_SPOTLIGHT_V1_SHELL } from '../pageGeneration/xmlShellManifest';
import { validatePublishContext } from './validationEngine';

function article(over: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-001',
    Title: 'A Well-Formed Title',
    ArticleContentType: 'monthlySpotlight',
    Subhead: 'A subhead',
    SummaryExcerpt: 'A summary.',
    BodyRichText: '<p>Body content.</p>',
    SpotlightType: 'monthly',
    ProjectStage: 'active',
    TemplateKey: 'ps-inprogress-monthly-v1',
    Slug: 'a-well-formed-slug',
    WorkflowState: 'approved',
    CreatedDateUtc: '2026-04-10T00:00:00Z',
    UpdatedDateUtc: '2026-04-12T00:00:00Z',
    ProjectId: 'PRJ-1',
    ProjectName: 'Project One',
    HeroPrimaryImage: 'https://img.example/banner.jpg',
    HeroPrimaryImageAltText: 'Banner alt',
    TargetSiteUrl:
      'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
    Destination: 'projectSpotlight',
    ...over,
  } as PublisherArticleRow;
}

function tpl(
  over: Partial<PublisherTemplateRegistryRow> = {},
): PublisherTemplateRegistryRow {
  return {
    TemplateKey: 'ps-inprogress-monthly-v1',
    TemplateName: "Test Template",
    IsActive: true,
    TemplatePriority: 100,
    VersionLabel: "1.0.0",
    ContentTypes: ["monthlySpotlight"],
    Destination: "projectSpotlight",
    PageShellTemplateKey: "ps-shell-inprogress-oob-banner-team-gallery-v1",
    HeroProfileKey: "hbSignatureHero",
    BodyProfileKey: "oobText",
    TeamViewerProfileKey: "teamViewer",
    GalleryProfileKey: "oobImageGallery",
    ShowHero: true,
    ShowBody: true,
    ShowTeamViewer: true,
    ShowGallery: true,
    ShowSecondaryImage: false,
    RequiredFieldSetKey: "req-default",
    ...over,
  } as PublisherTemplateRegistryRow;
}

function context(over: {
  article?: Partial<PublisherArticleRow>;
  template?: Partial<PublisherTemplateRegistryRow>;
  teamMembers?: readonly PublisherTeamMemberRow[];
  media?: readonly PublisherMediaRow[];
  existingBinding?: PublisherPageBindingRow;
} = {}): PublishResolutionContext {
  return {
    article: article(over.article),
    template: tpl(over.template),
    teamMembers: over.teamMembers ?? [
      {
        ArticleId: 'art-001',
        TeamMemberId: 'tm-1',
        Title: 'Alice',
        PersonPrincipal: 'alice@example.com',
        DisplayName: 'Alice',
      },
    ],
    media: over.media ?? [
      {
        ArticleId: 'art-001',
        MediaId: 'm-1',
        Title: 'gallery 1',
        MediaRole: 'gallery',
        ImageAsset: 'https://img.example/g1.jpg',
        AltText: 'gallery 1',
      },
    ],
    existingBinding: over.existingBinding,
    decisionTrace: {
      input: { ArticleContentType: 'monthlySpotlight', Destination: 'projectSpotlight' },
      steps: [],
      selectedKey: 'ps-inprogress-monthly-v1',
      selectionRule: 'applicability',
    },
  };
}

describe('validatePublishContext', () => {
  it('returns ok=true for a well-formed monthly spotlight', () => {
    const result = validatePublishContext(context());
    expect(result.ok).toBe(true);
    expect(result.errors).toHaveLength(0);
    // Slug presence is enforced as an error; uniqueness is enforced
    // at hosted publish time, not in-session.
    expect(
      result.warnings.some((w) => w.category === 'invalid-slug'),
    ).toBe(false);
  });

  it('tolerates a blank TargetSiteUrl — derived at publish time (P2-2 closure)', () => {
    // Tenant schema makes HB Articles.TargetSiteUrl optional. The
    // app now derives the canonical URL from Destination at write
    // time, so a blank value on the author side MUST NOT produce
    // a validation error.
    const result = validatePublishContext(
      context({ article: { TargetSiteUrl: undefined } }),
    );
    expect(
      result.errors.some((e) => e.field === 'TargetSiteUrl'),
    ).toBe(false);
  });

  it('rejects a TargetSiteUrl override that does not match the canonical destination URL', () => {
    // Authors may still supply a value, but any override MUST match
    // the canonical destination URL exactly — otherwise publishing
    // would silently retarget the page at an unauthorized site.
    const result = validatePublishContext(
      context({
        article: {
          TargetSiteUrl: 'https://evil.example.com/sites/NotHere',
        },
      }),
    );
    expect(result.ok).toBe(false);
    const finding = result.errors.find((e) => e.field === 'TargetSiteUrl');
    expect(finding).toBeDefined();
    expect(finding?.message).toContain('does not target the canonical');
  });

  it('flags missing Title as missing-required-field error', () => {
    const result = validatePublishContext(context({ article: { Title: '' } }));
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.field === 'Title')).toBe(true);
  });

  it('flags ShowTeamViewer=true with no authored team members', () => {
    const result = validatePublishContext(
      context({
        article: { ShowTeamViewer: true },
        teamMembers: [],
      }),
    );
    expect(result.errors.some((e) => e.category === 'invalid-team-configuration')).toBe(true);
  });

  it('flags ShowGallery with no gallery-role media', () => {
    const result = validatePublishContext(
      context({ media: [] }),
    );
    expect(result.errors.some((e) => e.category === 'invalid-gallery-configuration')).toBe(true);
  });

  it('flags gallery images missing alt text with a field path', () => {
    const result = validatePublishContext(
      context({
        media: [
          {
            ArticleId: 'art-001',
            MediaId: 'm-1',
            Title: 'gallery 1',
            MediaRole: 'gallery',
            ImageAsset: 'https://img.example/g1.jpg',
            AltText: '',
          },
        ],
      }),
    );
    const finding = result.errors.find(
      (e) => e.category === 'invalid-image-accessibility',
    );
    expect(finding).toBeDefined();
    expect(finding?.field).toBe('media[0].AltText');
  });

  it('milestone articles are out of sprint scope — no active profile requires MilestoneLabel / MilestoneDateUtc (P1-3 closure)', () => {
    // Templates still pointing at the removed
    // `req-ps-inprogress-milestone-v1` profile must NOT surface a
    // hard error demanding fields the UI cannot produce. The
    // validation engine's unknown-key fallback takes over: a
    // warning is emitted and global rules run, but no milestone-
    // specific error is pushed.
    const result = validatePublishContext(
      context({
        template: { RequiredFieldSetKey: 'req-ps-inprogress-milestone-v1' },
      }),
    );
    const errorFields = result.errors.map((e) => e.field);
    expect(errorFields).not.toContain('MilestoneLabel');
    expect(errorFields).not.toContain('MilestoneDateUtc');
    const errorMessages = result.errors.map((e) => e.message).join(' ');
    expect(errorMessages).not.toMatch(/MilestoneLabel|MilestoneDateUtc/);

    // Unknown-key fallback surfaces as a warning.
    const unknownWarning = result.warnings.find(
      (w) => w.field === 'template.RequiredFieldSetKey',
    );
    expect(unknownWarning).toBeDefined();
    expect(unknownWarning?.message).toContain(
      'req-ps-inprogress-milestone-v1',
    );
  });

  it('warns when template expects hbSignatureHero on the current OOB shell', () => {
    const result = validatePublishContext(
      context({ template: { } }),
    );
    const match = result.warnings.find(
      (w) => w.category === 'invalid-shell-compatibility',
    );
    expect(match).toBeDefined();
  });

  it('warns on shell version drift with tenant-accurate in-place messaging', () => {
    const result = validatePublishContext(
      context({
        template: { },
        existingBinding: {
          BindingId: 'b-1',
          ArticleId: 'art-001',
          Title: 'Acme Tower — April',
          PublishStatus: 'published',
          TargetSiteUrl:
            'https://hedrickbrotherscom.sharepoint.com/sites/ProjectSpotlight',
          PageName: 'p.aspx',
          PageShellVersion: '0.9.0',
          PageTemplateKey: 'ps-inprogress-monthly-v1',
          RenderVersion: '1.0.0',
        },
      }),
    );
    const driftWarning = result.warnings.find(
      (w) =>
        w.category === 'page-generation-blocker' &&
        w.field === 'existingBinding.PageShellVersion',
    );
    expect(driftWarning).toBeDefined();
    // The warning + action-hint must tell the operator the canonical
    // truth: shell-version drift is an in-place update, not a
    // regeneration. Only PageTemplateKey drift regenerates.
    expect(driftWarning!.message).toMatch(/in place/i);
    expect(driftWarning!.message).not.toMatch(/regenerat/i);
    expect(driftWarning!.actionHint).toMatch(/PageTemplateKey/);
    expect(driftWarning!.actionHint).not.toMatch(/\(or regenerate if the template forces it\)/i);
  });

  it('tolerates an unknown RequiredFieldSetKey with an invalid-template-match warning', () => {
    const result = validatePublishContext(
      context({ template: { RequiredFieldSetKey: 'req-unknown' } }),
    );
    expect(
      result.warnings.some(
        (w) =>
          w.category === 'invalid-template-match' &&
          w.field === 'template.RequiredFieldSetKey',
      ),
    ).toBe(true);
    // Still ok because global rules pass on a well-formed post.
    expect(result.ok).toBe(true);
  });

  it('flags an invalid Destination (companyPulse not yet implemented)', () => {
    const result = validatePublishContext(
      context({
        article: { Destination: 'companyPulse' },
      }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.errors.some(
        (e) => e.category === 'invalid-template-match' && e.field === 'Destination',
      ),
    ).toBe(true);
  });

  it('treats an empty TipTap body (`<p></p>`) as a missing BodyRichText', () => {
    const result = validatePublishContext(
      context({ article: { BodyRichText: '<p></p>' } }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.errors.some(
        (e) => e.category === 'missing-required-field' && e.field === 'BodyRichText',
      ),
    ).toBe(true);
  });

  it('treats a whitespace-only TipTap body as missing', () => {
    const result = validatePublishContext(
      context({ article: { BodyRichText: '<p>&nbsp;</p><p><br /></p>' } }),
    );
    expect(result.ok).toBe(false);
    expect(
      result.errors.some(
        (e) => e.category === 'missing-required-field' && e.field === 'BodyRichText',
      ),
    ).toBe(true);
  });

  it('emits a non-blocking warning when gallery alt text starts with "image of"', () => {
    const result = validatePublishContext(
      context({
        media: [
          {
            ArticleId: 'art-001',
            MediaId: 'm-1',
            Title: 'crew',
            MediaRole: 'gallery',
            ImageAsset: 'https://img.example.com/crew.jpg',
            AltText: 'Image of a crew raising a beam',
            SortOrder: 1,
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.field === 'media[0].AltText')).toBe(true);
    expect(result.errors.some((e) => e.field === 'media[0].AltText')).toBe(false);
  });

  it('emits a non-blocking warning when gallery alt text is past the 250-char ceiling', () => {
    const result = validatePublishContext(
      context({
        media: [
          {
            ArticleId: 'art-001',
            MediaId: 'm-1',
            Title: 'crew',
            MediaRole: 'gallery',
            ImageAsset: 'https://img.example.com/crew.jpg',
            AltText: 'x'.repeat(260),
            SortOrder: 1,
          },
        ],
      }),
    );
    expect(
      result.warnings.some(
        (w) => w.field === 'media[0].AltText' && /longer than/.test(w.message),
      ),
    ).toBe(true);
  });

  it('does not warn when gallery alt text is well-formed', () => {
    const result = validatePublishContext(
      context({
        media: [
          {
            ArticleId: 'art-001',
            MediaId: 'm-1',
            Title: 'crew',
            MediaRole: 'gallery',
            ImageAsset: 'https://img.example.com/crew.jpg',
            AltText:
              'Crew raising the final steel beam at the West Palm Beach jobsite.',
            SortOrder: 1,
          },
        ],
      }),
    );
    expect(result.warnings.some((w) => w.field === 'media[0].AltText')).toBe(false);
  });

  it('accepts schema-compliant rich body HTML with headings, lists, and links', () => {
    const richBody =
      '<p>Opening with <strong>emphasis</strong>.</p>' +
      '<h3>A subheading</h3>' +
      '<ul><li>Point one</li><li><a href="https://example.com">A link</a></li></ul>';
    const result = validatePublishContext(
      context({ article: { BodyRichText: richBody } }),
    );
    expect(
      result.errors.some((e) => e.field === 'BodyRichText'),
    ).toBe(false);
  });
});
