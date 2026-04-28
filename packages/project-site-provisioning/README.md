# `@hbc/project-site-provisioning`

Headless deterministic mapper / planner scaffold for the SP Project Control Center (PCC) **Standard Project Site Template Contract**.

This package consumes the schema-only contract owned by [`@hbc/project-site-template`](../project-site-template/README.md) and is intended to evolve into the layer that produces a frozen, signed, human-approved provisioning manifest plus a proof artifact. Tenant mutation, Graph / PnP calls, SPFx code, and Procore runtime concerns belong elsewhere — see the boundary tables below.

---

## Current scaffold status

**Phase 2 Step 2 — Mapper Package Scaffold.** This step delivers the package shape only:

- the `ProvisioningManifest` and `MutationGate` type contracts,
- a frozen mutation-gate factory and a runtime no-mutation guard,
- a deterministic minimal mapper (`createProvisioningManifest`) that returns a manifest with planned-only object plans and proof placeholders,
- a runtime validator (`validateProvisioningManifest`) that rejects unlocked / live-mutation / secret-bearing / Procore-mirror manifests,
- minimal fixtures and Vitest tests.

Object-plan population from the template contract is **not** in scope here. That is Phase 2 Step 3.

## What this package does

- defines the manifest contract that any future planner must satisfy,
- enforces the mutation gate at compile time (literal-true / literal-false types) and at runtime (validator + guard),
- produces a deterministic, mutation-locked manifest stamped from the contract's identity fields when given an injected clock,
- surfaces a public API that contains no tenant-execution function names.

## What this package does **not** do

- does not call Graph, PnP, the Azure SDK, SPFx APIs, Procore, or any tenant endpoint,
- does not import from `@pnp/*`, `@azure/*`, `@microsoft/sp-*`, or any SPFx package,
- does not perform site / list / library / page / group / permission creation,
- does not write files outside the test/docs scope,
- does not emit secrets or mirror Procore tables,
- does not host an executor — that responsibility belongs to a future `backend/functions/` adapter operating on an approved manifest.

## Dependency direction

```
@hbc/project-site-template     (schema/contract/validation only — no runtime)
            │
            ▼  declared workspace dependency; runtime imports added in Step 3+
@hbc/project-site-provisioning (this package — headless planner/mapper)
            │
            ▼  consumed by future surfaces (read-only)
backend/functions executor adapter (future)        SPFx PCC surfaces (read-only types)
```

The reverse direction is forbidden: `@hbc/project-site-template` must never depend on this package.

## No-mutation policy

A scaffold-stage manifest:

- has `mutationGate.mutationLocked === true`,
- has `mutationGate.liveMutationAllowed === false`,
- has `mutationGate.requiresHumanApproval === true`,
- contains none of the prohibited execution keys at any depth: `execute`, `apply`, `provision`, `mutate`, `createSite`, `createList`, `createLibrary`, `createGroup`, `assignPermission`,
- contains none of the prohibited secret-class keys: `clientSecret`, `client_secret`, `apiKey`, `accessToken`, `bearerToken`, `refreshToken` (and underscored variants),
- contains none of the prohibited Procore-mirror keys: `procoreMirror`, `mirrorTable`, `mirrorRecords` (and underscored variants).

The validator returns all violations rather than throwing on the first.

## Manifest lifecycle

| Stage | Owner | Output | Mutation |
|---|---|---|---|
| Step 2 (this package, current) | scaffold mapper | manifest with planned-only object plans + planned proof | none |
| Step 3 | expanded mapper | manifest with populated object plans derived from the contract | none |
| Step 4 | proof emitter | timestamped JSON + Markdown proof artifact in a version-controlled `proof/` folder | none |
| Step 5 | non-prod executor adapter under `backend/functions/` | tenant changes against a non-production target | yes, only on an approved manifest |
| Step 6 | drift / evidence services | post-provision validation | none |
| Step 7 | production gating | production tenant rollout | yes, only with operator-approved evidence |

## Expected future phases

- Step 3 — populate `objectPlans.*.entries` from the contract families: pages, libraries, lists, groups, permission templates, modules, workflows, integrations, site health, provisioning validation.
- Step 3 — add a deterministic `plannedHash` derived from normalized inputs, plus secret-scan and Procore-mirror-scan results in `proof`.
- Step 4 — integrate with the established `tools/pnp-runner-local/scripts` proof-folder convention.
- Step 5+ — define the executor adapter contract under `backend/functions/`.

## Validation commands

From the workspace root:

```bash
pnpm --filter @hbc/project-site-provisioning check-types
pnpm --filter @hbc/project-site-provisioning test
```

Phase 1 gate (must remain clean as a precondition for any work in this package):

```bash
pnpm --filter @hbc/project-site-template validate:all
```

## Boundary with `@hbc/project-site-template`

- Read-only consumer: this package only reads contract-shaped data.
- No reverse dependency: the template package must not import from this package.
- Runtime imports are deferred to Step 3; for Step 2 the dependency declaration locks the direction in `package.json` even though no code import exists yet.

## Boundary with `backend/functions/`

- This package is not consumed by the backend in Step 2.
- A future executor adapter under `backend/functions/` will consume **only the manifest type** (and possibly a small validator surface), never the planner internals.
- The executor adapter must operate on a frozen, signed, approved manifest and must never re-derive plans inside the backend.

## Boundary with SPFx

- SPFx surfaces must not import this package as a runtime dependency in Step 2.
- A later step may expose read-only typed views of the manifest for SPFx consumption; live tenant calls must remain backend-only.

## Boundary with Procore

- No Procore SDK, no Procore HTTP client, no Procore secrets.
- No full Procore mirror in any manifest produced by this package.
- All Procore API traffic stays behind `backend/functions/`; SPFx-direct calls remain forbidden.

## Boundary with `tools/pnp-runner-local/`

- This package does not invoke PnP runner scripts.
- A future step may emit proof artifacts that the PnP runner consumes for non-production apply runs, reusing the existing timestamped proof-folder convention.

---

## See also

- [Phase 2 Step 1 Provisioning Foundation Audit](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_1_Provisioning_Foundation_Audit.md)
- [Phase 2 Step 1 Consumer Boundary](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_1_Consumer_Boundary.md)
- [Phase 2 Step 1 Closeout](../../docs/architecture/blueprint/sp-project-control-center/phase-2/Phase_2_Step_1_Closeout.md)
- [`@hbc/project-site-template` README](../project-site-template/README.md)
- [PCC blueprint README](../../docs/architecture/blueprint/sp-project-control-center/README.md)
- [`docs/Phase_2_Step_2_Scaffold_Notes.md`](./docs/Phase_2_Step_2_Scaffold_Notes.md)
