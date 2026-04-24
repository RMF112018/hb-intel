# Prompt 04 — Release Verification and Readiness Probes

## Objective

Add deterministic verification that the shipped Safety SPFx package is correctly bound to the intended backend and route surface.

## Governing authorities

- `apps/safety/src/runtime/safetyRuntimeContract.ts`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.manifest.json`
- `apps/safety/vite.config.ts`
- SPFx package build scripts
- `backend/functions/src/functions/health/ready.ts`
- `backend/functions/src/functions/adminApi/safety-record-keeping-routes.ts`

## Current gap

Runtime binding proof exists on `window`, and health/ready proof is query-param gated. There is not yet a standard release verification flow that proves live package-to-backend correctness.

## Required implementation outcome

- Add release verification script/runbook proving Safety manifest ID/version, IIFE runtime binding authority, hosted runtime binding proof, backend liveness/readiness posture, expected preview/ingest/replay route availability, API audience, and permission grant.
- Keep `/api/health/ready` admin-gated.
- Do not expose privileged readiness detail to ordinary users.

## Proof of closure

- Script output example or documented command sequence.
- Tests for runtime binding proof shape.
- Clear operator runbook.

## Additional instruction

Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
