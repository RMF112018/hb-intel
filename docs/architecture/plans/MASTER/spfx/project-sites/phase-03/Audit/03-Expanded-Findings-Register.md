# Expanded Findings Register

## Severity model
- **P0** = severe responsive failure / materially broken UX
- **P1** = major responsive weakness / materially weak UX / strong remediation need
- **P2** = meaningful responsive improvement opportunity
- **P3** = hardening / polish / secondary improvement

---

## PS-RWD-01 — Current layout contract is too coarse for doctrine-required display classes
**Priority:** P1  
**Files:**  
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`
- `docs/architecture/reviews/spfx/project-sites/project-sites-breakpoint-contract-compact-mode-closure.md`

**Exact seams / symbols:**  
`PROJECT_SITES_WIDE_MIN_WIDTH`, `PROJECT_SITES_MEDIUM_MIN_WIDTH`, `PROJECT_SITES_SHORT_HEIGHT_MAX`, `resolveProjectSitesLayoutMode`, `resolveProjectSitesContainerState`, `useProjectSitesContainerState`

**Current issue:**  
The app still compresses a wide range of real display classes into only `compact`, `medium`, and `wide`. The contract is good enough to prevent breakage, but not expressive enough to create intentionally different behavior for phone portrait, phone landscape/short-height, tablet portrait, tablet landscape, standard desktop, and ultrawide.

**Likely user-visible symptom:**  
The surface feels “technically responsive” but not intentionally tuned to the device class or slot width it is actually occupying.

**Affected display classes:**  
phone portrait, phone landscape, tablet portrait, tablet landscape, standard desktop, ultrawide

**Why it matters:**  
The governing doctrine requires deliberate breakpoint behavior, not merely safe shrinkage.

**Root cause explanation:**  
The current contract uses only three named modes plus a short-height force-compact rule. That is a solid mechanical reducer, but too coarse to govern first-screen priorities, density rules, and wide-state composition strongly enough.

**Correction direction:**  
Refresh the layout contract so it explicitly governs more display-class outcomes. This may mean more named modes, or it may mean a richer responsibilities matrix layered onto the current mode names. The important requirement is that the contract become more expressive and more testable.

**Refinement vs structural redesign:**  
Refinement of the container-state seam, but structural redesign of the responsive contract.

**Proof-of-closure expectation:**  
- refreshed contract doc and code agree
- tests cover new or updated mode responsibilities
- mode differences are observable in root/card behavior and not only in prose

---

## PS-RWD-02 — Medium mode is still not a first-class tablet/transitional composition
**Priority:** P1  
**Files:**  
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`

**Exact seams / symbols:**  
`controlBar`, `controlBarMedium`, `searchSlotStacked`, `controlClusterStacked`, `controlClusterCompact`, `compactScopeSelect`, `renderControlBar`

**Current issue:**  
Medium mode still reads as a compressed safety state rather than an intentional tablet/transitional operating layout.

**Likely user-visible symptom:**  
At transitional widths the control band feels tall, stacked, and over-wrapped instead of structured.

**Affected display classes:**  
tablet portrait, tablet landscape, constrained desktop windows

**Why it matters:**  
Medium is the most fragile transition zone in the current surface and strongly affects perceived polish.

**Root cause explanation:**  
The root component applies stacked search/control-cluster behavior to both medium and compact. Compact then gets one clear control swap. Medium therefore inherits a lot of compact-adjacent behavior without getting its own clearly designed arrangement.

**Correction direction:**  
Introduce an explicit medium/tablet control-band composition. Search should remain primary, but scope, sort, and filter actions need a cleaner tablet-quality grouping and sequencing model.

**Refinement vs structural redesign:**  
Structural redesign of the control-band composition.

**Proof-of-closure expectation:**  
- medium has a visibly distinct composition, not only spacing tweaks
- tests assert medium-specific control arrangement behavior
- first-screen control density is measurably improved in tablet evidence

---

## PS-RWD-03 — Compact mode still carries too much body content per card
**Priority:** P1  
**Files:**  
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`

**Exact seams / symbols:**  
`layoutMode`, `isCompactLayout`, `metadataItems`, `identityRow`, `accessConfidence`, `statusMessage`, `metaList`, `footerCompact`

**Current issue:**  
Compact card treatment is mostly a posture change. The card body still keeps much of the same information strategy as wider layouts.

**Likely user-visible symptom:**  
On phones and narrow tablet states, cards feel tall and information-heavy before the user can scan more results.

**Affected display classes:**  
phone portrait, phone landscape, tablet portrait

**Why it matters:**  
A compact layout that preserves nearly desktop-level card density still satisfies width constraints while failing height and scan-speed constraints.

**Root cause explanation:**  
`ProjectSiteCard` only materially branches for `compact`. Even then, most compact-specific logic affects footer layout. The component does not yet have an explicit density policy for chips, launch-confidence messaging, metadata count, or hierarchy reduction.

**Correction direction:**  
Introduce density variants by layout mode. Compact should be allowed to suppress or defer lower-priority metadata while preserving launch-state truthfulness and primary action clarity.

**Refinement vs structural redesign:**  
Structural redesign of card information density.

**Proof-of-closure expectation:**  
- compact card height is reduced by design, not by incidental copy changes
- primary action and launch-state meaning remain intact
- tests assert density differences, not just compact footer alignment

---

## PS-RWD-04 — Filter/chip ergonomics are not sufficiently hardened for constrained-width and touch use
**Priority:** P2  
**Files:**  
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`

**Exact seams / symbols:**  
`activeChipsRow`, `chip`, `chipRemove`, `filterToggleBadge`, `filterPanel`, `facetOption`, `FacetGroup`

**Current issue:**  
The filter system is functionally correct, but still too desktop-shaped in tight states.

**Likely user-visible symptom:**  
Active chips, remove affordances, and filter-panel interactions become dense and height-expensive when the surface narrows.

**Affected display classes:**  
phone portrait, phone landscape, tablet portrait

**Why it matters:**  
This is both a responsive-UX issue and an accessibility/touch-target issue.

**Root cause explanation:**  
The current system keeps chips inline and uses compact remove affordances, but there is no strong compact-state disclosure policy and no explicit touch-target hardening strategy.

**Correction direction:**  
Rework chip visibility/disclosure and ensure compact interaction targets and spacing are credible for pointer/touch use.

**Refinement vs structural redesign:**  
Refinement with some structural UI policy change.

**Proof-of-closure expectation:**  
- compact filter controls remain reachable and understandable
- chip/remove affordances meet a stronger target-size posture
- no primary filter interaction depends on awkward precision tapping

---

## PS-RWD-05 — Sparse desktop and ultrawide states are still under-composed
**Priority:** P1  
**Files:**  
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

**Exact seams / symbols:**  
`grid`, `gridModeWide`, `gridModeMedium`, `gridSparse`, `visibleCount`, `isSparse`

**Current issue:**  
When only one or two cards are visible, wide and ultrawide states leave a large field of inert canvas with small left-anchored content.

**Likely user-visible symptom:**  
The surface looks timid and undersized relative to the available canvas.

**Affected display classes:**  
standard desktop, ultrawide

**Why it matters:**  
The doctrine explicitly rejects “technically correct but spatially timid” SPFx outcomes.

**Root cause explanation:**  
Sparse state currently caps card widths but does not truly recompose the sparse result state for broad canvases.

**Correction direction:**  
Introduce a sparse-layout strategy that uses the wider canvas more deliberately, whether through centered clusters, featured-leading-card treatment, bounded multi-card rails, or another clearly governed composition.

**Refinement vs structural redesign:**  
Structural redesign of sparse wide behavior.

**Proof-of-closure expectation:**  
- one- and two-card states feel intentionally composed at desktop and ultrawide widths
- the surface no longer reads as a small island in a large field
- new behavior is mode-aware and testable/documented

---

## PS-RWD-06 — First-screen vertical budget is still too expensive on constrained states
**Priority:** P1  
**Files:**  
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

**Exact seams / symbols:**  
`header`, `scopeContextPill`, `contextSummary`, `controlBar`, `activeChipsRow`, `renderHeader`, `renderControlBar`, `contextSummaryWarning`

**Current issue:**  
Too much non-result UI appears before the first card in compact and transitional states.

**Likely user-visible symptom:**  
Users must visually traverse title, context, summary, controls, and chips before meaningful results appear.

**Affected display classes:**  
phone portrait, phone landscape, tablet portrait, constrained desktop windows

**Why it matters:**  
This is a first-screen prioritization problem, not only a spacing problem. It directly affects perceived usefulness and scan speed.

**Root cause explanation:**  
The current root composes multiple context and control layers additively. Each one is individually reasonable, but together they consume too much vertical budget before results.

**Correction direction:**  
Compress or progressively disclose secondary context, tighten vertical rhythm, and redesign smaller-state entry sequencing so results arrive sooner without losing essential truthfulness.

**Refinement vs structural redesign:**  
Structural redesign of first-screen prioritization.

**Proof-of-closure expectation:**  
- cards appear materially sooner on compact and narrow-tablet first screens
- important context is preserved but no longer dominates the entry state
- changes remain host-safe and accessible

---

## PS-RWD-07 — Existing contract and evidence docs are real, but no longer sufficient
**Priority:** P2  
**Files:**  
- `docs/architecture/reviews/spfx/project-sites/project-sites-breakpoint-contract-compact-mode-closure.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-end-state-validation-evidence.md`
- `packages/spfx/src/webparts/projectSites/projectSitesLayoutMode.test.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`

**Exact seams / symbols:**  
existing closure docs and tests listed above

**Current issue:**  
The repo now has a breakpoint contract and evidence record, but both are still anchored to the earlier three-mode closure and do not yet fully protect the richer responsive future state this audit now requires.

**Likely user-visible symptom:**  
Later regressions could bring back weak tablet composition or over-dense compact cards without a strong enough proof layer to catch them.

**Affected display classes:**  
all classes indirectly

**Why it matters:**  
The package must not pretend the artifact is missing, but it must also not treat the current artifact as complete.

**Root cause explanation:**  
The current contract and tests were written around the prior closure objective, which successfully established the existence of a breakpoint contract but not the full premium responsive standard now desired.

**Correction direction:**  
Refresh existing docs and expand the proof layer. Do not create misleading duplicate artifacts unless there is a very clear supersession strategy.

**Refinement vs structural redesign:**  
Refinement of documentation and test coverage.

**Proof-of-closure expectation:**  
- current docs are refreshed or superseded intentionally
- responsive intent is discoverable from docs and tests
- hosted validation instructions are explicit

---

## PS-RWD-08 — Compact-state interactions need stronger accessibility and reflow hardening
**Priority:** P2  
**Files:**  
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

**Exact seams / symbols:**  
`sortSelect`, `compactScopeSelect`, `chipRemove`, `facetOption`, `openSiteAction`, `provisioningLabel`, `filterPanel`

**Current issue:**  
The current surface is generally accessible, but compact-state interaction sizing and reflow expectations are not yet explicitly hardened against touch constraints and zoom/reflow pressure.

**Likely user-visible symptom:**  
Small clustered controls can feel fiddly at high zoom or on touch-first use.

**Affected display classes:**  
phone portrait, phone landscape, tablet portrait

**Why it matters:**  
Responsive quality includes interaction safety, not just layout survivability.

**Root cause explanation:**  
The current package already uses accessible patterns, but there is not yet a clearly enforced compact-state target-size and reflow posture for the smallest interactive affordances.

**Correction direction:**  
Harden compact interactions against target-size and reflow requirements while preserving density discipline.

**Refinement vs structural redesign:**  
Refinement.

**Proof-of-closure expectation:**  
- compact interactions remain reachable at constrained widths
- no critical task requires awkward two-dimensional scrolling or precision tapping
- compact-state controls reflect explicit target-size intent

---

## PS-RWD-09 — Responsive proof should include a visual-regression path, not only unit assertions
**Priority:** P3  
**Files:**  
- `packages/spfx/src/webparts/projectSites/*.test.*`
- any future Playwright or hosted-validation seam adopted for Project Sites

**Exact seams / symbols:**  
current unit tests plus any future screenshot-validation harness

**Current issue:**  
The current proof model is almost entirely structural and DOM-state based. That is useful, but it is not enough to protect premium composition quality over time.

**Likely user-visible symptom:**  
Visually degraded but technically passing compositions can slip through.

**Affected display classes:**  
medium, wide, ultrawide, compact

**Why it matters:**  
The target state is visibly productized. The proof model should eventually be able to catch visible layout regressions, not only missing DOM states.

**Root cause explanation:**  
The prior closure work focused correctly on contract existence and primary component tests, but it stopped short of visual-regression posture.

**Correction direction:**  
Add a practical path for screenshot-based validation or at minimum a hosted screenshot checklist with stable named display classes.

**Refinement vs structural redesign:**  
Hardening / secondary improvement.

**Proof-of-closure expectation:**  
- a stable validation matrix exists
- screenshot evidence or screenshot-capable tooling is part of the future-proofing path
