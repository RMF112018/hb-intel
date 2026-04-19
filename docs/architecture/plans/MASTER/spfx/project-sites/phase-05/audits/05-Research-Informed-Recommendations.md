# Research-Informed Recommendations

## Why this document exists

The attached packages correctly asked for Microsoft guidance, but they still underused it in translating platform behavior into concrete repo decisions.

This document turns the current external guidance into repo-relevant decisions.

## Recommendation R-01 — Treat Flex deployment as a OneDeploy / deployment-storage problem, not a zip-deploy problem

Current Azure Functions guidance is clear enough on the important point:

- Flex Consumption has a single deployment path centered on an application package in deployment storage.
- Flex does not support classic zip deploy in the same way as Consumption / Premium / Dedicated.
- Manual/operator docs must not continue presenting `config-zip` as the Flex closure command path.

**Repo implication:** if the target app is really Flex Consumption, the repo must use Flex-appropriate deployment language and remove contradictory zip-deploy instructions.

## Recommendation R-02 — Keep `host.json` and runtime package metadata at artifact root

This part of current repo behavior is correct and should remain.

For a compiled Node Functions app, the deploy artifact should still look like a ready-to-run package whose extracted root contains `host.json` and the runtime package metadata expected by Functions.

## Recommendation R-03 — Use `pnpm deploy` only as a means to produce a portable runtime, not as an excuse to preserve artifact breadth

Current pnpm guidance supports using `pnpm deploy` to create an isolated deploy directory with installed dependencies, including workspace dependencies, and `--prod` is appropriate for skipping devDependencies.

But that does **not** justify validating unrelated runtime packages if the chosen entrypoint no longer imports them.

**Repo implication:** once the host entrypoint is narrowed, the artifact assertions must narrow too.

## Recommendation R-04 — Keep hoisted deploy output only where it solves a real hosted filesystem problem

Current pnpm guidance continues to recognize `node-linker=hoisted` as a practical option when tooling or hosting environments do not tolerate symlink-heavy installs.

**Repo implication:** keeping hoisted output is reasonable if the hosted/runtime environment needs it, but it should not hide unresolved entrypoint/dependency creep.

## Recommendation R-05 — Separate “route registration proof” from “trigger sync proof” from “business-success proof”

These are different things:

- Route/trigger registration proof says the host sees the functions.
- Trigger sync proof says the platform has synchronized them.
- Business-success proof says a hosted run completed the SharePoint and matching work correctly.

**Repo implication:** closure checklists and runbooks should require all three layers, not just one.

## Recommendation R-06 — Prefer structured operational fields over JSON-only summaries for run-level evidence

Queryable fields beat buried summary JSON whenever the system needs:

- alert thresholds,
- dashboards,
- quick operator triage,
- or comparison between runs.

**Repo implication:** the sync-run list/model should not stop at created/updated/unmatched if the service already computes richer counters that matter operationally.

## Recommendation R-07 — Preserve the dedicated host pattern already present in the repo instead of inventing a new doctrine from scratch

The repo already contains a per-domain host pattern through `src/hosts/admin-control-plane`.

**Repo implication:** the best remediation is likely not a novel architecture. It is more likely a reconciliation and narrowing exercise that uses patterns the repo already started adopting.
