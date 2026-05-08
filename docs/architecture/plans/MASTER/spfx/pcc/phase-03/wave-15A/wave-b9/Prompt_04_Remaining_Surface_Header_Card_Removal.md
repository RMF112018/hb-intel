# Prompt 04 — Remaining Surface Header Card Removal / Preservation

## Objective

Handle remaining Phase 04 candidates without losing operational content.

## Instructions

# Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, and tab/tabpanel accessibility.

Do not implement Phase 05 module launcher, Phase 06 Project Home bento composition realignment, URL routing, command routing, active module state, live integrations, writeback, or broad visual redesign during Phase 04.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

## Required Reads

```text
apps/project-control-center/src/surfaces/externalSystems/
apps/project-control-center/src/surfaces/controlCenterSettings/
apps/project-control-center/src/surfaces/projectReadiness/
apps/project-control-center/src/surfaces/approvals/
apps/project-control-center/src/surfaces/siteHealth/
apps/project-control-center/src/tests/
```

## Implementation Direction

### External Systems

- Remove or demote `PccExternalSystemsLaunchPadHeaderCard` only after preserving subtitle and launch-context cue.
- Confirm loading/error state cards remain visible.
- Confirm legacy `PccExternalSystemsHeaderCard` is unused before deletion; otherwise leave it and document.

### Control Center Settings

- Remove the first pure duplicate command card if operational settings cards remain.
- Preserve preview/governance/read-only posture via shell header metadata.

### Project Readiness

- Do not remove operational readiness hero stats, source-health badges, or degraded `PccSurfaceContextHeader` state cards.
- Strip/demote only duplicate title/advisory wrapper if safe.
- If unsafe, retain as an operational card and document Phase 06/07 follow-up.

### Approvals

- Do not remove operational HomeCard metrics, state/mode pills, or degraded state cards.
- Only remove duplicate title/advisory wrapper if an equivalent operational heading remains.

### Site Health

- Do not delete the metric grid unless those metrics are preserved in header or another retained operational card.
- Prefer retain/demote as an operational card if metrics remain card-owned.

## Tests

Add/adjust tests to prove:

- safe duplicates are absent;
- operational metrics remain;
- state/degraded cards remain;
- no active-panel card marker is required;
- no generic header-only card begins a surface.

## Completion Criteria

- Remaining safe duplicates removed.
- Operational cards preserved.
- Deferred operational candidates documented.
- Tests pass.
