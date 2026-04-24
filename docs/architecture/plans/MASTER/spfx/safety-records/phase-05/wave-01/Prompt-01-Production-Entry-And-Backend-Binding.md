# Prompt-01-Production-Entry-And-Backend-Binding.md

## Objective

Make the Safety frontend’s production runtime contract unambiguous and fail-closed when backend binding is incomplete.

## Governing authorities

- `apps/safety/src/App.tsx`
- `apps/safety/src/mount.tsx`
- `apps/safety/src/webparts/safety/SafetyWebPart.tsx`
- `apps/safety/vite.config.ts`
- `apps/safety/src/runtime/hostedSafetyGuidBinding.ts`
- `backend/functions/README.md`
- Microsoft Learn guidance on SPFx Entra-secured API access (`AadHttpClient` / token acquisition patterns)

## Current gap to close

Repo truth currently has two materially different production entry models:
- direct SPFx webpart render
- shell/IIFE mount render

The IIFE path accepts `functionAppUrl` and `apiAudience`.
The direct SPFx webpart path does not pass them.

That means the app can render in sharepoint mode without the backend config required for authenticated ingest/replay.

## Required implementation outcome

1. Choose one authoritative production runtime path for Safety, or make both paths share one explicit config contract.
2. In production sharepoint mode, backend command configuration must be required, not best-effort.
3. If backend binding is absent or malformed, the app must fail loudly with an operator-truthful configuration state — not fall into a pseudo-working surface.
4. Add a narrowly scoped runtime/config verification seam that proves:
   - backend base URL is present,
   - API audience is present,
   - host mode is known,
   - hosted GUID overlay state is known,
   - command surfaces cannot initialize without those requirements.

## Exact seams / files / symbols to inspect

- `App`
- `mount`
- `SafetyWebPart`
- repository creation in `App`
- any Safety packaging/build output assumptions in `vite.config.ts`
- hosted binding overlay usage

## Proof of closure required

- code diff showing one authoritative runtime contract
- sharepoint-mode startup proof that missing backend config produces a truthful blocked/configuration state
- tests covering direct SPFx path and shell/IIFE path (if both remain)
- explicit statement of which runtime path is the source of truth after the change

## Prohibitions

- do not rewrite unrelated Safety pages
- do not touch non-Safety apps
- do not add vague TODO placeholders instead of closure
- do not preserve the current ambiguity just because both paths “can be made to work”

Do not re-read files that are already in your active context unless you need to confirm drift, a dependency, or uncertainty after making changes.

Stay strictly inside the Safety frontend / shared Safety package / directly related packaging-runtime seams. Do not wander into unrelated homepage, admin, accounting, or non-Safety work.
