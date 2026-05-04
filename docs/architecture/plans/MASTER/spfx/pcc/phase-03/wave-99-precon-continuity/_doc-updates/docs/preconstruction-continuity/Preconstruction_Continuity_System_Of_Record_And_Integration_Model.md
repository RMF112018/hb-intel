# Preconstruction Continuity System Of Record And Integration Model

## Purpose

Define source-of-record boundaries for Preconstruction Continuity under the implemented unified lifecycle layer.

## System Of Record Rules

| Data Family | Source Of Record | PCC Posture |
|---|---|---|
| Go / No-Go source decision | BD / Pursuit source workflow or approved source template | read-only carry-forward projection after GO |
| Original source templates | repo reference templates / source files | field inventory and evidence only |
| Project Memory contribution | PCC | derived, source-lineage-backed summary |
| Traceability edges | PCC | PCC-native relationship metadata, source-lineage-backed |
| Estimating Kickoff future workflow state | PCC after future implementation | later-phase PCC-native workflow |
| Evidence binary files | Document Control / SharePoint / approved source | PCC stores references only |
| CRM/Unanet opportunity records | CRM/Unanet | future-gated reference only |
| Procore records | Procore | future-gated reference only |
| Sage accounting truth | Sage | no accounting posting; future-gated summary only |
| HBI answer/refusal | PCC/HBI runtime after future gate | derived, not source-of-record |

## Integration Posture

This documentation package authorizes no live integration.

Future integrations must be:

- backend-mediated;
- read-only by default;
- least-privilege;
- permission-filtered;
- audited;
- cache/stale-state controlled;
- source-lineage mapped;
- blocked from writeback unless separately approved.

## Microsoft Graph / SharePoint

Allowed in this package:

- documentation of future evidence-link posture;
- source-lineage concepts;
- no runtime calls.

Not allowed:

- Graph calls;
- SharePoint REST/PnP calls;
- tenant mutation;
- file upload/download/sync ownership.

## CRM / Unanet / BD Systems

Allowed:

- future source-system reference model;
- source-owned opportunity and pursuit-decision posture.

Not allowed:

- live CRM/Unanet integration;
- opportunity mutation;
- automatic project setup.

## Procore / Sage / Autodesk / BuildingConnected

Allowed:

- future source-system relationship references only.

Not allowed:

- live API calls;
- writeback;
- mirrors;
- bid platform clone;
- accounting postings.

## HBI / Unified Search

Allowed:

- documentation of future HBI eligibility, citations, refusal, and permission filtering.

Not allowed:

- live LLM/vector/search runtime;
- uncited summaries;
- source-of-truth claims;
- restricted-content summarization.

## Degraded State Rules

If source data is missing, stale, unavailable, unauthorized, or restricted:

- PCC should show safe degraded posture;
- HBI must refuse or qualify;
- hidden content must not leak through summaries;
- source-system links must not bypass user permissions.
