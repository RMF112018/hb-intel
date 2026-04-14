# Workstream A — Step 02 Closure Report

**Prompt:** Phase-08 / Phase-1 / Prompt-02 — Define the future-state author journey and workspace layout
**Status:** Closed. Documentation-only; no code changes required for this step.
**Date:** 2026-04-14

---

## 1. Scope and objective

Design the future-state author journey and the final Publisher workspace layout — a three-column composition comprising a **left draft rail**, a **center authoring canvas**, and a **right readiness rail** — with explicit section purposes and behavior for each. The output of this step is the authoritative layout contract Prompt-03 implements and Prompt-04 re-IAs.

This step refines (does not replace) the three-zone IA locked in Step-01 §6. The locked zones map cleanly onto the three-column layout:

| Step-01 zone | Step-02 column |
|---|---|
| Library zone ("Your articles") | Left draft rail |
| Workspace zone (editorial canvas) | Center authoring canvas |
| Lifecycle zone (contextual, non-modal) | Right readiness rail |

All preservation rules from Step-01 §3 continue to apply: webpart id, prop contract, adapter seams, lifecycle behavior, `actorEmail` threading, and `SUPPORTED_DESTINATIONS = ['projectSpotlight']`.

---

## 2. Author journey (future state)

The author is a project- or communications-side operator who wants to ship a Project Spotlight article with confidence. The redesigned workspace supports this journey as a single continuous flow, not a tab-hunt:

1. **Arrive** — Author lands on the Publisher webpart on the HBCentral publisher page. The left draft rail is populated; the canvas is in a premium empty state ("Pick a draft, or start a new Project Spotlight article").
2. **Locate or start** — Author picks a draft from the left rail (grouped by author-relevant cues — recency / state grouping / project) or starts a new Project Spotlight draft. Selecting a draft hydrates the canvas and the readiness rail.
3. **Compose** — Author moves top-to-bottom through the canvas sections (Identity → Hero → Story → Media → Team → Promotion → Destination binding → Preview). The canvas is a vertical editorial flow, not a tab strip. The readiness rail updates continuously as the author writes — validation, template resolution, drift detection, and transition eligibility are always visible but never modal.
4. **Confirm readiness** — The readiness rail expresses: "Ready to publish" / "Blocked — N issues" / "Republish will update in place" / "Republish will regenerate" in author language, anchored to the live `validationEngine`, `publishResolutionContext`, and `republishPolicy` results. No raw enum tokens are exposed.
5. **Act** — Author triggers the primary lifecycle action from the readiness rail (Publish, Republish, Save draft, Preview, Archive, Withdraw, or an allowed workflow transition expressed as an outcome, not a state token). Destructive and state-changing actions are grouped and confirmed contextually, not adjacency-only.
6. **Recover / iterate** — After the action completes, the readiness rail reflects the new state (e.g., "Published · binding healthy · last republish 2 min ago"). The author can iterate without leaving the workspace.

Guarantees on this journey:
- Never requires knowing `WorkflowState` / `PublishStatus` enum values.
- Never requires leaving the workspace to understand readiness.
- Always keyboard-safe; focus order follows draft-rail → canvas → readiness-rail.
- Always host-safe; no suite-bar / app-bar assumptions; the workspace owns the page canvas only.

---

## 3. Workspace layout (final)

Three columns at desktop width; responsive collapse order defined below.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Workspace header                                  │
│  Publisher title · active article title · state-as-outcome chip             │
├──────────────┬──────────────────────────────────────────────┬───────────────┤
│  LEFT        │               CENTER                          │   RIGHT       │
│  Draft rail  │               Authoring canvas                │   Readiness   │
│              │                                                │   rail        │
│  ·  Start    │   Identity                                     │               │
│     new      │   Hero                                         │   Readiness   │
│     draft    │   Story                                        │   summary     │
│              │   Media                                        │               │
│  ·  Drafts   │   Team                                         │   Validation  │
│              │   Promotion                                    │   signals     │
│  ·  In       │   Destination binding                          │               │
│     review   │   Preview                                      │   Drift /     │
│              │                                                │   republish   │
│  ·  Recently │                                                │   signal      │
│     published│                                                │               │
│              │                                                │   Lifecycle   │
│              │                                                │   actions     │
└──────────────┴──────────────────────────────────────────────┴───────────────┘
```

### 3.1 Left draft rail — purpose and behavior

Purpose: give the author a premium, always-available browser of their own drafts and recently handled articles, replacing the current `state-filter <select> + flat list`.

Structure:
- **Start new draft** primary affordance at the top. Starts a `projectSpotlight` draft in `draft` workflow state.
- **Grouped lists** (collapsible groups, not a filter dropdown):
  - *Drafts* — articles owned by the author in `draft`.
  - *In review* — articles in review-adjacent workflow states, expressed as an outcome group ("awaiting review"). Exact enum→group mapping is implemented in Prompt-03 by composing `workflowStateMachine` outputs into outcome buckets; no raw enum values are rendered here.
  - *Recently published* — most recent `published` articles.
  - *Archived / withdrawn* — collapsed by default, available on demand.
- **Row content** per article: article title, project name (or a credible empty-state phrasing, never "(no project)"), a lightweight state-as-outcome chip, and an updated-at cue. Never emits `postList` / `postRow` terminology.
- **Empty / loading / error states:**
  - Loading: `<HbcSpinner>` within each group shell.
  - Empty (no drafts at all): `<HbcEmptyState>` with an inviting "Start your first Project Spotlight" affordance.
  - Empty (group-only): muted "No <group> articles yet" — never "No articles in state 'X' yet."
  - Error: terminal error state with retry.

Behavior:
- Selecting a row hydrates the center canvas + right rail with that article's draft, team, media, binding, resolution context, preview, validation, and promotion policy.
- The rail is passive on write — it never commits changes; mutations always flow through the canvas and rail actions.
- Keyboard: arrow-key navigation inside a group; Tab moves between groups; Enter activates a row.
- Focus moves to the canvas identity section after selection.

### 3.2 Center authoring canvas — purpose and behavior

Purpose: a vertical editorial composition flow for a single Project Spotlight article, replacing the flat `metadata / hero / content / team / gallery / preview / status` tab strip.

Structure — the nine sections locked in Step-01 §7, in editorial order. Each section has a named heading, a short authoring intent line, the composed controls, and section-level empty/loading/error affordances. Each is backed by the adapter contracts locked in Step-01 §3.

| # | Section | Canvas behavior |
|---|---|---|
| 1 | **Identity** | Title, subject, content type, project binding (via existing `ProjectPicker`), owning author. No raw enum inputs; friendly author-facing labels. |
| 2 | **Hero** | Hero theme variant selection presented as visual chooser (not raw enum string); hero media slot (`MediaRole='hero'`) with credible upload/select affordance + empty state. |
| 3 | **Story** | Body composition. Rich, single-column editorial input. |
| 4 | **Media** | Gallery / supporting / secondary media composition. Role chosen per item. Empty state invites adding; loading/error states first-class. |
| 5 | **Team** | Team-member composition via `teamViewerAdapter` + TeamViewer modes, expressed as outcomes rather than raw enum values. |
| 6 | **Promotion** | Promotion policy surfaced through `selectPromotionPolicy`. Shows which rule applies and why, in author language. |
| 7 | **Destination binding** | Template resolution (`resolveTemplateSystemManaged`) and page-binding state (`PublisherPageBindingRow`) expressed as *status* sentences, not raw enum tokens. Drift — when present — is signaled here in addition to the readiness rail. |
| 8 | **Preview** | Structured preview from `buildPublisherPreview`; `loading` → `<HbcSpinner>`; `empty` → "Add content above to see a preview"; `error` → surface cause. |

The Lifecycle section (Step-01 §7 row 9) does **not** live in the canvas. It is promoted to the right readiness rail per §3.3.

Behavior:
- Canvas sections render in a single vertical scroll; in-page anchors are available but tabs are not.
- Each section is independently addressable for validation signals from the readiness rail (clicking a blocking issue scrolls/focuses the relevant section).
- All inputs are keyboard-safe and labelled.
- Stateful writes flow into `setArticleDraft` / `setTeamDraft` / `setMediaDraft` (retain the existing state shape) and are persisted via the existing writers.
- No tab chrome, no `nav.tabs`, no `styles.panel` router.

### 3.3 Right readiness rail — purpose and behavior

Purpose: give the author a continuous, author-confident readout of publish readiness and a clear place to act, replacing the current flat footer `actionBar` + inline chips.

Structure:
- **Readiness summary** — a single sentence in author language that composes:
  - `validationEngine` blocking/warning counts,
  - `buildPublishResolutionContext` outcome (publish vs republish in place vs republish will regenerate),
  - `republishPolicy` drift signal,
  - workflow state expressed as an outcome ("Draft", "Awaiting review", "Approved — ready to publish", "Published — healthy binding", "Published — republish will regenerate", "Archived", "Withdrawn").
- **Validation list** — author-readable blocking issues + warnings, each clickable to scroll the offending canvas section into focus. Backed by `validationEngine` output.
- **Drift / binding signal** — replaces the `driftChip` / `bindingBadge` chrome. One signal, authored in prose: "This republish will update the existing page in place." / "This republish will regenerate the destination page." / "No binding yet — publishing will create the Project Spotlight page." Author never sees the raw `PublishStatus` value.
- **Lifecycle actions** — primary / secondary / destructive grouping with clear hierarchy:
  - *Primary:* the single most-appropriate action for the current readiness state (Publish, Republish, or Save draft).
  - *Secondary:* Preview, Save draft (when not primary), allowed workflow transitions expressed as outcomes (e.g., "Send for review", "Mark approved") derived from `validTransitionsFrom` but presented as outcomes — never `→ approved`.
  - *Destructive:* Archive / Withdraw, grouped and confirmed contextually.
- **Post-action status** — terminal success / error summary reflecting the last lifecycle action (replaces the generic `statusLine`).

Behavior:
- The rail is sticky within the workspace viewport; it does not leave the author's view as they scroll the canvas.
- When a lifecycle action is in flight, the rail shows a determinate busy state with `<HbcSpinner>` and disables only the contested actions — not every control.
- Keyboard-safe: actions are real buttons with labels and `aria-describedby` linked to the readiness summary.
- Never renders raw `WorkflowState` / `PublishStatus` tokens.
- Actions are authorised by the same `workflowStateMachine.canTransition` rules as today; the *UI wrapper* changes, the *authorisation contract* does not.

---

## 4. Responsive and host-safety behavior

- **Desktop / wide (≥ 1280px):** three columns as drawn above.
- **Mid (≥ 960px, < 1280px):** left draft rail collapses to a compact group header row with a "Browse drafts" affordance that opens an in-canvas rail overlay; center canvas + right readiness rail remain.
- **Narrow (< 960px):** single-column stack ordered draft rail → canvas → readiness rail; the readiness rail stickies to the viewport bottom as a collapsed readiness bar that expands on demand. Lifecycle primary action remains reachable without scrolling.
- No fixed-position chrome that overlaps the SharePoint app bar or suite bar — host-safe per SPFx Governing Standard §3.1.
- Workspace owns only the page canvas — per §3.2 of the Governing Standard.
- All three columns participate in a single keyboard focus order (draft rail → canvas → readiness rail). No focus traps.

---

## 5. Empty / loading / error posture

Every surface in the three columns defines all three non-happy states:

| Surface | Empty | Loading | Error |
|---|---|---|---|
| Draft rail | "Start your first Project Spotlight" CTA | `<HbcSpinner>` | Terminal error + retry |
| Draft rail group | Muted "No <group> yet" | Group-level shimmer | Inline retry |
| Canvas (no selection) | `<HbcEmptyState>` with start-new + pick-existing affordances | `<HbcSpinner>` during hydrate | Terminal error card |
| Canvas section | Section-level empty copy that matches the editorial voice | Section-level shimmer for async content | Inline section error + retry |
| Preview section | "Add content above to see a preview" | `<HbcSpinner>` | `previewBuilder` error surfaced in author language |
| Readiness rail | "Pick a draft to see readiness" | `<HbcSpinner>` during resolution context build | Terminal error + retry |

No `"(Untitled)"`, no `"(no project)"`, no `"No articles in state 'X' yet."` The existing placeholder wording is retired in Prompt-03.

---

## 6. Reused primitives and seams

Reuse — do not duplicate:
- `HbcSpinner`, `HbcEmptyState` from `@hbc/ui-kit/homepage`.
- `HbcThemeProvider` composition wrapped by the host.
- `ProjectPicker` for Identity section.
- All adapter seams listed in Step-01 §3.

New shared primitives, if any are needed (e.g., a readiness summary surface, an outcome chip), are proposed into `@hbc/ui-kit` in Prompt-03 before being consumed — never invented inside `webparts/articlePublisher`.

---

## 7. Downstream change map

Implementation in Prompt-03 (shell + navigation model) and Prompt-04 (editorial IA over the shell). Files expected to change:

- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx` — replace aside + tab strip + action bar with the three-column layout and section model above.
- `apps/hb-webparts/src/webparts/articlePublisher/article-publisher.module.css` — retire `postList` / `postRow` / `tabs` / `tab` / `tabActive` / `panel` / `actionBar` / `driftChip` / `bindingBadge` / `stateBadge` / `statusLine` classes in favor of the three-column composition's tokens.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.test.tsx` — rewrite to assert the new IA and readiness rail behavior.
- Potential new local composition files inside `webparts/articlePublisher/` for `DraftRail`, `AuthoringCanvas`, `ReadinessRail`.

Not changed by Workstream A:
- `apps/hb-webparts/src/mount.tsx` (prop wiring unchanged).
- `webparts/articlePublisher/runtimeContract.ts`, `ArticlePublisherWebPart.manifest.json` id and prop contract.
- `ProjectPicker.tsx` (retained, possibly recomposed).
- `homepage/data/publisherAdapter/**` (no adapter behavior changes).

---

## 8. Out of scope for this step

- No edits to `ArticlePublisher.tsx`, CSS, tests, manifest, runtime contract, mount, or adapter.
- No new `@hbc/ui-kit` primitives.
- No manifest version bump.
- No lifecycle behavior changes.

---

## 9. Validation

- §2 author journey walks end-to-end against Step-01 §3 preserved seams — publish/republish/archive/withdraw/preview remain sourced from the same adapter contracts.
- §3 layout maps 1:1 onto Step-01 §6 three-zone IA and §7 nine-section model.
- §3.3 readiness rail composition is grounded in existing seams (`validationEngine`, `buildPublishResolutionContext`, `republishPolicy`, `workflowStateMachine`) — no new adapter work is implied.
- §4 responsive + §5 empty/loading/error postures are consistent with the SPFx Governing Standard's host-safe and production-ready-state obligations.
- No binding doctrine rule is contradicted.

---

## 10. Real blockers

None. Prompt-03 can implement the shell and navigation model directly from §3–§5 of this report.
