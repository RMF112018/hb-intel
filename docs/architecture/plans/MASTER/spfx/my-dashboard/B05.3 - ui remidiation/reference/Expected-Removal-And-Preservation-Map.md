# Expected Removal and Preservation Map

## Remove or De-Render from Target Runtime

| Artifact / Concept | Target Treatment |
|---|---|
| Visible primary tablist | Remove from rendered product path |
| Module dropdown launcher | Remove from rendered product path |
| Focused Adobe route requirement | Remove from primary product path |
| Telemetry-heavy hero band | Replace with compact production header |
| Page-level governance microcopy lane | Remove from rendered header |
| Work Summary card | Remove from primary render |
| Source Readiness card | Remove from primary render |
| Adobe Queue State standalone card | Remove through Adobe consolidation |
| Adobe Connection Guidance standalone card | Remove through Adobe consolidation |
| Oversized full-width My Projects posture | Replace with locked bento spans |

## Preserve or Reuse Where Helpful

| Artifact / Concept | Target Treatment |
|---|---|
| Read-model provider / envelope seams | Preserve |
| Existing OAuth start callback | Preserve |
| Source-status mapping in view-model logic | Preserve or refactor into consolidated card VM |
| MyWorkBentoGrid / MyWorkCard primitives | Preserve |
| Project launch row semantics | Preserve and compress where necessary |
| Adobe action-list item fields | Preserve inside consolidated card |
| Source-of-record handoff principle | Preserve |

## Conditional Cleanup Rule

After consolidation:
- if a file/component is no longer referenced by runtime or tests and is not required by shared contracts, remove it;
- if a pure helper remains broadly useful and is still referenced by valid target-state code, preserve it;
- if docs actively describe rejected runtime posture as current truth, update them or clearly reframe them as historical batch artifacts where appropriate.
