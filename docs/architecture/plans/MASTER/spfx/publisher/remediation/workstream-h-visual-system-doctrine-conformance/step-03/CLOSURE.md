# Workstream H · Step 03 — Closure

## Objective
Migrate the Publisher's most visible action and chip surfaces onto the Step-02 `PublisherButton` + `EditorialChip` primitives so the Publisher's iconography, actions hierarchy, and motion converge onto one governed language.

## What changed

### DraftQueue → shared chips
`apps/hb-webparts/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx`
- `CompletenessChip` now renders `<EditorialChip variant={'success' | 'warn' | 'danger'} size="sm">`, replacing the module-local `.chip` / `.chipReady` / `.chipTodo` / `.chipBlocked` combinations.
- `GroupCounts` renders the total count as `<EditorialChip variant="info" size="sm">` and the needs-attention pill as `<EditorialChip variant="warn" size="sm">`, collapsing the hand-written `.groupCount` / `.groupAttention` treatments onto the governed surface.

### TeamPanel → shared chips and buttons
`apps/hb-webparts/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- Featured name badge → `<EditorialChip variant="featured" size="sm">`.
- Featured-toggle star → `<PublisherButton iconOnly pressed={…} aria-label=… />`; `pressed` maps to `aria-pressed` through the primitive.
- `Up` / `Down` / `Edit` / `Remove` row actions → `<PublisherButton size="sm">` with the `danger` variant on `Remove`.
- `+ Add teammate` CTA → `<PublisherButton variant="primary">`.

### GalleryPanel → shared chips and buttons
`apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- Role badge (non-gallery rows) → `<EditorialChip variant="info" size="sm">`.
- Featured tile badge → `<EditorialChip variant="featured" size="sm">`.
- Featured-toggle star → `<PublisherButton iconOnly size="sm" pressed={…}>`; again `aria-pressed` flows through the primitive.
- `←` / `→` / `Remove` tile actions → `<PublisherButton size="sm">` (Remove uses the `danger` variant).
- `+ Add image` CTA → `<PublisherButton variant="primary">`.

### PublishReadinessDiagnostics → shared severity pills
`apps/hb-webparts/src/webparts/articlePublisher/readinessSurface/PublishReadinessDiagnostics.tsx`
- Validation-finding severity pill inside the Technical details drawer → `<EditorialChip size="sm" variant={severity === 'error' ? 'danger' : 'warn'}>`. The hand-written `.severityError` / `.severityWarn` classes are no longer applied on this surface.

### What did NOT change
- No CSS modules were deleted. The local `.chip*` / `.iconBtn` / `.actionBtn` / `.addBtn` classes remain in place for now; Step 04 applies the elevation + surface-hierarchy pass and removes the dead class declarations wholesale. Keeping them this step makes the Step-03 diff purely replacement-at-use-sites and avoids visual regressions if any other consumer reaches for them.
- No behavioural / interaction change. `aria-pressed`, `aria-label`, `title`, focus order, and disabled semantics are preserved because `PublisherButton` forwards them through to the underlying `<button>` and `EditorialChip` forwards them through to the underlying `<span>`.

## Doctrine alignment
- **One button language.** Primary / secondary / danger / icon-only variants now come from a single primitive across the rail, team panel, gallery panel, and composer action rows.
- **One chip language.** Six variants — success / warn / danger / info / neutral / featured — serve every chip surface that used to drift (completeness, group rollup, role badge, featured badge, severity).
- **Motion + reduced motion.** `PublisherButton` consumes `var(--hb-transition-fast)` from Step-02 tokens; under `prefers-reduced-motion: reduce` the variable collapses to 0ms, so hover / pressed transitions pause without any component-level knowledge.
- **Focus ring unified.** Every migrated button inherits the `HBC_PRESENTATION_BLUE` `:focus-visible` outline from the primitive; nine bespoke per-surface declarations are no longer consulted on these surfaces.
- **High-contrast safe.** `EditorialChip`'s `forced-colors: active` rule collapses the tinted backgrounds to `ButtonFace` / `ButtonText` / `ButtonBorder` so Windows high-contrast users get a system-paired treatment on every migrated surface.

## Lifecycle safety
- No schema change.
- No adapter / orchestrator / write-seam change.
- No test adjustments required — the migrations preserve the DOM contract (`<button>` remains `<button>`, `<span>` remains `<span>`, `aria-pressed` / `aria-label` / `title` are untouched).

## Validation performed
- `pnpm check-types` (hb-webparts) — clean.
- `pnpm vitest run sharedChrome draftQueue teamComposer mediaComposer readinessSurface ArticlePublisher` — **248/248 pass** across 22 files.

## Files changed
- `apps/hb-webparts/src/webparts/articlePublisher/draftQueue/DraftQueue.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/teamComposer/TeamPanel.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/mediaComposer/GalleryPanel.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/readinessSurface/PublishReadinessDiagnostics.tsx`
- `apps/hb-webparts/config/package-solution.json` (version bump)
- `docs/architecture/plans/MASTER/spfx/publisher/remediation/workstream-h-visual-system-doctrine-conformance/step-03/CLOSURE.md` (this file)

## Remaining / follow-on (per Step 01 design)
- **Step 04 — Elevation + surface hierarchy.** Apply the two-tier elevation story to the workspace shell, rails, canvas sections, composer bodies; remove the flat 1px grey borders in favour of `var(--hb-elevation-1)` / `var(--hb-elevation-2)`; drop dead `.iconBtn` / `.actionBtn` / `.addBtn` / `.chip*` / `.severity*` class declarations from the module CSS files.
- **Step 05 — Full scrub + workstream README + hosted SPFx / high-contrast / reduced-motion / zoom vetting.**

No blockers.
