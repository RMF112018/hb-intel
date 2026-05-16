# Prompt 08 — Hosted Evidence, Re-Audit, Scorecard, and Closeout

## Prompt to Send Local Agent

```md
You are working in the live `hb-intel` repository on Prompt 08 of the Adobe Sign flagship UI/UX remediation package.

# Objective

Close the remediation effort through validation, evidence registration, and a scorecard re-audit.

# Required Ground Rules

- Follow the decision-closed package exactly.
- Do not re-read files that are still within your current context or memory unless repo truth is stale, missing, contradictory, or exact edit context must be verified.
- Do not implement new visual redesign in this prompt.
- Do not modify package manifests, lockfiles, SPFx manifests, backend/functions code, or deployment files.
- Do not fabricate hosted evidence.
- Do not use `git add .`.
- Do not push.

# Required Pre-Closeout Baseline

Run and paste raw output for:

```bash
cd /Users/bobbyfetting/hb-intel
git status --short
git branch --show-current
git rev-parse HEAD
git log --oneline -20
md5 pnpm-lock.yaml
```

# Required Final Validation

Run:

```bash
pnpm --filter @hbc/spfx-my-dashboard check-types
pnpm --filter @hbc/spfx-my-dashboard test
pnpm --filter @hbc/spfx-my-dashboard lint
git diff --check
md5 pnpm-lock.yaml
```

# Docs to Create

Create:

```text
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/README.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/01_Implementation_Closeout.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/02_Validation_And_Evidence_Register.md
docs/architecture/plans/MASTER/spfx/my-dashboard/B05.5 - a-s-flagship-uiux/03_Reaudit_Scorecard.md
```

# Required Closeout Content

## README.md

Summarize:

- remediation objective;
- prompt sequence;
- final commit sequence;
- remaining evidence gates if any.

## 01_Implementation_Closeout.md

Document:

- what changed;
- which gaps AS-01 through AS-12 were closed;
- what was deliberately not changed;
- exact validations and outcomes;
- whether backend follow-up remains for timestamp completeness.

## 02_Validation_And_Evidence_Register.md

Create evidence tables for:

### Local validations
- typecheck
- tests
- lint
- diff check

### Hosted screenshot/evidence matrix
Use states and viewport matrix from:

```text
docs/10_Test_Validation_And_Evidence_Plan.md
```

If hosted capture is unavailable, mark the evidence rows:

```text
Pending operator-hosted capture
```

Do not claim hosted proof you did not capture.

## 03_Reaudit_Scorecard.md

Re-score all 14 attached scorecard categories.

Use:

- previous baseline score: `28 / 56`;
- target threshold: `48+ / 56`;
- preferred target: `50 / 56`.

State one of:

1. `Flagship remediation complete and evidence-backed.`
2. `Implementation complete; hosted acceptance evidence remains pending.`
3. `Do not close — residual doctrine gap remains.`

# Allowed Files to Modify

Only the new closeout docs listed above.

# Forbidden Scope

Do not edit code in Prompt 08. If validation reveals a code defect, stop and report instead of patching in this prompt.

# Staging and Commit

If docs are complete and validation succeeds:

- stage explicitly by closeout doc paths only;
- run staged diff proof;
- commit with:

```text
docs(my-dashboard): close adobe sign flagship uiux remediation evidence
```

# Required Final Response

Return:

## 1. Final Validation Results
## 2. Closeout Docs Created
## 3. Hosted Evidence Captured or Pending
## 4. Re-Audit Score
## 5. Final Verdict
## 6. Lockfile MD5 Before / After
## 7. Staged File Proof
## 8. Commit SHA
## 9. Explicit Forbidden-Scope Confirmation

# Stop Conditions

Stop before docs commit if:

- code validations fail;
- scorecard cannot be completed honestly;
- hosted evidence is falsely implied;
- a code issue is discovered that should be remediated before closeout.
```
