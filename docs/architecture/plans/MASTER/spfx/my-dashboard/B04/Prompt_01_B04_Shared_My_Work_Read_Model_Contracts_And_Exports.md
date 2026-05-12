# Prompt 01 — B04 Shared My Work Read-Model Contracts and Exports

## 1. Objective

Create the shared My Work DTO/read-model contract family under `packages/models/src/myWork/` and expose it through the repo’s standard models export posture.

## 2. Why this work exists

B04 closes the My Work data-contract layer. Downstream app clients, backend routes, mock providers, and B05 UI work all need one stable contract family. Without this shared contract layer, later work will drift into duplicate local shapes or raw Adobe payload leakage.

## 3. Current repo-truth problem or gap

The current repo has no `packages/models/src/myWork/` namespace and no shared My Work read-model envelope, route response map, or Adobe Sign Action Queue DTO vocabulary. PCC provides a precedent in `packages/models/src/pcc/`, but the B04 My Work contract must be actor-contextual and use the exact B04 vocabulary rather than copying PCC mode/status drift.

## 4. Attached B04 authority / plan basis

Use the attached **B04 — My Work Read Models, Routes, Error Taxonomy, and Fixture Architecture Development** artifact as the authoritative batch plan. Preserve these closed decisions:

- B04 model namespace: `packages/models/src/myWork/`
- B04 read-model modes: `fixture | backend`
- B04 source statuses: `available`, `partial`, `configuration-required`, `authorization-required`, `principal-unresolved`, `source-unavailable`, `backend-unavailable`
- B04 structured warning codes
- B04 home read model and Adobe queue read model
- B04 six-status actionable Adobe recipient vocabulary
- My Work DTOs are a narrow My Dashboard BFF/DTO layer, not a replacement for `@hbc/my-work-feed`.

## 5. Exact files, folders, docs, and symbols to inspect

Inspect:
- `packages/models/src/pcc/PccReadModels.ts`
- `packages/models/src/pcc/index.ts`
- `packages/models/src/index.ts`
- `packages/models/package.json`
- B04 support file `02_B04_Target_Contracts_And_Route_Map.md`

Confirm current repo conventions for:
- type-only shared contracts,
- barrel exports,
- test file placement,
- package subpath export behavior.

## 6. Required implementation outcome

Create:
```text
packages/models/src/myWork/
├── MyWorkReadModels.ts
├── AdobeSignActionQueue.ts
├── MyWorkReadModels.test.ts
├── AdobeSignActionQueue.test.ts
└── index.ts
```

Update:
```text
packages/models/src/index.ts
```

The new domain must be importable through repo-standard `@hbc/models/myWork` semantics once built.

## 7. Detailed change instructions

1. Create `MyWorkReadModels.ts` with:
   - read-model mode/status/warning literals,
   - `MyWorkReadModelWarning`,
   - `MyWorkReadModelEnvelope<T>`,
   - actor/source-readiness/home summary DTOs,
   - home Adobe queue projection DTO,
   - `MyWorkHomeReadModel`,
   - `MyWorkReadModelResponseMap`.

2. Create `AdobeSignActionQueue.ts` with:
   - exact six Adobe actionable recipient statuses,
   - exact six normalized required actions,
   - queue item DTO,
   - queue summary DTO,
   - query DTO,
   - pagination DTO,
   - freshness state DTO,
   - focused Adobe queue read model DTO.

3. Keep the queue contract separated enough that `MyWorkReadModels.ts` imports type-only references from `AdobeSignActionQueue.ts` as needed.

4. Create `index.ts` exporting both contract files. Do not create ad hoc deep-import assumptions.

5. Update `packages/models/src/index.ts` to export `./myWork/index.js`.

6. Add tests proving:
   - exact mode literals,
   - exact source-status literals,
   - exact warning-code literals,
   - exact six Adobe statuses,
   - exact six normalized actions,
   - representative object shapes for envelope/home/queue DTOs,
   - response-map route keys,
   - contract purity posture.

7. Model files must remain contract-only. Do not add fetch/service/provider/OAuth logic.

## 8. What done looks like

Done means:
- the new `myWork` model namespace exists,
- its exports compile,
- tests lock the B04 literals and DTO shapes,
- root models export exposes the new domain,
- no broad personal-work platform replacement language or behavior was introduced.

## 9. Strict constraints / prohibitions

- Do not import from app code or backend runtime into model files.
- Do not implement Adobe clients or routes here.
- Do not add ranking/dedupe/registry logic that belongs to `@hbc/my-work-feed`.
- Do not reuse PCC project IDs/personas in My Work DTOs.
- Do not introduce `mock`, `local`, or `production` as My Work envelope modes.
- Do not change existing PCC contracts.

## 10. Validation requirements

Run:
```text
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
```

Record exact command output status in closeout.

## 11. Proof of closure

Provide:
- a file list,
- a short literal/DTO summary,
- test names added,
- confirmation that `packages/models/src/index.ts` now exports `myWork`,
- confirmation that the contract files contain no client/provider/OAuth runtime logic.

## 12. Commit / closeout expectations

Do not commit unless the user’s workflow explicitly requests it. Provide a compact implementation closeout suitable for later commit-message generation.

## 13. Do not re-read files already in active context unless needed to confirm drift

Do not re-read files that are still available in your active context or memory unless you need to confirm repo drift, resolve a conflict, or verify an implementation detail that cannot be trusted from the current context.
