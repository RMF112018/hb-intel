# HB Intel My Dashboard — My Projects Source-List Schema Provisioning Audit

Prepared: 2026-05-14  
Repo: `RMF112018/hb-intel`  
Branch audited: `main`  
Prompt basis: `FRESH_SESSION_PROMPT_MY_PROJECTS_LIST_PROVISIONING_METHOD_AUDIT_AND_RESEARCH(1).md`


## Phase 4 — Provisioning Method Decision Matrix

Scoring scale: 1 = weak, 5 = strong.

| Option | Repo conformity | Operator safety | Existing-list targeting | Field type support | Permission clarity | Drift detection | Idempotence | Evidence | Overall | Verdict |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 1. Extend existing legacy fallback provisioner in place | 3 | 2 | 3 | 5 | 4 | 4 | 4 | 4 | 29 | Not preferred alone |
| 2. New dedicated repo-native TypeScript provisioner | 5 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 39 | **Recommended** |
| 3. Direct Microsoft Graph columnDefinition script | 3 | 4 | 5 | 4 | 5 | 3 | 4 | 4 | 32 | Viable fallback/secondary |
| 4. PnP PowerShell runbook | 2 | 3 | 4 | 5 | 3 | 2 | 3 | 2 | 24 | Emergency/operator fallback only |
| 5. Direct SharePoint REST script | 3 | 4 | 5 | 5 | 3 | 3 | 4 | 4 | 31 | Viable if wrapped in repo-native utility |
| 6. Hybrid: repo-native provisioner + verifier + optional runbook | 5 | 5 | 5 | 5 | 4 | 5 | 5 | 5 | 39 | Same recommendation with documented fallback |

## Tradeoff explanation

### Option 1 — Extend existing legacy fallback provisioner

This would be fast, but it is too broad. The legacy fallback script has list-creation responsibilities and carries unrelated `FolderWebUrl` drift. It also lacks explicit dry-run/apply semantics. Refactor its reusable pieces, but do not make it the only My Projects provisioning entry point.

### Option 2 — New dedicated repo-native TypeScript provisioner

This is the best fit. It can be narrowly scoped to the two existing lists and exact My Projects schema delta. It can default to dry-run, require `--apply`, emit JSON evidence, fail on wrong-type drift, and reuse shared field-definition utilities. It is easiest to test and easiest to hand to a local code agent without ambiguity.

### Option 3 — Direct Microsoft Graph columnDefinition script

Graph is official and has clear column create/update endpoints. It is technically viable, especially if PnPjs/Node runtime issues become a blocker. It is not the best primary path because the repo already encodes SharePoint field compatibility in `TypeAsString` terms and has PnP/REST field helpers. A Graph-only script would either duplicate or bypass the existing provisioning doctrine.

### Option 4 — PnP PowerShell runbook

PnP PowerShell is acceptable only as an emergency/manual fallback. It lacks the repo's TypeScript test/evidence chain unless heavily supplemented by the verifier and strict docs. It also increases the chance of internal-name mistakes.

### Option 5 — Direct SharePoint REST

This can be strong if implemented as a repo-native HTTP client and covered by tests. It is more verbose than PnPjs and less aligned with current script code, but could avoid PnP package-version issues.

### Option 6 — Hybrid

The recommended path is effectively a controlled hybrid: repo-native provisioner as the mutator, read-only verifier as the proof gate, existing backfill scripts as downstream mutation, and a documented PnP PowerShell emergency fallback only if the repo-native path cannot be executed.
