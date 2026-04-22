# 02 — Release 1 Upload-First Workflow

## Objective

Define the exact Release 1 user workflow for offline inspections and governed checklist upload.

## User roles

### Safety coordinator
- completes inspection checklist offline
- uploads completed checklist
- may review submission status and errors

### Safety manager
- monitors reporting-period completion
- reviews exceptions / parse failures / duplicates
- approves corrections or overrides
- publishes downstream rollups

### System / ingestion service
- validates template
- resolves project identity
- recalculates scores
- creates structured records
- updates project-week rollups
- flags exceptions

## Release 1 workflow

### Step 1 — Reporting period exists
A manager creates or confirms the active weekly reporting period in the app.

### Step 2 — Coordinator completes offline checklist
The coordinator uses the governed Excel checklist during the site walk.

### Step 3 — Coordinator submits workbook
The coordinator uploads the completed file through the Safety app on `/sites/Safety`.

### Step 4 — Intake validation
The system checks:

- file type
- workbook sheet names
- template version / contract compliance
- required metadata cells
- response structure
- duplicate inspection risk

### Step 5 — Project resolution
The system attempts to bind the inspection to:

1. `Projects` on HBCentral
2. `Legacy Project Fallback Registry` on HBCentral if no canonical project is found

### Step 6 — Parsing and recalculation
The backend reads the workbook and derives:

- inspection metadata
- per-row yes/no/n/a state
- freeform notes
- inspection flags
- section yes/no/n/a counts
- section score percentages
- weighted final inspection score

### Step 7 — Formal record creation
The system creates or updates:

- ingestion run record
- inspection event
- findings / corrective actions where warranted
- project-week rollup

### Step 8 — Review / exception handling
If anything is ambiguous, the system routes the upload to review-required status rather than silently writing bad data.

### Step 9 — Weekly completion view
The Safety manager sees a weekly queue showing:

- projects expected this week
- inspections received
- inspections missing
- parse failures
- duplicates
- review-required submissions

## Status model

### Upload status
- uploaded
- validating
- rejected
- parsed
- review-required
- committed

### Project-week status
- not-started
- awaiting-upload
- in-progress
- completed
- review-required
- published

### Inspection-event status
- accepted
- duplicate-suspected
- superseded
- review-required
- rejected

## Friction-reduction tactics

- no field connectivity dependency during site walk
- no requirement to re-key the full inspection in Release 1
- upload-first intake with deterministic parse rules
- automatic weekly averaging when multiple inspections exist
- automatic carry-forward of project context once resolved
- exception-only review workflow

## Duplicate handling

Potential duplicate inspection signals:

- same project
- same inspection date
- same inspection number
- same uploaded filename hash
- near-identical response pattern

Release 1 should not automatically destroy duplicates. It should:

- flag likely duplicates
- keep the raw upload artifact
- require manager review if confidence is not high

## Recommended weekly manager dashboard

The manager dashboard should answer:

- which active projects have no inspection this week?
- which projects have one inspection?
- which projects have multiple inspections?
- which uploads failed validation?
- which inspections need manual review?
- what is the current weekly average by project?

## Release 1 non-goals

- mandatory native in-app checklist entry
- full offline-first browser app
- free-form upload of arbitrary spreadsheets
- AI extraction from broken workbook layouts

## Structural decision

Release 1 is a governed upload-first ingestion workflow. Native in-app checklist entry is deferred unless and until true offline reliability is delivered.
