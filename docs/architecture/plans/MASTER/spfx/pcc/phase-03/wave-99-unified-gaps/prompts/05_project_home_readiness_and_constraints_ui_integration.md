# Prompt 05 — Integrate Lifecycle, Memory, Related Records, and Constraints Log into Project Home / Project Readiness UX

## Objective

Use the seams from Prompt 04 to integrate the unified lifecycle architecture into the existing PCC shell experience. The work must reinforce one project operating layer, not create siloed module apps.

This prompt must also close the verified remaining gap that Constraints Log has model/backend/SPFx client seams but lacks confirmed end-user Project Readiness surface integration.

## Repo Location

```text
/Users/bobbyfetting/hb-intel
```

## Context Handling

Do not re-read files still in current context or memory. Re-open only the relevant Project Home, Project Readiness, shell, fixtures, and tests needed to verify repo truth.

## Files to Inspect

- `apps/project-control-center/src/surfaces/`
- `apps/project-control-center/src/surfaces/projectReadiness/`
- `apps/project-control-center/src/surfaces/priorityActions/`
- `apps/project-control-center/src/shell/`
- `apps/project-control-center/src/fixtures/`
- `apps/project-control-center/src/tests/`
- `packages/models/src/pcc/`

## Required UX Integration

Integrate preview-safe unified lifecycle elements into existing PCC surfaces:

### Project Home

Add or enhance Project Home so users can see:

- current lifecycle stage;
- lifecycle timeline preview;
- project memory highlights;
- related cross-stage records;
- lens/context cue;
- warnings for redacted, mock, unresolved, or insufficiently evidenced data.

Do not overload the page. Use compact bento/dashboard patterns already present in the PCC app.

### Project Readiness

Add Project Readiness integration for:

- Constraints Log readiness signals;
- Buyout Log readiness signal posture if already available;
- lifecycle gate signals;
- project memory references that explain why an item exists;
- related-record links/cues to source records.

Constraints Log must appear as a governed readiness input, not as a disconnected risk workspace.

### Related Records

Where a readiness item, memory record, constraint, or warranty-related item has relationships, surface a compact related-records panel or preview cue.

### Lens Behavior

Users should experience lenses as contextual filters/views within the same PCC shell. Do not create separate routes such as `/estimating-workspace`, `/warranty-workspace`, or `/operations-workspace`.

## Required Acceptance Criteria

- Existing Project Home/Readiness routes still work.
- Constraints Log is visibly integrated into Project Readiness as a readiness signal/source.
- Lifecycle timeline appears as project context, not separate navigation.
- Project memory appears as cross-stage context, not a new workspace.
- Related-record cues include source-lineage/citation information.
- Redacted or restricted records do not leak sensitive content.
- No external-system live writes.
- No new dependency or lockfile change.

## Tests

Add/update tests to prove:

- Project Home renders lifecycle/memory preview from fixtures;
- Project Readiness renders Constraints Log readiness signals;
- lens cues do not change the shell/workspace route;
- related records render source/citation cues;
- restricted records are redacted/omitted;
- existing surfaces continue rendering.

## Constraints

- Do not redesign the whole PCC shell.
- Do not create standalone department workspaces.
- Do not add broad styling changes.
- Do not introduce live external-system writes.
- Do not change package dependencies.
- Do not modify `pnpm-lock.yaml`.

## Validation

Run:

```bash
pnpm --filter @hbc/project-control-center check-types
pnpm --filter @hbc/project-control-center test
pnpm --filter @hbc/models check-types
md5 pnpm-lock.yaml
```

If scripts differ, inspect package scripts and run closest equivalents.

## Required Response

Return:

1. UX surfaces changed.
2. Constraints Log integration proof.
3. Lifecycle/memory/related-record integrations added.
4. Tests added/updated.
5. Validation results.
6. Lockfile MD5 before/after.
7. Remaining gaps passed to Prompt 06.
