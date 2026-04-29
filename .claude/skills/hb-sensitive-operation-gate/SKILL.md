---
name: hb-sensitive-operation-gate
description: Gate HB Intel sensitive operations before execution, including tenant mutation, Azure deployment, Graph/PnP, Procore, app catalog, CI/CD, permissions, secrets, tokens, and live endpoint probes.
when_to_use: Use whenever a task mentions az, m365, pnp, Graph, PnP, Procore, app catalog, .sppkg, deployment, Azure Functions, live endpoint curl, GitHub workflow dispatch, permissions, tokens, secrets, app settings, tenant smoke tests, or hosted proof.
argument-hint: "[proposed command, plan, or sensitive operation]"
context: fork
agent: hb-tenant-deployment-gatekeeper
allowed-tools: Read, Grep, Glob
---

# HB Sensitive Operation Gate

Gate this proposed sensitive operation:

```text
$ARGUMENTS
```

## Objective

Determine whether the proposed operation is authorized, safe, necessary, and properly bounded before any execution occurs.

## Sensitive Categories

Treat the following as sensitive:

- tenant mutation;
- SharePoint site/list/library/group/permission mutation;
- live Graph/PnP calls;
- Procore calls;
- app catalog deployment or upload;
- `.sppkg` packaging or upload;
- Azure deployment or Function App mutation;
- CI/CD workflow changes or dispatch;
- live endpoint `curl`;
- hosted smoke tests;
- dependency install/update commands;
- package or manifest version changes;
- secrets, tokens, app settings, auth proof, JWT payloads, bearer strings, Key Vault, or connection strings.

## Gate Checklist

1. **Explicit Authorization**
   - Did the user explicitly authorize the sensitive class of work?
   - Does the governing prompt support it?

2. **Scope Boundary**
   - Is the target environment clear?
   - Is production vs non-production clear?
   - Is mutation vs read-only proof clear?

3. **Required Specialist**
   - Use `hb-security-and-secrets-auditor` for secrets/auth/token/app-setting risk.
   - Use `hb-tenant-deployment-gatekeeper` for tenant/deployment/app catalog/Azure/Graph/PnP/Procore/CI/CD risk.
   - Use `hb-spfx-runtime-parity-auditor` for SPFx source/build/manifest/runtime/hosted parity risk.

4. **Redaction**
   - Do not preserve tokens, secrets, app settings, bearer strings, raw JWTs, connection strings, or sensitive auth payloads.
   - If proof is needed, redact outputs before reporting.

5. **Rollback / No-Mutation Alternative**
   - Prefer dry-run, read-only proof, deterministic local validation, or generated command plan before mutation.
   - Identify rollback considerations if mutation is authorized.

## Output Format

## Gate Verdict

Use one:

- **Allowed to Plan Only**
- **Allowed to Execute After Explicit User Approval**
- **Blocked**
- **Needs Clarification / Authorization**

## Reason

- <short reason>

## Required Preconditions

- <authorization, environment, credentials posture, redaction plan, validation plan>

## Safer Alternative

- <dry-run/read-only/local proof option>

## Command Risk Classification

Use `reference/sensitive-command-classification.md`.


## Standing Constraints

- Use current repo truth before historical summaries.
- Do not re-read files still in active context unless they may have changed, line-level proof is needed, validation/closeout requires proof, scope expanded, or the user asked for a repo-truth audit.
- Separate evidence from recommendation.
- State uncertainty explicitly.
- Do not broaden scope into adjacent cleanup unless the user explicitly authorizes it.
- Do not claim completion without stating what was actually inspected or verified.

