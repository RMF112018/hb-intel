# Prompt 02 — Telemetry, Supportability, and Backend Event Seam

## Objective

Implement a production-oriented telemetry envelope with MVP SharePoint sink behavior and a clean transition path to `POST /api/foleon/events`.

## Governing Authorities

- HB Intel backend/API patterns
- Privacy/minimization principles
- Frontend observability best practices

## Files / Seams to Inspect

- `FoleonTelemetryService`
- telemetry event types
- SharePoint list write adapter
- future backend client interface
- Reader/highlights/hub event emitters
- tests

## Current Gap

Telemetry was not inspectable. The implementation must prove support usefulness without leaking sensitive data or blocking users.

## Required Implementation Outcome

- Define event envelope with event ID, event name/version, correlation ID, session ID, route, content ID, Foleon doc ID, package version, manifest ID, gate result, and sanitized error code.
- Use non-blocking best-effort SharePoint writes for MVP.
- Add abstraction that can switch to backend `POST /api/foleon/events` without changing route components.
- Strip or avoid full URLs, secrets, raw postMessage payloads, and unnecessary PII.

## Proof of Closure

- Tests for successful telemetry writes.
- Tests for non-blocking failures.
- Tests for payload redaction.
- README/runbook documenting event schema and privacy posture.

## Non-Negotiable Instructions for the Local Code Agent

- Use the live repo's `main` branch as the source of truth unless the prompt explicitly tells you to investigate an unmerged branch/commit.
- Do not protect weak patterns because the UI renders, the package builds, or prior summaries said the MVP landed.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes outside the stated Foleon scope.
- Provide proof of closure with exact commands, files changed, and artifacts generated.
- If repo truth contradicts this prompt, stop and report the contradiction clearly before changing code.
