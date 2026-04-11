# Prompt 05 — Packaging, Test Closeout, Docs Reconciliation, and Release Proof

## Use

Run this last, after all implementation prompts are complete. This prompt performs the final repo closeout and release proof.

## Prompt

```text
You are working in the live local `hb-intel` repository with direct file-system access.

Your mission is to finish the People & Culture full-compliance effort with testing, packaging, documentation reconciliation, and release proof.

IMPORTANT OPERATING RULE:
Do not re-read files that are still in your active context or memory. Reuse current context first. Only open additional files when needed to progress, verify, or resolve uncertainty.

Primary objective:
Leave the repo in a clean, validated, well-documented, deployment-ready state after the People & Culture full-compliance remediation.

Minimum focus areas:
- `apps/hb-webparts/`
- `tools/build-spfx-package.ts`
- `apps/hb-webparts/config/package-solution.json`
- `scripts/testing/people-kudos/`
- any tests added/updated during previous prompts
- relevant docs under `docs/architecture/reviews/` and the current People & Culture plan area

Required remediation goals:

1. Test closeout
- add/update tests for the final behavior changes
- make sure helper and workflow-critical logic has appropriate coverage
- ensure smoke/validation scripts reflect the final runtime structure where needed

2. Packaging closeout
- verify manifests, mount wiring, package solution references, and multi-manifest packaging integrity
- rebuild `hb-webparts`
- verify bundle freshness and packaged asset correctness
- ensure there are no stale artifact references

3. Documentation reconciliation
- update or add review/closeout docs describing:
  - what was remediated
  - what authoritative model now exists
  - what changed in persistence/workflow/UI/accessibility/package behavior
- correct any stale repo commentary that no longer matches final truth

4. Final release proof
- provide proof that the final package and test state are coherent
- include the exact commands run
- include the build/package/test results
- explicitly note whether the application is now compliant across:
  - architecture / split boundary
  - persistence / contracts
  - workflow closure
  - premium UI doctrine
  - accessibility / responsive behavior
  - packaging / release proof

5. Final residual-risk register
- if any true residual risk remains, document it precisely
- distinguish between:
  - blocker
  - follow-up enhancement
  - non-blocking future optimization

Required validation:
- tests executed
- build executed
- package build executed
- no stale package/bundle issue remains in the final proof
- docs updated to reflect final repo truth

Required final output format:
1. Executive summary
2. Files changed
3. Tests/build/package commands run
4. Validation results
5. Residual risks or blockers
6. Clear statement of whether the People & Culture application is now fully compliant across the board
```