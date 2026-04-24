# Workbook and Preview UX Assessment

Date: 2026-04-24

## Governed workbook contract

The workbook is not an arbitrary Excel upload. The repo defines a governed Safety Checklist v1 contract with required sheets, a parser sheet, accepted template marker, accepted parser contract version, anchor cells, response headers, named ranges, parser-critical cell error detection, reporting-period marker validation, and key findings seam validation.

The UI should continue treating preview as the authority boundary, not local workbook parsing in the browser.

## Current upload UX strengths

- File selection uses a governed accessible component.
- The UI requires project, inspection number, inspection date, reporting period, and workbook before preview.
- The UI explains parser authority: markered parser-meta/named-range values win.
- Preview result surfaces commit readiness, failure class, template compatibility, parser marker state, metadata parse state, reporting-period resolution/date-in-range, project resolution, duplicate/supersession risk, and metadata authority.
- Commit is disabled until the latest preview is commit-ready and confirmed.

## Gaps

### 1. Date validation drift

UI checks `YYYY-MM-DD` shape only. Backend validates actual calendar date. Target: use the same plain-calendar-date validator semantics in frontend and backend.

### 2. Inspection number drift

UI accepts any digits and says non-negative integer. Parser contract requires a positive integer. Target: enforce positive integer and update copy.

### 3. Reporting period status drift

UI copy says an open reporting period is required, but the app defaults to the first period and does not visibly enforce `open` before preview/commit. Target: require explicit valid/open period selection unless backend contract intentionally allows other statuses.

### 4. Uploaded-by authority

`uploadedByUpn` is currently derived from `window._hbcUpn` with a hardcoded fallback. Target: derive from SPFx page context/auth bootstrap or remove trust in frontend-supplied user identity and rely on backend token claims for authoritative identity.

### 5. File validation depth

Frontend extension/MIME/size checks are useful but advisory. Target: keep them, but add stronger language and test that backend template failure states are first-class.

### 6. Preview resolution model

Preview diagnostics are shown, but the UI should provide clearer next steps per failure class: template incompatible, parser authority violation, reporting-period mismatch, project unresolved, duplicate/supersession risk, and reference/list readiness failure.

### 7. Replay parity

Replay uses backend authority but lacks a preview-style operator confirmation model. Supersede actions deserve a stronger target UX.

## Target UX

1. Operator selects project and inspection metadata.
2. Operator selects an open reporting period.
3. Operator selects `.xlsx` workbook.
4. UI performs advisory client checks only.
5. Preview runs against backend.
6. UI shows a structured preview with commit readiness, blocking class, field authority source, mismatches, duplicate/supersession implications, and support request IDs.
7. Commit remains disabled until preview is commit-ready, preview signature matches current context, and user confirms.
8. Replay/supersede has its own governed confirmation panel before mutation.
