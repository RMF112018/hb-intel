# Prompt 01 — Wave 11 Implementation Readiness Audit

## Objective

Perform a read-only local repo-truth audit, current web research refresh, and implementation readiness report for Phase 3 Wave 11 Responsibility Matrix. Do not edit files.

## Required Instruction

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```

## Global Guardrails

You must preserve these guardrails throughout this prompt:

- Do not edit `docs/architecture/plans/**` unless separately authorized.
- Do not run broad formatting across the repo.
- Do not change dependencies, package manifests, lockfiles, workflows, CI, SPFx packaging, deployment files, app settings, or secrets unless this prompt explicitly authorizes a narrow change and you can justify it.
- Do not add runtime calls to Graph, PnP, SharePoint REST, Procore, Sage, AHJ portals, Document Crunch, Adobe Sign, or other external systems.
- Do not add backend write routes.
- Do not mutate Team & Access state.
- Do not execute approvals/checkpoints owned by Wave 14.
- Do not implement evidence file upload/download/sync/storage behavior.
- Do not provide legal advice, infer legal obligations, create legal obligations, or replace executed contracts.
- Stop and report if local repo truth contradicts the Wave 11 documentation package or this prompt.

## Allowed Files

Read-only inspection only. No edits.

## Required Local Baseline Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

## Required Repo-Truth Inspection

Inspect the files listed in:

```text
reference/01_REQUIRED_REPO_TRUTH_FILES.md
```

At minimum verify:

- Wave 11 canonical docs exist and are current.
- `WorkflowModules.ts` includes `responsibility-matrix`.
- `ProjectReadinessFramework.ts` includes `responsibility-matrix` as a source module.
- `PccReadModels.ts` read-model response-map pattern.
- backend `pcc-read-model` route/provider conventions.
- SPFx `src/api/`, `src/surfaces/`, `src/fixtures/`, and `src/tests/` conventions.
- package scripts in root, models, functions, and SPFx PCC package manifests.

## Required JSON Validation and Count Check

Run:

```bash
python3 -m json.tool docs/architecture/blueprint/sp-project-control-center/phase-3/wave-11/reference/default_responsibility_matrix_items.json >/tmp/wave11_default_items_validated.json
```

Run the count check from `reference/04_VALIDATION_COMMAND_REFERENCE.md` and verify:

- `defaultItems` total = `109`
- PM item count = `82`
- Field item count = `27`
- owner-contract active default obligations = `0`
- ambiguous item count matches canonical docs or is explained if changed

## Required Web Research

Use web search before producing the report. Review and cite current sources for:

- RACI/RAM fundamentals and RACI failure modes.
- Accountable vs Responsible and one-accountable/one-decider guidance.
- Construction role/responsibility allocation: owner, contractor, architect, engineer, consultants, subcontractors.
- AIA A201 and submittal responsibility distinctions.
- ConsensusDocs responsibility allocation concepts.
- CSI project delivery roles and information flow.
- RAPID and DACI decision-rights frameworks.
- Procore Ball In Court/current responsible party patterns.
- Autodesk Build submittal workflow roles, pending-action, reviewers, watchers, workflow table, and notifications.
- Git status/diff validation, Prettier, Vitest, pnpm/workspace validation patterns.

Use `reference/05_RESEARCH_PATTERN_REFERENCE.md` as a starting source list, but verify freshness rather than copying it blindly.

## Questions to Answer

### Documentation Completeness

Confirm whether Wave 11 includes:

- module identity and subtitle;
- workbook source grounding and corrected count posture;
- owner-contract placeholder/schema-only posture;
- four-layer model;
- two-axis model;
- template governance;
- project instance model;
- workbook import/human review workflow;
- contract clause/obligation reference model;
- assignment lifecycle and handoffs;
- current action owner/ball-in-court model;
- workflow steps;
- notifications/escalations;
- exception model;
- Matrix Health Score;
- eight-lane UI architecture;
- Priority Actions, Project Readiness, Approvals / Checkpoints, Team & Access, and Document Control seams;
- export/snapshot governance;
- legal/runtime/external-system guardrails.

### Repo-Truth Contradictions

Identify any contradictions, especially:

- Wave 11 described as only a RACI spreadsheet;
- separate spreadsheet launchers instead of one module;
- `109` treated as fully active assigned rows;
- owner-contract workbook treated as active obligations;
- implementation claimed as shipped;
- legal interpretation or approval execution implied;
- evidence-binary storage implied;
- Team & Access ownership redefined;
- external runtime integration authorized.

### Implementation Readiness

Classify as:

- documentation-ready / implementation-not-started;
- partial scaffold exists / module implementation not started;
- module implementation started;
- blocked.

Explain why.

### Current Model / Surface Gap

Determine exact implementation targets for Prompt 02:

- dedicated shared model files;
- fixture files;
- read-model response-map extensions;
- backend route/provider/test extensions;
- SPFx client/fixture/surface/test targets;
- integration seam targets.

## Expected Output

Produce a read-only report. Include:

- branch, HEAD, lockfile hash;
- current implementation-state classification;
- Wave 11 doc completeness matrix;
- JSON validation results;
- research citations and implementation implications;
- contradictions/gaps;
- exact allowed file list for Prompt 02;
- stop conditions, if any.

Do not commit.

## Final Output Requirements

- No commit.
- Provide a clear Prompt 02 allowed-file recommendation.
- State whether implementation may proceed.
