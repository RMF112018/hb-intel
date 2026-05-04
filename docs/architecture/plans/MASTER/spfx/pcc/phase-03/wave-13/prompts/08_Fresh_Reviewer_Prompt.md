# Prompt 08 — Fresh Reviewer Prompt

## Objective

You are reviewing the completed PCC Phase 3 Wave 13 Buyout Log implementation in a fresh session. Audit repo truth, implementation correctness, target architecture compliance, tests, guardrails, unified lifecycle alignment, and readiness for Wave 14 or hardening.

## Required Instruction Phrase

```text
Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
```

## Working Directory

```text
/Users/bobbyfetting/hb-intel
```


## Global Hard Guardrails

- Keep Wave 13 as a safe PCC Project Readiness workflow module.
- Buyout Log is an MVP Project Readiness workflow module with Procurement / Project Controls classification and future Procurement & Buyout Center affinity.
- Do not create a standalone `buyout-log` shell route unless current repo route taxonomy already explicitly authorizes it. Current unified lifecycle route taxonomy treats Buyout Log as a workflow/module region under approved PCC surfaces, not as a new shell workspace.
- Do not implement Procore, Sage, Microsoft Graph, Autodesk, Document Crunch, Adobe Sign, DocuSign, AHJ, utility, vendor-portal, or external-system runtime calls.
- Do not implement writeback, mirroring, scraping, sync, polling, production rollout, or tenant mutation.
- Do not create Procore commitments, purchase orders, subcontracts, SOVs, CCOs, invoices, or payments.
- Do not post to Sage or make accounting determinations.
- Do not make legal, claim, entitlement, compensability, delay-damages, or forensic schedule-analysis determinations.
- Do not create legal/contractual obligations automatically.
- Do not own evidence binaries in Wave 13; use Document Control / SharePoint evidence references only.
- Do not execute approvals/checkpoints; Wave 14 owns approval/checkpoint execution.
- Do not edit `docs/architecture/plans/**` unless the prompt explicitly authorizes it. This package does not authorize it.
- Do not change package dependencies, `pnpm-lock.yaml`, SharePoint manifests, workflows/CI, or deployment artifacts unless a prompt explicitly authorizes and justifies it. These prompts do not authorize them.
- Use fixture-first and read-only posture unless a prompt explicitly authorizes a repo-standard backend opt-in seam.
- Stage only files authorized by the current prompt.


## Required Audit Commands

```bash
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
git diff --stat HEAD~8..HEAD
```

Adjust the git range based on the actual Wave 13 implementation commits.

## Required Review Areas

1. Confirm Prompt 01–07 commit sequence.
2. Inspect actual changed files, not only commit summaries.
3. Confirm Buyout Log remained under Project Readiness / Project Controls governance and did not become a separate workspace.
4. Confirm `buyout-log` model mapping issue was resolved or safely bridged.
5. Confirm models/fixtures/state machines satisfy Wave 13 docs and unified lifecycle developer contracts.
6. Confirm backend route is GET-only and mock/read-only.
7. Confirm SPFx client and fixture parity.
8. Confirm UI contains required Buyout Command Center regions.
9. Confirm Priority Actions / Project Readiness / Document Control / External Systems / Approvals seams are reference-only where applicable.
10. Confirm source-lineage, Project Memory, traceability, HBI eligibility, audit, degraded states, and permission/redaction posture.
11. Confirm no Procore/Sage/Graph/Autodesk runtime calls or writeback.
12. Confirm no legal/claim/accounting determinations.
13. Confirm package/lockfile/manifest/workflow posture.
14. Confirm tests and validation.

## Required Output

- Executive summary.
- Implementation completeness table.
- Guardrail compliance table.
- Test evidence summary.
- Gaps / defects / risks.
- Recommendation: accepted, accepted with follow-ups, or blocked.
