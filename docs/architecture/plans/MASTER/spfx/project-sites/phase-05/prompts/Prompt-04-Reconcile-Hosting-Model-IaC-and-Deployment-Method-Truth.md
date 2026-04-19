# Prompt 04 — Reconcile Hosting Model, IaC, and Deployment Method Truth

## Objective

Resolve the repo’s internal contradiction about how the legacy fallback backend is hosted and which deployment technology is actually approved for that host.

## Current defect

The repo currently mixes Flex-style deployment-storage configuration, dedicated-plan defaults/reuse options, and operator instructions that still mention `config-zip` in a Flex closure context. This is not one coherent hosting/deployment story.

## Why it matters

A repo that tells the wrong deployment story can produce false closure even when the code is fine. The operator can deploy the wrong way, collect the wrong evidence, or preserve an accidental environment-specific success path that is not actually repo-truth-correct.

## Repo seams in scope

- `infra/legacy-fallback-hosting.bicep`
- `infra/legacy-fallback-hosting.staging.bicepparam`
- `infra/legacy-fallback-hosting.prod.bicepparam`
- `scripts/provision-legacy-fallback-hosting.ts`
- `.github/workflows/deploy-functions.yml`
- `docs/how-to/administrator/provision-legacy-fallback-hosting.md`
- `docs/how-to/administrator/run-legacy-fallback-discovery.md`
- any environment/release-scope docs that state what host this lane uses

## Required future state

The repo expresses one coherent answer to all of the following: what the host plan is, what deployment technology is approved for it, what the workflow assumes, and what the operator must do manually when validating or deploying the lane.

## Required changes

1. Determine the actual intended hosting model from repo truth and current platform constraints.
2. Align IaC, parameter files, deploy workflow language, and manual runbooks to that model.
3. Remove or explicitly deprecate contradictory deployment instructions.
4. If the chosen model is Flex, ensure the docs and deployment references no longer imply zip-deploy/config-zip as the closure command path.
5. If the chosen model is not Flex, make that explicit and remove misleading Flex-closure wording.

## Must not change

Do not leave the contradiction partially documented. This prompt is not closed if old and new hosting truths still coexist unclearly.

## Closure proof required

Return:
- the final declared hosting model,
- the final approved deployment method,
- exact files changed,
- why the old repo language was contradictory or unsafe,
- and a concise statement confirming that IaC, workflow, and operator docs now agree.

## Required deliverables

- reconciled IaC and/or parameter updates
- updated workflow or workflow documentation if needed
- corrected operator runbooks
- a closure note that states the authoritative hosting/deployment truth

## Local operating instruction

Do **not** re-read files that are already in your active context or memory unless you need to confirm drift, dependencies, uncertainty, or post-change impact.
