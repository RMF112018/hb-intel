# HB Homepage Layout Audit Package

## Purpose
Repo-truth audit of the live `main` branch HB Homepage implementation with one narrow objective: determine what the current homepage shell must change to achieve the locked non-handheld post-launcher composition requested by the user.

## Audit verdict
The live homepage shell is directionally stronger than a generic stacked SharePoint page, but it is **not close enough** to the required target state to be solved by simple item reordering, and the live default preset is internally inconsistent on its own terms.

The main blockers are structural:
- `DEFAULT_PRESET` encodes six bands with Company Pulse duplicated in three slots, Leadership Message duplicated in two, and HB Kudos / People & Culture Public pinned to `stacked-full` bands,
- `DominanceRule` supports `left-dominant`, `equal`, and `single` only — no `right-dominant`,
- paired ratios reach ~2:1 only at container widths ≥1900px; common laptop/desktop widths land at 1.5:1–1.75:1,
- occupant governance actively blocks the requested pairings (HB Kudos limited to `recognition` semantics, Safety limited to `operational-spotlight`, People & Culture Public primary-only with `pairedLayoutEligible: false` and `people-culture-must-stack`),
- bidirectional `pairingRestrictions` between PCP and HB Kudos remain live and should be revalidated.

## Package contents
- `00-Homepage-Layout-Audit-Summary.md`
- `01-Current-Homepage-Composition-Map.md`
- `02-Doctrine-and-Benchmark-Assessment.md`
- `03-Homepage-Layout-Gap-Register.md`
- `04-Prioritized-Homepage-Recomposition-Plan.md`
- `05-Recommended-Implementation-Waves.md`

## Related scoped plans
- `../wave-01/` — shell governance and row-model replacement
- `../wave-02/` — hosted-surface fit hardening

## Recommended execution order
1. Complete shell governance and row-model work first (`../wave-01/`).
2. Then complete hosted-application fit work for the surfaces that must live in the subordinate slot (`../wave-02/`).
3. Close only after conformance output, row-order / handedness / membership / ratio tests, and hosted screenshots at 1180px / 1600px / 1900px / handheld show the locked three-row composition working on non-handheld widths and a disciplined single-column fallback on handheld.
