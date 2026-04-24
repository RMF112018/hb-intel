# Prompt 02 — Establish Foleon SPFx Package Identity

## Objective

Create or verify the governed `hb-intel-foleon` SPFx app package with correct manifest identity, Vite IIFE output, global registration, and build-pipeline registration.

## Governing Authorities

- Microsoft SPFx client-side webpart guidance
- Existing HB Intel package-truth patterns in `tools/build-spfx-package.ts`
- Existing app package patterns under `apps/hb-homepage`, `apps/hb-publisher`, `apps/safety`, and `apps/hb-webparts`

## Files / Seams to Inspect

- `apps/hb-intel-foleon/**`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/**`
- `dist/sppkg/**`
- app `vite.config.ts`
- app manifest file
- app mount file

## Current Gap

No inspectable Foleon app/package exists on `main`, and the governed packaging registry does not include a Foleon domain.

## Required Implementation Outcome

- Add `apps/hb-intel-foleon` using repo-standard Vite/SPFx conventions.
- Emit `dist/foleon-app.js` as an IIFE.
- Bind runtime to `window.__hbIntel_foleon`.
- Add manifest id `2160edb3-675e-4451-92bb-8345f9d1c71e` unless repo governance requires a revised ID.
- Set package version explicitly and document it.
- Register the Foleon domain in `tools/build-spfx-package.ts` with package-truth verification.
- Ensure no Foleon API secrets, preview URLs, or test-only domains are bundled in production.

## Proof of Closure

- Build command output.
- Typecheck output.
- Test output.
- `.sppkg` path and SHA.
- Bundle SHA and manifest GUID proof.
- Search proof that production bundle contains expected marker and excludes secrets/preview URLs.

## Non-Negotiable Instructions for the Local Code Agent

- Use the live repo's `main` branch as the source of truth unless the prompt explicitly tells you to investigate an unmerged branch/commit.
- Do not protect weak patterns because the UI renders, the package builds, or prior summaries said the MVP landed.
- Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes outside the stated Foleon scope.
- Provide proof of closure with exact commands, files changed, and artifacts generated.
- If repo truth contradicts this prompt, stop and report the contradiction clearly before changing code.
