# PH7-SF-03: `@hbc/complexity` — Three-Tier Complexity Dial

**Priority Tier:** 1 — Foundation (must exist before domain modules render adaptive UI)
**Package:** `packages/complexity/`
**Interview Decision:** Q15 — Option B confirmed; retrofit note for existing UI Kit components acknowledged
**Mold Breaker Source:** UX-MB §2 (Complexity Dial); ux-mold-breaker.md Signature Solution #2

---

## Problem Solved

Construction management software has a dual audience problem: the same screen must serve a first-week Project Engineer and a 20-year Senior Project Manager. Today's platforms resolve this conflict by designing for the power user — resulting in information-dense interfaces that overwhelm new users — or by simplifying for beginners and frustrating veterans.

HB Intel solves this with a **platform-wide three-tier Complexity Dial**: Essential / Standard / Expert. Every component in every module reads the current complexity tier from a shared context and renders accordingly. The tier is a user-level preference persisted to their profile, togglable at any time, and respected uniformly across the entire platform.

This is a foundational shared infrastructure package. Without it, individual modules make independent decisions about which fields to show, creating inconsistency that undermines learnability and forces re-orientation every time a user crosses module boundaries.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #2 (Complexity Dial) is defined as: "A persistent, role-aware interface tier system where users choose their experience density and every component responds." Operating Principle §7.3 specifies: "Learnability-first — complexity is adaptive, not fixed." The con-tech UX study §11 documents that learnability is one of the lowest-scoring dimensions across all seven platforms evaluated; none offer dynamic complexity reduction.

The competitive impact is systemic: HB Intel is the only construction platform where a user can dial down complexity during onboarding and dial it back up as they gain expertise — without switching applications, requesting IT support, or losing access to any data.

---

## The Three Tiers

| Tier | Target User | Experience Philosophy |
|---|---|---|
| **Essential** | New users, field-only staff, occasional reviewers | Show the minimum information needed to complete the current task. Hide advanced fields, history panels, and configuration. Prominent coaching callouts. |
| **Standard** | Day-to-day users, project coordinators, most PMs | Full working view. All operational fields visible. Advanced configuration and audit trail collapsed but accessible. |
| **Expert** | Power users, PMs, estimators, VPs | Full information density. All fields, all history, all chain-of-custody, all configuration options exposed. No tooltips or coaching prompts unless requested. |

---

## Interface Contract

```typescript
// packages/complexity/src/types/IComplexity.ts

export type ComplexityTier = 'essential' | 'standard' | 'expert';

export interface IComplexityContext {
  /** Current active tier for this user */
  tier: ComplexityTier;
  /** Whether to show coaching callouts (auto-true for Essential) */
  showCoaching: boolean;
  /** Helper: returns true when tier is at or above the threshold */
  atLeast: (threshold: ComplexityTier) => boolean;
  /** Helper: returns true when tier exactly matches */
  is: (tier: ComplexityTier) => boolean;
  /** Update the user's tier (persists to profile) */
  setTier: (tier: ComplexityTier) => void;
}

export interface IComplexityAwareProps {
  /** Minimum tier required to render this element */
  minTier?: ComplexityTier;
  /** Maximum tier at which this element renders (e.g., coaching prompts hidden in Expert) */
  maxTier?: ComplexityTier;
}
```

---

## Package Architecture

```
packages/complexity/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── IComplexity.ts
│   │   └── index.ts
│   ├── context/
│   │   ├── ComplexityContext.ts          # React context + provider
│   │   └── ComplexityProvider.tsx        # Root provider; loads tier from user profile
│   ├── hooks/
│   │   ├── useComplexity.ts              # Access tier, helpers, setTier
│   │   └── useComplexityGate.ts          # Returns boolean: should this element render?
│   └── components/
│       ├── HbcComplexityGate.tsx         # Declarative wrapper: render children only at tier
│       ├── HbcComplexityDial.tsx         # UI control: tier selector (header/settings)
│       └── index.ts
```

---

## Component Specifications

### `HbcComplexityGate` — Declarative Render Control

The primary integration point for all components across all modules. Wrap any element that should only appear at a specific complexity tier.

```typescript
interface HbcComplexityGateProps {
  /** Minimum tier to show children (inclusive) */
  minTier?: ComplexityTier;
  /** Maximum tier to show children (inclusive) */
  maxTier?: ComplexityTier;
  /** Optional fallback rendered when gate is closed */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}
```

**Usage examples:**

```typescript
// Show only in Expert mode
<HbcComplexityGate minTier="expert">
  <HbcBicDetail item={scorecard} config={scorecardBicConfig} showChain={true} />
</HbcComplexityGate>

// Show in Essential and Standard, hide in Expert (coaching prompt)
<HbcComplexityGate maxTier="standard">
  <CoachingCallout message="Complete all sections before submitting for review." />
</HbcComplexityGate>

// Show only in Essential mode
<HbcComplexityGate minTier="essential" maxTier="essential">
  <SimplifiedTaskSummary />
</HbcComplexityGate>
```

### `HbcComplexityDial` — Tier Selector UI

Rendered in the application header (or user settings panel). Allows users to toggle their complexity tier interactively.

```typescript
interface HbcComplexityDialProps {
  /** Display variant: 'header' (compact icon+label) or 'settings' (full description cards) */
  variant?: 'header' | 'settings';
  /** Whether to show tier descriptions inline */
  showDescriptions?: boolean;
}
```

**Visual behavior (header variant):**
- Three-segment pill selector: Essential | Standard | Expert
- Active tier highlighted; smooth transition animation
- Tooltip on hover: tier name + one-sentence description
- Persists selection to user profile via `PATCH /api/users/me/preferences`

**Visual behavior (settings variant):**
- Three full cards with tier name, target audience, and example of what changes
- Current selection marked with a check

### `useComplexity` — Hook

```typescript
const { tier, showCoaching, atLeast, is, setTier } = useComplexity();

// Example: conditionally compute expensive data only in Expert mode
const fullAuditTrail = atLeast('expert') ? computeFullTrail(item) : null;

// Example: coaching callout visibility
const showOnboarding = is('essential');
```

### `useComplexityGate` — Boolean Hook

```typescript
// Returns true if current tier satisfies the gate condition
const isVisible = useComplexityGate({ minTier: 'standard' });
```

---

## Integration Pattern for Existing Modules

The Q15 retrofit note requires that existing UI Kit components be updated to respect the complexity context. The integration pattern is consistent:

**Step 1: Wrap the provider at the app root (done once)**
```typescript
// apps/pwa/src/App.tsx
import { ComplexityProvider } from '@hbc/complexity';

<ComplexityProvider>
  <RouterProvider router={router} />
</ComplexityProvider>
```

**Step 2: Gate existing fields in domain components**
```typescript
import { HbcComplexityGate, useComplexity } from '@hbc/complexity';

// In a form component
<HbcComplexityGate minTier="standard">
  <FormField label="Internal Notes" name="internalNotes" />
</HbcComplexityGate>

<HbcComplexityGate minTier="expert">
  <AuditTrailPanel itemId={item.id} />
</HbcComplexityGate>
```

**Step 3: Update UI Kit components (retrofit)**

The `@hbc/ui-kit` components that need retrofitting are identified during Phase 7 implementation. The retrofit pattern:
```typescript
// Inside a UI Kit component (e.g., HbcDataTable)
import { useComplexityGate } from '@hbc/complexity';

const showAdvancedFilters = useComplexityGate({ minTier: 'expert' });
// ... conditionally render
```

---

## Complexity Behavior by Module

| Module | Essential | Standard | Expert |
|---|---|---|---|
| BD Go/No-Go Scorecard | Active section only; required fields only | All sections; scoring criteria | Full scoring rubric + historical benchmarks + BIC chain |
| Estimating Pursuits | Active task + due date | Full pursuit details + docs | Full audit trail + bid readiness breakdown |
| Project Hub | Active constraints + overdue items | All project data | Full PMP trail + permit log + monthly review history |
| Admin | Read-only view of own provisioning | Full provisioning status | Full implementation truth layer + approval role config |
| BIC Badge | Owner name only | Owner + expected action | Owner + action + due date + chain |
| Document Attachment | Drop zone only | Drop zone + file list | Drop zone + file list + SharePoint path + migration status |

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/bic-next-move` | `HbcBicBadge` variant `'compact'` in Essential; `HbcBicDetail` gated to Standard+; full chain (`showChain`) gated to Expert |
| `@hbc/sharepoint-docs` | `HbcDocumentAttachment` shows simplified drop zone in Essential; folder path + SharePoint link in Expert |
| `@hbc/notification-intelligence` | Digest-only in Essential; full priority tiers in Standard; configuration panel in Expert |
| `@hbc/ai-assist` | AI suggestion panel gated to Standard+; confidence scores and model rationale gated to Expert |
| `@hbc/project-canvas` | Canvas tile set is role-filtered AND complexity-filtered; Essential shows summary tiles only |
| PH9b Progressive Coaching (§B) | Coaching system activates fully in Essential; suppressed in Expert per user intent |

---

## SPFx Constraints

- `ComplexityProvider` must be placed at the SPFx Application Customizer level (not per-webpart) to share tier across all webparts on a page
- `HbcComplexityDial` imports from `@hbc/ui-kit/app-shell` in SPFx shell contexts
- Tier preference stored in SharePoint user profile properties (via Graph API) as fallback when PWA session storage is unavailable

---

## Priority & ROI

**Priority:** P0 — Cross-cutting platform primitive; every module's UI density depends on this context
**Estimated build effort:** 2–3 sprint-weeks (context, hooks, two components, retrofit audit)
**ROI:** Solves the dual-audience UX problem that no construction platform currently addresses; enables progressive onboarding without a separate "beginner mode" product; retrofitting existing components is a one-time cost that pays dividends on every future module

---

## Definition of Done

- [ ] `ComplexityProvider` wraps PWA root and SPFx Application Customizer
- [ ] `useComplexity` returns `tier`, `atLeast`, `is`, `setTier` with full TypeScript types
- [ ] `useComplexityGate` returns boolean for `minTier`/`maxTier` conditions
- [ ] `HbcComplexityGate` renders/hides children based on current tier
- [ ] `HbcComplexityDial` header variant renders in app header; persists to user profile
- [ ] `HbcComplexityDial` settings variant renders in user settings panel
- [ ] Tier persisted to `PATCH /api/users/me/preferences` and loaded on session start
- [ ] SPFx Application Customizer integration: shared provider across webparts
- [ ] Retrofit audit complete: all existing UI Kit components categorized by complexity sensitivity
- [ ] At least 5 existing components updated with `HbcComplexityGate` wrappers
- [ ] `@hbc/complexity` integration verified in BD, Estimating, and Project Hub modules
- [ ] Unit tests ≥95% on `atLeast`, `is`, gate logic
- [ ] Storybook stories: all three tiers in all three components

---

## ADR Reference

Create `docs/architecture/adr/0012-complexity-dial-platform-primitive.md` documenting the decision to use a shared context rather than per-module complexity logic, the three-tier model rationale, and the SPFx Application Customizer placement strategy.
