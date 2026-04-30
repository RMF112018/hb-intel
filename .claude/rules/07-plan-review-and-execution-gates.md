# 07 — Plan Review and Execution Gates

## Primary Rule

For prompt-package, phase/wave, risky, cross-cutting, architecture, SPFx, backend, provisioning, deployment, Graph/PnP, Procore, permission, CI/CD, package/version, or tenant-sensitive work:

1. produce a plan first;
2. wait for user approval before execution;
3. execute only approved scope;
4. validate changed scope;
5. report evidence and residual risk.

## Forbidden Unless Explicitly Authorized

Do not:

- mutate tenants;
- call live Graph/PnP;
- call Procore;
- deploy to app catalog;
- generate or upload `.sppkg`;
- edit CI/CD workflows;
- change package or manifest versions;
- push commits;
- run destructive shell or git commands;
- run dependency install/update commands;
- call live backend/tenant endpoints with `curl`;
- broaden scope into adjacent cleanup.

## Completion Report

Report files inspected, files changed, validation run, validation not run, guardrails preserved, known gaps, commit summary, and commit description.
