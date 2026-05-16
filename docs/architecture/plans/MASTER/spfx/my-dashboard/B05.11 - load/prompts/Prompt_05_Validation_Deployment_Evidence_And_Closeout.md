# Prompt 05 — Validation, Deployment Evidence, and Closeout

## 1. Objective

Validate the complete registry-performance remediation, prepare backend deployment evidence, and close the package with a before/after runtime interpretation.

This prompt is the package’s implementation closeout.

## 2. Repo-truth context

Inspect only:
- files changed by Prompts 01–04,
- `supporting/Corrected_Trace_Based_KQL_Queries.md`,
- `supporting/Live_Telemetry_Baseline.md`,
- any existing B05.8 closeout doc requiring final evidence update.

Context-efficiency rule:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
If a file has already been loaded and remains reliable in context, use that context instead of reopening it.
Only re-read a file if it may have changed, an exact interface or line-level detail is required, or validation/evidence requires a fresh read.

## 3. Architectural guardrails

- Do not make new feature changes in Prompt 05.
- Only fix small validation regressions directly caused by Prompts 01–04.
- Do not touch Adobe or frontend runtime.
- Do not change package, lockfile, manifest, workflow, or deployment files unless this exact prompt explicitly requires a docs-only note about deployment evidence.
- Do not run tenant mutations.

Mandatory preflight:
1. Run and record:
   - `git status --short`
   - `git branch --show-current`
   - `git log --oneline -20`
   - `md5 pnpm-lock.yaml`
2. Identify unrelated pre-existing changes. Do not edit, stage, or absorb them.
3. Never use broad `git add .`. Stage exact intended paths only.
4. Before commit, run:
   - `git diff --check`
   - `git diff --cached --name-only`
5. After validation, run `md5 pnpm-lock.yaml` again and report before/after values.

## 4. Implementation instructions

### A. Full validation
Run and capture exact outcomes:

```bash
git diff --check
pnpm --filter @hbc/functions test
pnpm --filter @hbc/functions check-types
```

If pre-existing unrelated failures remain, classify them clearly and do not absorb them into this package.

### B. Backend deployment evidence
After the backend build/deploy path already used by this repo completes, record:
- commit SHA deployed,
- deploy success evidence,
- any known warning that did not block deployment.

### C. Runtime evidence
Trigger live My Dashboard requests and run corrected trace-based KQL queries to capture:

1. Handler duration summary.
2. Project Links source timings.
3. Project Links source + reconcile join.
4. Registry cache-state breakdown.

### D. Required before/after interpretation
Compare to the captured baseline:

| Metric | Baseline |
|---|---:|
| Registry row count | 825 |
| Registry duration | ~1,056–2,150 ms |
| Project Links handler | ~1,067–2,184 ms |
| Reconcile | ~1–32 ms |

Classify the outcome as exactly one:
- strong success,
- partial success,
- no material improvement,
- regression.

## 5. Verification

In addition to code validation, include:
- runtime KQL output summary,
- whether cache hit/miss/coalesced states appeared,
- whether `registryServerFilterApplied` proves the intended code path,
- whether assigned-project counts stayed correct.

## 6. Documentation updates

Update the relevant closeout/evidence file with:
- validation command results,
- deployment status,
- before/after telemetry interpretation,
- explicit decision on whether Prompt 06 should proceed.

## 7. Deliverables / exit criteria

Return:
- final package verdict,
- exact commands and outputs,
- exact live telemetry values,
- files changed,
- lockfile MD5 before/after,
- staged-file proof,
- final commit summary/description if docs closeout changes were committed.

### Expected commit language

```text
Commit summary
docs(my-dashboard): close registry performance remediation evidence pass

Commit description
Record validation, deployment, and live telemetry evidence for the Project Links registry-performance remediation package, including before/after comparison against the captured B05.8 baseline.

No new runtime behavior is introduced in this closeout commit. It documents results, remaining evidence-led follow-up, and the package verdict without unrelated frontend, Adobe, tenant, package, lockfile, manifest, workflow, or deployment changes.
```
