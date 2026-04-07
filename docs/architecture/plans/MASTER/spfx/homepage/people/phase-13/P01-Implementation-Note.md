# P01 — Implementation Note: Repo Truth, Product Direction, and UX Directive

**Date:** 2026-04-07
**Phase:** 13 / P01 — Repo Truth, Product Direction, and UX Directive

---

## Repo-Truth Audit

### Current Give Kudos entry points in `PeopleCultureMerged.tsx`

| Location | Line | Element | Current behavior |
|----------|------|---------|-----------------|
| `HeroBanner` | 184 | `<HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" size="sm" />` | Presentational anchor — no real action |
| `KudosSpotlight` featured card | 262 | `<HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" size="sm" arrow />` | Presentational anchor — no real action |
| `SparseLayout` invite hero | 394 | `<HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="secondary" size="md" arrow />` | Presentational anchor — no real action |

All three currently render as anchor tags pointing to `#give-kudos` with no associated handler. These must all become composer triggers.

### Existing runtime seams confirmed

| Seam | File | Status |
|------|------|--------|
| Site URL storage | `mount.tsx` → `storeSiteUrl(spfxContext?.pageContext?.web?.absoluteUrl)` | Ready |
| Site URL retrieval | `spContext.ts` → `getSiteUrl()` | Ready |
| List-source pattern | `projectSpotlightListSource.ts` | Established pattern for REST API interaction |
| Data hook pattern | `useProjectSpotlightData.ts` | Established pattern for loading/cache/error lifecycle |
| People & Culture list-source | `peopleCultureListSource.ts` | Established in Phase 12 — read path ready, write path needed |
| People & Culture data hook | `usePeopleCultureData.ts` | Established in Phase 12 — read hook ready |
| Content contracts | `communicationsContracts.ts` | `KudosEntry`, `KudosStatus`, `PersonReference`, `KudosRecipient` all exist |

### Current user identity seam

`mount.tsx` already receives `spfxContext?.pageContext?.user` with `displayName` and `email`. This can be threaded through to the composer for submitter metadata without adding a new context seam.

---

## Decision Record: CTA Trigger Strategy

### Problem

`HbcPremiumCta` (in `@hbc/ui-kit`) is hardcoded as a `motion.a` element. Its props interface requires `href: string` and does **not** support `onClick` or button semantics:

```ts
interface HbcPremiumCtaProps {
  label: string;
  href: string;       // required — renders as <a>
  arrow?: boolean;
  external?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'onDark';
  size?: 'sm' | 'md' | 'lg';
}
```

### Decision: Thin wrapper button in `PeopleCultureMerged.tsx`

Rather than modifying `@hbc/ui-kit` (which would be a cross-package change outside P13 scope), the Give Kudos triggers should use a **thin local button wrapper** that:

1. Visually matches `HbcPremiumCta` ghost/secondary styling using the same design tokens
2. Renders as `<button type="button">` for correct keyboard/screen-reader semantics
3. Accepts an `onClick` handler
4. Is scoped to `PeopleCultureMerged.tsx` (not a new reusable primitive — that would belong in `@hbc/ui-kit` if needed later)

This preserves the visual grammar while giving the composer proper trigger semantics. The "Celebrate" CTA (line 261) and "View All"/"View all" CTAs remain as anchors since they are navigational.

### Future consideration

If more webparts need button-semantic CTAs, `HbcPremiumCta` should be extended with optional `onClick` + `as="button"` support in `@hbc/ui-kit`. That is a Phase 14+ concern.

---

## Decision Record: Component API Changes for `PeopleCultureMerged.tsx`

### Required changes

1. **Add `onGiveKudos` callback prop** — or manage composer state internally via a `useState` toggle
2. **Replace 3 Give Kudos `HbcPremiumCta` instances** with the local button wrapper
3. **Add composer flyout rendering** — conditionally render `KudosComposerFlyout` when open
4. **Thread identity** — pass current user info to the composer for submitter metadata

### Recommended approach: internal state

Since the composer is an integral part of the People & Culture surface (not a separate webpart), managing open/close state internally with `useState` is simpler and more cohesive than lifting state to the parent mount:

```tsx
const [composerOpen, setComposerOpen] = useState(false);
```

All 3 Give Kudos triggers call `() => setComposerOpen(true)`. The flyout calls `onClose={() => setComposerOpen(false)}`.

---

## Decision Record: Preview Component

### Decision: Preview is a lightweight inline section, not a separate component

The preview should be an inline visual within the composer flyout body — not a separate routed page or standalone component. Reasoning:

1. The preview only needs to show a card-like rendering of the headline + message + recipients — essentially a simplified `KudosSpotlight` card
2. Making it a separate component adds indirection for minimal benefit
3. The flyout already manages compose → preview → submit → success states via a state machine

If the preview rendering becomes complex enough to justify extraction, it can be extracted later. For now, keep it as a conditional render section within the composer.

---

## Recommended File Architecture

| File | Responsibility |
|------|---------------|
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerFlyout.tsx` | Flyout shell — open/close, responsive behavior (side-sheet on desktop, full-screen on mobile), focus trap, escape handling, reduced-motion transitions |
| `apps/hb-webparts/src/webparts/peopleCulture/KudosComposerForm.tsx` | Form body — recipient input, headline, message, optional fields, inline preview, submit action bar |
| `apps/hb-webparts/src/homepage/data/kudosSubmissionSource.ts` | SharePoint REST write seam — `createKudosListItem()` mapping form data to Kudos list field internal names |
| `apps/hb-webparts/src/homepage/data/useKudosComposer.ts` | Composer state hook — form state, validation, submit lifecycle, loading/success/error states |

### What stays unchanged

- `communicationsContracts.ts` — existing `KudosEntry` contract already supports the moderation model
- `communicationsConfig.ts` — normalizer unchanged
- `peopleCultureListSource.ts` — read path unchanged
- `usePeopleCultureData.ts` — read hook unchanged
- `spContext.ts` — site URL seam unchanged
- `mount.tsx` — may need minor identity threading

---

## Composer State Model

```
idle → composing → previewing → submitting → success
                                           → error → composing (retain draft)
```

- **idle**: flyout closed
- **composing**: form visible, user entering data
- **previewing**: inline preview of the kudos card (toggled from composing)
- **submitting**: loading indicator, submit button disabled, duplicate prevention
- **success**: warm confirmation with "Close" and optional "Send Another"
- **error**: polished error message, draft retained, user can retry

---

## SharePoint Submission Field Mapping

Based on the Kudos list schema from Phase 12 P01 field resolution:

| Composer input | SharePoint field | Notes |
|---------------|-----------------|-------|
| Headline text | `Headline` | Required |
| Message text | `Excerpt` | Required, plain text |
| Selected recipients (people) | `IndividualRecipients` | Person multi-value |
| Selected recipients (teams) | `TeamRecipients` | Managed metadata |
| Current user | `SubmittedBy` | Person, auto-populated from SPFx context |
| Submission timestamp | `SubmittedDate` | DateTime, auto-populated |
| — | `HomepageEnabled` | Default `false` — moderation required |
| — | `IsPinned` | Default `false` |
| — | `CelebrateCount` | Default `0` |

Fields like `ApprovedBy`, `ApprovedDate`, `PublishStartDate`, `PublishEndDate` are left null — they are set by moderators/admins after review.

---

## Accessibility Requirements

| Requirement | Implementation approach |
|-------------|----------------------|
| Keyboard open/close | Button triggers (`<button type="button">`), Escape closes flyout |
| Focus trap | Focus trapped inside flyout when open; return focus to trigger on close |
| Screen reader | Flyout has `role="dialog"` with `aria-label`; form fields properly labeled |
| Reduced motion | Flyout transition respects `usePrefersReducedMotion()` — no animation when preferred |
| Unsaved changes | Closing a non-empty draft shows a confirmation before discarding |
| Mobile safe areas | Flyout respects `env(safe-area-inset-bottom)` for sticky footer |

---

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Identified which CTA elements become composer triggers | **Done** — 3 Give Kudos CTAs at lines 184, 262, 394 |
| Identified component API changes for `PeopleCultureMerged.tsx` | **Done** — internal `composerOpen` state, local button wrapper, flyout rendering |
| Assessed UI kit CTA primitive for button semantics | **Done** — `HbcPremiumCta` is anchor-only; thin local button wrapper needed |
| Decided whether preview is its own component | **Done** — inline section within composer, not a separate component |
