# Workstream D · Step 01 — Team authoring interaction model (DESIGN)

This step defines the final interaction model for team authoring in the Article Publisher using the Kudos composer flyout pattern and `@hbc/ui-kit`'s `HbcPeoplePicker` as the benchmark. No production code changes land in this step; it is the spec that the next workstream-D steps implement against.

## 1. Current state (repo truth)

**Surface:** `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx#TeamPanel` (L1852–2027).

**Shape:** A CRUD table. Clicking "Add team member" appends a `PublisherTeamMemberRow` with blank `DisplayName`, `Title`, `PersonPrincipal`, `Role`, `Company`, `Department`, `GroupKey`, `ParentMemberId`, `BioSnippet`, and `ContactLink` fields. Each row is a dense form of nine text inputs + a "Feature this member" checkbox + `Move up` / `Move down` / `Remove` buttons. `SortOrder` is recomputed by index on reorder.

**Problems:**
- **Author-hostile.** Every field is a raw text input. `PersonPrincipal` is typed by hand as an email; `applyTeamMemberPrincipalChange` tries to recover a display name from the local-part, but that is salvage, not authoring.
- **No identity validation.** A typo on `PersonPrincipal` ships a broken team card; nothing reconciles against Entra/Graph.
- **Admin-console feel.** Nine inputs per row, visible internal identifiers (`ParentMemberId`, `GroupKey`), inline-grid chrome. This contradicts the "editorial, not CRUD" posture set by the Step-03 metadata pass.
- **Reorder friction.** Two buttons per row; no drag, no keyboard reorder affordance beyond the buttons, no visible drop target.
- **Data-field coupling.** `GroupKey` and `ParentMemberId` are exposed as free-text because the team data model supports grouping / hierarchy, but no UX around that feature exists — authors get the complexity without the benefit.

## 2. Benchmarks

### Kudos composer flyout — `apps/hb-webparts/src/webparts/hbKudos/KudosComposerPanel.tsx`
- Slide-over flyout surface (`HbcKudosComposerFlyout`) with title + subtitle + primary/secondary actions pinned at the bottom.
- Form / preview / success / error states are a single mapped state machine owned by a hook (`useKudosComposer`) — not per-row mutation.
- Recipient selection is delegated to `HbcPeoplePicker` via `recipientsMode="typed" searchPeople={searchPeople}` — no manual UPN entry.
- Preview panel rerenders alongside the form so the author sees the final card in real time.

### HbcPeoplePicker — `packages/ui-kit/src/HbcPeoplePicker/index.tsx` + `types.ts`
- Governed combobox + chips, Graph-live search via `PeopleSearchFn`, photo retrieval via `PersonPhotoFn`, with idle/loading/missing/failed photo states already modelled.
- Supports `mode="single" | "multi"`, `bare` rendering for consumer-owned labels, validation messaging, and keyboard navigation.
- Returns rich `PersonEntry` objects (`upn`, `displayName`, `id`, `givenName`, `surname`, `mail`, `jobTitle`, `department`, `photoUrl`).

## 3. Target state — interaction model

### Entry surface (replaces the per-row input grid)

The `TeamPanel` body becomes a **team-composition canvas**:

1. **Empty state.** A premium `HbcEmptyState` plus a single primary CTA — `Add team members` — that opens the team-composer flyout. No visible columns, no phantom rows.
2. **Populated state.** A stack of **team-member chips** (`PersonEntry` driven: photo/initials avatar, display name, job title pulled from Graph, optional editorial role override). Each chip is:
   - Draggable (keyboard + pointer) for reordering; `SortOrder` is derived from chip order at save time — authors never see a `SortOrder` number.
   - Click / `Enter` / `Space` opens the composer flyout seeded on that chip (edit mode).
   - A single overflow affordance (kebab / `…`) per chip exposes `Feature`, `Remove`, `Move up`, `Move down` — keyboard-equivalent of drag.
3. **Featured pin.** A single "featured" slot rendered above the stack. Featured state is a mutually-exclusive promotion of one chip by default, enforced in the composer rather than via a checkbox on every row. (Product can revisit multi-featured later; do not ship a raw toggle per row.)
4. **Add button** below the stack — `+ Add teammate` — opens the flyout in add mode.

### Team-composer flyout (the Kudos-pattern surface)

A right-side slide-over flyout, built on the same `HbcKudosComposerFlyout` primitive family (renamed / generalised if necessary during implementation — see §5), with a reduced payload:

| Zone | Content |
| --- | --- |
| **Header** | Title: `Add teammate` / `Edit teammate`. Subtitle: `Pull from the directory — the article card uses this person's real profile.` |
| **Identity** | `HbcPeoplePicker` in `mode="single"`, `bare={false}`, `searchPeople` bound to a new `PublisherRuntimeContext.searchPeople` adapter (§6). Returns a `PersonEntry`; the composer maps it onto the `PublisherTeamMemberRow` shape at save. |
| **Editorial overrides** | Two optional fields, shown only once an identity is picked: `Role caption` (sits above `PersonEntry.jobTitle`, default empty = use directory title) and `Bio caption` (one-line editorial line). Both use the Step-03 `Field` primitive with helper copy + counter. No raw Department / Company / GroupKey / ParentMemberId text boxes. |
| **Feature toggle** | A single `Feature this teammate in the team section` control. Selecting it clears the feature flag on any other member (enforced by the composer). |
| **Live preview** | A right-pane card mirroring the published team-section treatment, updated in real time from the composer state, same pattern as `HbcKudosComposerPreview`. |
| **Primary action** | `Save teammate` (adds or replaces the row in the draft list). |
| **Secondary action** | `Cancel` / `Remove teammate` (edit mode). |

States:
- **idle** — no identity picked; primary button disabled.
- **editing** — identity picked, overrides visible, preview live.
- **error** — surfaced via `role="alert"` in the flyout body, identical wiring to Kudos `HbcKudosComposerError`.
- **success** — not used here (save closes the flyout immediately; chip stack is the confirmation).

### Keyboard + a11y contract
- Flyout trap: Tab cycles within the flyout while open; `Escape` calls `onRequestClose`; focus returns to the triggering chip / add button.
- Chip stack supports roving `Tab`, `Enter` to open composer, `Space` to pick up for keyboard reorder, arrow keys to move, `Enter` to drop. (Mirror the Homepage rail reorder affordance patterns already shipped elsewhere in the PWA / SPFx surface family — do not invent a one-off.)
- People picker already satisfies combobox a11y.

### Author-facing removals
- **Gone:** `PersonPrincipal` text box, `ParentMemberId` text box, `GroupKey` text box, `Company` / `Department` text boxes (pulled from Graph), per-row `Move up` / `Move down` buttons as the primary reorder affordance, `Feature this member` per-row checkbox.
- **Kept (editorial):** `Role caption` (overrides Graph `jobTitle` when present), `Bio caption` (short editorial tagline), `Feature` (single, composer-scoped).
- **System-managed (no UI):** `TeamMemberId`, `ArticleId`, `SortOrder`, `PersonPrincipal` (derived from picked `PersonEntry.upn`), `DisplayName` (derived from `PersonEntry.displayName`).

## 4. Data mapping — `PersonEntry` → `PublisherTeamMemberRow`

At save time in the composer:

| `PublisherTeamMemberRow` field | Source |
| --- | --- |
| `TeamMemberId` | Kept on edit; generated (`tm-${uuid}`) on add — same id scheme the current `TeamPanel` uses. |
| `ArticleId` | From composer context. |
| `PersonPrincipal` | `PersonEntry.upn`. |
| `DisplayName` | `PersonEntry.displayName`. |
| `Title` | **Role caption** if provided, else `PersonEntry.jobTitle ?? ''`. |
| `Role` | Unused by the composer in this step (reserved for later editorial detail work). Existing values preserved on edit. |
| `Company` / `Department` | Populated from `PersonEntry` directly (read-only to the author). Preserved on edit when the directory no longer returns them. |
| `GroupKey` / `ParentMemberId` | Not authored in this step. Preserved as-is on edit for any pre-existing rows so migration is non-destructive. |
| `BioSnippet` | **Bio caption**. |
| `ContactLink` | Not authored in this step; preserved on edit. |
| `IsFeaturedMember` | Single-featured invariant enforced by the composer. |
| `SortOrder` | Derived from chip-stack position at write time — never authored. |

No schema change. No migration. `publisherRepositories.teamMembers.replaceAllForArticle` remains the write seam — the composer produces the same `PublisherTeamMemberRow[]` payload the existing code already persists.

## 5. Primitive reuse vs. new work

Reuse, do not duplicate:
- `@hbc/ui-kit` → `HbcPeoplePicker` (identity + Graph search + photo cache).
- `@hbc/ui-kit/homepage` → `HbcKudosComposerFlyout`, `HbcKudosComposerPreview` pattern. **Action for Step 02:** evaluate whether the composer flyout chrome in `@hbc/ui-kit/homepage` is genuinely Kudos-specific or can be promoted to a reusable `HbcComposerFlyout` primitive. If it can, Step 02 promotes it; if its internals are Kudos-specific, Step 02 builds a sibling `HbcTeammateComposerFlyout` using the same token and motion language (not a new primitive family).
- Step-03 `Field` (local to Publisher) — the role/bio caption fields reuse it for helper + counter chrome.
- `HbcEmptyState` — already imported by `ArticlePublisher.tsx` for the empty canvas.

New work (to be landed in Steps 02–04, not this step):
- `PublisherRuntimeContext.searchPeople` adapter (§6).
- `PublisherRuntimeContext.fetchPersonPhoto` adapter (optional but aligned with the benchmark; falls back to initials when absent).
- Team-composer state hook (mirrors `useKudosComposer` shape).
- Keyboard-reorder affordance on the chip stack (aligned with existing HB Intel pattern, not a new one).

## 6. Runtime seams

### People search adapter
Mirror the existing `searchProjects` plumbing pattern: `ArticlePublisher.tsx` already exposes `searchProjects` built in a `React.useMemo` at the composition root. Add a parallel `searchPeople: PeopleSearchFn` built from the existing hook:
- Source: `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` (already consumed by Kudos).
- Wire at the SPFx mount boundary and thread through `ArticlePublisherProps` as an optional adapter. When the host cannot provide one (test runtime, unconnected preview), the team composer should render the picker in its fallback UPN-entry mode per `HbcPeoplePicker`'s built-in contract.

### Photo adapter
- Optional. Reuse the same `createGraphPersonPhotoFn` factory Kudos uses (`@hbc/ui-kit/homepage`).
- Graceful fallback to initials is already modelled in `HbcPeoplePicker`'s `PhotoState` machine.

## 7. Lifecycle safety

- Publish / republish / archive / withdraw all read `teamDraft` via `replaceAllForArticle`. The composer does not touch that seam — it only mutates the in-memory `PublisherTeamMemberRow[]` that already feeds `ArticlePublisher.save`. Lifecycle behaviour is preserved.
- Validation: existing `validationEngine` rule "Team Viewer is enabled but no team members are authored" continues to fire when the chip stack is empty. No new rules are needed for Step 01.
- Composer disables `Save teammate` until an identity is picked, so an empty `PersonPrincipal` can never land.

## 8. Scope lines for Steps 02 – 04 (sequencing)

- **Step 02** — Implement the team-composer flyout + `HbcPeoplePicker` integration + chip-stack surface. Replace `TeamPanel`'s CRUD grid with the canvas. Wire the `searchPeople` runtime seam. Preserve all existing field persistence for non-authored columns on edit.
- **Step 03** — Keyboard reorder + drag-and-drop on the chip stack. Featured-teammate invariant enforcement. Live preview polish. Accessibility audit (focus trap, roving focus, aria-activedescendant on the stack).
- **Step 04** — Closure: tests (unit + interaction), doctrine docs update, hosted vetting against the tenant `HB Article Team Members` list behaviour, final scrub for drift.

## 9. Scope cuts (explicit)

- Group / hierarchy authoring (`GroupKey`, `ParentMemberId`) is **not** exposed in this redesign; it is kept as data-through only until product validates the authoring need.
- Non-tenant teammates (external consultants) are out of scope; all picks come from Graph.
- Bulk add / CSV paste is out of scope.

## 10. Files touched by this step

- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-d-team-authoring-redesign/step-01/DESIGN.md` (this file — the design deliverable).
- No source or manifest changes. No tests added. No version bump.

## 11. Open questions / decisions deferred

- Does the existing Kudos composer flyout shell belong in a surface-neutral home (`HbcComposerFlyout`) inside `@hbc/ui-kit`? Decision deferred to Step 02; gates on whether its internals are Kudos-specific.
- Should `SortOrder` stay in the write payload at all, or be recomputed server-side at publish time? Out of scope for workstream D; tracked as a later hardening ticket.

## 12. Definition of completion for this step

- Interaction model for team authoring is defined and grounded in repo truth: ✔
- Primitive reuse plan aligned with `HbcPeoplePicker` + Kudos composer flyout: ✔
- Data mapping preserves the current tenant schema and lifecycle contracts: ✔
- Accessibility and keyboard contracts specified: ✔
- Runtime seams identified against existing plumbing: ✔
- Explicit scope and sequencing for Steps 02–04: ✔
