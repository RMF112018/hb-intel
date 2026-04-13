# 07 — Webpart Input Contracts

## Purpose

Define the expected input contracts for the current XML-shell-driven Project Spotlight page model.

## General rules

1. Render components should receive structured, minimal, explicit inputs
2. Render components should not own editorial truth
3. Contracts should tolerate missing optional fields gracefully
4. Profile keys should control behavior whenever practical
5. Contracts must be allowed to evolve as the shell and renderers mature

## Current shell ownership model

The canonical shell currently uses:

- **OOB Page Title / banner** for the banner region
- **OOB Text** for subhead
- **OOB Text** for body
- **`teamViewer`** for the team region
- **OOB Image Gallery** for the gallery region

The current shell does **not** include a standalone OOB secondary-image zone.

---

## A. OOB Page Title / banner contract (current active banner owner)

### Intended responsibility
- render the banner/title region
- render banner image
- render publish-date-capable page header
- preserve shell-aligned layout behavior

### Proposed generation payload

```ts
interface ProjectSpotlightOobBannerInput {
  postId: string;
  targetSiteKey: 'projectSpotlight';
  templateKey: string;
  pageShellKey: string;
  profileKey: string;

  title: string;
  bannerImageUrl: string;
  bannerImageAltText: string;

  showPublishDate?: boolean;
  showGradient?: boolean;
  themeVariant?: string;

  eyebrow?: string;
  categoryLabel?: string;
  publishedDateUtc?: string;
}
```

### Notes
- This is the **active** banner contract for the current canonical shell.
- It maps into the existing Page Title / banner control in the shell.

---

## B. `hbSignatureHero` contract (future-compatible, not active in the current shell)

### Intended responsibility
- future replacement for the OOB banner region if a later shell variant adopts it
- richer branded hero behavior than the current OOB banner

### Proposed future contract

```ts
interface HbSignatureHeroProjectSpotlightInput {
  postId: string;
  destination: 'projectSpotlight';
  templateKey: string;
  pageShellKey: string;
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
  postFamily?: string;
  spotlightType?: string;
}
```

### Role in the current architecture
- preserved deliberately as an evolution path
- **not mounted in the current canonical XML shell**
- should only become active when a future Project Spotlight shell explicitly includes it

---

## C. `teamViewer` contract (current active custom block)

### Intended responsibility
- render zero to many related team members
- support shell-aligned layout and density choices
- support an optional profile-detail drawer that ships disabled by default in the current shell

### Proposed input contract

```ts
interface TeamViewerInput {
  postId: string;
  destinationKey: 'projectSpotlight';
  templateKey: string;
  pageShellKey: string;
  profileKey: string;

  heading?: string;
  listHostOverride?: string;

  layout: 'grid' | 'list';
  density: 'standard' | 'compact' | 'comfortable';

  featureFlags?: {
    profileDetailDrawer?: boolean;
  };

  members: TeamViewerMemberInput[];
}

interface TeamViewerMemberInput {
  teamMemberId: string;
  displayName: string;
  jobTitle?: string;
  department?: string;
  company?: string;
  photoUrl?: string;
  sortOrder?: number;
  groupKey?: string;
  parentMemberId?: string;
  isFeaturedMember?: boolean;
  bioSnippet?: string;
  resumeRichText?: string;
  resumeDocumentUrl?: string;
  contactLink?: string;
}
```

### Notes
- The current XML shell already contains a Team Viewer control whose baseline properties include:
  - `heading`
  - `articleId`/post identity slot
  - `destinationKey`
  - `listHostOverride`
  - `layout`
  - `density`
  - `featureFlags.profileDetailDrawer`
- The implementation should map `PostId` into that identity slot and fix `destinationKey` to `projectSpotlight`.

---

## D. OOB Text contracts (current active text blocks)

### 1. Subhead block

```ts
interface ProjectSpotlightSubheadTextInput {
  postId: string;
  templateKey: string;
  pageShellKey: string;
  html: string; // generated from Subhead
}
```

### 2. Body block

```ts
interface ProjectSpotlightBodyTextInput {
  postId: string;
  templateKey: string;
  pageShellKey: string;
  html: string; // generated from BodyRichText
}
```

### Notes
- The current shell has distinct subhead and body controls.
- The system should not collapse them into one generic text blob unless the shell changes.

---

## E. OOB Image Gallery contract (current active media block)

### Intended responsibility
- render ordered supporting project images from the child media rows

### Proposed input contract

```ts
interface ProjectSpotlightGalleryInput {
  postId: string;
  templateKey: string;
  pageShellKey: string;
  profileKey: string;
  maxImagesCount?: number;
  images: ProjectSpotlightGalleryImage[];
}

interface ProjectSpotlightGalleryImage {
  mediaId: string;
  imageAssetUrl: string;
  altText: string;
  caption?: string;
  sortOrder?: number;
}
```

### Notes
- The current shell already includes an OOB Image Gallery control with an empty `images` array that should be populated dynamically.
- Gallery metadata/caption behavior should follow the chosen renderer profile.

---

## F. OOB Image contract (not active in the current canonical shell)

### Current role
- **not present** as a dedicated slot in the current XML shell

### Architectural consequence
- a template cannot require a dedicated secondary-image block unless it points to a different shell that includes one
- do not keep silent secondary-image requirements in validation for the current shell family

### Future rule
If a future shell adds a secondary-image slot, introduce:
- a new `PageShellKey`
- a new template registry row
- a dedicated image contract

---

## G. Renderer profile keys

Use profile keys rather than hard-coded assumptions.

### Example profile keys
- `oob-pagetitle-project-spotlight-v1`
- `teamviewer-project-spotlight-grid-v1`
- `oob-text-subhead-v1`
- `oob-text-body-v1`
- `oob-gallery-project-spotlight-v1`
- future: `hbsignaturehero-project-spotlight-v1`

## Profile rule

Profiles are the mechanism that lets field usage evolve without breaking the entire template system.
