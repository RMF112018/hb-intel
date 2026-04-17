# 01 — Repo Truth vs Current Wave 01 Comparison

## Comparison posture

The current Wave 01 package was compared against the live `main` branch and governing doctrine.

## Summary comparison

| Current Wave 01 Item | Repo truth says | Judgment | Required correction in enhanced package |
|---|---|---|---|
| Prompt 01 — lock shell-only scope and contracts | Correct direction. The shell truly is the subject. But the repo already contains meaningful shell contracts and comments. | Confirmed but underdeveloped | Upgrade from generic scope lock to a sharper shell-owned boundary brief with exact seams, symbols, and drift rules. |
| Prompt 02 — align shell breakpoint model to entry spec | Repo already has seven entry states, short-height handling, container-aware resolution, and breakpoint tests. | Partly confirmed, partly misframed | Shift from generic breakpoint work to spec-aligned entry policy closure: hero/action/first-lane budgets, inspectable diagnostics, and short-height proof. |
| Prompt 03 — harden shell layout contract, presets, and validation | Repo already has `shellTypes`, Zod schemas, presets, validation, normalization, and protected/configurable decisions. | Confirmed but lagging repo truth | Reframe as hardening and closure of existing partial implementation, with focus on persistence safety and override boundaries. |
| Prompt 04 — establish shell-level entry-stack orchestration seam | Repo still mounts hero, priority actions, and hbHomepage separately through `mount.tsx`. A shared shell-facing policy seam is not yet established. | Strongly confirmed | Split into a more exact work item around shared entry-stack policy and production dispatch/orchestration seams. |
| Prompt 05 — add shell harness, test matrix, and closure proof | Repo already has shell unit tests. What it lacks is a stronger preview harness, breakpoint matrix, and inspectable closure artifacts. | Confirmed but incomplete | Reframe around extending current tests, adding harnesses, and producing repeatable evidence. |

## Repo-truth shell seams already present

### Existing shell contract work
Already present in repo:
- `shellTypes.ts`
- `shellSchema.ts`
- `shellValidation.ts`
- `defaultPreset.ts`
- `presetLibrary.ts`
- `protectedDecisions.ts`

### Existing shell runtime work
Already present in repo:
- `breakpointPolicy.ts`
- `useShellContainer.ts`
- `slotComfortResolver.ts`
- `HbHomepageShell.tsx`

### Existing shell test work
Already present in repo:
- `shell/__tests__/breakpointPolicy.test.ts`
- `shell/__tests__/slotComfortResolver.test.ts`
- `shell/__tests__/shellValidation.test.ts`

### Existing production seam constraint
Still present in repo:
- `mount.tsx` dispatches:
  - `HbSignatureHero`
  - `PriorityActionsRail`
  - `HbHomepage`
- `ReferenceHomepageComposition.tsx` models the composed experience, but production does not use a unified composed runtime path.

## High-value comparison findings

### 1. The current package understates repo maturity
The shell is not a blank slate. The improved package must not waste agent energy rediscovering or rebuilding architecture that already exists.

### 2. The current package overstates how greenfield the harness/test work is
Tests already exist. The missing work is proof depth, not test existence.

### 3. The current package does not force closure of the most important remaining shell issue
That issue is the absence of a disciplined, shell-facing **entry-stack policy contract** that can govern:
- hero height budgets
- visible primary action budgets
- overflow rules
- first-lane visibility on first load
- short-height fallback rules

### 4. The current package is too soft on control-panel readiness
The repo already has protected/configurable decision primitives and typed layout input. The improved package must push on:
- serialization boundaries
- invalid persisted state handling
- what remains code-governed forever
- what may become maintainer-configurable later

## Bottom line
The new package must stop treating Wave 01 like a shell architecture kickoff and start treating it like **closure of an already partially implemented shell system**.
