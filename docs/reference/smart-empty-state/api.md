# @hbc/smart-empty-state — API Reference

> **Doc Classification:** Living Reference (Diátaxis) — Reference quadrant; developer audience; smart-empty-state API reference.

**Package:** `packages/smart-empty-state/`
**Locked ADR:** [ADR-0100](../../architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md)

---

## Main Exports (`@hbc/smart-empty-state`)

### Types

| Export | Kind | Description |
|--------|------|-------------|
| `EmptyStateClassification` | Type | `'first-use' \| 'truly-empty' \| 'filter-empty' \| 'permission-empty' \| 'loading-failed'` |
| `EmptyStateVariant` | Type | `'full-page' \| 'inline'` — display variant (D-06) |
| `IEmptyStateAction` | Interface | `{ label: string; href?: string; onClick?: () => void; variant?: 'button' \| 'link' }` |
| `IEmptyStateContext` | Interface | `{ module, view, hasActiveFilters, hasPermission, isFirstVisit, currentUserRole, isLoadError }` — all fields required |
| `IEmptyStateConfig` | Interface | Resolved content: `{ module, view, classification, heading, description, illustration?, primaryAction?, secondaryAction?, filterClearAction?, coachingTip? }` |
| `ISmartEmptyStateConfig` | Interface | `{ resolve(context: IEmptyStateContext): IEmptyStateConfig }` — module-supplied resolver (D-02) |
| `IEmptyStateVisitStore` | Interface | `{ hasVisited(module, view): boolean; markVisited(module, view): void }` — persistence adapter (D-04) |
| `IUseFirstVisitResult` | Interface | `{ isFirstVisit: boolean; markVisited: () => void }` |
| `IUseEmptyStateResult` | Interface | `{ classification: EmptyStateClassification; resolved: IEmptyStateConfig }` |

### Constants

| Export | Kind | Value | Description |
|--------|------|-------|-------------|
| `EMPTY_STATE_VISIT_KEY_PREFIX` | Constant | `'hbc::empty-state::visited'` | localStorage key prefix for visit tracking (D-04) |
| `EMPTY_STATE_COACHING_COLLAPSE_LABEL` | Constant | `'Need help getting started?'` | Disclosure label for Standard-tier coaching (D-05) |
| `emptyStateClassificationLabel` | Record | `Record<EmptyStateClassification, string>` | Display labels: First Use, No Data, No Filter Matches, No Access, Load Failed |

### Classification

| Export | Kind | Signature | Description |
|--------|------|-----------|-------------|
| `classifyEmptyState` | Function | `(context: IEmptyStateContext) => EmptyStateClassification` | D-01 precedence classifier: `loading-failed > permission-empty > filter-empty > first-use > truly-empty` |
| `createEmptyStateVisitStore` | Function | `(storage?: Storage) => IEmptyStateVisitStore` | Creates localStorage-backed visit store with in-memory fallback |
| `noopVisitStore` | Constant | `IEmptyStateVisitStore` | No-op implementation: always reports not visited, discards mark calls |

### Hooks

| Export | Kind | Params | Returns | Description |
|--------|------|--------|---------|-------------|
| `useFirstVisit` | Hook | `UseFirstVisitParams: { module: string; view: string; store?: IEmptyStateVisitStore }` | `IUseFirstVisitResult` | First-visit detection with automatic persistence (D-04) |
| `useEmptyState` | Hook | `UseEmptyStateParams: { config: ISmartEmptyStateConfig; context: Omit<IEmptyStateContext, 'isFirstVisit'> & { isFirstVisit?: boolean }; firstVisitStore?: IEmptyStateVisitStore }` | `IUseEmptyStateResult` | Combined classification + resolution hook |

### Components

| Export | Kind | Props | Description |
|--------|------|-------|-------------|
| `HbcSmartEmptyState` | Component | `HbcSmartEmptyStateProps: { config: ISmartEmptyStateConfig; context: IEmptyStateContext; variant?: EmptyStateVariant; onActionFired?: (actionLabel: string, classification: EmptyStateClassification) => void }` | Primary empty state renderer with complexity-aware coaching (D-05), illustration, and action buttons |
| `HbcEmptyStateIllustration` | Component | `HbcEmptyStateIllustrationProps: { classification: EmptyStateClassification; illustrationKey?: string; size?: 'sm' \| 'md' \| 'lg' }` | Classification-mapped icon illustration; supports custom `illustrationKey` override |

---

## Testing Sub-Path (`@hbc/smart-empty-state/testing`)

| Export | Kind | Description |
|--------|------|-------------|
| `createMockEmptyStateContext(overrides?)` | Factory | Minimal mock `IEmptyStateContext` with defaults: module `'estimating'`, view `'pursuits'`, role `'Estimator'`, all boolean flags `false` |
| `createMockEmptyStateConfig(overrides?)` | Factory | Minimal mock `IEmptyStateConfig` with default heading, description, and `'truly-empty'` classification |
| `mockEmptyStateClassifications` | Constant | Array of all 5 `EmptyStateClassification` values for parameterized tests |

> **Note:** The `testing/` sub-path is excluded from the production bundle. Import only in test files.

---

## References

- [ADR-0100 — Smart Empty State Platform Primitive](../../architecture/adr/ADR-0100-smart-empty-state-platform-primitive.md)
- [Adoption Guide](../../how-to/developer/smart-empty-state-adoption-guide.md)
- [SF11 Master Plan](../../architecture/plans/shared-features/SF11-Smart-Empty-State.md)
