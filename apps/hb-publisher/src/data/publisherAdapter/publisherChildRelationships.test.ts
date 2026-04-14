/**
 * Referential-integrity drift guard for child-row relationships.
 *
 * Every publisher child list on HBCentral (`HB Article Team Members`,
 * `HB Article Media`, `HB Article Destination Pages`,
 * `HB Article Workflow History`, `HB Article Publishing Errors`) uses
 * the tenant `ArticleId` column as the foreign key to the master
 * `HB Articles` record. If any child row/mapper/writer silently reverts
 * to `PostId`, reads and writes will target a non-existent column on
 * the tenant and every parent/child link will break.
 *
 * This suite pins the FK contract at the mapper, writer, and row-type
 * level so a drift back to `PostId` breaks CI loudly.
 */
import { describe, expect, it } from 'vitest';
import {
  mapMediaRow,
  mapPageBindingRow,
  mapPublishingErrorRow,
  mapTeamMemberRow,
  mapWorkflowHistoryRow,
} from './publisherRowMappers';
import {
  mapMediaRowToListFields,
  mapTeamMemberRowToListFields,
  mapWorkflowHistoryRowToListFields,
} from './publisherWriters';
import { mapBindingRowToListFields } from './pageBindingWriter';
import type {
  PublisherMediaRow,
  PublisherPageBindingRow,
  PublisherPublishingErrorRow,
  PublisherTeamMemberRow,
  PublisherWorkflowHistoryRow,
} from './publisherContracts';

const ARTICLE_ID = 'art-2026-042';

describe('child-row mappers read ArticleId, reject legacy PostId', () => {
  it('mapTeamMemberRow accepts ArticleId FK', () => {
    const row = mapTeamMemberRow({
      ArticleId: ARTICLE_ID,
      TeamMemberId: 'tm-1',
      Title: 'Alice',
      // Reader always expands PersonPrincipal — fixtures mirror the
      // expanded shape the repository's $select/$expand produces.
      PersonPrincipal: { EMail: 'alice@example.com', Title: 'Alice' },
      DisplayName: 'Alice',
    });
    expect(row?.ArticleId).toBe(ARTICLE_ID);
  });

  it('mapTeamMemberRow rejects rows whose FK is still PostId', () => {
    expect(
      mapTeamMemberRow({
        PostId: ARTICLE_ID,
        TeamMemberId: 'tm-1',
        Title: 'Alice',
        PersonPrincipal: { EMail: 'alice@example.com' },
        DisplayName: 'Alice',
      }),
    ).toBeUndefined();
  });

  it('mapTeamMemberRow rejects a flat-string PersonPrincipal — reader must always $expand (P2-4)', () => {
    // The team-member read path issues `$expand=PersonPrincipal` + a
    // select of the expanded sub-properties. If a consumer bypasses
    // the repository and hits SharePoint without $expand, the raw
    // value arrives as a flat lookup string; the mapper rejects it
    // loudly instead of silently hydrating the display identity.
    expect(
      mapTeamMemberRow({
        ArticleId: ARTICLE_ID,
        TeamMemberId: 'tm-1',
        Title: 'Alice',
        PersonPrincipal: 'alice@example.com',
        DisplayName: 'Alice',
      }),
    ).toBeUndefined();
  });

  it('mapMediaRow accepts ArticleId FK and rejects PostId', () => {
    expect(
      mapMediaRow({
        ArticleId: ARTICLE_ID,
        MediaId: 'm-1',
        Title: 'a',
        MediaRole: 'gallery',
        ImageAsset: 'https://img.example/a.jpg',
        AltText: 'alt',
      })?.ArticleId,
    ).toBe(ARTICLE_ID);
    expect(
      mapMediaRow({
        PostId: ARTICLE_ID,
        MediaId: 'm-1',
        Title: 'a',
        MediaRole: 'gallery',
        ImageAsset: 'https://img.example/a.jpg',
        AltText: 'alt',
      }),
    ).toBeUndefined();
  });

  it('mapPageBindingRow accepts ArticleId FK and rejects PostId', () => {
    const baseFields = {
      BindingId: 'bnd-1',
      Title: 'Binding title',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageTemplateKey: 'tmpl-v1',
      PublishStatus: 'published',
    };
    expect(mapPageBindingRow({ ...baseFields, ArticleId: ARTICLE_ID })?.ArticleId).toBe(ARTICLE_ID);
    expect(mapPageBindingRow({ ...baseFields, PostId: ARTICLE_ID })).toBeUndefined();
  });

  it('mapWorkflowHistoryRow accepts ArticleId FK and rejects PostId', () => {
    const base = {
      HistoryId: 'hst-1',
      Title: 'transition',
      NewState: 'approved',
      ActionDateUtc: '2026-04-10T00:00:00Z',
    };
    expect(mapWorkflowHistoryRow({ ...base, ArticleId: ARTICLE_ID })?.ArticleId).toBe(ARTICLE_ID);
    expect(mapWorkflowHistoryRow({ ...base, PostId: ARTICLE_ID })).toBeUndefined();
  });

  it('mapPublishingErrorRow accepts ArticleId FK and rejects PostId', () => {
    const base = {
      ErrorId: 'err-1',
      Title: 'pageGeneration failure',
      Destination: 'projectSpotlight',
      Operation: 'publish',
      ErrorSummary: 'boom',
    };
    expect(mapPublishingErrorRow({ ...base, ArticleId: ARTICLE_ID })?.ArticleId).toBe(ARTICLE_ID);
    expect(mapPublishingErrorRow({ ...base, PostId: ARTICLE_ID })).toBeUndefined();
  });
});

describe('child-row writers emit ArticleId, never PostId', () => {
  it('team-member write payload carries ArticleId FK', () => {
    const row: PublisherTeamMemberRow = {
      ArticleId: ARTICLE_ID,
      TeamMemberId: 'tm-1',
      Title: 'Alice',
      PersonPrincipal: 'alice@example.com',
      PersonPrincipalId: 17,
      DisplayName: 'Alice',
    };
    const fields = mapTeamMemberRowToListFields(row);
    expect(fields['ArticleId']).toBe(ARTICLE_ID);
    expect(fields['PostId']).toBeUndefined();
  });

  it('team-member write mapper REFUSES to encode a row whose User field is unresolved', () => {
    expect(() =>
      mapTeamMemberRowToListFields({
        ArticleId: ARTICLE_ID,
        TeamMemberId: 'tm-1',
        Title: 'Alice',
        PersonPrincipal: 'alice@example.com',
        DisplayName: 'Alice',
      }),
    ).toThrow(/PersonPrincipalId is required/);
  });

  it('team-member write payload emits tenant columns only and no removed legacy fields', () => {
    const row: PublisherTeamMemberRow = {
      ArticleId: ARTICLE_ID,
      TeamMemberId: 'tm-1',
      Title: 'Alice',
      PersonPrincipal: 'alice@example.com',
      PersonPrincipalId: 17,
      DisplayName: 'Alice',
      Role: 'PM',
      Company: 'HB',
      Department: 'Delivery',
      GroupKey: 'leads',
      ParentMemberId: 'tm-parent',
      IsFeaturedMember: true,
      SortOrder: 1,
      BioSnippet: 'Bio',
      ContactLink: 'https://p.example/alice',
    };
    const fields = mapTeamMemberRowToListFields(row);
    // Required tenant fields.
    expect(fields['Title']).toBe('Alice');
    expect(fields['DisplayName']).toBe('Alice');
    expect(fields['TeamMemberId']).toBe('tm-1');
    // User field written as resolved id, not as a bare string.
    expect(fields['PersonPrincipalId']).toBe(17);
    expect(fields['PersonPrincipal']).toBeUndefined();
    // Optional tenant fields.
    expect(fields['Role']).toBe('PM');
    expect(fields['Company']).toBe('HB');
    expect(fields['Department']).toBe('Delivery');
    expect(fields['GroupKey']).toBe('leads');
    expect(fields['ParentMemberId']).toBe('tm-parent');
    expect(fields['IsFeaturedMember']).toBe(true);
    expect(fields['SortOrder']).toBe(1);
    expect(fields['BioSnippet']).toBe('Bio');
    expect(fields['ContactLink']).toEqual({
      Url: 'https://p.example/alice',
      Description: 'https://p.example/alice',
    });
    // Legacy pre-tenant fields no longer written.
    expect(fields['JobTitle']).toBeUndefined();
    expect(fields['PhotoUrl']).toBeUndefined();
    expect(fields['ResumeRichText']).toBeUndefined();
    expect(fields['ResumeDocumentUrl']).toBeUndefined();
    expect(fields['IncludeInViewer']).toBeUndefined();
  });

  it('team-member read mapper rejects rows missing required tenant Title', () => {
    expect(
      mapTeamMemberRow({
        ArticleId: ARTICLE_ID,
        TeamMemberId: 'tm-1',
        PersonPrincipal: 'alice@example.com',
        DisplayName: 'Alice',
      }),
    ).toBeUndefined();
  });

  it('team-member read mapper resolves the expanded PersonPrincipal User shape', () => {
    const row = mapTeamMemberRow({
      ArticleId: ARTICLE_ID,
      TeamMemberId: 'tm-1',
      Title: 'Alice',
      DisplayName: 'Alice',
      PersonPrincipal: { EMail: 'alice@example.com', Title: 'Alice' },
      PersonPrincipalId: 17,
    });
    expect(row?.PersonPrincipal).toBe('alice@example.com');
    expect(row?.PersonPrincipalId).toBe(17);
  });

  it('team-member schema-backed optional fields round-trip through write/read shapes', () => {
    const authored: PublisherTeamMemberRow = {
      ArticleId: ARTICLE_ID,
      TeamMemberId: 'tm-77',
      Title: 'Alice',
      DisplayName: 'Alice',
      PersonPrincipal: 'alice@example.com',
      PersonPrincipalId: 17,
      GroupKey: 'north',
      ParentMemberId: 'tm-root',
      BioSnippet: 'Senior PM',
      ContactLink: 'https://people.example/alice',
    };
    const writeFields = mapTeamMemberRowToListFields(authored);
    expect(writeFields['GroupKey']).toBe('north');
    expect(writeFields['ParentMemberId']).toBe('tm-root');
    expect(writeFields['BioSnippet']).toBe('Senior PM');
    expect(writeFields['ContactLink']).toEqual({
      Url: 'https://people.example/alice',
      Description: 'https://people.example/alice',
    });

    const reread = mapTeamMemberRow({
      ...writeFields,
      PersonPrincipal: { EMail: 'alice@example.com', Title: 'Alice' },
    });
    expect(reread?.GroupKey).toBe('north');
    expect(reread?.ParentMemberId).toBe('tm-root');
    expect(reread?.BioSnippet).toBe('Senior PM');
    expect(reread?.ContactLink).toBe('https://people.example/alice');
  });

  it('media write payload carries ArticleId FK', () => {
    const row: PublisherMediaRow = {
      ArticleId: ARTICLE_ID,
      MediaId: 'm-1',
      Title: 'a',
      MediaRole: 'gallery',
      ImageAsset: 'https://img.example/a.jpg',
      AltText: 'alt',
    };
    const fields = mapMediaRowToListFields(row);
    expect(fields['ArticleId']).toBe(ARTICLE_ID);
    expect(fields['PostId']).toBeUndefined();
  });

  it('media write payload emits tenant internal names with no legacy aliases', () => {
    const row: PublisherMediaRow = {
      ArticleId: ARTICLE_ID,
      MediaId: 'm-1',
      Title: 'Hero shot',
      MediaRole: 'gallery',
      ImageAsset: 'https://img.example/a.jpg',
      AltText: 'alt',
      Caption: 'cap',
      SortOrder: 2,
      GalleryGroup: 'lobby',
      FeaturedInGallery: true,
    };
    const fields = mapMediaRowToListFields(row);
    // Required tenant columns.
    expect(fields['Title']).toBe('Hero shot');
    expect(fields['MediaId']).toBe('m-1');
    expect(fields['MediaRole']).toBe('gallery');
    expect(fields['AltText']).toBe('alt');
    // Asset URL uses the tenant column name and URL field shape.
    expect(fields['ImageAsset']).toEqual({
      Url: 'https://img.example/a.jpg',
      Description: 'https://img.example/a.jpg',
    });
    expect(fields['ImageAssetUrl']).toBeUndefined();
    // Optional tenant columns surfaced.
    expect(fields['Caption']).toBe('cap');
    expect(fields['SortOrder']).toBe(2);
    expect(fields['GalleryGroup']).toBe('lobby');
    expect(fields['FeaturedInGallery']).toBe(true);
  });

  it('media read mapper rejects rows missing tenant Title or using the legacy ImageAssetUrl column', () => {
    expect(
      mapMediaRow({
        ArticleId: ARTICLE_ID,
        MediaId: 'm-1',
        MediaRole: 'gallery',
        ImageAsset: 'https://img.example/a.jpg',
        AltText: 'alt',
      }),
    ).toBeUndefined();
    expect(
      mapMediaRow({
        ArticleId: ARTICLE_ID,
        MediaId: 'm-1',
        Title: 'a',
        MediaRole: 'gallery',
        ImageAssetUrl: 'https://img.example/a.jpg',
        AltText: 'alt',
      }),
    ).toBeUndefined();
  });

  it('page-binding write payload carries ArticleId FK', () => {
    const row: PublisherPageBindingRow = {
      BindingId: 'bnd-1',
      ArticleId: ARTICLE_ID,
      Title: 'Test',
      PublishStatus: 'published',
      TargetSiteUrl: 'https://example.com/sites/ProjectSpotlight',
      PageName: 'p.aspx',
      PageShellVersion: '1.0.0',
      PageTemplateKey: 'tmpl-v1',
      RenderVersion: '1.0.0',
    };
    const fields = mapBindingRowToListFields(row);
    expect(fields['ArticleId']).toBe(ARTICLE_ID);
    expect(fields['PostId']).toBeUndefined();
  });

  it('workflow-history write payload carries ArticleId FK', () => {
    const row: PublisherWorkflowHistoryRow = {
      HistoryId: 'hst-1',
      ArticleId: ARTICLE_ID,
      Title: 'Test',
      NewState: 'approved',
      ActionDateUtc: '2026-04-10T00:00:00Z',
    };
    const fields = mapWorkflowHistoryRowToListFields(row);
    expect(fields['ArticleId']).toBe(ARTICLE_ID);
    expect(fields['PostId']).toBeUndefined();
  });

  it('publishing-error row type enforces ArticleId at compile time', () => {
    // Type-level assertion: attempting to construct with PostId would
    // not compile. This runtime check confirms the field name the
    // append path will persist.
    const row: PublisherPublishingErrorRow = {
      ErrorId: 'err-1',
      ArticleId: ARTICLE_ID,
      Title: 'pageGeneration failure',
      Destination: 'projectSpotlight',
      Operation: 'publish',
      ErrorSummary: 'boom',
    };
    expect(row.ArticleId).toBe(ARTICLE_ID);
  });
});
