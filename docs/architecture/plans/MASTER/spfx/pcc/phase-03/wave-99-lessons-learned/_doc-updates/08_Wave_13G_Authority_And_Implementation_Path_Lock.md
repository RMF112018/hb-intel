# Wave 13G Authority and Implementation Path Lock

Generated: 2026-05-04

## Purpose

This file locks the Estimating Workbench documentation and implementation authority to Wave 13G.

## Governing Authority Path

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/
```

All Estimating Workbench UX, documentation, dependency evaluation, developer contracts, model-contract work, SharePoint schema work, SPFx surface work, read-model/command work, validation/test gates, and subsequent implementation prompts belong under this Wave 13G authority.

## Wireframe Reference Path

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/wireframes/
```

The wireframes saved at this path are the UX framing authority for the Estimating Workbench MVP amendment. Implementation must preserve their core intent unless a later Wave 13G decision record revises them.

## Developer Contract Target Path

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/
```

## Machine-Readable Reference Path

```text
docs/architecture/blueprint/sp-project-control-center/phase-3/wave-13G/estimating-workbench-developer-contracts/reference/
```

## Implementation Interpretation

- Wave 13G is not limited to wireframes.
- Wave 13G governs both documentation and implementation framing.
- Runtime implementation may be broken into scoped 13G sub-prompts, but those prompts must remain under this authority.
- The Estimating Workbench must remain mounted within the existing PCC Project Readiness surface for MVP.
- Commercial and Multifamily remain the only day-one templates.
- HB internal cost codes remain the MVP cost-code hierarchy.
- Active project workbook import remains deferred.

## Blocked Without Separate Gate

This authority lock does not authorize:

- production rollout;
- tenant mutation;
- live SharePoint list creation;
- package installation;
- lockfile mutation;
- Procore writeback;
- Sage writeback;
- active project workbook import;
- HBI pricing authority;
- HBI award authority.

## Required Closeout Language

Every Wave 13G prompt closeout must state:

- branch / HEAD / worktree status;
- `pnpm-lock.yaml` MD5 before and after when package files are in scope;
- files changed;
- validation commands and results;
- no unauthorized package install;
- no tenant mutation;
- no source-system writeback;
- no active project workbook import;
- whether work remained within Wave 13G authority.
