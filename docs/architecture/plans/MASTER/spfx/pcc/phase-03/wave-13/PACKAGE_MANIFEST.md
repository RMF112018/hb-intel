# Package Manifest — PCC Wave 13 Buyout Log Unified Lifecycle Implementation Prompt Set

## Package Name

`pcc_wave13_buyout_log_unified_lifecycle_implementation_prompt_set`

## Purpose

Generate a staged implementation prompt sequence for the local code agent to implement Phase 3 Wave 13 Buyout Log while explicitly adapting the original Wave 13 package to the PCC unified lifecycle developer-contract layer.

## Content Inventory

| Path | Purpose |
|---|---|
| `README.md` | Usage instructions and controlling objective |
| `PACKAGE_MANIFEST.md` | Package inventory and limits |
| `docs/00_EXISTING_WAVE_13_DOCUMENTATION_MAP.md` | Current Wave 13 docs and repo seam map |
| `docs/01_REPO_TRUTH_AUDIT_SUMMARY.md` | Repo-truth findings and questions to verify |
| `docs/02_IMPLEMENTATION_SEQUENCE_OVERVIEW.md` | Staged implementation sequence |
| `prompts/01_*.md` through `prompts/08_*.md` | Local code agent prompts |
| `reference/00_CONTROLLING_OBJECTIVE.md` | Module identity and non-negotiable direction |
| `reference/01_REQUIRED_REPO_TRUTH_FILES.md` | Files/directories each prompt should inspect |
| `reference/02_WAVE_13_REQUIRED_FIELDS_STATUSES_AND_CONTRACTS.md` | Required contracts and state expectations |
| `reference/03_HARD_GUARDRAILS.md` | Prohibited scope |
| `reference/04_VALIDATION_COMMAND_REFERENCE.md` | Validation command reference |
| `reference/05_RESEARCH_PATTERN_REFERENCE.md` | Research-backed product pattern references |

## Hard Usage Rules

- This package is for prompt execution only. It is not a source-code patch.
- The local agent must inspect repo truth before making changes.
- No prompt may rely solely on package assumptions when local repo truth contradicts them.
- The unified lifecycle developer contracts are controlling architecture for Wave 13 implementation.
- Stage only files authorized by the current prompt.
- Commit only after prompt-specific validation passes.

## Package Limitations

- Local commands were not run in `/Users/bobbyfetting/hb-intel` during package generation.
- Local agent must verify branch, HEAD, lockfile MD5, worktree cleanliness, package names, package scripts, and route/model conventions.
- Public research informs implementation patterns; it does not authorize cloning external products or integrating with live external systems.
