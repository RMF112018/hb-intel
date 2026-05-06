---
package: PCC Host Shell Add-On Remediation Package
phase: Phase 3 / Wave 15A
scope: Host shell remediation beyond hero and tab rail
generated: 2026-05-06
status: Planning and local-code-agent handoff package
---

# 05 — Shell State Model Contract

## Purpose

Define shell-level states so the PCC shell fails gracefully and does not render blank or misleading content.

## Shell State Types

| State | Trigger | Required Shell Behavior |
|---|---|---|
| `ready` | project profile and active surface available | render normal shell + active surface |
| `referencePreview` | preview/fixture data active | compact preview posture outside hero fact row if needed |
| `loadingProfile` | profile not yet loaded | stable skeleton or loading state, no layout collapse |
| `missingProfile` | profile unavailable | intentional state card, no fake placeholder values |
| `partialProfile` | some mandatory facts missing | render available facts and flag missing facts compactly |
| `surfaceUnavailable` | route exists but content unavailable | active panel unavailable card |
| `surfaceLoading` | active surface loading | stable surface skeleton |
| `surfaceError` | active surface failure | local error card with retry/recovery guidance if applicable |
| `permissionLimited` | user lacks access to part of surface | explain limitation, do not hide entire shell |
| `degradedSource` | read model/source is degraded | compact warning treatment, not dominant shell header |
| `commandPreviewDisabled` | command/search disabled | non-interactive preview affordance |

## State Display Rules

- Shell should not disappear because a surface is unavailable.
- Hero should not show fake values to mask missing profile data.
- Active surface area must always explain unavailable/empty/degraded state.
- Source/reference states should be compact and subordinate.
- Avoid state banners that push the entire canvas too far below the fold unless severity requires it.

## Preview Posture

The preview posture should be honest but not dominant.

Recommended copy:

- `Reference preview`
- `Preview data`
- `Project command search unavailable in preview`

Avoid:

- `mock`;
- `fixture`;
- `wave`;
- `prompt`;
- internal implementation terms.

## Acceptance Criteria

- Shell-level state types are documented in code comments or tests where implemented.
- Missing profile renders an intentional state.
- Surface unavailable renders above-fold state card.
- Disabled command preview is not an input.
- No blank canvas states.
