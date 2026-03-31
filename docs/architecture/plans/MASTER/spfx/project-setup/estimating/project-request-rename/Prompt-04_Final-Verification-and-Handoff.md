# Prompt 04 — Verification, packaging, and final handoff

You are completing the rename effort in:

`https://github.com/RMF112018/hb-intel.git`

## Objective

Run final verification on the Project Setup Requests rename so the repo, package identity, docs, and final SPFx package posture are internally consistent and release-ready.

## Critical instructions

- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Validate actual repo truth, not just assumptions from the change set.
- Treat this as a release-hardening pass for the rename.
- Be explicit about anything that would affect deployment, app catalog behavior, or upgrade behavior.

## Required verification scope

1. Verify code/build/test status.
2. Verify no critical references still frame the Project Setup Requests app as the Estimating app in package-facing/runtime-facing surfaces.
3. Verify SPFx packaging identity consistency:
   - manifests
   - package-solution metadata
   - IDs/GUIDs
   - artifact names
   - display strings
4. Verify docs/architecture consistency.
5. Verify route and scope integrity:
   - app remains Project Setup-only
   - no broadened Estimating surfaces were introduced
6. Verify that Accounting/Admin architectural separation is still correctly represented after the rename.

## Required output

Produce a final verification report with:

1. Build/test/package verification results
2. Final package identity summary
3. Final app naming summary
4. Final docs/architecture summary
5. Remaining known gaps or intentionally deferred items
6. Deployment-impact notes
7. Recommended follow-up tasks, if any

If packaging artifacts were regenerated or need regeneration, state exactly what was done and what remains.
