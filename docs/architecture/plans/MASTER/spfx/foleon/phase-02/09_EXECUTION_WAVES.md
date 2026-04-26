# Execution Waves

## Wave 01 — Schema and Contracts

Scope:

- content type choices;
- reader key / cadence / slot fields;
- placement key choices;
- frontend types;
- backend DTOs;
- schema constants;
- Feature Framework XML;
- docs/reference schema updates;
- no public UI behavior yet.

Exit criteria:

- schema tests pass;
- backend/frontend type checks pass;
- no runtime route change;
- no package deploy yet unless needed for schema validation.

## Wave 02 — Public Reader Services

Scope:

- reader configs;
- scalar-safe public reader query service;
- active record resolution;
- placement alignment logic;
- preview/blocked resolution model;
- no UI iframe rendering yet beyond tests.

Exit criteria:

- service tests prove Project Spotlight and Company Pulse resolution.
- no person field public select.
- no preview-on-error behavior.

## Wave 03 — Reader Module UI

Scope:

- `FoleonReaderModule`;
- `ProjectSpotlightReader`;
- `CompanyPulseReader`;
- route integration;
- toolbox entries;
- responsive behavior;
- preview states;
- telemetry contexts.

Exit criteria:

- both routes render.
- iframe host reused.
- mobile does not eagerly mount both iframes.
- tests pass.

## Wave 04 — Manager Workflows

Scope:

- Manager fields;
- lane presets;
- active edition warnings;
- placement lane validation;
- backend validation;
- Manager tests.

Exit criteria:

- Manager can edit new fields.
- no silent data loss.
- active lane validation works.

## Wave 05 — Docs, Package Proof, Tenant Rollout

Scope:

- version bump;
- docs/runbook;
- package proof;
- tenant schema migration runbook;
- App Catalog deployment instructions;
- tenant validation checklist.

Exit criteria:

- build/package proof passes.
- package is deployment-ready.
- tenant rollout path is explicit.
