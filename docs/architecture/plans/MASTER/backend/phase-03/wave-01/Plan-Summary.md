# Plan Summary — Wave 01

Execution order:
1. Prove whether the live function host is actually running the graph-native Safety ingest code from current `main`.
2. Instrument and repair the reporting-period Graph read seam under the deployed identity.
3. Lock one canonical reporting-period identifier contract across route → client context → repository.
4. Tighten preview/commit diagnostics enough to make live proof runs actionable.
5. Execute an end-to-end proof run and capture before/after list deltas.

Wave-01 closure is not complete until:
- a real workbook preview succeeds,
- a real workbook commit succeeds,
- expected records appear in the target Safety lists,
- and the proof bundle shows artifact version/sha, outbound identity evidence, and list deltas.
