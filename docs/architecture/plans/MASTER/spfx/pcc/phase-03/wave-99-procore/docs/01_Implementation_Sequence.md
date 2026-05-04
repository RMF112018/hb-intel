# Implementation Sequence

## 13A — Repo Truth and Scope Lock

Audit repo state, identify current Wave 13 implementation status, and create the Procore data-layer remediation scope lock.

## 13B — HB Central Projects Registry and Procore Mapping Contract

Implement shared mapping contracts and fixtures, anchored to the HB Central `Projects` schema but not overloading `Projects.procoreProject`.

## 13C — Shared Procore Data Layer Models and Fixtures

Add model-level types, deterministic fixtures, utilities, and tests for source lineage, object links, curated summaries, sync health, freshness, and derived signals.

## 13D — Backend Mock Adapter Boundary

Add mock-only backend provider interfaces and read-model routes where needed. No live Procore calls.

## 13E — SPFx Fixture Integration

Wire fixture/read-model displays into Project Home, Priority Actions, Project Readiness, External Systems, and Site Health. Do not introduce live runtime.

## 13F — Cross-Module Remediation and Closeout

Patch module docs/tests/surfaces for Waves 6-13, validate, close out, and produce the next live-read readiness gate.
