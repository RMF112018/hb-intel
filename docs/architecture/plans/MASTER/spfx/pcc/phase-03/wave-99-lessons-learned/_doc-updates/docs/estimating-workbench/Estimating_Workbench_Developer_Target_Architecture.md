# Estimating Workbench Developer Target Architecture
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

## Purpose

Define the developer-ready architecture for the PCC Estimating Workbench MVP.

## Core Decision

Estimating Workbench is a SharePoint/SPFx-first MVP module mounted under Project Readiness. It writes to structured SharePoint/PCC estimating lists and libraries and projects estimate/handoff posture into PCC downstream modules.

## System Boundary

PCC owns Estimating Workbench records because this feature replaces a legacy workbook workflow. Sage remains future accounting mapping source. Procore/Autodesk/BuildingConnected remain external/source systems where applicable. PCC does not write back to those systems in MVP.

## User-Facing Areas

- Estimate Home
- My Estimates
- Template Selector
- Estimate Builder
- Cost Summary
- GC/GR
- Scope Package Builder
- Bid Leveling Workbench
- Alternates / Allowances / Contingency
- Assumptions / Inclusions / Exclusions / Qualifications
- Handoff Preview
- Exports / Reports
- Template Admin

## Developer Principle

Every screen must distinguish working/scratch data from canonical downstream data. Handoff requires promoted, mapped, validated, frozen records.
