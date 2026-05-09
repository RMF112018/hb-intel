# Fresh Local Code Agent Prompt — PCC Phase 05

## Role

You are my local implementation agent for `RMF112018/hb-intel`.

You are implementing **PCC Phase 05 — Grouped Tab Module Navigation** inside `apps/project-control-center`.

## Global Instructions

- Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.
- Work against current `main`.
- Inspect repo truth before editing.
- Preserve SharePoint host-fit.
- Preserve read-only / preview / no-writeback posture.
- Preserve the distinction between primary dashboard surfaces and child modules.
- Preserve bento direct-child invariants.
- Preserve tab / tabpanel accessibility.
- Do not add a standalone hero/header Module Launcher.
- Do not add a persistent PCC sidebar.
- Do not introduce URL routing, query-string routing, or SharePoint page routing.
- Do not introduce Procore, Sage, SharePoint, tenant, group, list, library, approval, or HBI writeback.
- Do not present developer copy in the UI. All rendered content must be production-grade and end-user-facing.
- Do not render these strings in product UI: TODO, TBD, placeholder, stub, mock, fixture, debug, dev-only, not implemented, lorem, developer, code agent, prompt, repo, test selector, internal only.
- Do not delete existing surfaces to satisfy navigation changes. Map, adapt, or wrap them safely.

## Objective

Finalize the visible `Document Control` primary tab refinement and ensure the current Documents surface is preserved while expanding its module scope.

## Scope

Target:

```text
apps/project-control-center/src/shell/
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/preview/
apps/project-control-center/src/tests/
```

## Required Decisions

- Visible tab label must be `Document Control`.
- Internal ID may remain `documents` in Phase 05.
- Do not remove the current documents read-model seam.
- Do not remove existing document cards or state cards.
- Do not rename source folders unless required and safely validated.

## Required Child Modules

Document Control dropdown must include:

1. Primary Documents Tool
2. Document Control Center
3. Drawing & Model Center
4. SharePoint Project Record
5. My Project Files / OneDrive
6. Procore Documents
7. Document Crunch
8. Adobe Sign

## Required Dashboard Content

The Document Control dashboard must surface the current document-control experience and provide production-grade module posture for:

- formal project record;
- user's project files;
- external document sources;
- drawing/model future state;
- Procore document reference;
- Document Crunch / Adobe Sign launch-only posture.

## Required Copy

Approved examples:

```text
Project Record remains the formal source for project files.
Drawing and model coordination is planned for a future release.
Opens or references the source system. PCC does not write back to that system.
```

Forbidden examples:

```text
Documents placeholder
TODO drawing module
Mock document control
Not implemented
```

## Tests

Add/update tests proving:

- `Document Control` visible tab label renders;
- visible primary tab label `Documents` does not render;
- `documents` internal ID still maps to Document Control dashboard if compatibility is preserved;
- all required Document Control modules render in dropdown;
- drawing/model module uses future-release copy;
- Procore/Documents launch-only copy includes no-writeback cue;
- existing document control tests still pass or have equivalent coverage;
- no developer copy renders.

## Validation

Run:

```bash
git status --short
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
pnpm --filter @hbc/spfx-project-control-center check-types
pnpm --filter @hbc/spfx-project-control-center test
pnpm exec prettier --check <changed-files>
git diff --check
md5 pnpm-lock.yaml || md5sum pnpm-lock.yaml
```

## Closeout

Include:

- visible label changes;
- internal ID posture;
- Document Control module list;
- tests added/updated;
- validation results.
