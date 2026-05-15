# HB Intel My Dashboard UI Posture Reset Implementation Package

## Objective

This package instructs a local code agent to transform the current **HB Intel My Dashboard** application from a developer-first, state-demonstration surface into a polished, employee-facing **quick-action personal launch pad**.

The package is built around a **closed target UI posture**. It is not an exploratory package. The target state is already decided; the implementation agent's role is to execute it against current repo truth, prove closure, and update documentation/tests accordingly.

## Why This Package Exists

The current rendered My Dashboard experience has strong technical foundations but the wrong user-facing posture:

- shell-level tabs and dropdown module navigation remain visible;
- Adobe Sign is fragmented across multiple cards and a focused route;
- the hero behaves like a high-salience telemetry/state strip;
- `My Projects` consumes nearly full page width even when data density is low;
- readiness/status messaging is overexposed relative to quick action;
- the page reads as a staged validation environment rather than an employee launch pad.

This package corrects that posture while preserving:

- the existing read-model discipline;
- source-of-record boundaries;
- OAuth initiation behavior;
- responsive bento principles;
- testability and repo-truth governance.

## Closed Implementation Target

### Primary Page Model

The primary page becomes the product. There is no visible runtime dependence on:

- tab navigation;
- dropdown module launcher;
- route-switching to understand Adobe Sign;
- generic source-readiness cards outside the owning module.

### Rendered Module Inventory

Only two production-relevant module cards are rendered in the reset target:

1. **My Projects**
2. **Adobe Sign Action Queue**

No filler cards. No placeholder modules. No invented summary panels solely to occupy space.

### One-Card-Per-Module Doctrine

Every module owns all of its visible states inside its card:

- loading;
- unavailable;
- authorization required;
- configuration required;
- account/principal unresolved;
- partial/readiness degraded;
- empty but connected;
- populated/actionable.

### Header Model

The current telemetry-heavy hero is replaced by a compact production header:

- eyebrow: `My Dashboard`
- title: `My Work`
- support line: `Your personal launch pad for project access and work requiring attention.`

No four-column state telemetry strip.  
No governance microcopy lane at page-header level.

### Layout Model

Locked bento choreography:

| Breakpoint | My Projects | Adobe Sign |
|---|---:|---:|
| Large laptop | 7 / 12 | 5 / 12 |
| Desktop | 7 / 12 | 5 / 12 |
| Ultrawide | 7 / 12 | 5 / 12 |
| Standard laptop | 6 / 10 | 4 / 10 |
| Small laptop | Full width | Full width |
| Tablet landscape | Full width | Full width |
| Tablet portrait | Full width | Full width |
| Phone | Full width | Full width |

Ordering is static:
1. My Projects
2. Adobe Sign Action Queue

### Removed Standalone UI Concepts

The following are **not** part of the target primary-page runtime:

- standalone Work Summary card;
- standalone Source Readiness card;
- standalone Adobe Queue State card;
- standalone Adobe Connection Guidance card;
- focused Adobe module page as a required UI path;
- visible tab/dropdown launcher shell.

## Execution Model

Execute the prompts in order. Each prompt is intentionally bounded.

1. **Prompt 00** — repo-truth drift lock and execution map
2. **Prompt 01** — single-page shell reset
3. **Prompt 02** — compact production header replacement
4. **Prompt 03** — one-card Adobe Sign consolidation
5. **Prompt 04** — disciplined My Projects launch-pad card
6. **Prompt 05** — bento choreography and primary-page composition
7. **Prompt 06** — obsolete artifact removal, test/doc reconciliation
8. **Prompt 07** — final validation, packaging, proof of closure

## How the Local Agent Should Use This Package

1. Read:
   - this `README.md`;
   - `docs/02-Decision-Lock-And-Closed-Target-Posture.md`;
   - `docs/03-Comprehensive-Target-UI-Posture.md`;
   - `reference/Implementation-Guardrails.md`.

2. Execute prompts strictly in order.

3. Do not reopen locked decisions.

4. Do not re-read files already in active context unless:
   - they changed;
   - context is stale;
   - scope expanded;
   - dependency uncertainty requires confirmation.

5. After each prompt:
   - produce the requested proof of closure;
   - capture actual files changed;
   - run the required validation for that prompt;
   - document any repo-truth drift that affected implementation.

## Repository Areas Expected to Be Touched

The final implementation is expected to materially interact with:

```text
apps/my-dashboard/src/MyDashboardApp.tsx
apps/my-dashboard/src/shell/
apps/my-dashboard/src/surfaces/home/
apps/my-dashboard/src/modules/adobeSign/
apps/my-dashboard/src/modules/myProjects/
apps/my-dashboard/src/layout/
apps/my-dashboard/src/state/
apps/my-dashboard/**/*.test.tsx
apps/my-dashboard/README.md
```

Additional files may be edited when repo truth proves they are required to achieve the closed target posture, but unrelated refactors are prohibited.

## Validation Commands Expected by the Package

At minimum, the final execution must include:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard build
npx tsx tools/build-spfx-package.ts --domain my-dashboard
```

Run narrower tests during intermediate prompts as appropriate, but the final prompt requires the full closeout set.

## Success Standard

The implementation is successful only when all of the following are true:

- My Dashboard reads as a polished one-page launch pad.
- No visible tab/dropdown module launcher remains.
- No focused Adobe route is needed to understand or operate the Adobe queue summary.
- Adobe Sign is consolidated into one coherent card.
- My Projects is no longer a full-width low-density dominant card.
- Header telemetry is replaced with restrained page identity.
- State messaging is owned by the relevant card, not scattered across the page.
- Layout obeys the locked bento choreography.
- Tests and docs reflect the new architecture.
- Typecheck, tests, build, and SPFx package generation pass.
