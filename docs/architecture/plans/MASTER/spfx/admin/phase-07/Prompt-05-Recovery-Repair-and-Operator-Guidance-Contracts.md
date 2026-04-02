# Prompt-05 — Recovery, Repair, and Operator-Guidance Contracts

## Objective

Make provisioning recovery actions and operator guidance more explicit, durable, and trustworthy.

This phase should improve the semantics around retry, escalate, re-check, or repair initiation without pretending all later-phase repair frameworks already exist.

## Important execution rules

- Do not re-read files already in current context unless needed.
- Stay grounded in current provisioning actions already present.
- Do not invent a giant universal admin action framework here.
- Keep the backend as the owner of recovery execution semantics.

## Inputs

Use:
- provisioning failure/status APIs and related handlers
- `apps/admin/src/pages/ProvisioningFailuresPage.tsx`
- saga/run-state work from Prompt-04
- persistence/service files already touched
- the Phase 7 baseline docs

## Scope of work

Define and implement the minimum coherent recovery/repair action contract for provisioning, such as:

- retry,
- escalate,
- refresh/re-check status,
- operator guidance payloads,
- and narrowly scoped repair initiation hooks if Phase 7 truly needs them.

## Required implementation outcomes

1. Provisioning recovery actions have stable request/response semantics.
2. The backend returns durable reason/context for why an action is available or blocked.
3. Operator guidance can explain:
   - what failed,
   - what likely blocked the run,
   - what the next recommended action is,
   - and when escalation is more appropriate than retry.
4. Current UI actions do not remain “blind buttons” with weak context.

## Documentation requirement

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-7/provisioning-recovery-and-operator-guidance-contract.md`

## Validation

Add/update tests around:
- retry availability rules,
- escalate behavior,
- blocked-action messaging where applicable,
- and guidance payload stability.

## Completion condition

Stop after recovery/guidance contracts, code, and tests are complete.
Do not yet do the broader diagnostics instrumentation work in this prompt.
