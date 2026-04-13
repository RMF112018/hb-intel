# 07 — Webpart Input Contracts

## Purpose

Define the expected input contracts for the branded rendering webparts and OOB blocks used in generated article pages.

## General rules

1. Render components should receive structured, minimal, explicit inputs
2. Render components should not own editorial truth
3. Render components should tolerate incomplete optional fields gracefully
4. Contracts should be profile-driven when possible
5. Contracts must be allowed to evolve as components mature

---

## A. `hbSignatureHero` contract

## Intended responsibility
- render hero title
- render hero subhead
- render primary image
- render optional eyebrow/category/metadata
- apply destination/template-aware visual treatment
- optionally render hero CTA

## Proposed input contract

```ts
interface HbSignatureHeroArticleInput {
  articleId: string;
  destination: 'companyPulse' | 'projectSpotlight';
  templateKey: string;
  profileKey: string;

  title: string;
  subhead?: string;

  eyebrow?: string;
  categoryLabel?: string;

  primaryImageUrl: string;
  primaryImageAltText: string;
  imageFocalPoint?: string;

  themeVariant?: string;
  showMetadata?: boolean;
  metadataMode?: string;

  publishedDateUtc?: string;
  contentType?: string;
  spotlightType?: string;

  ctaLabel?: string;
  ctaUrl?: string;
}
```

## Notes
- This contract is expected to evolve after `hbSignatureHero` is updated for broader multi-application use.
- Fields such as metadata mode, theme variant, and focal-point behavior are especially likely to change.

---

## B. `teamViewer` contract

## Intended responsibility
- render zero to many team members
- support multiple render modes
- support optional grouping and future hierarchy
- support compact initial display and expansion

## Proposed input contract

```ts
interface TeamViewerInput {
  articleId: string;
  destination: 'companyPulse' | 'projectSpotlight';
  templateKey: string;
  profileKey: string;

  title?: string;
  intro?: string;

  mode: 'compact' | 'grouped' | 'orgChart' | 'summaryExpand';
  groupingMode?: 'none' | 'discipline' | 'company' | 'hierarchy';
  sortMode?: 'manual' | 'role' | 'hierarchy';

  maxInitialVisible?: number;
  allowExpand?: boolean;

  members: TeamViewerMemberInput[];
}

interface TeamViewerMemberInput {
  teamMemberId: string;
  displayName: string;
  role?: string;
  department?: string;
  company?: string;
  photoUrl?: string;
  sortOrder?: number;
  groupKey?: string;
  parentMemberId?: string;
  isFeaturedMember?: boolean;
  bioSnippet?: string;
  contactLink?: string;
}
```

## Notes
- This contract is highly likely to evolve after `teamViewer` is created and validated.
- MVP should not overcommit to org-chart complexity before actual UI design is proven.

---

## C. OOB Text contract

## Intended responsibility
- render article body content

## Proposed input contract
For MVP, the generated page can supply a standard text web part using:
- `BodyRichText`
- optional intro/closing blocks if used by the selected template

## Notes
- If the system later moves toward a custom body renderer, these body-related fields may need to split into structured sections.

---

## D. OOB Image contract

## Intended responsibility
- render secondary image if applicable

## Inputs
- `SecondaryImage`
- `SecondaryImageAltText`
- `SecondaryImageCaption`
- `ShowSecondaryImage`

---

## E. OOB Image Gallery contract

## Intended responsibility
- render supporting images

## Inputs
From `HB Article Media` child rows:
- image url/reference
- alt text
- caption
- sort order

---

## F. Webpart profile keys

The template system should bind renderers through profile keys rather than hard-coded assumptions.

### Example profile keys
- `hero-companypulse-standard-v1`
- `hero-projectspotlight-standard-v1`
- `hero-projectspotlight-milestone-v1`
- `teamviewer-project-standard-v1`
- `body-standard-v1`
- `gallery-standard-v1`

## Profile rule
Profiles are the mechanism that lets field usage evolve without breaking the entire template system.
