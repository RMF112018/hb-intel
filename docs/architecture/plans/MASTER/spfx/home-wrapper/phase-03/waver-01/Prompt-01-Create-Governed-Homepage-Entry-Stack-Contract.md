# Prompt 01 — Create a governed homepage entry-stack contract

## Objective
Unify the homepage entry stack into one governed contract spanning:
- `hbSignatureHero`
- `PriorityActionsRail`
- `hbHomepage`

The required end state is that the homepage behaves like one authored sequence:
1. flagship hero
2. priority actions band
3. first shell lane

The implementation must make the breakpoint-spec rules enforceable in code rather than spread across separate authoring assumptions.

## Governing authority
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/README.md`
- `docs/reference/ui-kit/homepage-webpart-benchmark.md`

## Inspect these files first
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbSignatureHero/*`
- `apps/hb-webparts/src/webparts/priorityActionsRail/*`
- `apps/hb-webparts/src/webparts/hbHomepage/*`
- any homepage shared breakpoint/density helpers already in `apps/hb-webparts/src/homepage/**`

Do not re-read files that are still in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Current gap
The current shell begins after the hero and action band. That means the first-fold sequence is only partially governed by one system, which leaves the breakpoint-spec acceptance criteria under-enforced.

## Required implementation outcome
Create a homepage entry-stack contract that:
- defines the spacing, density, and sequencing rules between hero, actions, and first shell lane
- encodes first-fold expectations by breakpoint/device class
- preserves system-authored decisions that must not be maintainer-configurable
- is consumable by the hero, actions band, and shell without duplicating logic
- provides stable defaults for SharePoint authoring cases

## Closure proof required
Provide:
- changed file list
- exact contract shape
- proof that the first shell lane can be evaluated as part of a unified entry sequence
- explicit note of which decisions remain code-governed
- any new tests or validation coverage added

## Prohibited
- no broad redesign of module internals
- no tenant control-panel UI
- no unrelated theming work
