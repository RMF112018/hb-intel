# SPFx Packaging Toolchain — Node Runtime Prerequisites

**Audience:** anyone running `tools/build-spfx-package.ts` locally or
in CI to produce `hb-publisher.sppkg` / `hb-webparts.sppkg`.

## Why two Node runtimes

The HB Intel monorepo runs the packaging orchestrator under the
repo's main Node runtime (the root `package.json` declares
`engines.node: ">=20"`). Inside that orchestrator, the SPFx gulp
toolchain must run under **Node 18.17.1 ≤ v < 19.0.0** because
`@microsoft/sp-build-web@1.18.0` (see
`docs/reference/developer/spfx-baseline.md` §1a for the governed
baseline) requires it. The shell subproject's own
`tools/spfx-shell/package.json` encodes this as
`engines.node: ">=18.17.1 <19.0.0"`.

The orchestrator bridges this by invoking `gulp bundle --ship` and
`gulp package-solution --ship` through an explicit Node 18 binary
rather than inheriting the caller's PATH. This is why two runtimes
are needed simultaneously: Node 20+ executes the orchestrator; Node
18.x runs gulp.

## How the orchestrator finds Node 18

`tools/build-spfx-package.ts` runs a preflight that tries five
strategies in order and uses the first one that reports a Node
`v18.17.x..<v19` version:

| # | Strategy | Notes |
|---|----------|-------|
| 1 | `HB_INTEL_NODE18_BIN` env var | Explicit operator override. If set but rejected, the run **fails fast** — no fallback — because the override is authoritative. |
| 2 | `command -v node18` | Matches systems with a dedicated `node18` shim on PATH. |
| 3 | `command -v node` | Used when the caller already has a Node 18.x shell active (e.g. via `nvm use 18`). |
| 4 | `~/.nvm/versions/node/v18.*/bin/node` | Highest patch of any installed 18.x; works independent of the specific patch version nvm currently serves. |
| 5 | `/opt/homebrew/opt/node@18/bin/node`, `/usr/local/opt/node@18/bin/node`, `/usr/local/n/versions/node/18.*/bin/node` | Common package-manager install paths on macOS/Linux. |

On success, the orchestrator prints:

```
✓ SPFx packaging toolchain: Node v18.20.8 at /.../bin/node (source: <strategy>)
```

On failure (or when the env override is rejected), it prints a
structured diagnostic listing each attempt with the reason it was
rejected, plus a remediation block, and exits with code `1` **before
any gulp command runs**.

## Remediation

If preflight reports no Node 18 available, install one of:

- **nvm** (cross-platform, recommended):
  ```sh
  nvm install 18
  nvm use 18
  # then re-run the packager; the nvm-glob strategy will find it
  ```
- **Homebrew** (macOS):
  ```sh
  brew install node@18
  ```
- **Direct download**: https://nodejs.org/en/download/releases → pick
  any `v18.17.x`+ and put the `bin/node` path into
  `HB_INTEL_NODE18_BIN`:
  ```sh
  export HB_INTEL_NODE18_BIN=/opt/node-v18.20.8/bin/node
  ```

## CI considerations

- Jobs that build the `.sppkg` must provision Node 18 (e.g. via an
  `actions/setup-node` step with `node-version: '18.20.x'` or by
  pre-installing `node@18`).
- The CI orchestrator still runs under the job's default runtime;
  Node 18 only needs to be *reachable* by one of the five strategies.
- Setting `HB_INTEL_NODE18_BIN=$NODE_18_BIN` in the CI step where the
  exact binary path is already known is the most deterministic
  option.

## Related

- `docs/reference/developer/spfx-baseline.md` — governed SPFx
  dependency baselines (shell 1.18.0 exact, apps ^1.20.0).
- `apps/hb-publisher/deployment/README.md` — operator runbook for
  installing + deploying the Publisher package.
