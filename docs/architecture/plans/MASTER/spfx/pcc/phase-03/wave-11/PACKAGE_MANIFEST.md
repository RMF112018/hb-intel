# PACKAGE MANIFEST — Wave 11 Responsibility Matrix Implementation Prompt Set v2

## Package Name

`wave11_responsibility_matrix_implementation_prompt_set_v2`

## Purpose

Provide a complete, staged prompt package for a local Claude Code agent to implement Phase 3 Wave 11 Responsibility Matrix in the HB Intel / PCC repo.

## Contents

| Path | Purpose |
|---|---|
| `README.md` | Execution overview and controlling posture |
| `PACKAGE_MANIFEST.md` | Package inventory and usage constraints |
| `docs/00_EXISTING_WAVE_11_DOCUMENTATION_MAP.md` | Current canonical docs and implementation-relevant repo seams |
| `docs/01_REPO_TRUTH_AUDIT_SUMMARY.md` | Connector-based audit summary and required local revalidation |
| `docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md` | End-to-end implementation sequence and dependency map |
| `prompts/01_*` | Read-only local audit, research, and implementation target plan |
| `prompts/02_*` | Shared model contracts and fixture contracts |
| `prompts/03_*` | Backend GET-only mock read model |
| `prompts/04_*` | SPFx API/client fixture parity |
| `prompts/05_*` | Read-only SPFx Responsibility Matrix surface shell |
| `prompts/06_*` | Integration seams with Priority/Readiness/Approvals/Team/Document |
| `prompts/07_*` | Tests, guardrails, and implementation closeout |
| `prompts/08_*` | Fresh reviewer prompt |
| `reference/00_CONTROLLING_OBJECTIVE.md` | Non-negotiable objective and module identity |
| `reference/01_REQUIRED_REPO_TRUTH_FILES.md` | Files that must be inspected by Prompt 01 |
| `reference/02_WAVE_11_REQUIRED_FIELDS_AND_STATUSES.md` | Required domain fields, statuses, enums, and counts |
| `reference/03_HARD_GUARDRAILS.md` | Prohibited scopes and stop conditions |
| `reference/04_VALIDATION_COMMAND_REFERENCE.md` | Repo validation command library |
| `reference/05_RESEARCH_PATTERN_REFERENCE.md` | Web-researched product/UX/construction/process references |

## Hard Usage Rules

- This is a prompt package, not implementation code.
- Prompt 01 is mandatory.
- Prompt 01 must rerun local repo-truth checks.
- Every prompt must preserve lockfile/package/manifest/workflow/deployment protection unless a specific prompt separately authorizes a narrow change.
- All runtime/external/legal/approval/evidence-binary guardrails remain active throughout the sequence.
