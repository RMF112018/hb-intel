# 08 — Execution Run Order

## Objective

Provide the serialized execution path for the local code agent.

## Prompt 01 — Repo truth + Adobe search syntax confirmation

Purpose:

- validate continuation baseline;
- confirm exact current Adobe completed-search request-body syntax;
- lock implementation facts before editing.

No code changes. No commit.

## Prompt 02 — Shared contracts, route IDs, fixtures, exports

Purpose:

- create completed DTO family;
- extend route/response registry;
- add fixtures and model tests;
- export new symbols.

Commit after validation.

## Prompt 03 — Backend search-intent seam and completed request builder

Purpose:

- extend search-client input/request model with bounded intent;
- preserve pending lane;
- add recent-completions request builder;
- add tests.

Commit after validation.

## Prompt 04 — Completed adapter, provider, route, telemetry

Purpose:

- add backend completed read-model lane;
- wire provider method;
- register protected route;
- emit bounded telemetry;
- add route/adapter/provider tests.

Commit after validation.

## Prompt 05 — Frontend client, lazy fetch, completed view-models

Purpose:

- add frontend read-model client method;
- fixture client support;
- lazy completed-data hook;
- view-model selectors and copy.

Commit after validation.

## Prompt 06 — Header toggle and completed card rendering

Purpose:

- replace static title with dynamic header toggle;
- render completed panel;
- enforce all UI state behavior;
- add UI tests.

Commit after validation.

## Prompt 07 — Documentation reconciliation and implementation closeout

Purpose:

- update governing repo docs;
- reconcile stale route/copy/state docs;
- run scoped validation;
- commit docs only plus any explicitly required doc-adjacent tests if changed.

Commit after validation.

## Prompt 08 — Final integrated regression review and release readiness

Purpose:

- run final package-wide validation;
- inspect for any scoped defects across the completed feature;
- remediate only in-scope defects;
- return release-readiness closeout.

Commit only if Prompt 08 makes actual remediation changes. Otherwise return no-change validation closeout.
