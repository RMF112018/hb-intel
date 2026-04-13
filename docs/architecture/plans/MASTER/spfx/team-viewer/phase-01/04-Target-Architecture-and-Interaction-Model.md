# 04 — Target Architecture and Interaction Model

## Recommended target architecture

### 1. Runtime shape

Implement `teamViewer` as a thin public-runtime orchestrator:

- `TeamViewer.tsx` — thin orchestration only
- `teamViewerRuntimeContract.ts` — manifest/runtime anti-drift constants
- `hooks/useTeamViewerArticleBinding.ts` — resolve active article from host site/page context
- `hooks/useTeamViewerData.ts` — data loading + refresh for article-linked team members
- `hooks/useTeamViewerPhotoHydration.ts` — generic person-photo hydration
- `hooks/useTeamViewerHostSafeLayout.ts` — reuse or generalize hosted safe-zone behavior if needed
- `display/teamViewerSelectors.ts` — ranking / grouping / density selection
- `components/TeamViewerSurface.tsx` — primary composed surface
- `components/TeamViewerDetailPanel.tsx` — only if detail expansion is kept
- `components/TeamViewerEmptyState.tsx`
- `components/TeamViewerErrorState.tsx`

### 2. Source binding model

Do not guess the data source.

Follow-up scope now makes the preferred model explicit:

- authoritative article parent rows in `HB Articles`
- child person rows in `HB Article Team Members`
- destination/page binding support from `HB Article Destination Pages` when needed to resolve the active article on the current host site/page

The implementation must determine the cleanest repo-truth binding path, such as:
- host site URL + page URL → destination-page binding → article ID
- directly supplied article ID / article key webpart property fallback
- host site-specific article-context seam if the repo already has one

Property-only person arrays are no longer the recommended default unless repo truth proves the article system is unavailable.

Regardless of source, normalize immediately into a stable `TeamViewerPerson` contract and keep article-binding metadata explicit.

### 3. Contract model

Recommended contract family:

```ts
export interface TeamViewerPerson {
  id: string;
  articleId: string;
  articleTeamMemberId?: string;
  displayName: string;
  email?: string;
  upn?: string;
  jobTitle?: string;
  photoUrl?: string;
  department?: string;
  teamLabel?: string;
  projectRole?: string;
  groupKey?: string;
  sortOrder?: number;
  profileUrl?: string;
  bio?: string;
  resumeRichText?: string;
  resumeDocumentUrl?: string;
}

export interface TeamViewerArticleBinding {
  articleId: string;
  articleSiteUrl?: string;
  articlePageUrl?: string;
  destinationKey?: string;
  resolutionSource: 'host-context' | 'property' | 'direct-binding';
}

export interface TeamViewerGroup {
  id: string;
  label: string;
  people: TeamViewerPerson[];
}

export type TeamViewerDensity = 'compact' | 'standard' | 'expanded';
export type TeamViewerLayout = 'grid' | 'rail' | 'strip' | 'grouped';
```

### 4. Rendering model by team size

#### Small teams
- stronger card presence
- optional larger imagery
- room for richer hover/detail affordance

#### Medium teams
- balanced grid or strip
- consistent title handling
- grouped scanability if relevant

#### Large teams
- tighter density
- capped visible members with expand path
- optional grouping
- overflow strategy
- no visually broken wrapping behavior

### 5. Surface posture

Recommended primary posture:
- premium people-focused surface
- stronger than default card grid
- visually distinct from Kudos
- refined but not playful
- confident scan hierarchy

Recommended hierarchy:
- section identity / heading
- optional subgroup label or team descriptor
- people cards/rows
- optional detail expansion
- premium empty state when no records exist

### 6. Interaction model

Use only purpose-fit interactions.

Recommended:
- hover/focus states on person tiles
- press state for click targets
- keyboard-safe open detail behavior
- a right-side bio/resume slide-out built with Kudos-grade shell mechanics
- density toggle only if it materially helps
- search/filter only if backed by real need

Critical lock:
- the bio/resume slide-out must be **implemented for real**
- the feature must be **disabled by default** via explicit config / feature flag
- harness and seeded validation must still prove the enabled path works

Avoid:
- decorative controls with no real value
- Kudos-style article/feed semantics
- forced drawers if they add no useful data

### 7. Photo and fallback model

Recommended precedence:
1. explicit image URL
2. resolved SharePoint user photo
3. Graph-backed photo lookup
4. initials fallback

Fallback rules:
- missing photo → initials avatar
- missing title → omit title row but preserve spacing rhythm
- missing name → hide invalid item or render a controlled “Unknown team member” fallback, depending on source quality policy
- no people → premium empty state

### 8. Accessibility model

Must include:
- visible focus
- semantic buttons/links
- no hover-only critical data
- keyboard open/close for detail behavior
- reduced-motion compliance where animated transitions exist
- light-theme-first homepage compliance

### 9. Validation model

Minimum required proof:
- unit or harness proof for selectors, article binding, and fallback handling
- seeded data scenarios:
  - no photo
  - no title
  - partial identity
  - empty dataset
  - large dataset
  - unresolved host-context article binding
  - resolved article binding with ordered team-member child rows
  - bio/resume drawer enabled
  - bio/resume drawer disabled by default
- hosted screenshots / runtime proof
- conformance scoring against benchmark categories

---

## Final architecture recommendation

### Implementation mode
**Hybrid new-build with selective generalized seams**

### Why
Because the repo proves good reusable mechanics, but not a clean reusable people-viewer product layer.

### Translation rule
Learn from Kudos’:
- seam discipline
- runtime maturity
- photo handling
- state completeness
- validation seriousness

Do not inherit Kudos’:
- workflow semantics
- domain contracts
- surface identity
- interaction grammar where it is recognition-specific
