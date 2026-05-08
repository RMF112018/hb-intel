# Prompt 03 — Documents and Team Header Card Removal

## Objective

Remove the cleanest pure duplicate header cards first: Documents and Team & Access.

## Instructions

# Common Local-Agent Directive

Do not re-read files that are still within your current context or memory unless you need to verify stale, missing, or contradictory repo truth.

You are operating inside the local `hb-intel` repo. Use current repo truth. Do not rely on this package alone where live files contradict it. Preserve SharePoint host-fit, read-only/no-writeback posture, bento direct-child invariants, and tab/tabpanel accessibility.

Do not implement Phase 05 module launcher, Phase 06 Project Home bento composition realignment, URL routing, command routing, active module state, live integrations, writeback, or broad visual redesign during Phase 04.

Use `apps/project-control-center/config/package-solution.json` for PCC package-solution references. Root `config/package-solution.json` is stale for PCC unless current repo truth proves otherwise.

## Required Reads

```text
apps/project-control-center/src/surfaces/documents/PccDocumentsHeaderCard.tsx
apps/project-control-center/src/surfaces/documents/
apps/project-control-center/src/surfaces/teamAccess/PccTeamAccessHeaderCard.tsx
apps/project-control-center/src/surfaces/teamAccess/
apps/project-control-center/src/tests/
apps/project-control-center/src/shell/PccProjectHeroBand.tsx
apps/project-control-center/src/shell/surfaceHeaderMetadata.ts
```

## Implementation Direction

### Documents

- Remove `PccDocumentsHeaderCard` from the bento render path.
- Confirm document source/status cue remains in shell header metadata or retained state context.
- Ensure the Documents surface begins with document/source operational content.
- Delete the component file only if no imports remain and tests do not need it.

### Team & Access

- Remove `PccTeamAccessHeaderCard` from the bento render path.
- Ensure Team surface begins with operational Team/Permission/Access content.
- Delete the component file only if no imports remain and tests do not need it.

## Tests

Update tests that expect:

- full-width Documents/Team header cards;
- card-level active surface panel marker;
- first card title matching surface title.

Add assertions that:

- Documents and Team headers are represented in shell hero content;
- Documents and Team first bento cards are operational;
- no direct-bento-child compatibility active-panel card is required.

## Completion Criteria

- Documents no longer renders `PccDocumentsHeaderCard`.
- Team no longer renders `PccTeamAccessHeaderCard`.
- Equivalent header context remains in shell.
- Tests pass.
