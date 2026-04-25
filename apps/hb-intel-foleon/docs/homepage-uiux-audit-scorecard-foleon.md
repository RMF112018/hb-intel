# Foleon Connector — Homepage UI/UX Audit Scorecard (closure)

**Package:** `@hbc/spfx-hb-intel-foleon`  
**SPFx / manifest version:** `1.0.17.0` (see `config/package-solution.json`, `FoleonWebPart.manifest.json`, `runtimeContract.ts`)
**Date:** 2026-04-24  
**Auditor:** Engineering (automated closure draft — replace with human sign-off before release).

## Target

Per `docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md`, aim for **≥ 40 / 56** homepage-grade with **no category &lt; 2** and **no hard-stop failures**.

## Summary (self-assessment)

| Category | Score (1–5) | Notes |
|----------|-------------|-------|
| Governance & identity | 4 | Governed manifest/version contract unchanged; manage route uses backend API + tokens. |
| Layout & breakpoints | 4 | Explicit breakpoint contract + `data-breakpoint-*` evidence hooks on manage root. |
| Motion & premium stack | 4 | `motion`, `lucide-react`, Radix tooltip/separator/scroll-area, `cva`, `clsx` used on manage surfaces. |
| State & errors | 4 | Load/blocked/error/ready; save conflict via `isGraphConflict`; dirty-state `beforeunload`; correlation in errors. |
| Accessibility & keyboard | 3 | Focus-visible on registry buttons; further focus order / live-region polish deferred. |
| Security / no iframe (manage) | 5 | Manage route has no iframe host; invariant test asserts `iframe` absent. |

**Approximate total:** _placeholder — complete during human audit using the canonical scorecard grid._

## Checklist cross-reference

See companion notes: `homepage-uiux-audit-checklist-notes-foleon.md`.

## Accepted exceptions

- Manage route uses **local CSS semantic tokens** (`foleonManageTokens.css` + CSS modules) rather than Griffel, to keep the SPFx IIFE bundle aligned with doctrine “no ordinary drift” while avoiding ui-kit coupling for this experimental surface. ESLint may still warn on residual inline styles for Radix portals/icons.

## Verification commands (evidence)

```bash
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions build
pnpm --filter @hbc/functions exec vitest run src/services/__tests__/foleon-service.test.ts
```
