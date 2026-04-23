# Plan Summary — Wave 01

## Goal
Eliminate the current Safety ingestion blocker by replacing the failing REST/app-only repository seam with a Graph-native implementation, and make the parser honor the workbook’s stronger machine-readable contract.

## Why this wave exists
The live blocker is no longer deployment parity or route registration. It is the first repository-level reporting-period read on the ingestion path. The current repository is still a SharePoint REST adapter. The workbook has already moved ahead of the parser by adding `ParserMeta`, named ranges, and contract/version markers.

## Closure standard
This wave is only done when:
1. the ingestion path performs successful authoritative writes,
2. the Safety lane no longer depends on REST list-item operations for ingestion,
3. the parser prefers `ParserMeta` / named ranges over visible-cell fallbacks,
4. and the backend returns clean, operator-usable diagnostics for invalid template or parse-contract states.
