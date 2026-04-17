# Prompt 03 — Shared Priority Rail Surface Family

## Objective
Create the governed shared Priority Rail surface family under the homepage UI entry point so the public runtime surface and admin preview render through the same premium, breakpoint-aware visual system.

## Current-state repo-truth
- The homepage package already enforces `@hbc/ui-kit/homepage` as the primary import entry point for homepage work.
- The repo already has homepage shared/local seams, but the spec requires a dedicated promoted surface family under `packages/ui-kit/src/homepage/surfaces/priority-rail/`.
- A public rail exists and an admin preview requirement exists, so local-only UI duplication would immediately create drift risk.

## Relevant SharePoint list-schema truth
The schema implications here are indirect but important:
- the surface must be able to render config-driven visible-count and layout-mode outcomes
- the surface must faithfully render item-level `badge`, `group`, `external-link`, `overflow`, and visibility outcomes
- preview must consume the same normalized contracts created from the schema-backed read layer

## Why the current implementation is insufficient
Without a shared surface family:
- public runtime and admin preview will diverge
- breakpoint logic will leak into individual webparts
- state variants will become inconsistent
- icon/badge/overflow shells will be reimplemented ad hoc
- the rail risks remaining a one-off local composition instead of governed homepage UI

## Relevant governing doctrine / benchmark authorities
- Homepage import discipline: primary UI imports must come through `@hbc/ui-kit/homepage`
- Premium stack expectations: materially use `motion/react`, `lucide-react`, `@floating-ui/react`, `@radix-ui/react-tooltip`, `@radix-ui/react-scroll-area`, `class-variance-authority`, and `clsx` where relevant
- Anti-safety-zone rule: no stock white-card quick-links clone
- Breakpoint doctrine: explicit application-level behavior, narrowest stable mode, overflow rules, and compact-state behavior
- Benchmark rule: shared primitive discipline and UX completeness are scored categories

## Exact files, seams, symbols, patterns, and schema docs to inspect
Inspect:
- `packages/ui-kit/src/homepage/`
- existing homepage surface family patterns under `packages/ui-kit`
- `apps/hb-webparts/src/webparts/priorityActionsRail/`
- outputs from Prompt 01 and Prompt 02
- doctrine files in `docs/reference/ui-kit/doctrine/`
- benchmark docs in `docs/architecture/plans/MASTER/spfx/benchmark/`

Create or harden:
- `packages/ui-kit/src/homepage/surfaces/priority-rail/`
- homepage entry-point exports so the new surface family is consumable via `@hbc/ui-kit/homepage`

Required exports:
- `HbcPriorityRailSurface`
- `HbcPriorityRailAction`
- `HbcPriorityRailOverflow`
- `HbcPriorityRailSkeleton`
- `HbcPriorityRailEmptyState`
- `HbcPriorityRailErrorState`
- `HbcPriorityRailPreviewSurface`

Optional support if justified:
- `HbcPriorityRailBadge`
- `HbcPriorityRailIconFrame`
- `HbcPriorityRailSectionLabel`
- `HbcPriorityRailMoreSheet`

## Required implementation outcome
Build a governed surface family that:
- expresses the public rail as a single premium command band
- supports desktop/laptop/tabletLandscape/tabletPortrait/phone/compactSticky variants
- supports loading/empty/error/preview states
- handles overflow through governed anchored or sheet patterns
- uses real iconography and refined hierarchy
- avoids looking like HB Kudos or SharePoint Quick Links

## What done really looks like
- Public runtime and admin preview use the same rendering primitives.
- Variants are driven by explicit props/contracts, not duplicated markup trees.
- Overflow, badge, icon frame, and action shells are readable and reusable.
- The surface family is obviously homepage-governed and importable through the homepage entry point.
- Motion is restrained and reduced-motion aware.
- The result is compact and operational, not a timid card strip.

## Proof of closure required
- New surface family directory and exports exist
- homepage entrypoint export updated
- variant props documented in code or types
- preview and public render can both consume the same surface primitives
- at least one targeted test/story/proof seam exists for breakpoint/state variants if that pattern already exists in the repo

## Constraints / prohibited shortcuts
- Do not leave the shared family as local-only UI inside the webpart.
- Do not use root `@hbc/ui-kit` or `@hbc/ui-kit/app-shell` imports.
- Do not rely on Unicode or text-initial pseudo-icons.
- Do not implement the visual language as repeated thin white cards.
- Do not create admin-only preview markup that bypasses the shared public surface family.

## Instruction not to re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
