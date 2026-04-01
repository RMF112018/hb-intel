# Phase 6 — Data Contract and SharePoint Schema Hardening

## Purpose

This package governs **Phase 6 — Data Contract and SharePoint Schema Hardening** for the Accounting-side Project Setup workflow and its connected backend persistence model.

The goal of this phase is to make the Project Setup request-record contract, SharePoint mapping contract, and compatibility posture explicit enough that downstream work can rely on them without schema guesswork.

## Authority order

Every prompt in this package must use this authority order:

1. live repo code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living reference docs and runbooks
4. historical PH6 / MVP plans as drift evidence only

Do not treat historical plans as peer authority when live implementation and current-state docs disagree.

## Confirmed repo-truth baseline that governs this phase

The live repo currently shows all of the following:

- Project Setup request persistence is backed by the SharePoint `Projects` list.
- The SharePoint contract is already defined in:
  - `backend/functions/src/services/projects-list-contract.ts`
  - `backend/functions/src/services/projects-list-mapper.ts`
  - `backend/functions/src/services/project-requests-repository.ts`
- The schema posture is **mixed by design in current repo truth**, including:
  - legacy CSV-import `field_1` through `field_24`
  - named columns such as `viewerUPNs` and `addOns`
  - named P2-07 fields such as `projectStreetAddress`, `supportingEstimatorUpns`, `clarificationItems`
  - named identity fields such as `submittedByOid` and `completedByOid`
- The current backend submit path and mapper behavior **alias** persisted `requestId` and `projectId` in practice:
  - `submitProjectSetupRequest` sets `requestId = projectId`
  - the SharePoint contract maps `requestId -> field_1`
  - the mapper reconstructs both `requestId` and `projectId` from `field_1`
- `projectNumber` remains a separate human/business identifier used for approval, display, and provisioning launch.
- Completion and provisioning linkage fields (`state`, `projectNumber`, `siteUrl`, `completedBy`, `completedAt`) are already consumed across backend and Accounting surfaces.

These facts are the starting point for Phase 6. Do not write prompts that assume a fully normalized or already-separated dual-key persistence model unless the work in this phase deliberately creates one.

## What this phase covers

- repo-truth audit of the request-record and SharePoint mapping contract
- canonical contract freeze grounded in current implementation
- mapper and repository hardening
- migration / compatibility and schema validation posture
- cross-surface verification
- final documentation reconciliation and readiness closure

## What this phase does not cover by default

- broad lifecycle redesign
- broad provisioning redesign
- frontend workflow redesign outside tiny compatibility fixes
- ungrounded schema invention
- forced key separation without explicit repo changes and compatibility analysis

## Ordered prompt sequence

1. `Prompt-01` — repo-truth data-contract and SharePoint schema audit
2. `Prompt-02` — canonical request-record contract freeze
3. `Prompt-03` — SharePoint mapper and persistence hardening
4. `Prompt-04` — migration / compatibility and schema validation hardening
5. `Prompt-05` — cross-surface contract verification
6. `Prompt-06` — final documentation reconciliation and readiness report

Do not skip order. Prompt-02 depends on Prompt-01 findings. Prompt-03 through Prompt-05 depend on the contract frozen in Prompt-02.

## Expected evidence artifact

Maintain and update a single evolving review artifact at:

`docs/architecture/reviews/project-setup-phase-6-data-contract-and-schema-audit.md`

If the file does not yet exist, create it in Prompt-01. Do not treat its absence as a repo defect.

## Notes for the local code agent

- Treat the live repo as authoritative implementation truth.
- Do not re-read files that are still within your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not invent schema or field mappings not evidenced by repo truth or attached source artifacts.
- Start from the real aliased-identifier and mixed-schema posture before proposing normalization.
- Prefer reconciliation and explicit compatibility rules over wholesale redesign unless repo truth clearly requires a structural correction.

## Exit condition

Phase 6 is complete only when the final report can state, with evidence, that:

- the Project Setup request-record contract is explicit
- the SharePoint mapping contract is explicit
- identifier semantics are explicit
- legacy compatibility is either governed or deliberately removed
- cross-surface consumers are compatible with the hardened contract
- downstream phases can rely on the contract without schema guesswork
