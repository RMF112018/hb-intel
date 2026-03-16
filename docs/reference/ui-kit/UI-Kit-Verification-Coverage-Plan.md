# UI Kit Verification Coverage Plan

> **Doc Classification:** Living Reference — WS1-T11 verification overhaul establishing automated test coverage for `@hbc/ui-kit` and Wave 1-critical UI.

**Source of Truth:** `packages/ui-kit/vitest.config.ts`, `packages/ui-kit/package.json` scripts
**Governing Standard:** Release confidence must be driven by automated verification, not only visual inspection.

---

## Test Commands

| Command | Purpose | CI-Ready |
|---------|---------|----------|
| `pnpm --filter @hbc/ui-kit test` | Run all unit and interaction tests | Yes |
| `pnpm --filter @hbc/ui-kit test:watch` | Watch mode for development | No |
| `pnpm --filter @hbc/ui-kit test:coverage` | Run tests with V8 coverage report | Yes |
| `pnpm --filter @hbc/ui-kit test-storybook` | Run Storybook interaction tests | Yes |
| `pnpm --filter @hbc/ui-kit check-types` | TypeScript compilation check | Yes |
| `pnpm --filter @hbc/ui-kit lint` | ESLint with token enforcement | Yes |
| `pnpm --filter @hbc/ui-kit build` | Full TypeScript build | Yes |

---

## Test Infrastructure

- **Runner:** Vitest 3.x with jsdom environment
- **React plugin:** `@vitejs/plugin-react`
- **Assertion library:** `@testing-library/jest-dom` (extended matchers)
- **Coverage:** V8 provider with text, lcov, and html reporters
- **Configuration:** `packages/ui-kit/vitest.config.ts`
- **Setup:** `packages/ui-kit/src/__tests__/setup.ts`

---

## Current Test Coverage

### Existing Tests (3 files, 9 tests)

| File | Tests | Coverage Area |
|------|-------|---------------|
| `HbcThemeContext.test.tsx` | 3 | Theme provider context, theme switching, SSR rendering |
| `ThemeResponsiveness.test.tsx` | 4 | Theme token validation, field mode surfaces, connectivity colors, spacing |
| `HbcConnectivityBar.test.ts` | 2 | Connectivity status rendering, state transitions |

---

## Priority Coverage Map

Based on T09 accessibility findings and T07 component tiers:

### Priority 1 — Unit Tests (Key Contracts)

| Category | What to Test | Status |
|----------|-------------|--------|
| Tokens and theme | Token values valid; theme switching produces expected assignments | **Covered** (3 tests) |
| Status system | Each status variant produces correct semantic color | Planned |
| Density context | `useDensity()` returns correct tier; field mode defaults to comfortable | Planned |
| Component props | Required props enforce constraints; optional produce defaults | Planned |
| Card weight classes | `weight` prop produces correct elevation, border, padding | Planned |
| Validation state | Error, warning, success states apply correct visual + ARIA | Planned |

### Priority 2 — Interaction Tests

| Component | What to Test | Status |
|-----------|-------------|--------|
| HbcModal | Opens; Escape closes; focus trapped; focus returns | Planned |
| HbcPanel | Opens; Escape/close button closes; focus managed | Planned |
| HbcConfirmDialog | Opens as alertdialog; confirm/cancel fire callbacks | Planned |
| HbcTabs | Arrow keys navigate; Enter/Space activates; panel visible | Planned |
| HbcToast | Appears on trigger; auto-dismiss; manual close | Planned |
| HbcDataTable | Checkbox selects row; select-all; bulk bar appears | Planned |
| HbcForm | Submit without required shows errors; field-level messages | Planned |
| HbcSearch | Keyboard activation; Escape clears; Enter submits | Planned |
| HbcCommandPalette | Arrow navigation; Enter selects; Escape closes | Planned |
| HbcPopover | Opens on trigger; Escape closes; outside click closes | Planned |

### Priority 3 — Accessibility Automation (from T09 Findings)

| Check | Components | Status |
|-------|-----------|--------|
| Focus trap activation | HbcModal, HbcPanel, HbcTearsheet, HbcCommandPalette | Planned |
| Focus return on close | All overlay components | Planned |
| Escape key dismissal | All overlay components | Planned |
| ARIA role correctness | dialog, alertdialog, tablist, table | Planned |
| Live region announcement | HbcBanner, HbcToast, HbcConnectivityBar | Planned |
| Reduced-motion compliance | All 12 animated components | Planned |

### Priority 4 — Composition Smoke Tests

| Composition | What to Verify | Status |
|-------------|---------------|--------|
| WorkspacePageShell + DashboardLayout | Renders without errors | Planned |
| WorkspacePageShell + ListLayout + DataTable | Renders without errors | Planned |
| CreateUpdateLayout + HbcForm | Renders without errors | Planned |
| HbcModal + HbcConfirmDialog | Renders without errors | Planned |
| HbcAppShell + HbcSidebar | Renders without errors | Planned |

---

## Visual Regression (Planned)

Visual regression testing requires a browser rendering environment (Playwright or Storybook test-runner with visual comparisons). This is tracked as a future enhancement:

- **Tool:** Storybook `test-storybook` with visual snapshot addon or Playwright
- **Baselines:** Stored in `packages/ui-kit/.visual-baselines/`
- **Command:** `pnpm --filter @hbc/ui-kit test:visual`
- **Scope:** All Priority 1 components + density variants + 10 composition patterns

---

## CI Integration

The following commands should run in CI for every PR touching `packages/ui-kit/`:

```yaml
- pnpm --filter @hbc/ui-kit check-types
- pnpm --filter @hbc/ui-kit lint
- pnpm --filter @hbc/ui-kit test
- pnpm --filter @hbc/ui-kit build
```

---

## Test Writing Guidelines

1. **Test user-observable outcomes**, not internal DOM structure
2. **Use `@testing-library/react`** for component rendering and user event simulation
3. **Use `@testing-library/jest-dom`** matchers for accessible assertions (`toBeVisible`, `toHaveRole`, etc.)
4. **Mock only at boundaries** — prefer testing through public component APIs
5. **Keep tests focused** — one behavior per test, descriptive names
6. **Exclude story files** — stories are not test targets; they have their own runner

---

*Verification Coverage Plan v1.0 — WS1-T11 (2026-03-16)*
