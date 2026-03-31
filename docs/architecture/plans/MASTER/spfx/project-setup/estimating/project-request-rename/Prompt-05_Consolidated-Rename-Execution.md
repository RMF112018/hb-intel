# Prompt 05 — Consolidated rename execution

You are working in the authoritative implementation repository for HB Intel:

`https://github.com/RMF112018/hb-intel.git`

## Objective

Rename the current SPFx app currently treated as the “Estimating” app into **Project Setup Requests**, and fully separate its identity from the future Estimating SPFx app.

## Critical intent

- The current Project Setup Requests SPFx app must no longer be named, packaged, documented, or architecturally represented as the Estimating app.
- The final `.sppkg` and all package-facing metadata must reflect **Project Setup Requests**.
- The renaming effort must update SPFx/package identity, app-facing labels, docs, architecture maps, plan files, and release/readiness artifacts as needed.
- Docs defining the Estimating SPFx app should be updated to remove the Project Requests feature and reflect the new app separation.
- Architecture maps should be updated to reflect separation between:
  - Project Setup Requests app
  - future Estimating app
  - Accounting app
  - Admin app
  - shared provisioning/saga backbone

## Critical instructions

- Treat live repo truth as authoritative.
- Do not re-read files that are already in your active context or memory unless needed to verify a contradiction or retrieve exact evidence.
- Preserve existing Project Setup functionality and scope.
- Do not broaden this app back into a general Estimating shell.
- Be careful and deliberate with SPFx package identity and GUID-backed changes.
- If any rename remnants are intentionally deferred, document them explicitly.

## Required working approach

1. Audit the full rename blast radius.
2. Implement the app/package/runtime rename.
3. Update docs, plans, and architecture maps.
4. Run final verification and summarize deployment/package implications.

## Required output

1. Rename impact audit
2. Implemented code/package changes
3. Implemented docs/architecture changes
4. Final verification report
5. Explicit list of:
   - changed SPFx/package identity items
   - changed runtime/app naming items
   - changed docs/maps
   - deferred rename remnants
   - deployment-impact notes
