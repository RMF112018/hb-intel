# 07 — Testing and Validation Plan

## Required unit/DOM tests

### Preview model tests

- Fixture arrays export non-empty records.
- Fixture IDs are stable and start with `preview-`.
- Fixture records do not include URL fields, Foleon doc IDs, SharePoint item IDs, or live telemetry IDs.
- Fixture records include title, summary, content type, layout role, and sample/preview context.

### Highlights tests

Mock services:

- `fetchFoleonPlacements`
- `fetchFoleonContent`

Cases:

1. Config incomplete → current `FoleonError`; preview not present.
2. Config complete + zero placements + zero content → preview fallback present.
3. Config complete + active placement + matching content → live `FoleonCard` present; preview absent.
4. Config complete + content fallback records but no placements → live cards present; preview absent.
5. Fetch error → `FoleonError`; preview absent.
6. Preview rendered → `onCardImpression` called only with `[]` or not called with preview records.
7. Preview card action → no `onOpenReader` or `onOpenExternal` invocation.

### Content Hub tests

Cases:

1. Config incomplete → error; preview absent.
2. Config complete + zero registry records → Hub preview fallback present.
3. Config complete + records exist → live archive present; preview absent.
4. Config complete + records exist + search no match → filter empty state; preview absent.
5. Config complete + records exist + type no match → filter empty state; preview absent.
6. Fetch error → error; preview absent.
7. Search telemetry remains based on user search only and does not treat preview records as live content.

### Manager tests

Cases:

1. Backend blocked state remains unchanged.
2. Ready + zero content optionally shows guidance panel.
3. Ready + live content does not show first-run preview guidance unless deliberate.
4. Guidance panel has no editable sample records.

### Accessibility tests

Use Testing Library assertions:

- preview region has accessible label;
- headings are present and ordered reasonably;
- preview labels are visible text;
- preview action is disabled or `aria-disabled`;
- no hover-only controls are required;
- loading state still uses status semantics;
- errors still use alert semantics.

## Required validation commands

Run from repo root unless otherwise noted:

```bash
git status --short
git branch --show-current
git log -5 --oneline

npx tsx tools/spfx-shell/scripts/validate-foleon-runtime-config-bridge.ts

pnpm --filter @hbc/spfx-hb-intel-foleon lint
pnpm --filter @hbc/spfx-hb-intel-foleon check-types
pnpm --filter @hbc/spfx-hb-intel-foleon test
pnpm --filter @hbc/spfx-hb-intel-foleon build
pnpm --filter @hbc/spfx-hb-intel-foleon schema:validate

pnpm --dir tools/spfx-shell build

npx tsx tools/build-spfx-package.ts --domain hb-intel-foleon
pnpm --filter @hbc/spfx-hb-intel-foleon package:proof
```

If SPFx shell build fails under Node 22 due to SPFx engine constraints, rerun under Node 18 and document both results.

## Package proof requirements

The final closure report must prove:

- source version and manifest version match `1.0.17.0`;
- generated package contains the new preview fallback code;
- runtime config bridge validation still passes;
- schema validation still passes;
- package proof still passes;
- no stale manifest/package content is being shipped.

## Tenant validation requirements

Covered in `15_TENANT_VALIDATION_RUNBOOK.md`.

## Closure report format

Every implementation prompt must close with:

```md
# Closure Report

## Summary

## Files Changed

## Behavior Implemented

## Tests Added / Updated

## Validation Commands and Results

## Runtime Proof Impact

## Telemetry Impact

## Risks / Follow-Ups

## Commit
```
