# PCC Phase 1 Step 1 Prompt Package

## Purpose

This package instructs a local code agent to execute:

```text
Phase 1 Step 1 — Machine-Readable Template Contract Scaffold and Schema Family Skeleton
```

Phase 0 is closed and the current readiness decision is:

```text
Ready to Open Phase 1
```

Phase 1 Step 1 is the first controlled move from documentation planning into a machine-readable contract scaffold. It creates the `packages/project-site-template/` structure and schema-family skeletons, but it does **not** complete full schema extraction, provisioning, backend integration, SPFx implementation, or CI validation.

## Prompt Files

| File | Use |
|---|---|
| `01_Phase_1_Step_1_Template_Contract_Scaffold_and_Schema_Family_Skeleton.md` | Primary execution prompt. Creates the scaffold and family skeletons. |
| `02_Phase_1_Step_1_Architecture_Gap_Escalation_If_Required.md` | Optional prompt if scaffold work exposes an undecided architecture point. |
| `03_Phase_1_Step_1_Closeout_Validation.md` | Closeout prompt to validate the scaffold and confirm readiness for Phase 1 Step 2. |
| `04_Phase_1_Step_1_Final_Commit_Summary.md` | Helper prompt to produce the final commit summary and description. |
| `COMMIT_MESSAGE.md` | Suggested commit message. |

## Expected Implementation Target

The primary allowed implementation target is:

```text
packages/project-site-template/
```

The local agent may also create Phase 1 documentation under:

```text
docs/architecture/blueprint/sp-project-control-center/phase-1/
```

## Core Guardrail

This package allows **schema scaffold and skeleton files only**. It does not allow:

- backend provisioning implementation;
- SPFx implementation;
- Graph / SharePoint provisioning code;
- Procore integration code;
- package deployment changes;
- manifest version bumps;
- CI pipeline changes;
- generated artifacts;
- full object extraction;
- Procore canonical-model implementation;
- external-user activation;
- HBI Assistant activation;
- Procore write-back.

The scaffold must remain traceable to Phase 0 Step 2 and the governing Contract.
