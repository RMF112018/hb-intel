# @hbc/complexity

**Version:** 0.1.0
**Status:** Tier-1 Platform Primitive
**Phase:** PH7.4 — Shared-Feature Tier-1 Normalization

---

## Purpose

`@hbc/complexity` is the platform-wide context that answers the question every component must ask before rendering: **"How much information should I show this user right now?"**

It provides a consistent three-tier density model — **Essential**, **Standard**, **Expert** — that all HB Intel modules read to adapt UI density. Without this package, modules make independent density decisions, creating cross-module inconsistency that undermines learnability.

Any feature that renders UI with variable information density, expertise-gated content, or coaching prompts **must** use this package.

---

## Concern Area

UI density adaptation, complexity tier persistence, role-derived defaults, admin tier locking, cross-tab synchronization, coaching visibility.

---

## Installation

```bash
pnpm add @hbc/complexity
```

### Peer Dependencies

- `react` ^18.3.0
- `react-dom` ^18.3.0

### Internal Dependencies

- `@hbc/ui-kit` — design system components
- `@tanstack/react-query` — background API synchronization

---

## Quick Start

### 1. Wrap your app with the provider

**PWA:**
```tsx
import { ComplexityProvider } from '@hbc/complexity';

// At app root, wrapping <RouterProvider>
<ComplexityProvider>
  <RouterProvider router={router} />
</ComplexityProvider>
```

**SPFx Application Customizer:**
```tsx
import { ComplexityProvider } from '@hbc/complexity';

<ComplexityProvider spfxContext={this.context}>
  <AppShell />
</ComplexityProvider>
```

### 2. Read the current tier

```tsx
import { useComplexity } from '@hbc/complexity';

function MyComponent() {
  const { tier, atLeast, is, setTier, showCoaching } = useComplexity();

  if (atLeast('standard')) {
    // Show additional detail
  }
}
```

### 3. Gate content declaratively

```tsx
import { HbcComplexityGate } from '@hbc/complexity';

function MyPanel() {
  return (
    <>
      <BasicInfo />
      <HbcComplexityGate minTier="standard">
        <DetailedInfo />
      </HbcComplexityGate>
      <HbcComplexityGate minTier="expert">
        <AuditTrail />
      </HbcComplexityGate>
    </>
  );
}
```

### 4. Let users change their tier

```tsx
import { HbcComplexityDial } from '@hbc/complexity';

// In header:
<HbcComplexityDial variant="header" />

// In settings page:
<HbcComplexityDial variant="settings" />
```

---

## Public API

### Types

- `ComplexityTier` — `'essential' | 'standard' | 'expert'`
- `IComplexityContext` — full context shape returned by `useComplexity()`
- `IComplexityPreference` — API payload shape (tier, showCoaching, lockedBy, lockedUntil)
- `IComplexityAwareProps` — mixin props for complexity-sensitive components

### Context & Provider

- `ComplexityContext` — React context instance
- `ComplexityProvider` — root provider with hydration, storage, API sync, cross-tab sync, lock handling

### Hooks

- `useComplexity()` — access `tier`, `atLeast(tier)`, `is(tier)`, `setTier`, `showCoaching`, `setShowCoaching`, `isLocked`, `lockedBy`, `lockedUntil`
- `useComplexityGate({ minTier?, maxTier? })` — returns `boolean` for conditional rendering
- `evaluateGate(currentTier, { minTier?, maxTier? })` — pure function for gate evaluation

### Components

- `HbcComplexityGate` — declarative gate that unmounts children below tier threshold (150ms CSS fade-in on appear; optional `keepMounted` prop)
- `HbcComplexityDial` — user-facing tier selector (header compact + settings expanded variants; locked state with tooltip)

---

## Tier Model

| Tier | Target User | UI Behavior |
|------|------------|-------------|
| **Essential** | New hires, field staff, reviewers | Minimal fields, coaching prompts visible, simplified views |
| **Standard** | PMs, coordinators, estimators, BD | Full working set, coaching hidden, standard detail level |
| **Expert** | Directors, VPs, executives | All fields, audit trails, configuration panels, full detail |

Role-to-tier mapping is configured in `src/config/roleComplexityMap.ts` — editable via PR without code changes.

---

## Storage & Persistence

- **PWA:** `localStorage` with key `hbc::complexity::v1`
- **SPFx:** `sessionStorage` fallback (detected via `spfxContext` prop)
- **Cross-tab sync:** Instant via browser `StorageEvent` listener (PWA only)
- **Zero-flash:** Synchronous cache read on mount; background API sync updates if server differs

---

## Testing

Import testing utilities from the `/testing` sub-path:

```typescript
import {
  ComplexityTestProvider,
  createComplexityWrapper,
  mockComplexityContext,
  allTiers,
} from '@hbc/complexity/testing';
```

These utilities have zero production bundle impact.

---

## Cross-References

- [Platform Primitives Registry](../../docs/reference/platform-primitives.md)
- [ADR-0081 — Complexity Dial as Platform Primitive](../../docs/architecture/adr/ADR-0081-complexity-dial-platform-primitive.md)
- [SF03 Master Plan](../../docs/architecture/plans/shared-features/SF03-Complexity-Dial.md)
- [Complexity Sensitivity Reference](../../docs/reference/ui-kit/complexity-sensitivity.md)
- [Current-State Architecture Map](../../docs/architecture/current-state-map.md) §3 Category C

<!-- PH7.4 — Package README created as part of Shared-Feature Tier-1 Normalization (§7.4.2) -->
