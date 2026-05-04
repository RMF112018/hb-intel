# Implementation Sequence Overview

## Sequence Principle

Build from inert shared contracts toward read-only presentation. Do not introduce commands, runtime approvals, or external mutations.

## Stage Dependencies

| Stage | Focus | Dependency | Expected Deliverable |
| --- | --- | --- | --- |
| 01 | Readiness audit | None | Required local repo truth, package scripts, current seams, stop/go report |
| 02 | Shared models/fixtures | Prompt 01 | Typed Wave 14 contracts, state-machine helpers, deterministic fixtures, model tests |
| 03 | Backend GET-only read model | Prompt 02 | Mock provider envelopes, GET route(s), backend tests, no write routes |
| 04 | SPFx client/fixture parity | Prompts 02–03 | Typed route IDs/client methods, fixture fallback, parity tests |
| 05 | SPFx surface shell | Prompt 04 | Approvals UI shell/screen set, disabled reasons, HBI panel, read-only states |
| 06 | Integration seams | Prompts 02–05 | Priority Actions, readiness, source-module, Wave 13G, admin/site-health seams |
| 07 | Tests/closeout | Prompts 02–06 | Guardrail tests, validation evidence, implementation closeout |
| 08 | Reviewer prompt | Prompt 07 committed | Fresh-session review prompt for independent audit |

## Validation Expectations

- Each source prompt runs package-specific type/test commands that are confirmed by local `package.json` scripts.
- Each prompt captures `pnpm-lock.yaml` MD5 before/after.
- Each prompt runs `git diff --check`.
- Markdown/json closeout files use targeted Prettier checks only.
- Prompt 07 re-runs the full targeted validation set across models, functions, and SPFx if implementation touched all three.

## Rollback / Stop Conditions

Stop and ask for direction if:

- local HEAD does not include Wave 14 closeout commit or equivalent docs;
- local worktree contains user-owned drift that overlaps allowed files;
- package scripts differ from the command assumptions in this package;
- implementation requires package/lockfile/SPFx manifest/workflow changes;
- implementation would require backend command routes or external mutation;
- existing model contracts conflict with Wave 14 docs in a way that cannot be bridged safely;
- tests reveal unrelated failures outside prompt scope and remediation would exceed allowed files.

## Default Design Decisions

- Use one composite `approvals` read-model route unless local conventions clearly favor split route families.
- Keep decision affordances as disabled/read-only intent previews with explicit reason text.
- Preserve current preview behavior as fallback when backend is unavailable.
- Use existing CSS/module/component conventions before adding abstractions.
- Prefer repo-native utilities and existing dependencies before evaluating dependency candidates.
