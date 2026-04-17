# Phase-02 Command Band — Conformance Scorecard

## PriorityActionsRail (Public)

| # | Category | Score | Evidence |
|---|----------|-------|----------|
| 1 | Purpose-fit sophistication and persona expression | 4 | Premium command band with urgency variants, CVA-driven layout modes, Lucide icons, PremiumBadge. Visually distinct from Quick Links, Kudos, or editorial surfaces. |
| 2 | Interaction completeness | 3 | Breakpoint-aware overflow with expand/collapse, external-link indication, keyboard-navigable action rows, motion-aware hover feedback. Preview device modes available. |
| 3 | Shared primitive discipline | 4 | HbcPriorityRailSurface family in @hbc/ui-kit/homepage. Imports via governed entrypoint. No root @hbc/ui-kit or prohibited imports. |
| 4 | Contract / data rigor | 4 | Schema-aligned list descriptors with full internal-name coverage. Raw row interfaces (unknown-typed). Normalized contracts. Validation issue types. Write command discriminated union. 69 tests. |
| 5 | Backend seam quality | 4 | Explicit config list source with documented active-row resolution. Item list source. Audience/schedule/device/overflow filtering pipeline. Cache with TTL and invalidation. |
| 6 | State orchestration | 3 | React hook with loading/error/success states. Manifest-config fallback when SPFx context absent. Device-class responsive state. |
| 7 | UX completeness | 4 | Skeleton loading, empty state with authored messaging, error state with retry, breakpoint-aware overflow, badge visibility toggle. |
| 8 | Identity / media / attribution | 3 | Not directly applicable (no person identity). Icon-driven action classification. External-link vs internal distinction. |
| 9 | Accessibility / host behavior | 3 | Focus-visible outlines, reduced-motion CSS, keyboard-navigable items, ARIA roles/labels, min touch targets 44px. SharePoint page-canvas compatible. |
| 10 | Validation / closure proof | 3 | Prompt-06 focused tests pass for Priority Actions seams; package-truth proof regenerated at `dist/sppkg/hb-webparts-package-truth-proof.json`; hosted SharePoint screenshot validation still pending. |

**Total: 35/40 (code-path only)** — Hosted SharePoint screenshot closure remains open.

---

## PriorityActionsRailAdmin

| # | Category | Score | Evidence |
|---|----------|-------|----------|
| 1 | Purpose-fit sophistication and persona expression | 3 | Operational authoring surface with sectioned layout, fieldset organization, inline preview. Distinct from public rail and Kudos composer. |
| 2 | Interaction completeness | 4 | Full CRUD: add/edit/reorder/archive actions. Band settings editor. Device visibility toggles. Schedule fields. Audience mode. Badge configuration. |
| 3 | Shared primitive discipline | 4 | Preview renders through HbcPriorityRailPreviewSurface (same surface family as production). Imports via governed entrypoint. |
| 4 | Contract / data rigor | 4 | Typed draft/resolved separation. Schema-aligned writer field mapping. Validation engine with 8 issue kinds. Dirty-state JSON comparison. |
| 5 | Backend seam quality | 4 | Config writer (MERGE/POST upsert). Item writer (batch). Reorder (deterministic SortOrder). Archive (ItemStatus=Archived). Read-after-write reload. Cache invalidation. |
| 6 | State orchestration | 4 | Load/save state machines. Dirty tracking. Discard confirmation dialog. Validation summary. Permission model. |
| 7 | UX completeness | 3 | Loading skeleton, load-error with retry, save-error banner, save-success banner, discard dialog, validation issue list. No dead controls. |
| 8 | Identity / media / attribution | 3 | Not directly applicable. Admin notes field for maintainer context. |
| 9 | Accessibility / host behavior | 3 | Keyboard-navigable item list with up/down/archive buttons. Focus-visible outlines. Reduced-motion CSS. ARIA roles on dialogs. SharePoint page-canvas compatible. |
| 10 | Validation / closure proof | 3 | Prompt-06 focused admin/runtime tests pass; `@hbc/spfx-hb-webparts` typecheck passes; hosted SharePoint screenshot validation and console capture still pending. |

**Total: 35/40 (code-path only)** — Hosted SharePoint screenshot closure remains open.

---

## Doctrine Compliance

- SPFx Governing Standard: Compliant. Explicit breakpoint behavior, host-safe runtime, typed contracts, no browser prompt/confirm.
- Homepage Overlay: Compliant. Prioritized actions (not flat directory), breakpoint-capped visibility, identity→action→value sequence respected.
- Import discipline: All homepage imports through `@hbc/ui-kit/homepage`. No prohibited entrypoints.
- Package boundaries: Surface family in ui-kit, data layer in hb-webparts. No cross-feature coupling.

## Gaps and Remaining Items

| Item | Severity | Status |
|------|----------|--------|
| Hosted SharePoint screenshots (public + admin scenario matrix) | High | Still open — not captured in this execution environment |
| Hosted runtime console capture in SharePoint page canvas | High | Still open — no authenticated hosted runtime session available |
| Drag-to-reorder (keyboard alternative exists) | Non-blocking | Button reorder implemented |
| Audience gating live validation | Non-blocking | Unit-tested; live test requires audience setup |
| Permission-aware read-only mode | Non-blocking | Permission model exists; SP group check requires hosted context |

## Closure Statement

Prompt-06 refreshed packaging and code-path evidence, but full closure is **not complete** because hosted SharePoint screenshot/runtime proof is still missing. The package-truth artifacts are current (`dist/sppkg/hb-webparts-package-truth-proof.json`, `dist/sppkg/hb-webparts-shim-proof.json`), and hosted UI validation remains an explicit open gate.
