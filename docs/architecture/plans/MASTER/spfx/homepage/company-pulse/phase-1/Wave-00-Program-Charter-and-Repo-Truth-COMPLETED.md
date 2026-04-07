# Wave 00 — Program Charter and Repo Truth (Completed)

> **Status:** Locked
> **Audited:** 2026-04-07
> **Source charter:** `Wave-00-Program-Charter-and-Repo-Truth.md`

---

## 1. Repo-Truth Notes

Audited from live repo state on 2026-04-07.

### CompanyPulse.tsx

- **Path:** `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
- **Lines:** 94
- **Pattern:** Pure presentation component, delegates layout to `HbcEditorialSurface` from `@hbc/ui-kit/homepage`
- **Imports:** `HbcEditorialSurface`, `HbcPremiumCta`, `HbcPremiumBadge`, `FileText`, `Clock` (lucide icons)
- **Props:** `config?: Partial<CompanyPulseConfig>`, `activeAudience?: string`, `isLoading?: boolean`
- **Composition:** Featured item (eyebrow, title, excerpt, metadata badge, clock icon, CTA) + bounded secondary item list
- **Empty/loading:** Shared `HomepageEmptyState` / `HomepageLoadingState` components
- **Category variant map:** `update→info`, `safety→warning`, `recognition→success`, `milestone→critical`
- **Phase tag:** P17-05 structural rebuild comment present

### Manifest

- **Path:** `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json`
- **UUID:** `0b53f651-fd92-4f7f-a9da-f7797017f5eb`
- **Alias:** `CompanyPulseWebPart`
- **Host:** `SharePointWebPart`
- **Hidden from toolbox:** `true`
- **Preconfigured group:** HB Intel (`5c03119e-3074-46fd-976b-c60198311f70`)
- **Default heading:** "Company Pulse"
- **Default maxSecondaryItems:** 3
- **Default seed items:** 2 (one featured milestone, one safety highlight)

### Barrel exports

- **Path:** `apps/hb-webparts/src/webparts/companyPulse/index.ts` (2 lines)
- **Exports:** `CompanyPulse` component, `CompanyPulseProps` type

### Mount seam

- **Path:** `apps/hb-webparts/src/mount.tsx`
- **Registration:** UUID-keyed entry in `WEBPART_RENDERERS` map — `createElement(CompanyPulse, { config })`
- **Gap:** Only `config` is passed from the mount dispatcher; `activeAudience` and `isLoading` are not wired from the SPFx mount seam

### Data and normalization

- **Normalizer:** `normalizeCompanyPulseConfig()` in `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts` (401 lines)
- **Behavior:** Pure synchronous function — validates items (requires id, title, summary), filters by audience visibility, normalizes CTAs (requires both label and href), sorts by priority (featured first, then order, then alphabetical), splits into featured/secondary bounded by `maxSecondaryItems`
- **Returns:** `CuratedCollection<CompanyPulseItem>` (heading, featured?, secondary[])
- **Audience filter:** `isVisibleForAudience()` in `apps/hb-webparts/src/homepage/helpers/visibility.ts`
- **No hooks or API calls** — data flows entirely through props from property pane or parent composition

### Contracts

- **Path:** `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts` (195 lines)
- **CompanyPulseItem:** id, title, summary, category?, metadata?, cta?, featured?, order?, audiences?
- **CompanyPulseConfig:** heading?, items?, maxSecondaryItems?
- **CompanyPulseCategory:** `'update' | 'safety' | 'recognition' | 'milestone'`
- **Default config:** heading "Company Pulse", maxSecondaryItems 3

### Authoring governance

- **Path:** `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts`
- **Zone:** awareness
- **Owner role:** Corporate Communications
- **Freshness cadence:** weekly
- **Zone intent:** "Curated company updates with editorial hierarchy"

### Directory footprint

```
apps/hb-webparts/src/webparts/companyPulse/
  CompanyPulse.tsx                      (94 lines)
  CompanyPulseWebPart.manifest.json     (43 lines)
  index.ts                              (2 lines)
```

Total webpart-local lines: 139. Supporting logic lives in `homepage/helpers/` and `homepage/webparts/`.

---

## 2. Locked Product Direction

### Product decisions

1. **CompanyPulse retains its homepage slot and manifest identity.** UUID `0b53f651-fd92-4f7f-a9da-f7797017f5eb` is preserved. No net-new webpart is created.
2. **CompanyPulse becomes the communications/newsroom surface.** Its role is curated internal news, updates, and editorial content — not generic card rollup.
3. **LeadershipMessage continues to own executive-message posture.** CompanyPulse does not absorb leadership messaging.
4. **PeopleCulture continues to own recognition, celebrations, and Kudos.** CompanyPulse does not absorb people/culture content.
5. **CompanyPulse borrows surface quality discipline from the People & Culture remediation** but not its celebration-first personality.

### Validation statements

**What the current CompanyPulse does:**
It is a lightweight editorial-digest component that delegates its entire layout to `HbcEditorialSurface`. It receives normalized config data through props, renders a featured item with eyebrow/title/excerpt/badge and a bounded list of secondary items. The component itself is 94 lines of prop mapping with no custom composition logic.

**Why the current UI underperforms:**
- Delegates entirely to the generic `HbcEditorialSurface` — the same framework used by `LeadershipMessage`. This prevents CompanyPulse from having a distinct newsroom identity.
- No custom composition zones, no asymmetric featured/supporting split, no media treatment.
- No rich featured-story treatment (no image zone, no scrim, no prominence scaling).
- No category-specific iconography — uses a single hardcoded `FileText` icon.
- Header CTA hardcoded to `"#"` — no real archive destination.
- No sparse-state fallback beyond the generic empty state.
- The result reads as a formatted list, not a newsroom surface.

**How the People & Culture prompt guides the UI:**
The PeopleCultureMerged component demonstrates the premium homepage surface grammar that CompanyPulse should match:
- Premium container quality (warm cream spotlight zone, cool mist support rail, layered shadows with brand-tinted glow)
- Bold focal hierarchy (dominant spotlight ~62% + subordinate rail ~34%)
- Supporting-rail discipline (announcements + celebration chips, structured and bounded)
- Sparse-state resilience (dedicated `SparseLayout` with centered invite hero when featured content is absent)
- CTA integration (action-oriented CTAs placed contextually within composition zones, not just in headers)
- Motion discipline (staggered entrance animations, reduced-motion aware)

**How newsroom tuning must differ from People & Culture:**
- **Register:** Editorial authority and freshness, not warmth and celebration
- **Tone:** Current, authoritative, polished, brand-forward — not playful or socially expressive
- **Hierarchy:** Lead article dominance + headline stack — not kudos spotlight + celebration ribbon
- **Density:** More information-dense and scannable — structured for rapid editorial consumption
- **Color:** Cooler editorial palette with blue-authority tints — not warm cream/orange celebration palette
- **CTAs:** Navigation-oriented (Read more, See all, View archive) — not action-oriented (Celebrate, Give Kudos)
- **Energy:** More energetic than LeadershipMessage, less celebratory than PeopleCulture

---

## 3. Changed-File Plan

### Wave 01 — Data Architecture and Source Model
| Action | Path |
|--------|------|
| Modify | `apps/hb-webparts/src/homepage/webparts/communicationsContracts.ts` — extend `CompanyPulseItem` with media, byline, publishedDate, and richer category model |
| Modify | `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts` — update `normalizeCompanyPulseConfig()` for new fields |
| Modify | `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json` — update seed data to reflect richer newsroom items |

### Wave 02 — UI Kit Extension and Newsroom Primitives
| Action | Path |
|--------|------|
| Create | `packages/ui-kit/src/homepage/HbcFeaturedStoryCard.tsx` — premium featured article component with image zone, scrim, headline, byline, metadata |
| Create | `packages/ui-kit/src/homepage/HbcHeadlineStack.tsx` — compact secondary headline list with category chips and recency metadata |
| Create | `packages/ui-kit/src/homepage/HbcEditorialCategoryChip.tsx` — category badge/chip for editorial content taxonomy |
| Modify | `packages/ui-kit/src/homepage/index.ts` — export new primitives |

### Wave 03 — CompanyPulse Render-Layer Rebuild
| Action | Path |
|--------|------|
| Rebuild | `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx` — replace `HbcEditorialSurface` delegation with custom newsroom composition (featured story zone + headline stack rail) |
| Modify | `apps/hb-webparts/src/webparts/companyPulse/index.ts` — update exports if interface changes |

### Wave 04 — Newsroom Destination and Archive Surface
| Action | Path |
|--------|------|
| Modify | `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx` — wire real archive CTA destination |

### Wave 05 — Authoring, Sparse-State, and Governance Hardening
| Action | Path |
|--------|------|
| Modify | `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx` — add sparse-state layout (featured-only, category-highlight fallback) |
| Modify | `apps/hb-webparts/src/homepage/helpers/authoringGovernance.ts` — refine CompanyPulse governance messages for newsroom posture |
| Modify | `apps/hb-webparts/src/homepage/helpers/communicationsConfig.ts` — harden validation for new fields |

### Wave 06 — Packaging, Validation, and SharePoint Proof
| Action | Path |
|--------|------|
| Verify | `apps/hb-webparts/src/webparts/companyPulse/CompanyPulseWebPart.manifest.json` — confirm manifest integrity post-rebuild |
| Verify | Build output — confirm `.sppkg` validates and rendered output matches structural intent |

---

## 4. UI Trait Borrowing Statement

The following premium surface traits are borrowed from the People & Culture remediation and retuned for CompanyPulse's editorial/newsroom register:

| Borrowed Trait | People & Culture Expression | CompanyPulse Retune |
|---|---|---|
| **Premium container** | Warm cream spotlight (`#FDF8F4`) + cool mist rail (`rgba(34,83,145,0.022)`), orange-tinted card glow (`rgba(229,126,70,0.12)`) | Cooler editorial palette, blue-authority tints, subtle newsroom depth — gravitas over warmth |
| **Bold focal hierarchy** | Dominant kudos spotlight (~62% desktop) + subordinate announcement/celebration rail (~34%) | Dominant lead article zone (~65-70%) + compact headline stack rail (~26-30%) |
| **Supporting rail discipline** | Announcements section with type badges + celebration chips with avatar/name/type/date | Secondary story list with category chips, recency metadata, and concise headlines |
| **Sparse-state resilience** | Dedicated `SparseLayout` with centered invite hero icon + announcement/celebration lists when featured kudos absent | Sparse newsroom layout with featured-only display or category-highlight fallback when secondary stories are absent |
| **CTA integration** | Action-oriented CTAs: Celebrate (secondary variant), Give Kudos (ghost variant) — placed within composition zones | Navigation-oriented CTAs: Read more (secondary), See all (ghost), View archive — guiding to newsroom depth |
| **Motion discipline** | Staggered entrance: hero first, rail with 150ms delay; `usePrefersReducedMotion()` respected | Same stagger pattern with lighter motion weight; editorial surfaces favor crispness over warmth |
| **Badge/chip system** | `HbcPremiumBadge` for announcement types (info, success, warning, critical) | `HbcPremiumBadge` for story categories (update, safety, recognition, milestone) with editorial color mapping |
| **Brand shadow language** | Blue + orange layered shadows, orange glow on featured card | Blue-dominant layered shadows, cooler glow — authority over celebration |
| **Responsive stacking** | Desktop flex split → tablet/mobile full-width stacking | Same responsive breakpoint pattern: flex split on desktop, stacked on mobile/tablet |
| **Safe image fallback** | Branded placeholder with ring effect on avatars | Branded placeholder with editorial styling for article images; no avatar treatment needed |

### What is NOT borrowed

- Warm gradient hero banner (orange → dark → blue) — CompanyPulse uses cooler editorial header treatment
- Celebration ribbon and chips — these are People & Culture content patterns, not newsroom patterns
- Avatar-rich composition — newsroom content is article-centric, not person-centric
- "Give Kudos" action model — CompanyPulse has no user-generated content actions
- Decorative circles and warm cream backgrounds — these carry celebratory energy inappropriate for editorial authority
