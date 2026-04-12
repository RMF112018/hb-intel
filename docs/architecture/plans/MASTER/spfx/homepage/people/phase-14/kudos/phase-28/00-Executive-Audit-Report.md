# HB Kudos Repo-Truth Audit — Main Branch

Date: April 12, 2026  
Repo: `https://github.com/RMF112018/hb-intel.git`  
Branch audited: `main`

## Phase 1 — Audit framing

### Objective
Conduct an exhaustive, repo-truth audit of the current HB Kudos implementation and generate a remediation package that closes one finding at a time. The audit covers the public employee-facing Kudos surface, the companion governance surface, shared homepage seams, relevant UI-kit/shared shell dependencies, manifest posture, and validation posture.

### Governing authority
Primary governing doctrine for this audit:

1. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
2. `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Broader supporting authority also applied:

- `docs/reference/ui-kit/homepage-webpart-benchmark.md`
- `apps/hb-webparts/.eslintrc.cjs`

### Evaluation criteria
The implementation was evaluated against:

- homepage/SPFx host-aware doctrine
- homepage import discipline
- token and styling discipline
- premium-stack usage where relevant
- React decomposition and maintainability
- accessibility and interaction rigor
- SPFx manifest/packaging intent
- product quality of the public surface
- product quality of the companion moderation workspace
- validation/test posture

---

## Phase 2 — Repo-truth implementation map

### Public runtime
Primary entry:

- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`

Primary public composition seams:

- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosFeedPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosArticleReader.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/ArchiveList.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudos/kudosVariants.ts`
- `apps/hb-webparts/src/webparts/hbKudos/kudosIcons.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`

### Companion runtime
Primary entry:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

Primary companion composition seams:

- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/QueueRow.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/DetailPanel.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/BulkActionBar.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`

### Shared homepage / shell seams
Relevant shared seams actually participating in the rendered experience:

- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`
- `apps/hb-webparts/src/homepage/shared/kudosShells.tsx`

### Shared UI-kit seam actually in use
Critical premium shell:

- `packages/ui-kit/src/HbcKudosComposer/HbcKudosComposerFlyout.tsx`

### Validation seams
Evidence of substantial harness / test investment:

- `apps/dev-harness/src/harness/kudosHarness.ts`
- `e2e/webparts/kudos/README.md`

### Import governance seam
Homepage import policy enforcement:

- `apps/hb-webparts/.eslintrc.cjs`

---

## Phase 3 — Exhaustive audit findings

## A. Doctrine compliance findings

### Finding 1 — Token discipline is not fully closed in ordinary webpart CSS source
**Severity:** P0

#### Evidence
The benchmark explicitly says ordinary homepage webpart CSS modules must have zero hardcoded hex/rgba/raw px for color, spacing, radius, elevation, or transition values, with values flowing from a governed token bridge. The current public and companion CSS modules still contain substantial raw geometry/elevation literals throughout.

Examples:
- `apps/hb-webparts/src/webparts/hbKudos/kudosSurface.module.css`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

The companion module also still contains direct color literals in ordinary source:
- `color: #ffffff;`
- `background: linear-gradient(135deg, var(--hbk-brand-orange) 0%, #d4693a 100%);`

#### Why it matters
The doctrine and benchmark do not treat this as cosmetic. Literal geometry/elevation/color values in ordinary homepage source make the surface harder to govern, easier to drift, and harder to audit. The current implementation has a good token bridge concept, but it has not completed the last-mile closure.

#### Recommended direction
Do not patch only the two obvious hex values. Close the finding comprehensively:
- move geometry/elevation/animation/spacing aliases into a formal surface token seam
- eliminate ordinary-source raw px / raw color literals from public and companion CSS modules
- keep only the sanctioned runtime-measured inline values
- make the benchmark pass literally, not rhetorically

---

### Finding 2 — The companion workspace still reads as a conventional queue tool rather than a flagship moderation product surface
**Severity:** P0

#### Evidence
The companion host is cleanly decomposed, but the rendered composition remains conventional:
- header
- sticky control zone
- filter chip bar
- bulk bar
- queue region
- detail flyout

Queue rows are still wrapped in `HbcCard` and rendered as repeated card/list items:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/QueueRow.tsx`

The host structure itself confirms a standard queue surface rather than a more intentional triage workspace:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanion.tsx`

#### Why it matters
The doctrine explicitly prohibits timid enterprise card-grid outcomes and prefers structural replacement over decorative refinement. The companion is no longer messy, but it is still compositionally cautious. It looks like a good internal moderation utility, not the best product-grade answer.

#### Recommended direction
Do a real structural redesign of the companion:
- replace the repeated generic-card posture
- introduce a stronger triage layout with persistent context
- make priority, state, and actionability legible before opening the detail sheet
- treat the moderation experience as a premium operational product, not just a cleaned-up queue

---

### Finding 3 — Action ergonomics are still too deep; moderation remains detail-panel dependent
**Severity:** P1

#### Evidence
`QueueRow.tsx` exposes selection and open-detail behavior, but not meaningful row-level quick triage controls. Nearly all meaningful actions live inside `DetailPanel.tsx`, grouped in the flyout:
- review decision
- publication & prominence
- admin review flag
- ownership
- takedown

Relevant files:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/QueueRow.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/DetailPanel.tsx`

#### Why it matters
This increases click depth for the most common moderation flows. The operator can scan state, but cannot act with sufficient speed. For a governance surface, the queue should support quicker triage without requiring nearly every item to open a secondary workspace.

#### Recommended direction
Introduce row-level quick actions for the most common safe operations and redesign the queue/detail relationship so the detail view becomes deliberate depth, not the default path for nearly every action.

---

### Finding 4 — The task-dialog shell introduces nested dialog semantics
**Severity:** P1

#### Evidence
`HbcKudosComposerFlyout.tsx` already renders the outer overlay as `role="dialog"` with `aria-modal="true"`.
`KudosTaskDialogShell` then renders another `role="dialog"` element inside that flyout body.

Relevant files:
- `packages/ui-kit/src/HbcKudosComposer/HbcKudosComposerFlyout.tsx`
- `apps/hb-webparts/src/homepage/shared/kudosShells.tsx`

#### Why it matters
Nested dialog semantics are not a small detail. They create ambiguous semantics for assistive technology and weaken an otherwise strong flyout shell. The current task shell should present task-specific content inside the dialog, not declare a second dialog inside the first.

#### Recommended direction
Remove nested dialog semantics from the inner task shell and revalidate the entire task-dialog family for focus, labeling, and screen-reader clarity.

---

### Finding 5 — Full-bleed / manifest intent is not convincingly aligned with product role
**Severity:** P1

#### Evidence
The companion manifest declares `supportsFullBleed: true`:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`

The public manifest does not:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`

#### Why it matters
This is not automatically wrong, but it is odd. The employee-facing public surface is the more natural candidate for visually authoritative homepage placement. The moderation companion is a utility workspace. The current manifests suggest intent drift or at least unarticulated intent.

#### Recommended direction
Conduct an explicit packaging-intent review:
- justify full-bleed for the companion with a product reason, or remove it
- confirm whether the public surface should remain non-full-bleed or gain explicit full-width/full-bleed support
- document the decision so packaging matches real placement strategy

---

### Finding 6 — The shared token bridge is strong in concept but still over-localized
**Severity:** P2

#### Evidence
`KudosGovernancePrimitives.tsx` centralizes a large number of local authored colors and ramps. This is materially better than scattered literals, but the seam is still carrying too much local authored presentation logic.

#### Why it matters
This is acceptable as a transition seam, but not a fully mature end state if HB intends Kudos to remain the benchmark webpart. Too much of the visual system still lives in a single local file rather than a more formalized reusable/tokenized layer.

#### Recommended direction
Do not force premature promotion into `@hbc/ui-kit`, but do:
- formalize the local token seam
- reduce ad hoc constant growth
- separate true local exceptions from values that should already be shared or aliased more cleanly

---

## B. UI/UX findings

### Finding 7 — The companion queue scan is improved, but still not decisive enough for high-volume moderation
**Severity:** P1

#### Evidence
The queue has:
- state rail
- status chips
- aging chip
- recipient summary
- date spine

That is good progress. But the row still requires too much vertical reading and too much click-through for action. The design is more polished than generic, but not yet optimized for rapid multi-item governance.

Relevant files:
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/QueueRow.tsx`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/companion.module.css`

#### Why it matters
A moderation queue should feel operationally sharp. The current row anatomy is readable, but it is not yet the fastest possible shape.

#### Recommended direction
Tighten density, elevate priority cues, expose safe quick actions, and consider a more structured row anatomy or split-pane triage model.

---

### Finding 8 — Assignment/reassignment UX is still too raw for a premium governance surface
**Severity:** P1

#### Evidence
`KudosGovernanceAssignmentDialog` uses email entry plus “Resolve user” rather than a more productized assignee search/picker flow.
Relevant file:
- `apps/hb-webparts/src/homepage/shared/KudosGovernancePrimitives.tsx`

#### Why it matters
This technically works, but it feels like an operator utility, not a premium moderation interaction. The companion already has a people-search precedent on the public side; governance reassignment should not feel materially weaker than employee-facing recipient search.

#### Recommended direction
Replace the email-resolve interaction with a governed assignee picker/search flow that supports live match confidence, photo/name identity, and clearer failure handling.

---

### Finding 9 — The public surface is materially stronger than the companion, and does not need a full rewrite
**Severity:** Opportunity

#### Evidence
The public runtime is a thin orchestrator, the hero/recent/archive structure is coherent, the flyout shell is strong, and the icon/variant seams are governed.

Relevant files:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/PublicKudosSurface.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- `packages/ui-kit/src/HbcKudosComposer/HbcKudosComposerFlyout.tsx`

#### Why it matters
This is important because the remediation package should not overreact. The public surface still has room for selective refinement, but it is not the part of the system demanding structural replacement first.

#### Recommended direction
Preserve the public surface architecture. Focus its remediation on doctrine closure, token closure, and selective polish — not a wholesale redesign.

---

## C. React / code quality findings

### Finding 10 — Architecture is substantially healthier than a typical legacy SPFx surface
**Severity:** Strength

#### Evidence
Both public and companion entrypoints are thin orchestrators and rely on extracted hooks, components, and shared seams:
- `HbKudos.tsx`
- `HbKudosCompanion.tsx`

#### Why it matters
This is a real strength. The package should preserve decomposition and avoid collapsing logic back into large entry files.

#### Recommended direction
Preserve the current decomposition posture. Fix the weak seams without undoing the structural cleanup already achieved.

---

### Finding 11 — Some shared seams are carrying too many responsibilities
**Severity:** P2

#### Evidence
`KudosGovernancePrimitives.tsx` is both:
- a token bridge
- a primitive factory
- a dialog family
- an audit timeline surface
- an assignee resolution surface

#### Why it matters
The file is not catastrophic, but it is starting to become a gravity well. Long-term maintainability will improve if the token bridge, task dialogs, and timeline/assignment primitives are separated more cleanly.

#### Recommended direction
Split this file by concern after the more important UI/UX closures are complete.

---

## D. Accessibility / interaction rigor findings

### Finding 12 — Accessibility posture is mostly strong, but the nested-dialog issue is a real regression
**Severity:** P1

#### Evidence
Positive signals:
- focus-visible treatment appears throughout public and companion CSS
- `prefers-reduced-motion` handling exists in public surface CSS and in the flyout shell
- explicit focus restoration and focus trap exist in `HbcKudosComposerFlyout.tsx`

Regression:
- nested dialog semantics in `KudosTaskDialogShell`

#### Why it matters
The system is close to strong accessibility posture, which makes the remaining semantic issue more important to close cleanly.

#### Recommended direction
Keep the current focus/motion shell behavior. Fix task-shell semantics and re-run hosted keyboard/focus coverage.

---

## E. SPFx / packaging findings

### Finding 13 — Host-aware behavior is one of the strongest parts of the current implementation
**Severity:** Strength

#### Evidence
- host-safe layout hook / safe-zone sentinel in the public runtime
- host offset and focus restoration in the shared flyout shell
- dev harness plus hosted Playwright coverage

Relevant files:
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `packages/ui-kit/src/HbcKudosComposer/HbcKudosComposerFlyout.tsx`
- `apps/dev-harness/src/harness/kudosHarness.ts`
- `e2e/webparts/kudos/README.md`

#### Why it matters
This is the correct SPFx posture. The remediation package should preserve this strength.

#### Recommended direction
Do not rewrite the host-aware flyout mechanics. Build on them.

---

## F. Validation / production-readiness findings

### Finding 14 — Hosted validation is strong, but doctrine-drift guardrails are weaker than interaction guardrails
**Severity:** P1

#### Evidence
The hosted test lane is substantial:
- harness adapter exists
- README documents a large hosted suite

But the repo evidence provided here shows import discipline guardrails and hosted interaction tests, not an equivalent automated guard against CSS literal/token drift in the webpart family.

Relevant files:
- `e2e/webparts/kudos/README.md`
- `apps/dev-harness/src/harness/kudosHarness.ts`
- `apps/hb-webparts/.eslintrc.cjs`

#### Why it matters
The repo can ship a surface that “works” while still drifting from doctrine. That is exactly what appears to have happened with CSS literal closure.

#### Recommended direction
Add static validation / lint / audit checks for:
- raw color literals in ordinary webpart CSS modules
- raw geometry/elevation literals in ordinary webpart CSS modules
- prohibited import sources
- manifest intent rules where applicable

---

## Phase 4 — Executive audit summary

### Overall quality judgment
HB Kudos is no longer a weak or messy implementation. It has real strengths:
- thin orchestrator entrypoints
- solid host-aware shell behavior
- governed icon seam
- real premium-stack use in the shared flyout family
- serious harness and hosted validation investment

That said, it is **not fully doctrine-compliant** and **not yet fully premium / benchmark-grade** across the whole product.

### Compliance judgment
- **Import discipline:** largely compliant
- **Host-aware SPFx posture:** strong
- **Premium-stack usage:** partially strong
- **Token discipline:** not fully compliant
- **Companion product quality:** materially under target
- **Accessibility:** mostly strong, but with a real dialog-semantics defect
- **Manifest / packaging intent:** needs explicit cleanup

### Biggest issues
1. Token discipline closure is incomplete in ordinary webpart CSS source.
2. The companion is still structurally too conservative for the governing doctrine.
3. Moderation actions are too detail-panel dependent.
4. Task dialog semantics need correction.
5. Packaging/full-bleed intent is not clearly aligned with product role.
6. Static guardrails do not appear strong enough to stop doctrine drift from reappearing.

### Biggest missed opportunities
1. The companion could be a genuinely excellent moderation workspace rather than a cleaned-up queue.
2. Reassignment / ownership workflows could feel premium instead of operator-raw.
3. The benchmark status of Kudos is undermined when doctrine text is stronger than the actual closure state.

### Highest-priority remediation themes
1. Finish doctrine/token closure first.
2. Redesign the companion structurally, not cosmetically.
3. Reduce moderation click depth.
4. Fix task-shell accessibility semantics.
5. Tighten packaging and validation discipline.

---

## Phase 5 — Prompt package generation strategy

The package generated alongside this report is serialized by finding and deliberately avoids blended remediation. Each prompt:
- activates one finding only
- instructs exhaustive footprint tracing
- forbids superficial patching
- requires closure proof before moving on
- tells the code agent not to re-read files already in its active context/memory

No full rewrite is recommended for the public employee-facing surface. The companion governance surface does warrant structural redesign.
