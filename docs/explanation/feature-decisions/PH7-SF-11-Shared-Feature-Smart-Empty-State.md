# PH7-SF-11: `@hbc/smart-empty-state` — Context-Aware Empty State & Onboarding Guidance

**Priority Tier:** 2 — Application Layer (enhances every module; required for production readiness)
**Package:** `packages/smart-empty-state/`
**Interview Decision:** Q20 — Option B confirmed
**Mold Breaker Source:** UX-MB §14 (Smart Empty States); ux-mold-breaker.md Signature Solution #14; con-tech-ux-study §11 (Learnability — first-use experience)

---

## Problem Solved

Every module in HB Intel has lists and views that begin empty — a new user seeing an empty Estimating Pursuits list, a new project with no constraints entered, a BD scorecard with no documents attached. How a platform handles the empty state defines the first-impression learnability of the system.

Current construction platforms universally render one of two empty states:
1. **Blank screen with no guidance** — user has no idea what to do next
2. **Generic "No items found" text** — slightly better, still useless

Neither approach uses the empty state as a teaching moment. A context-aware empty state knows:
- Which module and view is empty
- Whether it's empty because no items exist vs. because a filter is hiding them
- What role the current user plays
- What the right first action is for this user in this context

This transforms the empty state from a dead end into a guided onboarding step.

---

## Mold Breaker Rationale

The ux-mold-breaker.md Signature Solution #14 (Smart Empty States) specifies: "Empty states are first-run tutorials, not error messages." Operating Principle §7.3 (Learnability-first) requires that every empty state communicate purpose, context, and next action. The con-tech UX study §11 identifies first-use experience as the metric where the highest opportunity for differentiation exists.

`@hbc/smart-empty-state` ensures that every module's first impression is intentional, role-aware, and action-oriented — at zero incremental cost per adopting module.

---

## Empty State Classifications

| Classification | Trigger | Example |
|---|---|---|
| **First Use** | No records of this type exist AND user has never visited this view | Estimating Pursuits list — user has never seen it |
| **Truly Empty** | No records exist, but user has visited before | BD Scorecard list after all scorecards archived |
| **Filter Empty** | Records exist but active filter returns zero results | Search for a project name that matches nothing |
| **Permission Empty** | Records exist but user lacks access | PM seeing Estimating Pursuits they're not assigned to |
| **Loading Failed** | API error prevented data from loading | Network timeout |

---

## Interface Contract

```typescript
// packages/smart-empty-state/src/types/ISmartEmptyState.ts

export type EmptyStateClassification =
  | 'first-use'
  | 'truly-empty'
  | 'filter-empty'
  | 'permission-empty'
  | 'loading-failed';

export interface IEmptyStateConfig {
  /** Module identifier */
  module: string;
  /** View identifier within the module */
  view: string;
  /** Classification: first-use, truly-empty, filter-empty, etc. */
  classification: EmptyStateClassification;
  /** Illustration key from @hbc/ui-kit icon set */
  illustration?: string;
  /** Main heading */
  heading: string;
  /** Supporting description (1-2 sentences) */
  description: string;
  /** Primary CTA (the right first action) */
  primaryAction?: IEmptyStateAction;
  /** Secondary CTA (e.g., "Import from Excel", "Learn more") */
  secondaryAction?: IEmptyStateAction;
  /** For filter-empty: instructions to clear filters */
  filterClearAction?: IEmptyStateAction;
  /** Optional coaching tip (shown in Essential mode) */
  coachingTip?: string;
}

export interface IEmptyStateAction {
  label: string;
  /** Navigation URL or handler */
  href?: string;
  onClick?: () => void;
  /** Variant: primary CTA or subdued link */
  variant?: 'button' | 'link';
}

export interface ISmartEmptyStateConfig {
  /** Resolves the correct empty state config based on context */
  resolve: (context: IEmptyStateContext) => IEmptyStateConfig;
}

export interface IEmptyStateContext {
  module: string;
  view: string;
  hasActiveFilters: boolean;
  hasPermission: boolean;
  isFirstVisit: boolean;
  currentUserRole: string;
  isLoadError: boolean;
}
```

---

## Package Architecture

```
packages/smart-empty-state/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types/
│   │   ├── ISmartEmptyState.ts
│   │   └── index.ts
│   ├── hooks/
│   │   └── useEmptyState.ts              # classifies empty state from context
│   └── components/
│       ├── HbcSmartEmptyState.tsx        # main empty state renderer
│       ├── HbcEmptyStateIllustration.tsx # illustration + icon wrapper
│       └── index.ts
```

---

## Component Specification

### `HbcSmartEmptyState` — Context-Aware Empty State Renderer

```typescript
interface HbcSmartEmptyStateProps {
  config: ISmartEmptyStateConfig;
  context: IEmptyStateContext;
  /** Size variant: 'full-page' (centered on empty page) or 'inline' (within a card or panel) */
  variant?: 'full-page' | 'inline';
}
```

**Visual behavior by classification:**

**First Use:**
- Large illustration (construction-themed, role-appropriate)
- Bold heading: "[Module Name] is ready for your first [item type]"
- Description: What this module does and why it matters
- Primary CTA: "Create your first [item]" or "Start import"
- Coaching tip (Essential mode): step-by-step "Start here" guidance

**Truly Empty:**
- Smaller illustration
- Heading: "No [items] yet"
- Description: Brief reminder of purpose
- Primary CTA: "Create [item]"

**Filter Empty:**
- No illustration (or small icon)
- Heading: "No results match your filters"
- Description: "Try adjusting your search or filter criteria"
- Filter clear CTA: "Clear all filters"

**Permission Empty:**
- Lock icon illustration
- Heading: "You don't have access to this view"
- Description: "Contact your administrator to request access"
- No CTA (or: "Contact Admin")

**Loading Failed:**
- Error icon
- Heading: "Unable to load [items]"
- Description: "There was a problem connecting. Try refreshing."
- Primary CTA: "Retry" (triggers data reload)

---

## Module Adoption Pattern

Each module defines its own empty state configurations and passes them to the component:

```typescript
import { HbcSmartEmptyState, ISmartEmptyStateConfig } from '@hbc/smart-empty-state';

const estimatingPursuitsEmptyStateConfig: ISmartEmptyStateConfig = {
  resolve: (context) => {
    if (context.isLoadError) return {
      module: 'estimating', view: 'pursuits',
      classification: 'loading-failed',
      heading: 'Unable to load pursuits',
      description: 'Check your connection and try again.',
      primaryAction: { label: 'Retry', onClick: () => refetch() },
    };
    if (!context.hasPermission) return {
      module: 'estimating', view: 'pursuits',
      classification: 'permission-empty',
      heading: "You don't have access to Estimating Pursuits",
      description: 'Contact your Estimating Coordinator or Administrator.',
    };
    if (context.hasActiveFilters) return {
      module: 'estimating', view: 'pursuits',
      classification: 'filter-empty',
      heading: 'No pursuits match your filters',
      description: 'Try adjusting your date range or status filter.',
      filterClearAction: { label: 'Clear Filters', onClick: () => clearFilters() },
    };
    if (context.isFirstVisit) return {
      module: 'estimating', view: 'pursuits',
      classification: 'first-use',
      illustration: 'estimating-pursuits',
      heading: 'Welcome to Estimating Pursuits',
      description: 'Track every active bid from Go/No-Go approval through project award. Get started by creating your first pursuit or importing your current bid calendar.',
      primaryAction: { label: 'Create Pursuit', href: '/estimating/pursuits/new' },
      secondaryAction: { label: 'Import from Excel', href: '/admin/data-seeding?type=estimating-pursuit' },
      coachingTip: 'Tip: Your first pursuits will likely come from a handoff from the Business Development team after a Go/No-Go scorecard is approved.',
    };
    return {
      module: 'estimating', view: 'pursuits',
      classification: 'truly-empty',
      heading: 'No active pursuits',
      description: 'New pursuits are created when a Go/No-Go scorecard is approved and handed off.',
      primaryAction: { label: 'Create Pursuit', href: '/estimating/pursuits/new' },
    };
  },
};

// In the pursuits list component
{pursuits.length === 0 && (
  <HbcSmartEmptyState
    config={estimatingPursuitsEmptyStateConfig}
    context={{
      module: 'estimating',
      view: 'pursuits',
      hasActiveFilters: activeFilters.length > 0,
      hasPermission: currentUser.canViewEstimating,
      isFirstVisit: !localStorage.getItem('visited-estimating-pursuits'),
      currentUserRole: currentUser.role,
      isLoadError: isError,
    }}
    variant="full-page"
  />
)}
```

---

## Integration Points

| Package | Integration |
|---|---|
| `@hbc/complexity` | Coaching tip shown in Essential mode; hidden in Expert mode |
| `@hbc/data-seeding` | First-use empty states link to import flow as secondary action |
| `@hbc/notification-intelligence` | Loading-failed states trigger Watch-tier alert if persistent |
| PH9b Progressive Coaching (§B) | First-use empty state coaching tip is the entry point for the full progressive coaching system |

---

## SPFx Constraints

- `HbcSmartEmptyState` is SPFx-compatible via `@hbc/ui-kit/app-shell`
- Illustrations sourced from `@hbc/ui-kit/icons` (SVG, no external dependencies)
- First-visit detection uses `@hbc/session-state` in PWA; SharePoint user profile property in SPFx

---

## Priority & ROI

**Priority:** P1 — Required for all module list views to have production-quality empty states; without it, empty views are confusing dead ends that harm adoption
**Estimated build effort:** 1–2 sprint-weeks (one main component, classification hook, module config pattern)
**ROI:** Directly improves first-impression learnability; converts dead-end screens into onboarding moments; zero incremental cost per module adoption

---

## Definition of Done

- [ ] `ISmartEmptyStateConfig` and `IEmptyStateContext` contracts defined and exported
- [ ] `useEmptyState` hook classifies empty state from context object
- [ ] `HbcSmartEmptyState` renders all five classifications with correct visual treatment
- [ ] All five classification visuals designed in `@hbc/ui-kit` (illustrations, icons)
- [ ] `@hbc/complexity` integration: coaching tip shown in Essential, hidden in Expert
- [ ] First-visit detection via `@hbc/session-state` (PWA) and SharePoint user profile (SPFx)
- [ ] BD, Estimating, Project Hub, and Admin modules each implement their empty state configs
- [ ] Unit tests on `useEmptyState` classification logic
- [ ] Storybook: all five classification variants in full-page and inline sizes

---

## ADR Reference

Create `docs/architecture/adr/0020-smart-empty-state-platform-primitive.md` documenting the five-classification model, the resolve-function config pattern, and the first-visit detection strategy.
