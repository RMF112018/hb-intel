# P1-F1-T03: Raw, Normalized, Canonical, and Published Read-Model Architecture

## 1. Target Information Flow

The native integration backbone uses the following end-to-end information flow:

1. **Source acquisition**
2. **Raw custody**
3. **Normalized source-aligned records**
4. **Thin canonical mapping**
5. **Published operational read models**
6. **Downstream consumption through governed repositories or read-model services**

## 2. Layer Definitions

| Layer | Governing role | Custody target |
|---|---|---|
| Source acquisition | Pulls or receives external-system data | External source system |
| Raw custody | Stores source-native payloads or source-faithful records for replay and audit | Azure |
| Normalized source-aligned records | Produces queryable HB-owned records that stay close to source semantics | Azure |
| Thin canonical core | Maps shared identifiers, shared status vocabulary, and publication-ready fields without flattening all source semantics | Azure |
| Published operational read models | Produces downstream-consumable project/work/admin views | Azure by default; SharePoint permitted for selected transitional operational views |
| Downstream consumption boundary | Serves PWA, SPFx, query-hooks, and feature packages through governed reads | Published read models / governed repositories only |

## 3. Locked Custody Decisions

The following custody assignments are binding:

- Azure owns raw custody.
- Azure owns normalized source-aligned records.
- Azure owns replay.
- Azure owns reconciliation.
- Azure owns audit and provenance for connector-runtime layers.
- Azure owns canonical mapping.
- SharePoint may host selected published operational read models during transition.

## 4. Published Read-Model Boundary

The published read-model boundary means:

- feature packages consume published HB Intel views, not connector runtimes,
- read models may be surfaced through repositories, query-hooks, or other governed read surfaces,
- direct feature-package awareness of connector-specific source payloads is prohibited by default.

## 5. Design Rule: Thin Canonical Core

The canonical layer must stay thin. It exists to:

- align shared identity,
- align shared status and lifecycle concepts where necessary,
- support reconciliation and publication,
- enable cross-source read-model assembly.

It must not:

- erase source-specific semantics that remain important,
- force unrelated systems into one oversized schema,
- duplicate all normalized source fields into a fake universal model.

## 6. Implementation Consequence

Future implementation must replace current mock PWA query seams and unreconciled route contracts with this published-read-model posture, while preserving the current repo's useful normalization and publication precedents.
