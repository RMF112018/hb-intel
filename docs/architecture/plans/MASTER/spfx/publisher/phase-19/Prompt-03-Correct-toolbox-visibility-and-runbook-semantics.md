# Prompt 03 — Correct toolbox visibility and runbook semantics

## Objective
Close the mismatch between the repo’s declared Publisher discoverability model and the emitted package’s actual toolbox behavior.

## Audit-derived issue
The codebase and deployment docs described the Publisher as an admin-managed hidden web part, but the emitted package did not preserve that posture consistently. The current implementation and documentation cannot both be true.

## Files to inspect first
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.manifest.json`
- `apps/hb-publisher/deployment/README.md`
- `apps/hb-publisher/deployment/Add-ArticlePublisherWebPart.ps1`

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required work
1. Determine the intended final toolbox posture for `hb-publisher`:
   - page-picker discoverable
   - or intentionally hidden/admin-only
2. Implement that posture correctly in the source manifest shape expected by SPFx.
3. Ensure the packaging pipeline preserves that posture into the generated shell/composed manifests.
4. Update deployment docs/scripts so they match the actual package.
5. Add package-truth validation so future packaging cannot silently ship the wrong discoverability posture.

## Important
Do not preserve invalid or ambiguous semantics such as a documentation-only hidden posture while the emitted package remains discoverable, or vice versa.

## Proof of closure
Return proof showing:
- source manifest final visibility posture
- generated shell/composed manifest posture
- packaged manifest posture after rebuild
- final deployment/test instructions that align with the actual package

## Constraints
- do not broaden into article workflow or publishing feature changes
- do not leave the old runbook in place if it conflicts with the chosen final model
- no future-wave deferrals
