# @hbc/spfx-hb-shell-extension — HB Central Shell Extension

The shell-extension product lane (Lane B) for HB Intel's SharePoint presence. Renders into supported SharePoint placeholder regions only — no suite-bar replacement, no app-bar takeover, no unsupported DOM manipulation.

## Architecture

This package is **Lane B** (Shell Extension Product) in the [three-lane SharePoint architecture](../../docs/reference/sharepoint-homepage-shell-boundaries.md). It owns supported shell-adjacent rendering through SPFx Application Customizer extensions.

**It does not own:**
- Homepage page-canvas content (Lane A — `apps/hb-webparts`)
- Navigation / branding governance (Lane C — SharePoint admin config)
- Suite bar, app bar, or native SharePoint chrome

## Placeholder Regions

| Region | Purpose | Status |
|--------|---------|--------|
| **Top** | Top ribbon utilities + alert/notification band | Scaffold — P04-02 |
| **Bottom** | Footer rail + support band | Scaffold — P04-03 |

## Mount Seam

`src/mount.tsx` exports the shell-extension API on `globalThis.__hbIntel_hbShellExtension`:

| Function | Purpose |
|----------|---------|
| `mountTop(el)` | Render top placeholder content into the provided element. Safe no-op if `el` is null. |
| `mountBottom(el)` | Render bottom placeholder content into the provided element. Safe no-op if `el` is null. |
| `unmountTop()` | Clean up top placeholder React root. |
| `unmountBottom()` | Clean up bottom placeholder React root. |

The SPFx Application Customizer calls these functions with the placeholder DOM elements obtained from `this.context.placeholderProvider.tryCreateContent()`.

## Import Policy

Shell-extension surfaces use `@hbc/ui-kit/app-shell` as their primary UI entry point. Enforced by ESLint `no-restricted-imports`.

| Entry Point | Status |
|-------------|--------|
| `@hbc/ui-kit/app-shell` | **Allowed — Primary** |
| `@hbc/ui-kit/theme` | Allowed — supplementary tokens |
| `@hbc/ui-kit/icons` | Allowed — supplementary icons |
| `@hbc/ui-kit` | Prohibited |
| `@hbc/ui-kit/homepage` | Prohibited — belongs to Lane A |

## Package Structure

```
src/
├── mount.tsx                    # Mount/unmount seam (SPFx entry contract)
├── test-setup.ts                # Vitest setup
├── placeholders/
│   ├── types.ts                 # Placeholder types and config
│   ├── TopPlaceholder.tsx       # Top placeholder component
│   ├── BottomPlaceholder.tsx    # Bottom placeholder component
│   └── index.ts                 # Barrel export
└── __tests__/
    └── shellExtension.test.ts   # Structural + import discipline tests
```

## Scripts

```bash
pnpm --filter @hbc/spfx-hb-shell-extension check-types
pnpm --filter @hbc/spfx-hb-shell-extension lint
pnpm --filter @hbc/spfx-hb-shell-extension build
pnpm --filter @hbc/spfx-hb-shell-extension test
```

## Related Documents

- [SharePoint Homepage & Shell Boundaries](../../docs/reference/sharepoint-homepage-shell-boundaries.md)
- [UI Kit Entry Points](../../docs/reference/ui-kit/entry-points.md)
- [Tenant Shell Implementation Blueprint](../../docs/architecture/blueprint/sharepoint-shell/HB_Webparts_Tenant_Shell_Implementation_Blueprint.md)
