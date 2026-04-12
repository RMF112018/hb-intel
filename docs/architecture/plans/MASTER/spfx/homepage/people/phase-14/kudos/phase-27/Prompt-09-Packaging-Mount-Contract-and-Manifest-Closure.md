# Prompt-09 — Packaging, Mount Contract, and Manifest Closure

## Objective

Close the final structural finding by re-validating that the runtime split, mount linkage, manifest adjacency, and package registration still reflect repo truth after the remediation series.

This prompt is about **runtime / packaging integrity only**.

## Active finding only

Only remediate this finding:
- mount / manifest / contract discipline must survive remediation intact

Do not perform more visual redesign in this prompt unless a packaging or mount issue directly requires it.

## Repo-truth starting footprint

At minimum inspect:

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/kudosRuntimeContract.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudosWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/HbKudosCompanionWebPart.manifest.json`
- any relevant shell-entry / release-manifest / package-solution files
- doctrine guard tests and smoke tests covering these seams

## Required work

1. Re-verify that the runtime split still matches the packaged webpart identities.
2. Re-verify mount-map linkage and constant usage.
3. Re-verify manifest adjacency and correctness.
4. Re-verify that packaging smoke and doctrine guards still reflect the now-current source.
5. Tighten any drift you discover.

## Exhaustive scrub requirement

- Remove stale manifest descriptions, stale packaging comments, stale test assumptions, or stale runtime references introduced by the remediation series.
- Verify no legacy merged-seam assumptions were accidentally reintroduced.

## Not acceptable

- Treating packaging as “probably fine” because earlier tests once passed
- Leaving stale manifest copy that no longer matches the actual runtime
- Leaving mount / contract / tests slightly out of sync

## Closure standard

Do not declare this finding closed until you provide:
1. the touched files,
2. the structural invariants you verified,
3. any drift corrected,
4. the final packaging / mount / contract proof posture.
