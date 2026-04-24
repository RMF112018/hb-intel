# 04 — Workbook and Preview UX Assessment

## Phase 5 — Workbook / preview UX target analysis

## Current workbook selection

Public-main upload:
- accepts `.xlsx`;
- uses a hidden raw file input;
- displays file name;
- submits directly.

Missing:
- file size guardrail;
- file signature/readability precheck;
- parser-contract explanation;
- preview results;
- parser marker/contract version display;
- support for operator metadata required by backend preview.

## Governed workbook target

The app must present the workbook as a governed contract:
- expected template: Safety Checklist v1;
- expected parser marker: `SafetyChecklist_v1`;
- expected parser contract: `parse-first-2026-04`;
- required sheets and anchor/header structure;
- parser metadata and named-range seams;
- exact failure if contract is unsupported.

## Target preview / validation UX

1. Project selection
   - Search current and legacy projects.
   - Show selected source: Projects, Legacy Register, or merged.
   - Carry project number, name/location/stage snapshots, and lookup IDs in upload context.

2. Inspection metadata
   - Inspection number.
   - Inspection date as plain `YYYY-MM-DD`.
   - Date must not be timezone-converted.
   - The frontend copy must explain when parser values override context values.

3. Reporting period
   - Select reporting period.
   - Preview confirms whether parser-authoritative inspection date is inside the selected period.

4. Workbook selection
   - Choose `.xlsx`.
   - Validate type/size before preview.
   - Preserve file content for base64 backend transport; do not modify workbook bytes.

5. Preview
   - Call `/api/safety-records/ingest/preview`.
   - Show template compatibility, parser contract version, parser marker state, metadata-authority source, reporting-period resolved/date-in-range, project resolution, duplicate/supersession risk, warnings, blockers, and request ID/support ID.

6. Commit confirmation
   - Commit disabled until preview is `commitReadiness === true`.
   - Commit disabled if file/context changed after preview.
   - Operator must confirm latest previewed context before commit.
   - Commit calls `/api/safety-records/ingest`.

7. Replay / supersede
   - Review queue uses `/api/safety-records/replay`.
   - Supersede must be deliberate, not an accidental retry.

## Parser-authority vs user-entered-authority

The target UI must match the backend authority model:
- markered workbook + parser-meta/named-range value exists: parser value wins; operator entry is advisory; mismatch is warning;
- markerless or legacy workbook without parser authority: operator context may supply authority and must be labeled as legacy fallback.

Any statement like “the committed record uses your entered values” is unsafe unless scoped to legacy fallback or confirmed by backend metadata authority.

## Reporting-period mismatch

Target:
- preview blocks commit when parser-authoritative inspection date is outside selected reporting period;
- UI shows selected period dates and parser-authoritative inspection date;
- user must correct workbook or selected period before commit.

## Duplicate/supersession

Target:
- near duplicate = warning;
- high-confidence duplicate/supersession risk = blocker;
- user must use review/supersede flow;
- commit stays disabled unless backend preview says commit-ready.

## Target UX verdict

The public-main UX is a Release 1 upload intake, not a production-ready Graph/backend command UX. It must be replaced with a preview-first intake runway.
