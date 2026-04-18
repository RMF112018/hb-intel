# Prompt 02 — Productize Admin IA, Permission States, and the Authoring Workflow

## Objective

Turn `PriorityActionsRailAdmin` from a mostly monolithic editor into a benchmark-grade maintainer product with clear workflow regions, permission-aware behavior, and trustworthy authoring ergonomics.

## Current issue / future-state gap

The current admin is directionally strong but still reads too much like a local composite form/editor rather than a fully productized maintainer experience.

Gaps still open in `main` include:
- unintegrated permission state modeling
- no credible read-only / insufficient-permission experience
- limited information architecture for action discovery and editing
- weak distinction between library browsing, item editing, validation, and preview
- no search/filter workflow for larger action sets
- limited workflow clarity around add/edit/archive/draft/discard

## Intended future state

The admin behaves like a real maintainer product:
- band settings are one clear authoring region
- the action library is searchable/filterable and easy to scan
- action editing occurs in a structured region (drawer/panel/side editor if appropriate)
- validation is visible and actionable
- preview remains visible and credible
- unauthorized users see a clear read-only/insufficient-permission state
- keyboard-safe reorder and editing remain first-class
- destructive actions are explicit, confirmed where appropriate, and never ambiguous

## Repo seams / files / symbols to inspect

Inspect at minimum:

- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/PriorityActionsRailAdmin.tsx`
- `apps/hb-webparts/src/webparts/priorityActionsRailAdmin/priority-actions-rail-admin.module.css`
- `apps/hb-webparts/src/homepage/data/priorityActionsAdminState.ts`
- any local admin subcomponents you create
- any homepage helper or local admin helper seams needed for search/filter/editor-region logic

Use `HbHeroBannerAdmin` only as a precedent for quality and state discipline, not as a layout template to clone.

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Governing files / doctrine / specs

- `docs/architecture/plans/MASTER/spfx/command-band/PriorityActionsRail-and-Admin-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/04-Conformance-Scoring-Matrix.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/07-Persona-and-Design-Symmetry-Rule.md`

## Required implementation outcomes

1. Restructure the admin into explicit authoring regions, at minimum covering:
   - band settings
   - action library
   - action editor
   - validation summary
   - preview
   - save/discard / status controls

2. Integrate permission-aware behavior:
   - resolve permissions into the runtime
   - disable or hide write actions when appropriate
   - provide a clear read-only / insufficient-permission message instead of dead controls

3. Add action-library search and/or filtering sufficient for a growing command-band dataset.

4. Improve editor ergonomics for:
   - action identity
   - title / href
   - icon / badge / grouping
   - audience targeting
   - breakpoint visibility
   - overflow assignment
   - schedule controls

5. Ensure the full workflow remains keyboard-safe, including item selection and reorder fallback behavior.

6. Preserve deliberate dirty/save/discard handling after the structural fixes from Prompt 01.

7. Keep the admin visually premium and productized, but authoring-first rather than heroic or editorial.

## Supporting development concepts to apply materially

- authoring IA instead of undifferentiated form walls
- permission-aware UI, not permission comments left unused
- keyboard-complete workflows
- preview-rich authoring
- structured destructive-action UX instead of ad hoc shortcuts

## Proof of closure

Return:

- the new admin IA structure
- how permissions are resolved and surfaced
- how search/filter works
- how item editing is organized
- the keyboard-safe path for core authoring workflows
- screenshots or local proof notes if available
- confirmation that unauthorized users do not see deceptive write affordances

## Boundaries / anti-drift rules

- Do not rebuild this as fake shell chrome inside SharePoint page content.
- Do not clone Kudos or Hero Banner layouts.
- Do not rely on raw SharePoint list editing as a fallback maintainer UX.
- Do not bury validation or save status in a way that weakens workflow clarity.
- Do not remove preview; strengthen it.
