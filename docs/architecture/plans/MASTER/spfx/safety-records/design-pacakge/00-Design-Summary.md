# 00 — Design Summary

## Objective

Replace the weekly `Jobsite Safety Scores.xlsx` process with a governed Safety Record Keeping solution that:

- supports offline field inspections
- ingests governed Excel checklist uploads
- creates durable structured inspection and weekly safety records
- rolls multiple inspections into a single project-week score
- preserves each underlying inspection event
- publishes downstream safety signals for Safety Field Excellence

## Finalized hosting model

- **Safety site (`/sites/Safety`)**
  - hosts the Safety Record Keeping application
  - hosts the upload library / intake experience
  - hosts optional temporary intake / review artifacts
- **HBCentral (`/sites/HBCentral`)**
  - hosts authoritative structured safety lists
  - already hosts `Projects`
  - already hosts `Legacy Project Fallback Registry`

## Release 1 operating model

Release 1 is **upload-first**:

1. safety coordinator completes the governed Excel checklist offline in the field
2. coordinator uploads the workbook through the Safety application on `/sites/Safety`
3. backend validates template/version/layout
4. backend resolves project identity against HBCentral
5. backend parses checklist responses and notes
6. backend recalculates section scores and overall inspection score
7. backend creates structured inspection/finding/project-week records on HBCentral
8. the application surfaces review status, exceptions, and weekly completion progress

## Why this is the correct Release 1 model

- it fits limited-connectivity jobsites
- it respects existing coordinator behavior
- it avoids forcing live data entry into a connected app
- it still gives the business a clean, structured system of record
- it supports multiple inspections in a week without collapsing them into one cell
- it creates a clean path to a future offline-first native field capture experience

## Core domain model

The spreadsheet row is **not** the primary record.

The primary record stack is:

1. **Safety Reporting Period**
2. **Safety Project Week Record**
3. **Safety Inspection Event**
4. **Safety Finding**
5. **Safety Corrective Action**

### Relationship summary

- one reporting period has many project-week records
- one project-week record may have zero, one, or many inspection events
- one inspection event may have zero, one, or many findings
- one finding may have zero, one, or many corrective actions

## Key derived behaviors

- weekly project score = average of inspection-event scores for that project/week
- weekly project notes = rollup or curated summary of inspection-event notes/findings
- project-week status can distinguish:
  - no inspection uploaded yet
  - inspection(s) uploaded / processing
  - completed
  - review required
  - published

## Existing weekly score workbook pattern under replacement

The weekly workbook currently behaves like this:

- columns represent weeks
- each project occupies a score row
- the row beneath contains freeform notes
- some weekly cells contain one score
- some weekly cells contain multiple scores in one string such as `92.2% + 93.3%`
- those compound cells mean **multiple inspections occurred in the same week**

That confirms the correct system design is **not** one opaque weekly score field. It is an inspection-event model with a project-week rollup.

## Release 1 data ownership split

### Safety site owns

- upload UX
- submission queue UI
- upload library
- review / retry experience
- user-facing workflow surface

### HBCentral owns

- structured safety records
- cross-list relationships to Projects / Legacy Registry
- publishing snapshots
- trendable history
- downstream consumable model

## Exact checklist-template contract

A dedicated workbook contract is documented in `03A-Checklist-Template-Contract.md`.

Highlights:

- workbook sheets:
  - `ScoreCard`
  - `ScoringWeights`
- top metadata block:
  - date
  - project/site
  - inspection number
  - auto summary values
- response matrix columns:
  - Item
  - Yes
  - No
  - N/A
  - Notes
  - Score
  - Inspection Flag
- weighted section score rollup
- explicit formula behavior
- explicit parser rules
- explicit note on row-band mismatches in the current workbook formulas

## Recommendation

Adopt this design as the governing Release 1 structure. Do **not** revert to a browser spreadsheet or a one-list weekly form.
