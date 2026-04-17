# 07 — Embed HB Kudos

## Objective

Embed `HbKudos` into `hb-homepage` without regressing its workflow richness, safety logic, or recognition quality.

## Files changed

| File | Change |
|------|--------|
| `src/webparts/hbHomepage/zones/HbKudosZone.tsx` | Created. Extracts `hbKudos` config slice, passes `identity`, `assetBaseUrl`, `getGraphToken` to module. |
| `src/webparts/hbHomepage/HbHomepageShell.tsx` | Distributes `getGraphToken` via `zoneProps` to HbKudos zone. |

## Embedded-shell contract decision

**No explicit embedded-shell mode was added.** The existing `HbKudos` component API is sufficient for shell composition:

- `HbKudos` already accepts all context via optional props (`config`, `identity`, `assetBaseUrl`, `getGraphToken`)
- `HbKudos` already handles its own internal state management (data fetching, composer, panels, feed, article reader)
- `HbKudos` already uses `useHostSafeLayout` for persistent assistant overlay non-intersection
- The shell only needs to pass context through — no mode flag or embedded contract needed

**Evidence:** The module's props interface (`HbKudosProps`) is identical to what mount.tsx already passes. The zone wrapper extracts the same props from the shell context. No behavioral change is required.

## Shell-owned responsibilities

- Zone placement (position 5 in the shell)
- Outer spacing (shell CSS gap)
- Section aria labeling (`aria-label="HB Kudos"`)
- Error boundary (fault isolation from other zones)

## HbKudos internal responsibilities preserved

- Featured spotlight + recent recognition rail
- Typed-recipient submission via composer flyout
- Archive browse with configurable age-off
- Role-safe article reader
- Discard-draft confirmation dialog
- Celebrate action with Graph photo hydration
- Host-safe layout (persistent assistant overlay non-intersection)
- All internal state management (detail entry, composer state, archive search, feed open, celebrating)

## Split-runtime contract protection

- `kudosRuntimeContract.ts` unchanged — ownership map intact
- HbKudosCompanion not modified, not imported, not referenced
- Governance queue, patch planning, approval dispatch remain companion-owned
- Shared CSS modules and governance primitives not altered

## Behavior intentionally preserved unchanged

- `kudosListHostUrl` override: in mount.tsx, `storeKudosListHostUrl` is called from the `webPartProperties` level before dispatch. The shell's HbKudos zone receives config from the shell-level config blob. The global kudos list host URL is already stored by mount.tsx before any renderer runs — this continues to work.
- Graph token provision: `getGraphToken` is passed through from mount context → shell → zone → HbKudos, identical to standalone path.
- Photo hydration: `useRecipientPhotoHydration` and `useGraphPersonPhotoFn` hooks within HbKudos consume `getGraphToken` directly — no change needed.

## Compile verification

- `check-types` passes
- `build` succeeds

## Residual risks before mount/packaging

None. The module renders through the shell using the same props interface as standalone dispatch. Mount registration and packaging integration are the remaining steps.
