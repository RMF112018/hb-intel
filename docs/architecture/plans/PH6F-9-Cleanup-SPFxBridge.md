# PH6F-9 — SPFx Host Bridge Wiring

**Plan ID:** PH6F-9-Cleanup-SPFxBridge
**Parent Plan:** PH6F-DeadWiring-Cleanup-Plan.md
**Blueprint Reference:** §5b (SPFx environment adapter), §3b (Shell environment adapter pattern)
**Foundation Plan Reference:** Phase 6 (SPFx webparts), Phase 8 (Multi-environment architecture)
**Priority:** LOW
**Execution Order:** Last (blocked on PH8 — SPFx app structure must exist)
**Estimated Effort:** 2–4 hours (when unblocked)
**Risk:** LOW for planning; MEDIUM when implementing (SPFx build toolchain complexity)

---

## Problem Statement

`@hbc/shell` exports:
- `createSpfxShellEnvironmentAdapter` — factory for the SPFx shell environment adapter
- `assertValidSpfxHostBridge` — validates the bridge object before use
- `normalizeSpfxHostSignals` — normalizes SPFx host context signals to the shell's signal format

Without these, the SPFx webpart operates in a "blind" mode: the shell cannot detect Teams
context, apply the correct theme, receive connectivity signals from SharePoint, or propagate
user context from the SPFx page context. The shell runs in a generic fallback mode that
doesn't reflect the actual SharePoint environment.

---

## ⚠️ Block Status

This task is **blocked** until `apps/spfx/` exists with a working webpart scaffolding.

Trigger conditions to unblock:
1. SPFx webpart project scaffolded in `apps/spfx/`
2. At least one webpart class (`BaseClientSideWebPart` subclass) exists
3. PH8 (SPFx integration phase) is active

**Until unblocked:** This document serves as the implementation plan for when PH8 begins.
No action is required before that.

---

## Architecture Context

The SPFx host bridge connects two systems:

```
SharePoint Page Context (SPFx runtime)
         ↓
ISpfxHostBridge (bridge object)
         ↓
createSpfxShellEnvironmentAdapter()
         ↓
ShellEnvironmentAdapter interface
         ↓
ShellCore (renders shell with correct theme/connectivity/user context)
```

The `ISpfxHostBridge` object is created inside `WebPart.onInit()` from the SPFx
`this.context` object (webpart context, Teams context, page context).

---

## Step 1 — Create the SPFx Host Bridge in `onInit`

**File:** `apps/spfx/src/webparts/<webpartName>/<WebpartName>WebPart.ts`

```typescript
// apps/spfx/src/webparts/hbIntel/HbIntelWebPart.ts
// D-PH6F-9: SPFx host bridge wiring — creates shell environment adapter from SPFx context.

import {
  createSpfxShellEnvironmentAdapter,
  assertValidSpfxHostBridge,
  normalizeSpfxHostSignals,
  type ISpfxHostBridge,
  type ShellEnvironmentAdapter,
} from '@hbc/shell';

export default class HbIntelWebPart extends BaseClientSideWebPart<IHbIntelWebPartProps> {
  private _shellAdapter: ShellEnvironmentAdapter | null = null;

  protected async onInit(): Promise<void> {
    await super.onInit();

    // D-PH6F-9: Build the host bridge from SPFx page context.
    const bridge: ISpfxHostBridge = {
      signals: {
        theme: this.context.sdks.microsoftTeams?.context?.theme ?? 'default',
        isTeamsContext: Boolean(this.context.sdks.microsoftTeams),
        locale: this.context.pageContext.cultureInfo.currentUICultureName,
        userDisplayName: this.context.pageContext.user.displayName,
        userEmail: this.context.pageContext.user.email,
      },
      applySignals: async (normalizedSignals) => {
        // Apply normalized SPFx signals to the shell — theme changes, connectivity updates, etc.
        // This callback fires when the shell requests a signal refresh.
        console.log('[HB Intel SPFx] Applying signals:', normalizedSignals);
      },
    };

    // D-PH6F-9: Validate bridge before use — throws in DEV if bridge is misconfigured.
    assertValidSpfxHostBridge(bridge);

    // D-PH6F-9: Create the shell environment adapter from the validated bridge.
    this._shellAdapter = createSpfxShellEnvironmentAdapter({
      webpartContext: this.context,
      bridge,
    });
  }

  public render(): void {
    if (!this._shellAdapter) {
      this.domElement.innerHTML = '<div>Shell adapter not initialized.</div>';
      return;
    }

    // Pass adapter to the React render root
    const element = React.createElement(HbIntelApp, {
      shellAdapter: this._shellAdapter,
    });

    ReactDOM.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDOM.unmountComponentAtNode(this.domElement);
  }
}
```

---

## Step 2 — Pass the Adapter to `ShellCore`

The SPFx app root component should mount `ShellCore` with the adapter:

```typescript
// apps/spfx/src/HbIntelApp.tsx
import { ShellCore } from '@hbc/shell';

interface HbIntelAppProps {
  shellAdapter: ShellEnvironmentAdapter;
}

export function HbIntelApp({ shellAdapter }: HbIntelAppProps) {
  return (
    <ShellCore
      adapter={shellAdapter}
      // ShellCore handles: auth, permissions, routing, connectivity bar, theme
    />
  );
}
```

Note: `ShellCore` is the correct integration surface for SPFx (it uses the adapter pattern).
The PWA uses `HbcAppShell` directly until PH8 adopts `ShellCore` — these are different
integration strategies for the two environments.

---

## Step 3 — Verify `ISpfxHostBridge` Interface Shape

Before implementing Step 1, check the actual `ISpfxHostBridge` interface definition:

```bash
grep -r "ISpfxHostBridge\|SpfxHostBridge" packages/shell/src --include="*.ts" -r
```

The `signals` object and `applySignals` callback shape must match exactly. Adjust Step 1 to
use the correct field names.

---

## Step 4 — Add `normalizeSpfxHostSignals` Call

If the bridge requires normalized signals (rather than raw SPFx context values):

```typescript
// Inside onInit, before or after assertValidSpfxHostBridge:
const normalizedSignals = normalizeSpfxHostSignals({
  teamsContext: this.context.sdks.microsoftTeams?.context,
  pageContext: this.context.pageContext,
});

// Use normalizedSignals.theme, normalizedSignals.connectivity, etc. in the bridge
```

---

## Files Modified / Created

| Action | File |
|--------|------|
| Create | `apps/spfx/src/webparts/hbIntel/HbIntelWebPart.ts` (or modify existing) |
| Create | `apps/spfx/src/HbIntelApp.tsx` |

---

## Verification Commands

```bash
# SPFx verification requires the SPFx workbench or a SharePoint site:

# 1. Build SPFx solution
cd apps/spfx && gulp build

# 2. Start local workbench
gulp serve --nobrowser
# Navigate to: https://{tenant}.sharepoint.com/_layouts/15/workbench.aspx

# 3. Add the HB Intel webpart to the workbench page

# 4. Verify in browser console:
#    "[HB Intel SPFx] Applying signals: {theme: 'default', ...}"
#    No assertValidSpfxHostBridge errors

# 5. In Teams (if Teams context is configured):
#    Verify: shell theme matches Teams theme
#    Verify: shell shows Teams user display name
```

---

## Success Criteria

- [ ] PH6F-9.1 SPFx host bridge created in webpart `onInit` from `this.context`
- [ ] PH6F-9.2 `assertValidSpfxHostBridge` validates bridge before adapter creation
- [ ] PH6F-9.3 `createSpfxShellEnvironmentAdapter` returns a valid adapter
- [ ] PH6F-9.4 Adapter passed to `ShellCore` in the SPFx app render
- [ ] PH6F-9.5 Shell connectivity bar reflects SPFx Teams context (when in Teams)
- [ ] PH6F-9.6 SPFx gulp build passes with zero errors
- [ ] PH6F-9.7 `assertValidSpfxHostBridge` does not throw in a valid SPFx environment

<!-- IMPLEMENTATION PROGRESS & NOTES
Task created: 2026-03-07
Status: BLOCKED — requires apps/spfx/ to exist (PH8 prerequisite)
Execution: Last in sequence; blocked on PH8

PH6F-9 wiring attempted: 2026-03-07
Block confirmed: `apps/spfx/` does not exist. No SPFx webpart scaffold in the monorepo.
Unblock dependency: PH7-BW-1 (creates webpart classes) → PH8 (SPFx integration phase).
Parent plan (PH6F-DeadWiring-Cleanup-Plan.md) already records PH6F-9 as BLOCKED — no update needed there.

Shell bridge infrastructure verified built and tested in @hbc/shell:
- packages/shell/src/spfxHostBridge.ts — exports all three functions
- packages/shell/src/types.ts:145-178 — all SPFx types defined

CORRECTIONS TO PLAN CODE EXAMPLES (must apply when unblocked):

1. Interface name: The real interface is `SpfxHostBridge` (not `ISpfxHostBridge` as shown in §Architecture Context and Steps 1/3).
   Source: packages/shell/src/types.ts:173

2. Bridge shape mismatch: The plan examples show `signals.theme`, `signals.isTeamsContext`,
   `signals.locale`, `signals.userDisplayName`, `signals.userEmail`, and an `applySignals` callback.
   Actual shape (types.ts:173-178):
     - hostContainer: SpfxHostContainerMetadata { hostId, domElementId?, siteUrl?, webPartInstanceId? }
     - identityContextRef: string
     - signals?: SpfxHostSignalSnapshot { themeKey?, widthPx?, pathname? }
     - handlers?: SpfxHostSignalHandlers { onThemeChange?, onResize?, onLocationChange? }

3. Factory params: `createSpfxShellEnvironmentAdapter` takes `{ bridge, adapter? }`,
   NOT `{ webpartContext, bridge }` as shown in Step 1.
   Source: packages/shell/src/spfxHostBridge.ts:42-44

4. Validation scope: `assertValidSpfxHostBridge` validates `hostContainer.hostId` and
   `identityContextRef` only — not Teams context or user fields.
   Source: packages/shell/src/spfxHostBridge.ts:15-26

When unblocked, Step 1 onInit should build the bridge as:
  const bridge: SpfxHostBridge = {
    hostContainer: { hostId: this.context.instanceId },
    identityContextRef: this.context.pageContext.user.loginName,
    signals: { themeKey: '...', widthPx: ..., pathname: '...' },
    handlers: { onThemeChange: ..., onResize: ..., onLocationChange: ... },
  };
  assertValidSpfxHostBridge(bridge);
  this._shellAdapter = createSpfxShellEnvironmentAdapter({ bridge });

No action needed until PH7-BW-1/PH8 begins.
-->
