# Prompt-08 — Provisioning Package and Client-Surface Alignment

## Objective

Align `packages/provisioning` and any related client-facing provisioning surface with the hardened backend semantics introduced in Prompts 03–07.

## Important execution rules

- Do not re-read files already in current context unless needed.
- Keep client-surface changes minimal but coherent.
- Do not introduce frontend-side business logic that belongs in the backend.
- Preserve compatibility wherever reasonable, but do not leave materially misleading client contracts in place.

## Inputs

Use:
- `packages/provisioning/**`
- provisioning API client(s)
- backend API contract changes from Prompts 03–07
- current admin provisioning page usage
- any shared model updates

## Scope of work

Update the provisioning package/client layer so it can consume and expose:

- improved validation failures,
- improved run/failure status payloads,
- enriched recovery/guidance payloads,
- and any new provisioning-history or evidence fields needed by the SPFx operator experience.

## Required implementation outcomes

1. Client surface matches backend contract reality.
2. Naming and payload shapes are consistent enough for SPFx use.
3. No backend-only semantics are pushed into the package as fake client logic.
4. Existing provisioning consumers remain compatible where practical or are updated together.

## Documentation requirement

If package-level public surface changed materially, update:
- `packages/provisioning/README.md` if present, or create one if the package lacks a durable usage explanation.

Document:
- public client methods,
- status/error semantics,
- and any behavior that SPFx consumers must understand.

## Validation

Add/update targeted package/client tests as appropriate.
Run only the smallest relevant package/backend validation set.

## Completion condition

Stop after package/client alignment and related docs/tests are complete.
Do not yet correct the SPFx route/UI layer in this prompt.
