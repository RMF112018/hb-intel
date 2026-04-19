# Build, Deploy, and Artifact Assessment

## Build/package truth in the repo today

The current artifact pipeline is centered on `scripts/package-functions-artifact.ts`.

It does the following:

- builds selected workspace packages,
- runs `pnpm --filter @hbc/functions deploy --prod --legacy ... --config.node-linker=hoisted`,
- copies `host.json` into the staged artifact root,
- asserts presence of `dist/index.js` and `dist/functions/legacyFallbackDiscovery/index.js`,
- asserts multiple workspace packages in staged `node_modules`,
- validates `package.json.main`,
- imports the staged entrypoint before zipping.

## What is good about the current shape

### 1. The artifact now looks like a real Node Functions runtime package

Compared with the older failure mode, the current shape is substantially better because it ensures:

- `host.json` is at the artifact root,
- `package.json` points to `./dist/index.js`,
- `@azure/functions` is present in runtime dependencies,
- and a staged import check runs before zipping.

### 2. The use of `pnpm deploy` is conceptually appropriate for creating a portable deploy directory

`pnpm deploy` is a reasonable strategy for this monorepo because it produces an isolated deploy directory with installed dependencies rather than assuming the host will understand workspace symlinks.

### 3. `node-linker=hoisted` is a practical response to symlink-hostile/serverless deployment environments

The choice is understandable and defensible for a deploy artifact that must avoid workspace-link surprises.

## What is still wrong

### 1. The artifact still targets the broad shared host entrypoint

This is the single biggest artifact-composition issue.

The script validates `dist/index.js`, not a purpose-fit legacy fallback host entrypoint. That keeps the artifact coupled to unrelated function domains.

### 2. The artifact contract itself asserts unrelated runtime packages

The current staged artifact assertions require:

- `@hbc/notification-intelligence`
- `@hbc/acknowledgment`
- `@hbc/provisioning`

Some of these may still be transitively needed by the broad shared host, but that is exactly the problem: the artifact contract currently reflects the broad host, not the legacy fallback lane.

### 3. Package manifest breadth is still larger than the objective

`backend/functions/package.json` remains a shared backend package, not a purpose-fit legacy fallback package.

That does not make it invalid, but it does mean the repo has not yet completed the objective of a narrow, deployment-safe legacy fallback runtime lane.

## Hosting and deployment truth assessment

### IaC truth

`infra/legacy-fallback-hosting.bicep` mixes signals from more than one hosting model:

- Linux Function App kind,
- `functionAppConfig.deployment.storage` with blob-container deployment storage,
- user-assigned identity deployment storage auth,
- but also dedicated-plan defaults (`B1`, `Basic`) and existing-plan reuse.

This is not one clean hosting story.

### Runbook truth

`docs/how-to/administrator/run-legacy-fallback-discovery.md` explicitly tells operators to verify host model first, which is good. But it still includes a Flex-closure example using `az functionapp deployment source config-zip`, which is not safe if the target app is truly Flex Consumption.

### Workflow truth

`.github/workflows/deploy-functions.yml` uses `azure/functions-action@v1`, which is not itself a problem. The problem is that the repo does not clearly declare whether this workflow is meant for the shared host, the dedicated legacy fallback host, or both.

## Most important deployment conclusion

The repo has improved packaging mechanics, but it has **not yet achieved deployment truth**.

The current system still needs one authoritative answer to this question:

> Is the legacy fallback backend being deployed as part of the broad shared `@hbc/functions` host, or is it meant to run in a dedicated legacy/admin host lane with a host-model-specific deploy method?

Until that answer is explicit in code, docs, and pipeline behavior, the packaging path remains operationally ambiguous.

## Required target state

A correct end state for this objective should satisfy all of the following:

- one explicit host entrypoint is chosen,
- the artifact asserts only the runtime graph that entrypoint needs,
- the package and workflow target that entrypoint intentionally,
- the deploy method matches the real host model,
- and post-deploy validation proves the intended routes and persistence seams actually work.
