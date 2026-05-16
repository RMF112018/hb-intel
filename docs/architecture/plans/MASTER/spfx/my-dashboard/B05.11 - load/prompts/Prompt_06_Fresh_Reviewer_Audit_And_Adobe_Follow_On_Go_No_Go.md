# Prompt 06 — Fresh Reviewer Audit and Adobe Follow-On Go / No-Go

## 1. Objective

Use a fresh-session repo-truth audit to decide whether the registry-performance remediation fully closed the backend bottleneck or whether the next package should target Adobe token-refresh latency or broader HAR/browser evidence.

This is an audit prompt, not an implementation prompt.

## 2. Repo-truth context

Inspect:
- the Prompt 05 closeout/evidence doc,
- the actual runtime code changed in Prompts 01–04,
- the corrected trace-based KQL docs,
- any captured live telemetry tables or pasted outputs provided with the handoff.

Context-efficiency rule:
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
If a file has already been loaded and remains reliable in context, use that context instead of reopening it.
Only re-read a file if it may have changed, an exact interface or line-level detail is required, or validation/evidence requires a fresh read.

## 3. Architectural guardrails

- Do not implement code changes.
- Do not reopen the registry architecture unless runtime evidence proves it failed.
- Do not assume Adobe needs remediation simply because refresh-path latency exists.
- Do not recommend hosting-plan changes without HAR/browser evidence or telemetry separating handler runtime from end-user latency.

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

Produce a structured audit with these phases:

1. Framing
   - define the remediation target that was executed.

2. Repo-truth implementation map
   - identify what actually landed.

3. Evidence assessment
   - compare baseline vs post-remediation telemetry.

4. Gap assessment
   - determine whether:
     - registry load remains the dominant backend issue,
     - Project Links is materially improved,
     - dashboard residual slowness now likely sits outside this backend lane.

5. Adobe follow-on decision
   - recommend either:
     - `Go`: generate a focused Adobe token-refresh/read-path package,
     - `No-Go`: do not generate Adobe package yet; collect HAR/browser evidence first.

6. Executive verdict
   - concise final recommendation.

## 5. Verification

No code validation required unless the audit discovers that Prompt 05 closeout claims cannot be reconciled with current committed repo truth.

## 6. Documentation updates

None. Return a report only.

## 7. Deliverables / exit criteria

Return:
- verdict on registry remediation completeness,
- verdict on next optimization target,
- whether a fresh Adobe remediation package is justified,
- whether HAR/browser waterfall evidence remains mandatory before any broader dashboard performance claim.
