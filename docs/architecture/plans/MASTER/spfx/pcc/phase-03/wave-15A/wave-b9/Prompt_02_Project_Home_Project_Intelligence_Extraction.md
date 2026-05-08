# Prompt 02 — Project Home Project Intelligence Extraction / Demotion

## Objective

Make Project Home stop using `Project Intelligence` as a duplicate bento header card while preserving all useful facts, command summary counts, source/HBI posture, and operational meaning.

## Instructions

# Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, and tab/tabpanel accessibility.

Do not implement Phase 05 module launcher, Phase 06 Project Home bento composition realignment, URL routing, command routing, active module state, live integrations, writeback, or broad visual redesign during Phase 04.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

## Required Reads

```text
apps/project-control-center/src/surfaces/projectHome/PccProjectIntelligenceCard.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHome.tsx
apps/project-control-center/src/surfaces/projectHome/PccProjectHomeReadModelContent.tsx
apps/project-control-center/src/surfaces/projectHome/
apps/project-control-center/src/tests/PccProjectHome.test.tsx
apps/project-control-center/src/tests/PccProjectHome.composition.test.tsx
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```

## Implementation Direction

Choose the safest current-repo path:

### Preferred

Remove `PccProjectIntelligenceCard` from the first bento position and preserve its content by:

- relying on existing shell hero for location/value/completion/stage;
- ensuring source/HBI/read-only posture is visible in header summary/cues;
- ensuring high-priority actions, pending approvals, and blocking gaps remain visible in their operational cards;
- adding a slim Project Facts card only if client/type/status facts would otherwise be lost.

### Allowed

Demote `PccProjectIntelligenceCard` into a non-header operational Project Facts/Command Summary card only if immediate full removal would lose unique content and Phase 06 has not yet provided the final composition.

### Prohibited

- deleting facts/counts without replacement;
- implementing full Phase 06 row/span composition;
- adding module launcher behavior;
- changing global footprints.

## Tests

Update tests to stop looking for `Project Intelligence` as the active surface card.

Add/adjust assertions that:

- Project Home has shell-owned active panel marker;
- the first bento card is operational, not a duplicate header card;
- Project Home facts/counts remain visible somewhere;
- no card-level `data-pcc-active-surface-panel="project-home"` is required;
- bento direct-child behavior remains valid.

## Completion Criteria

- Project Home no longer depends on `Project Intelligence` as duplicate surface header.
- Useful content is preserved.
- Tests pass for both fixture and read-model paths.
