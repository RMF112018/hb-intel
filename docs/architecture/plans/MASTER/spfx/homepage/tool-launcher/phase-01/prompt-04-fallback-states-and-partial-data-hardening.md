# Prompt 04 — Fallback States and Partial-Data Hardening

## Objective

Harden the live-list-backed Tool Launcher implementation so it behaves safely and professionally when list values are incomplete, stale, or partially missing.

## Required stance

- repo truth first
- do not re-read files still in your current context unless needed
- preserve doctrine requirements for empty/loading/error behavior and authoring safety
- do not turn this into a broad visual redesign phase

## Required hardening areas

Review the new live-data path and harden all meaningful cases including:

1. **No data**
   - list returns zero active items

2. **Partial record**
   - required launch metadata exists but supporting metadata is missing

3. **Logo degradation**
   - official logo asset missing
   - dark logo missing
   - preferred logo type missing
   - fallback strategy required

4. **Grouping / shelf degradation**
   - workflow shelf missing
   - category missing
   - featured flags missing
   - sort values missing

5. **Support / utility degradation**
   - help link missing
   - support owner missing
   - access request destination missing

6. **Notice / status degradation**
   - partial notice fields
   - expired notice
   - malformed badge tone

7. **Authoring / host safety**
   - edit mode
   - slow load
   - configuration mismatch
   - unexpected list item shape

## Required output

1. code changes for hardening
2. a markdown file named:
   - `phase-01-hardening-notes.md`

The notes file must include:

### 1. Hardened scenarios
### 2. Fallback rules by scenario
### 3. User-facing outcome for each scenario
### 4. Authoring / edit-mode notes
### 5. Remaining deferred work for later phases

## Additional instruction

Where the asset manifest already establishes the preferred brand-fallback direction, use it rather than inventing a new fallback system.
