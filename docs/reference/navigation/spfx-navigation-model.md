# SPFx Navigation Model

Traceability: D-PH4C-24, D-PH4C-25 | Blueprint §2c | Foundation Plan PH4.14.5 / PH4B.10

## Runtime ownership

SPFx webparts do not use `HbcAppShell` for primary navigation composition. In SPFx mode, navigation is owned by `ShellLayout` + `ContextualSidebar` from `@hbc/shell`.

## Bottom navigation applicability

`HbcBottomNav` is not part of the SPFx shell model. The PH4C.12 dead-zone fix for tablet widths (768–1023px) applies to `HbcAppShell`-based runtimes (PWA and dev-harness), not to SPFx webparts.

## Mode rule linkage

The SPFx mode rule keeps contextual navigation enabled:

- `shellModeRules.spfx.supportsContextualSidebar = true`

This means tool-level navigation remains available through contextual sidebar surfaces in SPFx.

## SharePoint interaction model

In SPFx, SharePoint suite/global navigation provides top-level site and tenant navigation, while `ContextualSidebar` provides in-webpart tool navigation. This split avoids duplicating PWA bottom-nav behavior and prevents PH4C.12 dead-zone conditions from applying to SPFx.
