# Prompt 16 — Final Closure Audit, Scorecard, README, and Commit Guidance

## Objective

Perform the final closure audit for the My Projects dual-launch initiative. Produce the final implementation closeout, score the surface against the repo’s flagship SPFx acceptance model, update implementation package/readme references as appropriate, and provide commit guidance.

This prompt must close with a clear:

- PASS;
- FAIL;
- or PASS WITH OPERATOR-PENDING LIVE PROOF

verdict, supported by evidence from prior prompts.

## Mandatory efficiency instruction

Do not re-read files that are still fully available in your current context or working memory unless drift is suspected, a prior step changed them, or the prompt explicitly requires a fresh verification pass.

---

## Required inputs

- Prompt 15 validation/evidence report
- Prompt 01 provisioning readiness artifact
- Prompt 02–14 closeouts
- `supporting/02_Plan_Reconciliation_Updated_Closed_Decisions.md`
- `supporting/04_Risks_Prerequisites_Operator_Owned_Steps.md`

---

## Repo-truth references to inspect

### Acceptance doctrine
- `docs/reference/ui-kit/doctrine/UI-Doctrine-Acceptance-and-Scoring-Model.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Full-Page-App-Widget-Overlay.md`

### Final implementation footprint
- all files materially changed by Prompts 02–15
- package/runtime files
- validation/evidence report

### My Dashboard planning/readme references if updates are required
- relevant My Dashboard dev-plan README(s)
- any package README/map used by the operator

---

## Implementation scope

# 1. Final Definition-of-Done audit

Audit the implementation against the package DoD:

1. Both source lists have repo-side target contracts for fourteen role fields.
2. Legacy Registry has repo-side `procoreProject` target contract.
3. `procoreProject` semantics are reconciled to raw token string.
4. Projects backfill workflow exists and is operator-safe.
5. Registry mirror/preservation workflow exists and is operator-safe.
6. Discovery writer truth override is removed.
7. Protected route exists:
   - `GET /api/my-work/me/project-links`
8. Actor scope derives only from validated claims.
9. No actor override query/path exists.
10. Backend returns normalized/deduped launch records.
11. Every rendered project has two explicit action slots.
12. Procore URL is only constructed from valid tokens.
13. Merged vs legacy-only authority rules are deterministic and tested.
14. UI is flagship-grade and materially above Project Sites posture.
15. Full state matrix is implemented.
16. Hosted evidence is captured or explicitly operator-pending.
17. Scorecard closure reaches required target or documents exact failure.
18. Documentation/schema references are updated.

# 2. Flagship SPFx scorecard

Create a scored closeout artifact mapped to the repo acceptance model.

Recommended filename:

```text
16_My_Projects_Final_Closure_Audit_And_Scorecard.md
```

Score out of 56, using 0–4 categories. The final artifact must include at least:

- doctrine and host compliance;
- interaction completeness;
- state-model completeness;
- data/contract seam rigor;
- accessibility and keyboard quality;
- host/runtime resilience;
- validation and closure evidence;
- command-center/workbench composition quality;
- widget footprint/span/compact contract quality;
- breakpoint/container-fit stability;
- KPI/status/command zone clarity and hierarchy;
- any additional categories needed to total 56 consistently with repo practice.

Required acceptance target:

- **48+/56**
- no category below **2**
- no hard-stop failures.

# 3. Hard-stop failure checklist

Explicitly mark pass/fail for:

- critical accessibility failure;
- host behavior violation;
- fake shell duplication;
- broken/misleading primary interaction path;
- missing required core state handling;
- ambiguous/unsafe seam ownership;
- evidence-free “looks good” acceptance.

# 4. README / execution map updates

If the implementation package or repo planning directory maintains an authority map/readme, update it to:

- reflect completed prompt sequence;
- link to final validation/evidence artifacts;
- record operator-pending live tenant steps if any;
- record final verdict.

Do not create redundant README files if the package already has the right one. Update the existing appropriate README.

# 5. Commit guidance

Provide recommended:

- commit title;
- commit description;
- whether final work should be:
  - one closeout docs commit;
  - or split according to the repo’s actual staging state.

Do not blindly stage unrelated work.

# 6. Residual risk summary

Separate:

- resolved risks;
- operator-pending risks;
- out-of-scope risks.

---

## Required non-goals

- Do not add new feature implementation.
- Do not rewrite previous prompts.
- Do not make live tenant mutations.
- Do not lower the flagship score target.
- Do not mark PASS if evidence is incomplete or blockers remain unacknowledged.

---

## Validation requirements

Run:

```bash
git status --short
git diff --stat
```

Re-run only the narrow validation checks necessary to confirm no drift since Prompt 15. Do not needlessly rerun the entire matrix unless files changed after Prompt 15.

Search final closeout-relevant strings:

```bash
rg -n "48\\+/56|hard-stop|My Projects|project-links|operator-pending|HOSTED EVIDENCE" \
  <final-closeout-artifact-path> \
  <readme-path-if-updated>
```

---

## Evidence requirements

Final closeout must include:

1. Verdict
2. Branch / HEAD
3. Files changed in Prompt 16
4. DoD matrix
5. Scorecard table
6. Hard-stop table
7. Hosted evidence status
8. Operator-pending step register
9. Validation commands/outcomes
10. Recommended commit title and description
11. Residual risk summary

---

## Commit / closeout expectations

Recommended docs commit title if Prompt 16 adds only closure artifacts:

```text
docs(my-projects): close dual-launch module implementation package and scorecard
```

Closeout format:

1. Verdict: PASS / FAIL / PASS WITH OPERATOR-PENDING LIVE PROOF
2. Branch / HEAD
3. Files changed
4. DoD audit result
5. Scorecard score and hard-stop status
6. Hosted/live proof status
7. README/execution-map updates
8. Validation commands and outcomes
9. Residual risks
10. Recommended commit title/description

---

## Guardrails

- Protect unrelated active work.
- No lockfile/package changes.
- No feature expansion.
- Closure must be evidence-backed, not rhetorical.
