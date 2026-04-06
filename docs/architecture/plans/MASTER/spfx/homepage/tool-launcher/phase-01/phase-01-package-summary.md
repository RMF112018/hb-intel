# Phase 01 — Package Summary

## Phase Title

Live SharePoint List Wiring and Data Adapter Foundation

## Objective

Replace the current Tool Launcher grouped local-config intake with a typed, normalized, SharePoint-backed content adapter targeting the already-created list **`Tool Launcher Contents`**.

## What has already been solved

- the SharePoint list already exists
- the list is already seeded
- the platform fields have already been conceptually defined
- the launcher already exists as a webpart in the homepage lane
- the current grouped local-config seam is already identifiable in repo truth

## What this phase must solve

- discover and verify the actual live field names
- create a stable launcher record model for the UI
- normalize SharePoint field names and raw values into that model
- bind the webpart to live list data
- preserve graceful fallback behavior when values are missing or partial

## Key repo constraints

- keep work within the homepage lane
- preserve `@hbc/ui-kit/homepage` import discipline
- do not regress the cumulative `hb-webparts` package
- avoid overloading shared kit with business-specific list logic too early

## Required outputs

1. live field map
2. normalized launcher model
3. adapter/service wiring
4. webpart binding proof
5. partial-data fallback proof
6. updated docs / implementation notes

## Dependencies

Phase 00 should be complete or otherwise understood and treated as locked.

## Primary risks

- assuming SharePoint field names rather than validating them
- preserving the local grouped-config seam as a hidden long-term dependency
- mixing business-specific content mapping directly into shared UI primitives
- failing partial-data states when list records are incomplete
