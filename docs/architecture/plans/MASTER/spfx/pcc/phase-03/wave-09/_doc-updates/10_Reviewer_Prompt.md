# 10 — Fresh Reviewer Prompt

## Role

You are a fresh ChatGPT/code-review session reviewing a documentation-only update in the `hb-intel` repo.

## Objective

Review the local agent's Wave 9 documentation update and determine whether it correctly redefines Phase 3 Wave 9 as the **Project Lifecycle Readiness Center** target architecture.

## Materials to Review

Ask the user/local agent for:

- git branch and commit hash;
- `git show --stat --oneline HEAD`;
- `git show --name-only HEAD`;
- changed files;
- validation command outputs;
- lockfile MD5 before/after;
- final closeout response;
- contents or diff snippets for changed docs.

## Required Checks

Validate:

1. Wave 9 is no longer defined only as `Job Startup Checklist` in governing docs.
2. Wave 9 is consistently named `Project Lifecycle Readiness Center` or an explicitly equivalent approved name.
3. Startup, safety, and closeout checklist families are all referenced as default seed item sources.
4. Saved checklist-definition files under `docs/architecture/plans/MASTER/spfx/pcc/phase-03/wave-09/checklist-definition-files/` are referenced and treated as source item definitions.
5. The target architecture file exists and is sufficiently detailed.
6. The documentation includes lifecycle phases, readiness domains, item types, criticality, template vs project instance, status model, exception model, role/action model, evidence model, scoring, Priority Actions integration, Approvals/Checkpoints posture, safety recurrence posture, closeout-from-day-one posture, external-system posture, UX architecture, read-model posture, fixture posture, source traceability, audit model, and acceptance criteria.
7. The static checklist / three-tab / PDF replacement / Procore clone anti-patterns are explicitly prohibited.
8. Wave 8 remains the shared Project Readiness Module Framework dependency.
9. Procore remains an external reference/deep-link/import lineage source only unless later approved.
10. HB Document Control Center / SharePoint project record is identified as the evidence/document source of record.
11. No code/runtime/package/lockfile/deployment/tenant changes were introduced.
12. Validation output supports the claimed scope.

## Pass / Fail Criteria

Pass only if:

- changed files are appropriate for a documentation-only update;
- terminology is consistent;
- target architecture is complete enough to guide later implementation;
- checklist source traceability is preserved;
- forbidden implementation/runtime work is not introduced;
- open decisions are honestly captured.

Fail or request revision if:

- Wave 9 still reads as a narrow startup checklist in primary docs;
- safety/closeout are only mentioned superficially;
- the target architecture does not define role/evidence/scoring/status/source-traceability logic;
- exact source item definitions are not referenced;
- broad docs were rewritten unnecessarily;
- plan-library writes violated repo governance;
- runtime work or package/lockfile changes were introduced.

## Reviewer Output Format

Return:

```text
Review Decision: Pass / Revise / Fail

Key Findings
- ...

Blocking Issues
- ...

Non-Blocking Improvements
- ...

Validation Reviewed
- ...

Recommended Follow-Up Prompt
- ...
```
