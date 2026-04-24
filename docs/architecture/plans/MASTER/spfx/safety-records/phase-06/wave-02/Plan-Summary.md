# Plan Summary — Wave 02

## Objective

Turn the Safety upload screen into a governed intake runway: project selection, inspection metadata, reporting period, workbook selection, backend preview, explicit confirmation, commit, support details, and review/replay handling.

## Critical path

1. Replace direct submit with preview/commit state machine.
2. Add project picker and inspection metadata context.
3. Surface workbook/parser/period/project/duplicate diagnostics.
4. Add truthful error/support panels.
5. Harden accessibility, file validation, and replay/supersede handling.

## Dependency

Wave 02 assumes Wave 01 has provided a truthful backend command client and hook layer.
