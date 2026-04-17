# Homepage Shell Wave 02 — Enhanced Shell-Only Audit and Implementation Package

## Objective

Replace the attached Wave 02 shell package with a materially stronger, repo-truth-grounded package that is strictly focused on homepage shell refinement, shell governance, entry-stack behavior, and future control-panel readiness.

This package is not a restyle of the attached prompts.

It is a re-audit package built against the live `main` branch of `RMF112018/hb-intel`, the governing shell and homepage doctrine, and external research on responsive shell composition, container-aware adaptation, prioritized homepage/task design, and reflow-safe UI architecture.

## What changed relative to the attached package

The attached package was directionally right about four themes:

1. shell governance metadata
2. persisted layout boundaries
3. preview / validation seams
4. closure artifacts

But it was too thin, partially stale, and too future-control-panel-centric.

### The main repo-truth corrections

- The shell already has an occupant registry, protected decisions, preset library, validation pipeline, override parsing, and preview helpers.
- The shell is already container-aware at the `hbHomepage` surface level via `ResizeObserver` and entry-state resolution.
- The attached Prompt 03 is obsolete as written because preview helpers already exist.
- The largest current shell-only gap is not “add preview helpers.” It is the lack of a shared entry-stack contract across:
  - flagship hero
  - priority actions band
  - first shell lane
- The persisted layout boundary is still too loose and under-specified for a future maintainer-facing control panel.
- Existing validation and tests are real, but not yet proof-grade against the shell-entry breakpoint spec.

## Scope lock

This package is **strictly shell-only**.

### In scope

- shell-owned governance metadata
- protected-vs-configurable decision boundaries
- versioned persisted shell policy
- preset canonicalization and override permissions
- entry-stack breakpoint governance across hero / priority actions / first shell lane
- shell-owned mode negotiation seams
- proof-grade conformance harnesses, tests, and closure artifacts

### Out of scope

- redesign of child modules
- module shell-fit parity programs
- module maturity audits
- compact-mode rebuilds inside hosted modules
- hosted module feature work
- maintainer UI construction for a control panel

The shell may define the contract a future control panel must obey.
It must not build that control panel in this scope.

## Repo-truth posture

This package assumes the following live-code seams already exist and must be extended rather than re-invented:

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellTypes.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/protectedDecisions.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellSchema.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/shellValidation.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/breakpointPolicy.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/slotComfortResolver.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/__tests__/shellValidation.test.ts`
- `apps/hb-webparts/src/webparts/priorityActionsRail/PriorityActionsRail.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/HbSignatureHeroHomepage.tsx`
- `apps/hb-webparts/src/mount.tsx`

## Governing authority

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`

## Package contents

### Audit documents

- `Plan-Summary.md`
- `00-Enhanced-Audit-Summary.md`
- `01-Repo-Truth-vs-Wave-02-Comparison.md`
- `02-Shell-Issue-Gap-Register.md`
- `03-Research-Uplift-and-Recommended-Concepts.md`
- `04-Prioritized-Shell-Enhancement-Plan.md`

### Implementation prompts

- `Prompt-01-Harden-Shell-Governance-Registry-And-Decision-Model.md`
- `Prompt-02-Define-Versioned-Shell-Layout-Policy-And-Persisted-Boundary.md`
- `Prompt-03-Canonicalize-Presets-Band-Semantics-And-Override-Permissions.md`
- `Prompt-04-Establish-Entry-Stack-Breakpoint-Contract-Across-Hero-Actions-And-First-Lane.md`
- `Prompt-05-Add-Shell-Owned-Mode-Negotiation-And-Container-Conformance-Seams.md`
- `Prompt-06-Build-Shell-Conformance-Harness-Tests-And-Closure-Artifacts.md`

## How to use this package

1. Read `Plan-Summary.md` first.
2. Read `00-Enhanced-Audit-Summary.md` and `01-Repo-Truth-vs-Wave-02-Comparison.md` to understand why the replacement package differs from the attached Wave 02 package.
3. Execute the implementation prompts in order.
4. Do not skip Prompt 04 or Prompt 06. They close the largest shell-only gaps.
5. Treat the prompt sequence as one closure program, not as unrelated tickets.

## Local code agent instruction standard

Each implementation prompt in this package explicitly tells the local code agent:

> Do not re-read files that are already in active context or memory unless you need to confirm drift, dependencies, or uncertainty after making changes.

That instruction is intentionally preserved because the shell work is spread across a known seam set and should not waste cycles on unnecessary re-scanning.

## Success standard

Wave 02 shell work is only complete when all of the following are true:

- the shell’s governance model is materially stronger than the attached package contemplated
- persisted layout inputs are versioned, bounded, and reject unsafe control-panel drift
- preset semantics and override permissions are canonical and reviewable
- the hero, priority actions rail, and first shell lane are governed by a shared shell-entry breakpoint contract
- the shell owns a meaningful mode-negotiation seam, not just data attributes
- closure includes proof-grade conformance artifacts against breakpoint, reflow, and governance rules
- the work remains strictly shell-only
