# TeamViewer — Phase-01 Closure Review & Conformance Scorecard

## 1. Closure summary

TeamViewer is a new article-bound, premium SPFx homepage webpart that
presents article-linked team members (photo, name, title) with a
flag-gated bio/resume slide-out. Phase-01 delivered, across six
prompts:

- Prompt 01: anti-coupling architecture + seam scaffold.
- Prompt 02: normalized contracts, GUID-disciplined list sources,
  host-context resolution, documented schema gaps.
- Prompt 03: premium surface (CVA tile vocabulary, decisive
  hover/focus/press, motion staggered entry, Users lucide nameplate),
  real motion-animated drawer with focus restore + reduced-motion.
- Prompt 04: locked 4-tier photo precedence with broken-image
  hardening.
- Prompt 05: manifest/mount wiring, unhidden toolbox entry, dev-harness
  tab with 11 seeded validation scenarios.
- Prompt 06 (this file): closure review + conformance scoring.

TeamViewer passes closure at **37/40**.

## 2. Doctrine compliance review

- **`UI-Doctrine-SPFx-Governing-Standard.md`** — Primary UI imports
  flow through `@hbc/ui-kit/homepage` (HbcEmptyState, HbcSpinner,
  motion/AnimatePresence, cva, lucide `Users`/`ArrowRight`/`Mail`/
  `Link2`/`ExternalLink`). No direct `fluentui`, no shell recreation,
  no domain coupling to Kudos.
- **`UI-Doctrine-SPFx-Homepage-Overlay.md`** — Token-backed CSS via
  `teamViewerCSSVars()`; hosted safe-zone honored via
  `useTeamViewerHostSafeLayout`; light-theme-first rhythm.
- **`.claude/rules/03-package-boundaries.md`** — TeamViewer composes
  `@hbc/ui-kit` primitives and homepage helpers
  (`peopleCultureProfilePhotoResolver`) without creating a duplicate
  reusable visual primitive. Local hooks are documented as
  pre-generalization candidates (promote only when a second consumer
  appears).
- **`.claude/rules/05-implementation-quality.md`** — Strong typing,
  explicit contracts, pure selectors, abortable fetches, typed
  `TeamViewerSourceResult` with `not-provisioned` guard.

No doctrine violations observed.

## 3. Strengths

1. **Persona is distinct**: Users lucide icon + accent-gradient
   nameplate, ArrowRight trailing affordance, hover lift +
   accent-soft background. Reads as a people viewer, not a renamed
   Kudos module.
2. **State set is complete**: loading / error (+retry) / empty /
   article-unresolved / surface — all wired with `data-hbc-binding`
   attributes for e2e.
3. **Anti-coupling is explicit**: zero imports from `../hbKudos/` or
   `../hbKudosCompanion/`; a `grep` is clean.
4. **Photo precedence is deterministic**: explicit → SP Delve → Graph
   fallback → initials, with `<img onError>` hardening.
5. **Schema gaps are documented, not hand-waved**: two co-located
   markdown artifacts (`data/SCHEMA-NOTES.md`, `photos/PHOTO-POLICY.md`,
   plus `HARNESS-VALIDATION.md`).
6. **Real drawer**: motion slide-in, backdrop, dialog semantics,
   focus restore, Escape, reduced-motion, sanitized-HTML resume
   section, mailto + profile + document links.

## 4. Remaining gaps

1. **Live list GUIDs not provisioned** in
   `teamViewerListRegistry.ts`. Runtime degrades to the empty state.
2. **Bio/resume schema** — CLOSED. `ResumeRichText`,
   `ResumeDocumentUrl`, and `ResumeDocumentLabel` are now provisioned
   by `packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1`
   alongside the pre-existing `BioSnippet` and `ContactLink`. Drawer
   renders through the locked contract with no unprovisioned
   assumptions.
3. **Focus trap inside the drawer** is not implemented — browser
   default tab order is acceptable for a read-only viewer, but a full
   trap is a nice-to-have for keyboard-only navigation. Held back
   from UX-completeness rather than accessibility.

## 5. Accepted exceptions

**Exception 1 — empty list GUIDs.** Scope: three entries in
`teamViewerListRegistry.ts`. Reason: the publisher product's article
lists are not yet provisioned in this tenant. The source functions
guard with `isProvisioned` and return a typed `not-provisioned` result;
the hook degrades to an empty render without issuing any doomed
requests. Populate the GUIDs when the lists go live — no other code
needs to move.

## 6. Conformance scorecard

| # | Category | Score / 4 | Rationale |
|---|---|---:|---|
| 1 | Purpose-fit sophistication & persona | 4 | Nameplate header, gradient badge, CVA vocabulary, ArrowRight affordance, motion stagger. |
| 2 | Interaction completeness | 3 | Hover/focus/press + keyboard + drawer open/close/escape/focus-restore/reduced-motion. No focus trap. |
| 3 | Shared primitive discipline | 4 | All primary UI via `@hbc/ui-kit/homepage`. Zero Kudos imports. |
| 4 | Contract / data rigor | 4 | Normalized `TeamViewerPerson`, strict fallback rules, abortable hook, `not-provisioned` guard. |
| 5 | Backend seam quality | 3 | GUID-binding, OData filters, typed results. Live GUIDs pending (accepted exception). |
| 6 | State orchestration | 4 | Five distinct states with `data-hbc-binding` e2e hooks. |
| 7 | UX completeness | 4 | Densities auto-select by team size; grid/rail/strip/grouped layouts. |
| 8 | Identity / media / attribution | 4 | 4-tier precedence (explicit → SP → Graph → initials) + broken-image hardening. |
| 9 | A11y / host behavior | 3 | Dialog semantics, Escape, focus restore, reduced-motion, live-region, hosted safe-zone. No focus trap. |
| 10 | Validation / closure proof | 4 | 11 seeded scenarios, typecheck + lint clean, dual drawer-flag provability. |

**Total: 37 / 40.** Pass (≥ 32, no category below 2, doctrine OK).

## 7. Pass/fail decision

**PASS.** TeamViewer is approved to close Phase-01.

## 8. Anti-homogenization confirmation

TeamViewer reached benchmark-grade quality **without becoming
Kudos-for-people**:

- Icon vocabulary: `Users` (not `Trophy`); trailing `ArrowRight`
  (not `ThumbsUp` / celebrate).
- No archive/feed/composer grammar. No celebrate affordance. No
  recognition copy. No workflow/governance surfaces.
- No imports from `../hbKudos/**` or `homepage/shared/KudosGovernance*`.
- Stable selectors namespaced to `team-viewer`
  (`data-hbc-webpart="team-viewer"`,
  `data-hbc-testid="team-viewer-public-root"`).
- Visual grammar: editorial nameplate + people-centric tiles with
  decisive-but-calm hover lift. Kudos uses warm celebratory
  masthead/recent-rail grammar; TeamViewer uses a cool refined grid.

## 9. Benchmark closure checklist

| Line | Proof |
|---|---|
| Manifest + mount wiring correct | Manifest `c2f1b4e7-…` registered in `mount.tsx` against `TEAM_VIEWER_WEBPART_ID`; runtime contract guards drift. |
| Runtime contract ownership documented | `teamViewerRuntimeContract.TEAM_VIEWER_RUNTIME_OWNERSHIP`. |
| Normalized contracts | `teamViewerContracts.ts` + `teamViewerNormalization.ts` with explicit fallback rules. |
| Source-binding explicit | `useTeamViewerArticleBinding` returns tagged `resolutionSource`; `fetchArticleIdForHostContext` filters destination pages. |
| States: loading/empty/error complete | `TeamViewerLoadingState`, `TeamViewerEmptyState`, `TeamViewerErrorState`, article-unresolved variant. |
| Photo fallback intentional | `photos/PHOTO-POLICY.md`; card + drawer have `onError` → initials. |
| Drawer real | `TeamViewerDetailDrawer.tsx` with dialog semantics, focus restore, Escape, reduced-motion. |
| Drawer disabled by default | `DEFAULT_TEAM_VIEWER_FEATURE_FLAGS.profileDetailDrawer = false`; orchestrator conditionally mounts. |
| Hosted runtime considered | `useTeamViewerHostSafeLayout` mirrors Kudos safe-zone discipline. |
| Seeded validation | `apps/dev-harness/src/tabs/TeamViewerTab.tsx` + 11 scenarios. |
| Versioned | Manifest `0.1.5.0`; solution `1.0.0.197`; feature `1.0.0.208`. |
| Docs in place | `README.md`, `ARCHITECTURE.md`, `data/SCHEMA-NOTES.md`, `photos/PHOTO-POLICY.md`, `HARNESS-VALIDATION.md`, this file. |

## 10. Direct answers to mandatory closure questions

1. **Is TeamViewer truly article-bound in the implemented runtime?**
   Yes. `useTeamViewerArticleBinding` resolves a
   `TeamViewerArticleBinding` with a tagged `resolutionSource`
   (`'direct-binding' | 'property' | 'host-context'`); `useTeamViewerData`
   only fetches team-member rows keyed by `ArticleId` via
   `fetchArticleTeamMemberRows`. There is no generic-person-list
   fallback in the code path.
2. **Is host-context article resolution credible and explicit?**
   Yes. `fetchArticleIdForHostContext` queries
   `HB Article Destination Pages` with
   `PageUrl eq <page> and PublishStatus eq 'published'`, takes the
   first row, and returns its `ArticleId`. When no row matches the
   binding resolves to empty and the article-unresolved empty variant
   renders.
3. **Is the bio/resume drawer implemented for real?**
   Yes. `TeamViewerDetailDrawer.tsx` is a motion-animated right-side
   panel with dialog semantics, initial focus on the close button,
   focus restore on dismiss, Escape handling, backdrop-click close,
   reduced-motion compatibility, and section renderers for bio,
   sanitized-HTML resume, resume-document link, profile link, and
   mailto. Not a placeholder.
4. **Is the drawer intentionally disabled by default while still
   provable in harness/validation?** Yes.
   `DEFAULT_TEAM_VIEWER_FEATURE_FLAGS.profileDetailDrawer = false`.
   The orchestrator renders the drawer only when the flag is `true`
   and removes the click handler from tiles (which then render as
   static `<article>` elements). The dev-harness exposes both
   `drawer-disabled` and `drawer-enabled` scenarios, giving provable
   parity.
5. **Are any article-schema or team-member-schema gaps unresolved?**
   Only the tenant-side GUID population is pending. Schema itself is
   fully locked: `BioSnippet`, `ResumeRichText`, `ResumeDocumentUrl`,
   `ResumeDocumentLabel`, and `ContactLink` on `HB Article Team Members`
   are now provisioned by
   `packages/sharepoint-docs/infrastructure/provision-publisher-lists.ps1`.
   The live list GUIDs in `teamViewerListRegistry.ts` remain empty
   placeholders until provisioning runs against the HBCentral tenant;
   the runtime degrades cleanly to the empty state until they land.
