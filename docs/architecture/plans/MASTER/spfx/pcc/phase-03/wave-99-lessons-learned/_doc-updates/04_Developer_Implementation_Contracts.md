# Developer Implementation Contracts — Estimating Workbench
## Wave 13G Authority Lock

All Estimating Workbench documentation, UX/wireframe framing, dependency evaluation, model contracts, SharePoint schema contracts, SPFx surface contracts, read-model/command contracts, test gates, and subsequent runtime implementation prompts are governed under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

The wireframe authority path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/
```

The developer-contract target path is:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

This Wave 13G authority supersedes any earlier implication that Estimating Workbench implementation work should move to a separate future wave. Future implementation may be split into 13G sub-prompts or phases, but it remains under Wave 13G unless a later approved architecture decision explicitly supersedes this path.

Wave 13G documentation and prompts do not, by themselves, authorize production rollout, tenant mutation, package installation, lockfile mutation, Procore/Sage writeback, or active project workbook import.

## Wave 13G Target Paths

| Artifact Family | Required Repo Path |
| --- | --- |
| Wave authority root | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/` |
| Wireframes | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/` |
| Developer contracts | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/` |
| Machine-readable references | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/reference/` |
| Prompt closeouts | `docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/closeouts/` |

All generated documentation and implementation prompts must use these paths. Do not create a parallel `wave-99-estimating-workbench`, top-level `estimating-workbench-developer-contracts`, or separate future wave for Estimating Workbench unless a later approved authority update supersedes Wave 13G.


## Required Developer Contracts

The local agent must create or update the following target docs under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

Required docs are supplied in this package under `docs/estimating-workbench/`.

## Machine-Readable Artifacts

The local agent must also add the corresponding JSON artifacts under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/reference/
```

The JSON artifacts in this package are the content basis. Adapt path references to repo truth, but do not change closed decisions.

## Contract Families

- Scope and routing.
- SharePoint physical schema.
- Read models and command contracts.
- State machines.
- Field dictionary.
- Validation catalog.
- Role/action/permission matrix.
- Grid and formula behavior.
- Dependency-package evaluation.
- Commercial and Multifamily templates.
- HB cost-code dictionary contract.
- Workbook template migration mapping.
- Downstream handoff schema.
- HBI grounding/search behavior.
- Error/degraded states.
- Test and acceptance gates.
