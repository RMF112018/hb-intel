# Prompt 04 — Create an Explicit Zone Composition Registry and Clean Up Contract Drift

## Objective

Stop treating homepage composition as ad hoc JSX ordering and convert it into an explicit, governed shell composition model with clean contracts.

## Governing authority

Binding:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`

Benchmark context:
- `docs/architecture/plans/MASTER/spfx/benchmark/01-Homepage-Webpart-Conformance-Standard.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/03-Homepage-Webpart-Delivery-Workflow-and-Gates.md`

## Exact seams to inspect

- `apps/hb-webparts/src/webparts/hbHomepage/HbHomepageShell.tsx`
- `apps/hb-webparts/src/webparts/hbHomepage/hbHomepageContract.ts`
- zone wrapper files under `apps/hb-webparts/src/webparts/hbHomepage/zones/`
- any new registry/config files you add

## Current future-state gap to close

The shell currently hard-codes zone sequence directly in JSX and the contract surface is broader than the actual runtime composition behavior.

That makes it harder to:
- reason about homepage hierarchy
- review shell decisions
- enforce role/priority semantics
- evolve layout without hidden drift

## Required implementation outcome

1. Introduce an explicit composition registry or equivalent shell-governance structure that defines:
   - zone key
   - render order
   - layout role / priority
   - fallback behavior
   - optional section metadata needed by the shell
2. Clean up `hbHomepageContract.ts` so the contract reflects what the shell genuinely composes and forwards.
3. Keep the implementation readable and bounded.
4. Preserve the intentional zone model; do not flatten zone ownership.

## Proof of closure

Show:
- the new registry structure
- old vs new contract summary
- how shell composition decisions are now explicit instead of buried in JSX order
- which stale or unused props were removed, retained with rationale, or reconnected

## Constraints

- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not create configuration indirection with no governance value.
- Do not re-architect unrelated webparts.
