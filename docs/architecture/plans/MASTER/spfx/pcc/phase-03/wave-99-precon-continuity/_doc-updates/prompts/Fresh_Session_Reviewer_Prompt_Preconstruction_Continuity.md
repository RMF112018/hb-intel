# Fresh Session Reviewer Prompt — Preconstruction Continuity Unified Lifecycle Documentation

## Objective

Audit the completed Preconstruction Continuity documentation update against repo truth and the implemented unified lifecycle developer contracts. Do not edit files unless separately instructed.

## Required Audit

Run:

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -12
md5 pnpm-lock.yaml
```

Inspect:

```text
docs/architecture/blueprint/sp-project-control-center/preconstruction-continuity/
docs/architecture/blueprint/sp-project-control-center/unified-lifecycle-developer-contracts/
docs/architecture/blueprint/sp-project-control-center/Unified_PCC_Lifecycle_Objective_Architecture.md
docs/architecture/blueprint/sp-project-control-center/PCC_Project_Memory_Layer.md
docs/architecture/blueprint/sp-project-control-center/PCC_Cross_Stage_Traceability_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Unified_Search_And_HBI_Grounding_Model.md
docs/architecture/blueprint/sp-project-control-center/PCC_Knowledge_Reuse_Security_And_Retention_Model.md
docs/architecture/blueprint/sp-project-control-center/System_of_Record_Matrix.md
docs/architecture/blueprint/sp-project-control-center/phase-3/Register_Workflow_Module_Register.md
```

## Audit Questions

1. Does Preconstruction Continuity align with implemented unified lifecycle contracts?
2. Does it avoid creating separate departmental workspaces?
3. Is Go / No-Go source-owned with PCC read-only carry-forward after GO?
4. Is Estimating Kickoff later-phase and not runtime-enabled?
5. Are Project Memory contributions defined?
6. Are traceability edges defined?
7. Are HBI citation/refusal requirements defined?
8. Are permission/redaction rules defined?
9. Are source-of-record boundaries preserved?
10. Are source templates mapped without becoming workbook clones?
11. Are hard guardrails preserved?
12. Did validation pass?
13. Did lockfile remain unchanged?
14. Are any docs inconsistent or stale?

## Output

Return a concise audit report with:

- completeness rating;
- gaps;
- recommended corrections;
- whether a follow-up documentation prompt is required.
