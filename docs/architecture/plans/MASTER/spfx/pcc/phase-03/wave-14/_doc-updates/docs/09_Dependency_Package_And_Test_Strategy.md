# Dependency Package and Test Strategy

## Dependency Posture

No package installation is authorized by this documentation update.

| Package | Current / Candidate Posture | Guidance |
| --- | --- | --- |
| `@fluentui/react-components` | existing in repo areas | Use where already available and consistent with UI-kit governance |
| `@tanstack/react-table` | existing in estimating app | Strong candidate for queue sorting/filtering if adopted through gated decision |
| `@tanstack/react-virtual` | candidate | Adopt only if queue scale requires virtualization |
| `@pnp/sp` | candidate | Defer for Phase 14 MVP; no direct SPFx mutation |
| `@pnp/queryable` | existing root dev dependency | Evaluate only behind approved SharePoint data-access boundary |
| `zod` | candidate / possibly existing in areas | Defer unless repo standardizes schema validation around it |
| `ajv` | candidate | Adopt when gated for JSON Schema/runtime command validation |
| `xstate` | candidate | Defer; consider only if state/routing complexity justifies visual statecharts/runtime actors |
| `@testing-library/react` | existing | Use for component and accessibility-adjacent interaction tests |
| `vitest` | existing | Use for model/state/validation tests |
| `@playwright/test` | existing | Use for keyboard/responsive/high-level UX tests |

## Required Test Categories

### Model and Contract Tests

- entity shape coverage;
- state enum coverage;
- route mode enum coverage;
- decision action enum coverage;
- validation rule catalog coverage;
- role/action matrix coverage.

### State Machine Tests

- every valid transition;
- every invalid transition;
- required fields per transition;
- terminal-state behavior;
- execution-pending behavior;
- stale-source and superseded-source behavior.

### Routing Tests

- single-approver;
- sequential;
- parallel-all;
- parallel-any;
- advisory-review;
- acknowledgement-only;
- escalation-review;
- admin-verification.

### Permission and Redaction Tests

- role/action rights;
- HBI no-authority;
- external/owner/subcontractor redaction;
- unauthorized decision attempts;
- sensitive field visibility.

### Integration Tests

- Priority Actions create/update/resolve/dedupe;
- Project Readiness gate impact;
- Team & Access execution-pending;
- Buyout Log handoff;
- Constraints Log readiness deferral;
- Responsibility Matrix exception;
- Permit/Inspection waiver;
- Wave 13G estimate freeze/handoff;
- Site Health admin verification;
- External Systems mapping correction.

### UX Tests

- queue filters;
- queue sorting;
- pagination;
- disabled action reasons;
- detail drawer/focus management;
- confirmation dialog behavior;
- error and loading states;
- keyboard navigation;
- accessible labels and status.

### Guardrail Tests

- no Procore/Sage writeback;
- no Power Automate runtime dependency;
- no tenant mutation;
- no package/lockfile mutation;
- no direct SPFx decision mutation;
- no HBI decision execution.

## Validation Commands

Use repo-correct equivalents:

```bash
python3 -m json.tool <json-file>
pnpm exec prettier --check <touched-markdown-json-files>
pnpm --filter @hbc/models check-types
pnpm --filter @hbc/models test
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm --filter @hbc/functions check-types
pnpm --filter @hbc/functions test
git diff --check
```

Documentation-only prompts must not require runtime test suites if no runtime files are touched, but must include expected future validation gates.
