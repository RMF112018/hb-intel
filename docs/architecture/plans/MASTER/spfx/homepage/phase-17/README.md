# HB Central — Structural Rebuild Prompt Package

## Purpose

This package instructs a **structural rebuild** of the homepage webparts under:

- `apps/hb-webparts/src/webparts/`

This is not a styling pass.
This is not a card-refresh pass.
This is not a Fluent-adjacent refinement pass.

The objective is to rebuild the homepage webparts with a **far more elegant, top-of-class stack** and a materially stronger interaction and composition model.

## Non-Negotiable Requirements

1. Focus the rebuild on the actual webparts under `apps/hb-webparts/src/webparts/`.
2. Every webpart must include the appropriate SPFx manifest next to its webpart entry.
3. The **signature hero banner manifest** must include:

```json
"supportsFullBleed": true,
```

4. Do not preserve the current design-safety-zone approach.
5. Do not default to Fluent UI as the visual language.
6. Use the stack specified in this package.
7. Validate the result in SharePoint-hosted rendering, not just Storybook or local preview.

## Required Stack

Install and use this stack deliberately:

- `motion`
- `lucide-react`
- `@floating-ui/react`
- `@radix-ui/react-slot`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`
- `class-variance-authority`
- `clsx`

## Stack Usage Intent

### `motion`
Use `motion/react` for:
- hero reveal choreography
- premium hover and press states
- subtle section entrance
- CTA response
- controlled depth and transform transitions

### `lucide-react`
Use as the primary icon system for:
- launcher items
- priority actions
- search and discovery affordances
- operational signals
- editorial accents where appropriate

Do not use Unicode icons or text initials as pseudo-icons.

### `@floating-ui/react`
Use for:
- anchored search suggestion surfaces
- launcher flyouts
- richer command popovers
- tooltip positioning
- premium contextual overlays

### `@radix-ui/react-slot`
Use to create composable primitives that can wrap native anchors, buttons, or SPFx-safe custom shells cleanly.

### `@radix-ui/react-tooltip`
Use for elegant, accessible micro-help and icon-label clarification.

### `@radix-ui/react-separator`
Use for refined visual rhythm and section segmentation where a divider genuinely improves hierarchy.

### `@radix-ui/react-scroll-area`
Use where discovery rails, long result areas, or curated shelves need polished overflow behavior.

### `class-variance-authority`
Use to define serious primitive variants for:
- hero
- command
- launcher
- discovery
- editorial
- operational
- recognition

### `clsx`
Use to compose classes cleanly and keep variant logic readable.

## Hard Prohibitions

Do not:
- keep the old surface system and decorate it
- keep the hero as a large blue slab
- keep a standalone greeting block beside or below the hero and claim the hero is unified
- use Fluent-style cards as the homepage’s dominant language
- ship subtle before/after differences and call the rebuild complete

## Files Included

1. `Phase-Implementation-Plan-Summary.md`
2. `Prompt-01_Stack_Installation_and_Doctrine_Reset.md`
3. `Prompt-02_Manifest_Audit_and_FullBleed_Enforcement.md`
4. `Prompt-03_Shared_Primitive_System_Rebuild.md`
5. `Prompt-04_Webpart_Structural_Rebuild_TopBand_Command_Discovery.md`
6. `Prompt-05_Webpart_Structural_Rebuild_Editorial_Operational.md`
7. `Prompt-06_QA_Rendered_Validation_and_SPPKG_Rebuild.md`
