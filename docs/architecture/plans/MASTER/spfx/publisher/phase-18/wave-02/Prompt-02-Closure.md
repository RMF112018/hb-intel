# Phase 18 Wave 02 — Prompt 02 Closure

**Status:** Closed
**Closure date:** 2026-04-16
**Manifest bump:** `hb-publisher` `1.0.0.65` → `1.0.0.66`
**Scope:** Replace the hardcoded `~/.nvm/…/v18.20.8/bin/node` default
with a deterministic Node 18 resolver + operator-facing prerequisite
doc.

## What was fragile

`tools/build-spfx-package.ts` defaulted `NODE18_BIN` to
`$HOME/.nvm/versions/node/v18.20.8/bin/node` — a path that only
exists on one specific workstation layout. Clean workstations and
CI without that exact nvm patch version would silently produce a
broken gulp command, failing late with a cryptic `ENOENT` instead of
an actionable preflight error. The only escape hatch was
`HB_INTEL_NODE18_BIN`, and nothing validated it actually resolved
to a Node 18.x binary.

## What changed

### `tools/build-spfx-package.ts`

- Removed the `$HOME/.nvm/versions/node/v18.20.8/bin/node`
  hardcoded default. `NODE18_BIN` is now a `let` binding populated
  at preflight time by `resolveNode18Binary()`.
- Added a five-strategy resolver that tries, in order:
  1. `HB_INTEL_NODE18_BIN` env var (authoritative — if set and
     rejected, fails immediately without fallback).
  2. `command -v node18` on PATH.
  3. `command -v node` on PATH, when it reports `v18.17.x..<v19`.
  4. Highest-patch `~/.nvm/versions/node/v18.*/bin/node` present
     (resilient to nvm advancing past 18.20.8).
  5. `/opt/homebrew/opt/node@18/bin/node`,
     `/usr/local/opt/node@18/bin/node`, and the
     `/usr/local/n/versions/node/18.*/bin/node` glob.
- Every candidate is probed with `<binary> --version` and accepted
  only if the output matches `v18.<minor>.<patch>` with `minor ≥ 17`.
- On success the orchestrator prints a single line identifying
  which Node 18 won and why (visible audit trail):
  ```
  ✓ SPFx packaging toolchain: Node v18.20.8 at /…/bin/node (source: ~/.nvm/versions/node/v18.*/bin/node)
  ```
- On hard failure it prints a structured diagnostic that lists each
  attempted strategy, why it was rejected, plus remediation
  commands (`nvm install 18`, `brew install node@18`, or setting
  `HB_INTEL_NODE18_BIN`), and exits with code `1` *before* any gulp
  call.
- `run()` now asserts `NODE18_BIN !== ''` when `useNode18: true` is
  requested, catching any future regression where the preflight is
  skipped.

### New doc: `docs/reference/developer/spfx-packaging-toolchain.md`

~70 lines explaining:
- Why two Node runtimes (Node 20+ for the orchestrator, Node 18.x
  for the SPFx gulp toolchain via
  `@microsoft/sp-build-web@1.18.0`).
- The five resolver strategies and their order.
- The override semantics of `HB_INTEL_NODE18_BIN`.
- Remediation commands for nvm, Homebrew, and direct install.
- CI considerations (`setup-node@18`, setting the override
  explicitly).

### Cross-links

- `docs/reference/developer/spfx-baseline.md` §1a — new "Node
  runtime prerequisite" subsection pointing to the toolchain doc.
- `apps/hb-publisher/deployment/README.md` — new "Prerequisites for
  building the package" section before the deployment steps,
  pointing to the toolchain doc.

## Verification

1. **Happy path** — `npx tsx tools/build-spfx-package.ts --domain hb-publisher`:
   ```
   ✓ SPFx packaging toolchain: Node v18.20.8 at /.../v18.20.8/bin/node (source: ~/.nvm/versions/node/v18.*/bin/node)
   ✓ SPFx baselines: shell=1.18.0 exact (7 pkgs), apps=^1.20.0 (hb-publisher, hb-webparts)
   ```
   All four package-truth checks + all four hosted-load proof
   checks pass. `hb-publisher.sppkg` still 355.1 KB.
2. **Webparts regression gate** — `npx tsx tools/build-spfx-package.ts --domain hb-webparts`:
   Preflight green, all four package-truth checks pass, `hb-
   webparts.sppkg` still 3180.3 KB.
3. **Failure-path proof** —
   `HB_INTEL_NODE18_BIN=/nonexistent/node npx tsx tools/build-spfx-package.ts --domain hb-publisher`:
   exits with code `1`, prints the structured diagnostic
   (`HB_INTEL_NODE18_BIN is set but rejected`, the attempted path
   + rejection reason, remediation block, doc pointer), and does
   **not** invoke gulp. No raw `ENOENT` leaked.
4. **User-path independence** —
   `grep -nE 'v18\.20\.8|\.nvm/versions/node/v' tools/build-spfx-package.ts`
   returns only a single hit on line 1409: the string label
   `'~/.nvm/versions/node/v18.*/bin/node'` used to describe the
   glob pattern to the operator. No hardcoded binary path
   survives.
5. **Standalone `tsc --noEmit`** on the orchestrator: clean.

## Out of scope

- Auto-installing Node 18 (we fail actionably; we don't mutate the
  operator's toolchain).
- Upgrading the SPFx shell baseline (see `spfx-baseline.md`
  change-control procedure).
