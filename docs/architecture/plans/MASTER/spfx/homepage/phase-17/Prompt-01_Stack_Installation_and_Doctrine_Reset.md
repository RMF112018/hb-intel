# Prompt 01 — Stack Installation and Doctrine Reset

## Objective

Install and adopt the exact stack required for a serious structural rebuild, then lock a doctrine that prevents fallback to the current safe design language.

## Required Packages

Install these packages in the appropriate workspace packages as needed:

### Core visual and motion
- `motion`

Use it through:
```ts
import { motion, AnimatePresence } from "motion/react";
```

### Icon system
- `lucide-react`

Use it as the homepage icon system.
Do not fall back to Unicode glyphs, text initials, or vague abstract placeholders.

### Anchored overlays
- `@floating-ui/react`

Use:
- `useFloating`
- `offset`
- `shift`
- `flip`
- `autoUpdate`
- interaction hooks where needed

### Accessible composable primitives
- `@radix-ui/react-slot`
- `@radix-ui/react-tooltip`
- `@radix-ui/react-separator`
- `@radix-ui/react-scroll-area`

### Variant and class composition
- `class-variance-authority`
- `clsx`

## Required Usage Rules

### `motion`
Use for:
- hero entrance and reveal choreography
- CTA hover and press response
- card-to-surface hover refinement
- search results or flyout transitions
- only restrained, premium motion — no gimmicks

### `lucide-react`
Use for:
- priority actions
- launcher groups
- quick paths
- promoted destinations
- operational status cues
- editorial metadata accents where useful

### `@floating-ui/react`
Use for:
- search suggestion panels in discovery surfaces
- premium anchored menus
- utility flyouts
- contextual info popovers

### `@radix-ui/react-tooltip`
Use for:
- icon-only affordances
- clipped labels
- command clarification
- premium micro-help

### `@radix-ui/react-scroll-area`
Use where a discovery list, command rail, or curated content shelf benefits from polished overflow handling.

### `class-variance-authority` and `clsx`
Use to define and compose structured visual primitives, not just class sprawl.

## Hard Direction

Do not install this stack and then continue rendering the homepage as mildly upgraded Fluent cards.

## Deliverables

1. update package manifests
2. document exact install locations
3. document exactly where each package will be used
4. document the rule that homepage webparts may not default to Fluent-shaped visual patterns

## Important Instruction

Do not re-read files that are still within your active context or memory.
