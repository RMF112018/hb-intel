# Wave 01 Plan Summary

## Wave intent

Stabilize the Safety upload/preview/commit/replay lane around the current Graph-first design on `main`, and eliminate the remaining ambiguity between repo truth and live behavior.

## Closure units

1. restore authoritative Graph reads/writes and prove runtime binding correctness
2. adopt parse-first workbook authority for parser-critical values
3. strengthen preview, diagnostics, and proof of closure

## Non-goals

- unrelated frontend redesign
- broad admin-control-plane refactoring outside the Safety lane
- premature rollback to old SharePoint REST data-plane patterns

