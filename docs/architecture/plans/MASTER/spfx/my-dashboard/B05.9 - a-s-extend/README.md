# Adobe Sign Actionability + Direct Handoff Implementation Package

## Purpose

This package instructs a local code agent to fully implement **direct, secure Adobe Sign item actionability** inside the **HB Intel / My Dashboard Adobe Sign module**.

The target state is:

- **Action Queue rows** become directly actionable through a **click-time backend Action Link Resolver**.
- **Completed / history rows** retain safe **view/open** behavior where a durable, policy-approved source URL exists.
- **Sensitive Adobe action URLs** are never persisted in read models, fixtures, telemetry, or logs.
- **OAuth scope posture** is verified and hardened for the signing URL path.
- **Frontend CTA behavior** becomes explicit, stateful, and trustworthy.
- **Validation** closes both the local code contract and the hosted operational proof.

This package is based on the current connected-repo audit of `RMF112018/hb-intel` at:

```text
06e5fff21c5a3e9ef541f8a86c0e6b9f0f5ac1e1
```

## Package contents

```text
README.md
Plan-Summary.md
00_Repo_Truth_Audit_Summary.md
01_Official_API_Research_Summary.md
02_Target_Architecture.md
03_Decision_Register.md
04_Implementation_Roadmap.md
05_Contract_Route_And_State_Map.md
06_File_Level_Change_Map.md
07_Test_Validation_And_Telemetry_Plan.md
08_Risk_Register_And_Rollout.md
09_Operator_Validation_Runbook.md

artifacts/
  architecture_decisions.json
  acceptance_criteria.json
  implementation_sequence.json
  validation_matrix.json

prompts/
  Prompt-01-Revalidate-Repo-Truth-and-Freeze-Implementation-Boundaries.md
  Prompt-02-Add-Action-Handoff-Contracts-and-Resolver-Route-Skeleton.md
  Prompt-03-Implement-Adobe-Signing-URL-Resolver-Client-and-Provider-Normalization.md
  Prompt-04-Implement-Transient-Action-Handoff-Policy-Redirect-Safety-and-Telemetry.md
  Prompt-05-Expose-Non-Sensitive-Resolver-Capability-in-Read-Models-and-Fixtures.md
  Prompt-06-Implement-Frontend-Act-Now-CTA-Resolve-State-and-Fallback-UX.md
  Prompt-07-Harden-OAuth-Scope-Reconsent-and-Unsupported-Action-Type-Handling.md
  Prompt-08-Complete-Test-Coverage-Validation-Gates-and-Release-Proof.md
```

## Recommended execution order

Run the prompt files in strict sequence:

1. Prompt 01 — revalidate live repo truth and freeze implementation boundaries.
2. Prompt 02 — add contracts and resolver route skeleton.
3. Prompt 03 — implement the Adobe live signing URL resolver client.
4. Prompt 04 — implement transient-action policy, redirect safety, and telemetry.
5. Prompt 05 — expose non-sensitive action-handoff capability metadata in read models and fixtures.
6. Prompt 06 — implement frontend `Act now` behavior, resolve state, and fallback UX.
7. Prompt 07 — harden OAuth scope / reconsent posture and unsupported-action handling.
8. Prompt 08 — complete tests, validations, and release-proof closeout.

## Binding implementation decision

The package intentionally rejects two weaker architectures:

- **Do not** solve the problem by only improving speculative `viewURL` / `agreementViewUrl` extraction from `/search`.
- **Do not** persist `esignUrl` or any direct action URL inside read models or fixtures.

The chosen architecture is:

> **Hybrid direct-handoff architecture**
>
> - Action Queue rows use a **click-time backend resolver**.
> - Completed/history rows use **safe view/open URLs** when available.
> - Resolver outputs are transient and redacted.
> - Read models carry only non-sensitive capability metadata.

## Hard implementation constraints

Every prompt repeats the core rules, but the package-level constraints are:

- Do not broad-format the repo.
- Do not use `git add .`.
- Do not stage unrelated local drift.
- Do not edit `docs/architecture/plans/**` unless a prompt explicitly authorizes a package-local closeout note or existing doc target.
- Do not mutate `pnpm-lock.yaml`.
- Do not run `pnpm install`, `pnpm add`, or dependency changes.
- Do not change deployment workflows, app catalog packaging, tenant config, or external systems unless the specific prompt explicitly requires a local source change for documented scope/reconsent handling.
- Do not perform live Adobe mutation.
- Do not log or persist Adobe direct-action URLs, query strings, OAuth codes, access tokens, refresh tokens, or provider response bodies.
- Do not re-read files that are still within your current context or memory; only re-open files when you need fresh repo truth, exact line references, or to verify changes after editing.

## Completion definition

The overall implementation is complete only when:

- Action Queue rows render `Act now` when resolver capability is present.
- Clicking `Act now` goes through a backend resolver.
- Resolver attempts to return the best official Adobe action handoff for all six HB action categories and degrades safely when Adobe cannot provide one.
- Completed items remain safely viewable when a durable approved source URL exists.
- No direct action URL is stored in read-model DTOs, fixtures, logs, or telemetry.
- OAuth scope posture is verified and insufficient-scope states are handled.
- Local tests and targeted package validation are green.
- Final closeout records changed files, validation outputs, lockfile md5 before/after, exclusions, residual risks, and the recommended next action.
