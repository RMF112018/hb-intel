# Plan Summary — Wave 01

## Objective

Convert the Safety frontend from a public-main direct SharePoint/REST upload posture into a backend-command-aware SPFx surface over the current Azure Functions Safety routes.

## Critical path

1. Prove repo/artifact truth.
2. Add runtime backend config and fail-closed SPFx mount contract.
3. Implement typed backend command client with delegated token acquisition.
4. Add preview/ingest/replay hooks and contract tests.
5. Add release proof for config, auth, route availability, and diagnostics.

## Non-goals

- Do not redesign the entire Safety UI in Wave 01.
- Do not change backend auth semantics unless current backend code is provably wrong.
- Do not expose provisioning in normal upload UX.
