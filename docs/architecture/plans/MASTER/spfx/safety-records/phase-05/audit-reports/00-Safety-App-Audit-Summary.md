# 00 — Safety App Audit Summary

## Verdict

The current Safety frontend is **directionally substantial but not yet a credible production surface** over the live backend.

The implementation has strong building blocks:
- a serious shared domain package,
- a governed workbook contract,
- better project/reporting-period intake than earlier Safety iterations,
- a structured review queue,
- and a backend that now has explicit preview, replay, readiness, request-id, and failure-class semantics.

However, the app still fails the production-readiness bar because the most important frontend/backend seams are not aligned.

## Primary blockers

### 1. Preview-before-commit is not actually implemented in the frontend
The backend exposes an explicit preview route and blocks commit when preview says the run is not commit-ready. The frontend and shared repository still go straight to `/api/safety-records/ingest`, skipping a distinct preview UX and skipping operator confirmation over preview diagnostics.

### 2. Production mounting is ambiguous
There are two materially different production entry patterns:
- direct SPFx webpart rendering via `SafetyWebPart.tsx`
- shell/IIFE mounting via `mount.tsx`

The direct SPFx webpart path renders `<App spfxContext={this.context} />` without passing `functionAppUrl` or `apiAudience`, while the IIFE shell path expects those values in mount config. That creates a release seam where the app can render, load lists, and still fail ingestion/replay because backend config was never supplied.

### 3. Backend failure truth is being collapsed
The backend returns request IDs, failure classes, preview failure classes, and graph-context diagnostics. The frontend adapter currently throws a generic fetch error when `response.ok` is false or when `payload.data.result` is absent. That discards the backend’s most useful operator/support data.

### 4. The UI contract still reflects an older mental model
The Upload page is authored as a direct commit form. The copy says submission validates/parses/scores/writes. That is not the right user model for a backend that now has:
- preview evaluation,
- commit gating,
- duplicate/supersession signaling,
- reporting-period compatibility signaling,
- parser/source authority telemetry.

### 5. Config / overlay / packaging seams are still brittle
The app depends on:
- hosted GUID overlay,
- SPFx auth bootstrap,
- backend base URL,
- API audience,
- correct tenant permission grants,
- correct host mount path.

Those seams are not yet collectively verified in a way that proves “this build is truthfully wired to this backend in this host.”

## Strongest assets to preserve

- Reuse of the shared Safety domain package.
- Governed workbook contract and parser seam.
- Project picker reuse from the Project Sites search pipeline.
- Reporting-period error messages that are more honest than generic “failed to load.”
- Review queue triage framing and replay affordances.
- Backend readiness / request-id / failure-class / graph-context architecture.

## Final judgment

This is not a “small polish gap.” It is a **wiring-truth gap** plus a **workflow-model gap**.

The work is still tractable. The repo does not need a broad rewrite. But the app needs a bounded structural correction in the following order:

1. make the production entry and backend binding unambiguous,
2. replace the current direct-commit client seam with a typed backend client that preserves backend diagnostics,
3. implement a real preview-before-commit upload flow,
4. harden state/error/accessibility/observability semantics,
5. add release-proof checks that verify the host is mounted with the right config against the right backend.
