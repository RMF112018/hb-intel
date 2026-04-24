# 04 — Workbook and Preview UX Assessment

## 1. Workbook contract reality

The workbook is governed. It is not a generic upload.

The parser contract expects:
- required sheets,
- anchor labels,
- response header labels,
- parser markers / named ranges,
- accepted template markers,
- accepted parser contract version,
- valid inspection date/number,
- complete reporting-period markers when present,
- and a key-findings seam.

That means the upload experience should be explicitly authored around template compatibility and preview diagnostics.

## 2. Current upload UX reality

The current Upload page asks the user to:
- select a project,
- enter inspection number/date,
- select a reporting period,
- choose the workbook,
- and submit.

The page then behaves like a direct commit form.

This is the wrong mental model for the current backend.

## 3. Parser authority vs entered-authority reality

Repo truth currently encodes a mixed authority model:
- operator-entered project/inspection metadata is treated as authoritative for writes,
- workbook-parsed equivalents are retained for provenance and mismatch advisory,
- and `metadataAuthority` / mismatch payloads exist to record what happened.

That is important because the UI should not pretend the parser is the sole source of truth today. The repo currently says otherwise.

If the target architecture truly wants parser-first authority, that needs a deliberate product/contract decision and probably backend/domain changes. The current frontend audit should not hide this drift.

## 4. Current missing UX stage: preview

The target upload journey should be:

1. intake entry
2. workbook selection
3. preview request
4. preview review
5. commit confirmation (only if preview commit-ready)
6. terminal outcome / route to inspection or review queue

The current app jumps from intake readiness directly to commit submission.

## 5. What preview UX should show

A production-correct preview surface should show:

### Template compatibility
- supported / unsupported
- detected template version
- parser contract version
- invalid-template blockers

### Parse and metadata summary
- inspection date
- inspection number
- project-site/project-number interpretation
- key findings preview
- parser authority/source metadata if available

### Reporting-period assessment
- resolved period
- date-in-range status
- mismatch blocker if present

### Project resolution assessment
- resolved / unresolved
- project source classification
- selected project vs parsed project mismatch advisory

### Duplicate / supersession risk
- duplicate confidence
- matched inspection if any
- whether commit is blocked or requires review/supersede path

### Commit-readiness summary
- explicit green/yellow/red posture
- blocking errors
- warnings
- what commit will do next

## 6. Commit UX target

Once preview is clean enough to commit:
- user confirms the preview
- commit button becomes available
- the commit request uses the exact previewed intake/workbook context
- commit outcome preserves backend request-id and terminal details

## 7. Replay UX target

Replay should be preview-aware as well:
- show why the prior run failed
- show whether replay is a simple retry or a supersede path
- preserve the same support diagnostics and request IDs

## 8. Accessibility target for async upload flow

The upload flow should include:
- a polite live region for non-urgent progress/status changes,
- an alert live region only for urgent blocking failures,
- disabled controls during in-flight operations,
- explicit retry affordances for bounded retryable failures,
- and no reliance on color or layout alone to communicate terminal state.
