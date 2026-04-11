# Prompt 00 — Operating Instructions for the Local Agent

## Objective

Use this file as the operating envelope for the entire prompt package.

## Prompt

```text
You are executing a staged gap-closure effort for the `hb-webparts` SPFx packaging/runtime path, with special focus on the PnP Operations webpart.

Global instructions:
- Work from live local repo truth.
- Do not re-read files that are still within your active context or memory window unless needed for precision.
- Avoid broad speculative refactors outside the packaging/render scope.
- When you change build/package logic, also change the verification/proof logic.
- Prefer deterministic, reviewable fixes over clever but opaque optimizations.
- Keep a clear distinction between:
  1. structural package validity
  2. package freshness
  3. source/package semantic alignment
  4. SharePoint live-runtime proof

Execution order:
1. Audit current state
2. Implement fresh-build enforcement
3. Implement stronger package-truth proofs
4. Close render-path / authoring gaps
5. Run final validation and produce closure report

Mandatory repo areas:
- `apps/hb-webparts/src/webparts/pnp/`
- `apps/hb-webparts/src/mount.tsx`
- `tools/build-spfx-package.ts`
- `tools/spfx-shell/src/webparts/shell/ShellWebPart.ts`
- `tools/spfx-shell/config/package-solution.json`
- `tools/spfx-shell/release/manifests/`

Expected result:
A fresh `hb-webparts.sppkg` that is materially harder to ship in a stale/drifted state, with direct proof outputs that future audits can trust.
```
