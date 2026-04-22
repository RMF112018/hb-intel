# 08-List-Architecture-Findings-Register

| Classification | Finding | Act now? | Requires code change | Requires list/schema change | Requires both | Documentation only | Notes |
|---|---|---:|---:|---:|---:|---:|---|
| Critical missing architecture | Separate SharePoint item-ID contract for lookup-backed relationships | Yes | Yes | Yes | Yes | No | Current domain uses string IDs while schema declares Lookup fields |
| Major underdeveloped architecture | Add `ReportingPeriodId` to `Safety Ingestion Runs` | Yes | Yes | Yes | Yes | No | Required for audit filtering and replay |
| Major underdeveloped architecture | Add attempted/resolved project context to `Safety Ingestion Runs` | Yes | Yes | Yes | Yes | No | Needed for unresolved/invalid review operations |
| Major underdeveloped architecture | Add explicit descriptor/config contract for `Projects` and `Legacy Project Fallback Registry` | Yes | Yes | Possibly | Yes | No | Resolution dependency should be first-class |
| Major underdeveloped architecture | Implement durable retry/replay closure model | Yes | Yes | Potentially | Yes | No | Review-required / commit-failed states need executable replay |
| Moderate structural weakness | Add upload-library item metadata for status / checksum / latest run / period | Later | Yes | Yes | Yes | No | Helpful for supportability, not first fix |
| Moderate structural weakness | Add distinct parser-failure terminal state/telemetry | Yes | Yes | Possibly | Yes | No | Current model flattens parser issues into invalid-template |
| Low-priority worthwhile improvement | Add richer review assignment/disposition metadata | Later | Yes | Yes | Yes | No | Improves operations after replay exists |
| Beneficial but not necessary | Separate exceptions list | No | Yes | Yes | Yes | No | Only if run volume and review complexity justify it |
| No extra architecture warranted | Keep raw checklist evidence in `RawChecklistJson` on inspection events | — | No | No | No | No | Adequate for Release 1 once persistence contract is fixed |
| No extra architecture warranted | Keep findings as child list rather than separate raw-answer list | — | No | No | No | No | Appropriate balance for Release 1 |
| No extra architecture warranted | Keep project-week as derived rollup list | — | No | No | No | No | Correct pattern once weekly derivation is fixed |
