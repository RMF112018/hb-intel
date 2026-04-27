# Prompt 04 — forbidden and approved copy scans

Scans use **ripgrep** (`rg`). **Source** scans target implementation code (excluding reliance on unrelated docs trees unless explicitly included).

## Exact forbidden fragments (requested list)

| Fragment |
| --- |
| `Leadership Message Reader` |
| `Leadership Message reader` |
| `Preview layout` |
| `Sample executive byline` |
| `Sample role` |
| `Sample pull quote` |
| `Sample audience` |
| `Cadence` |
| `Archive group` |
| `Executive byline not provided` |
| `not been provided` |
| `no-embed-url` |
| `embed-not-allowed` |
| `requires-external-open` |

## A) Source scan — `packages/foleon-reader/src`

**Purpose:** catch forbidden **employee-facing** copy before packaging.

Notable hits (expected / technical):

- **`Leadership Message Reader` / `Leadership Message reader`:** appear in **tests** (`expect` guards), forbidden-string lists, and **types** / **content service** literals (e.g. `homepageSlot` union in `packages/foleon-reader/src/types/foleon-content.types.ts`, `packages/foleon-reader/src/services/FoleonContentService.ts`) — **not** the same as visible Leadership briefing UI strings; follow-up hardening may migrate schema literals away from banned phrases.

**Command examples:**

```bash
rg -n -F "Leadership Message reader" packages/foleon-reader/src --glob '!**/__tests__/**'
rg -n -F "Preview layout" packages/foleon-reader/src
```

Document hit counts per fragment in your working tree when validating.

## B) Package scan — `hb-intel-homepage.sppkg`

Extract bundled JS:

```bash
unzip -p dist/sppkg/hb-intel-homepage.sppkg ClientSideAssets/hb-homepage-app-4b010aba.js > /tmp/hb-homepage-app.bundle.js
```

**Observed counts** (Prompt 04 run, minified single-line bundle):

| Fragment | Count | Notes |
| --- | ---: | --- |
| `Leadership Message reader` | 0 | |
| `Leadership Message Reader` | 1 | Likely **substring** of toolbox / product strings or legacy labels embedded with other homepage routes — **review** in hosted UI (may differ from employee-facing Leadership briefing surface). |
| `Preview layout` | 0 | |
| Sample family | 0 | |
| `Cadence` | 1 | May appear in **unrelated** homepage modules in the same megabundle — confirm not visible in Leadership lane only via hosted screenshot. |
| `Archive group` | 1 | Same caveat — multi-lane bundle. |
| `Executive byline not provided` | 0 | |
| `not been provided` | 1 | Possible generic substring in shared copy — verify hosted. |
| `no-embed-url` | 1 | **Structured disabledReason token** in viewer protocol — **not** employee-facing prose; expected in technical bundle. |
| `embed-not-allowed` | 1 | Same |
| `requires-external-open` | 1 | Same |

**Interpretation:** Raw `rg` on **minified omnibus homepage JS** cannot distinguish Leadership lane strings from other lanes or protocol enums. **Hosted** confirmation must show Leadership reader surface does not render forbidden employee copy — see `HOSTED_SCREENSHOT_INDEX.md`.

## Approved strings (positive grep targets)

Examples verified in extracted homepage bundle:

- `A message from leadership`
- `Leadership message preview`
- `Preview only`
- `Open in Foleon`
- `Read the leadership message`

## Secondary — `hb-intel-foleon.sppkg`

Same methodology on `ClientSideAssets/hb-intel-foleon-app-a6d4ef42.js`; Leadership + sibling lane keys present for consumer proof — see `PACKAGE_PROOF.md`.
