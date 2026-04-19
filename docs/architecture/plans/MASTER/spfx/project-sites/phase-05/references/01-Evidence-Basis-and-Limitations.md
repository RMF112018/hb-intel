# Evidence Basis and Limitations

## What was verified directly

The following were verified directly against the live repo or attached package contents:

- the attached package file inventory and high-level conclusions,
- the current shared Functions package manifest and host metadata,
- the default shared entrypoint,
- the legacy fallback discovery trigger registration file,
- the discovery service,
- the discovery repository,
- the Graph client,
- the project-index provider,
- the hosting config,
- the source config,
- the admin/review route registration file,
- the dedicated admin-control-plane host entrypoint,
- the packaging script,
- the deploy workflow,
- the hosting IaC template,
- the operator runbooks,
- the list descriptors,
- the shared legacy fallback model,
- and the monitoring template.

## What was inferred from repo truth

The following conclusions are reasoned inferences from the code and docs rather than direct hosted-environment observation:

- that the default deployed artifact still follows the shared `backend/functions/src/index.ts` path unless explicitly changed elsewhere,
- that the documented review/admin route surface is therefore not fully reconciled with the default artifact path,
- that the project-index provider’s hard-coded field reads are a real schema-abstraction defect,
- and that the current sync-run schema under-models the counters already computed by the service.

These are strong, code-based inferences, but they are still distinct from runtime capture from the live hosted environment.

## What was verified from current external guidance

External research was used to verify:

- current Azure Functions deployment-method distinctions by hosting plan,
- current Flex Consumption deployment expectations,
- current run-from-package caveats for Flex,
- current pnpm deploy behavior and the role of `--prod` / `--legacy`,
- and current pnpm `node-linker=hoisted` rationale for symlink-hostile/serverless environments.

## What remains a hard limit in this session

This package does **not** include direct live hosted tenant evidence such as:

- current Azure resource properties from the user’s subscription,
- current `/admin/functions` output from the live function app,
- current Application Insights event captures,
- or current SharePoint list rows from the hosted environment.

That is why the prompt set still requires hosted closure proof, not just code inspection.

## Confidence statement

Confidence is high that the new package materially surpasses the attached packages in these areas:

- repo alignment,
- active-finding specificity,
- remediation decomposition,
- and closure rigor.

Confidence is lower only where the final answer would require direct live-environment inspection that is outside the repo and outside this session’s runtime access.
