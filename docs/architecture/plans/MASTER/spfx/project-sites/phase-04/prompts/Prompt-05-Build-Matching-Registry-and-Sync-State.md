# Prompt 05 — Build Matching, Registry, and Sync State

## Objective
Turn raw discovery records into governed fallback records by implementing project-number parsing, normalized title comparison, match confidence classification, deterministic upsert rules, and stale/sync-state handling across all configured annual sources.

## Current gap to close
Discovery alone is not enough. The bridge needs a reliable way to associate legacy folders with project identity and distinguish between confident matches and records that require human review.

## Governing files and authorities

Inspect and align to:

- `00-Legacy-Project-Fallback-Bridge-Spec-and-Implementation-Plan.md`
- `01-Implementation-Waves.md`
- output of Prompts 01 through 04
- live `project-sites` project identity and normalization seams

## Required repo inspection areas

Inspect the correct live repo seams for:

- project identity fields and normalization
- existing matching / normalization utilities worth reusing
- registry write/update patterns
- sync-run logging patterns
- whether additional HBCentral registry fields or field alterations are required by the final matching model

## Required implementation outcome

Implement the matching layer and registry maturity needed to support application integration.

Required capabilities:

1. parse project numbers from folder names using the approved regex family
2. normalize folder/project names for comparison
3. attempt deterministic project matching
4. classify each record by `MatchStatus`, `MatchConfidence`, and `MatchMethod`
5. preserve unmatched and ambiguous records cleanly
6. support all configured annual sources, not just pilot years
7. maintain durable upsert identity using `DriveId + DriveItemId`
8. support inactive/stale handling for records that disappear or stop resolving
9. apply any required HBCentral list field additions or alterations if the governed model needs them

## Required implementation details

- High-confidence auto-bind must be project-number first.
- Do not silently force weak heuristic matches.
- Route ambiguous records to `NeedsReview`.
- Preserve provenance fields from discovery.
- Preserve run metadata and last-seen / last-validated timestamps.
- Keep matching logic separated from the SPFx app layer.
- Make the matching utilities testable.
- If the registry schema must evolve, alter the HBCentral list through the repo's provisioning path instead of leaving schema drift.

## Proof of closure

Provide:

- exact files added or modified
- the final parser and confidence rules as implemented
- examples of:
  - a high-confidence matched record
  - a needs-review record
  - an unmatched record
- evidence that all in-scope years can be processed by the pipeline
- summary of any HBCentral schema changes applied in this prompt
- summary of any known edge cases deferred to review workflow instead of hidden by logic

## Constraints

- Do not wire UI launch behavior yet.
- Do not add admin review screens yet.
- Do not reduce ambiguity by forcing incorrect auto-matches.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
