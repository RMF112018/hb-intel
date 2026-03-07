# PH4C.10 — UI Kit Application to PH5C Shell Dev Tooling

**Version:** 1.0
**Date:** 2026-03-07
**Purpose:** Apply `@hbc/ui-kit` components, Fluent UI tokens, and HBC design system CSS variables to the PH5C developer tooling suite (`DevToolbar`, `PersonaCard`, `DevToolbar.module.css`) in `packages/shell/src/devToolbar/`. Replace all hardcoded hex color values and plain HTML interactive elements with their correct `@hbc/ui-kit` equivalents, while preserving the dark developer-tool aesthetic and the `import.meta.env.DEV` production-bundle boundary.
**Audience:** Implementation agent(s), frontend developers, design system maintainers, QA engineers.
**Implementation Objective:** Guarantee that every component produced in PH5C conforms to the HB Intel UI Kit design system — using `HbcButton`, `HbcTabs`, `HbcStatusBadge`, `HbcCard`, Fluent `tokens`, and CSS variables from `@hbc/ui-kit` throughout — and that the production bundle safety guarantees established in PH5C remain fully intact after these changes.

---

## Prerequisites

**No hard prerequisites within PH4C** — this task is independent and may run in parallel with PH4C.1 through PH4C.9.

**However:** Before beginning, verify that `@hbc/ui-kit` is a declared dependency of `packages/shell`:

```bash
# Confirm @hbc/ui-kit is in packages/shell/package.json
grep -E '"@hbc/ui-kit"' packages/shell/package.json
# Expected: "@hbc/ui-kit": "workspace:*" (or similar)
```

If it is not present, add it before proceeding (see step 4C.10.1).

**Verify PH5C DevToolbar files exist:**

```bash
# Confirm PH5C deliverables are present
ls packages/shell/src/devToolbar/DevToolbar.tsx
ls packages/shell/src/devToolbar/PersonaCard.tsx
ls packages/shell/src/devToolbar/DevToolbar.module.css
ls packages/shell/src/devToolbar/useDevAuthBypass.ts
ls packages/shell/src/devToolbar/index.ts
# Expected: all five files present
```

---

## Context

PH5C (Auth & Shell Foundation Completion) delivered a complete developer toolbar suite — `DevToolbar.tsx`, `PersonaCard.tsx`, `useDevAuthBypass.ts`, `DevToolbar.module.css` — in `packages/shell/src/devToolbar/`. These components are fully functional and production-boundary-safe (gated behind `import.meta.env.DEV`), but they were built with raw CSS modules, hardcoded hex values (`#1a1a1a`, `#1e1e1e`, `#00a0e9`, `#333`, `#fff`, etc.), and plain HTML interactive elements (`<button>`, `<input type="range">`, `<input type="checkbox">`).

PH4C's expanded mandate requires that **the UI Kit be applied to every HB Intel feature** — including developer tooling. Applying `@hbc/ui-kit` to these components:

1. Tests the UI Kit in real application context, surfacing any integration gaps
2. Ensures the dev toolbar's interactive elements behave correctly under accessibility standards (keyboard navigation, high-contrast mode, focus rings)
3. Replaces brittle magic numbers with the same design system tokens used everywhere else in HB Intel
4. Preserves the dark-themed developer-tool aesthetic by using Fluent `makeStyles` with explicit forced-dark values rather than defaulting to the light app theme

**Important constraint:** The DevToolbar intentionally uses a dark theme to visually distinguish itself from the application it debugs. The UI Kit application must preserve this dark aesthetic. The approach is to use Fluent `makeStyles` with explicit dark-palette token values or CSS variable overrides — not to inherit the app's current `hbcLightTheme` context.

---

## 4C.10.1 — Verify or Add `@hbc/ui-kit` Dependency to `packages/shell`

```bash
cat packages/shell/package.json | grep -A5 '"dependencies"'
```

If `@hbc/ui-kit` is absent from `dependencies` or `devDependencies`:

**`packages/shell/package.json`** — add to `dependencies`:
```json
{
  "dependencies": {
    "@hbc/ui-kit": "workspace:*",
    ...existing
  }
}
```

Then run:
```bash
pnpm install
pnpm turbo run build --filter=@hbc/shell
# Expected: EXIT 0
```

If already present, skip this step and proceed.

---

## 4C.10.2 — Audit All Hardcoded Values in PH5C DevToolbar Files

Run the following to produce a complete inventory of hardcoded hex colors and raw HTML interactive elements:

```bash
# Hardcoded hex colors in DevToolbar files
grep -n "#[0-9a-fA-F]\{3,6\}" \
  packages/shell/src/devToolbar/DevToolbar.module.css \
  packages/shell/src/devToolbar/DevToolbar.tsx \
  packages/shell/src/devToolbar/PersonaCard.tsx \
  packages/shell/src/devToolbar/PersonaCard.module.css 2>/dev/null

# Plain HTML interactive elements that should be replaced
grep -n "<button\|<input type=" \
  packages/shell/src/devToolbar/DevToolbar.tsx \
  packages/shell/src/devToolbar/PersonaCard.tsx
```

Record the complete output. Expected inventory (based on PH5C.4 implementation):

| File | Hardcoded Value | Replacement Target |
|------|-----------------|--------------------|
| `DevToolbar.module.css` | `#1a1a1a` (background) | `var(--hbc-dev-surface-base)` (new dev-toolbar CSS var) |
| `DevToolbar.module.css` | `#00a0e9` (accent/brand) | `tokens.colorBrandBackground` via makeStyles |
| `DevToolbar.module.css` | `#333` (border/divider) | `var(--hbc-dev-border)` |
| `DevToolbar.module.css` | `#888`, `#b0b0b0`, `#e0e0e0` (text shades) | Fluent text tokens (dark variants) |
| `DevToolbar.module.css` | `rgba(0,0,0,0.3)` (shadow) | `tokens.shadow8Dark` or CSS variable |
| `DevToolbar.tsx` | `<button>` (toggle) | `HbcButton` |
| `DevToolbar.tsx` | `<button>` (tab nav, 3×) | `HbcTabs` + `HbcTab` |
| `DevToolbar.tsx` | `<button>` (Expire/Refresh) | `HbcButton` |
| `DevToolbar.tsx` | `<button>` (Clear SessionStorage) | `HbcButton` |
| `DevToolbar.tsx` | `<span className={styles.statusBadge}>` | `HbcStatusBadge` |
| `PersonaCard.tsx` | `<button>` (card wrapper) | `HbcCard` + click handler |
| `PersonaCard.tsx` | `<span className={styles.role}>` (role tags) | `HbcStatusBadge` (subtle variant) |

Do not proceed to code changes until the full inventory is recorded in the progress notes.

---

## 4C.10.3 — Create Dev-Toolbar CSS Variable Definitions

The DevToolbar needs a set of CSS variables that define its dark palette using the HBC design token system. Add these to the appropriate theme injection file in `packages/ui-kit/src/theme.ts` (or create a dev-toolbar-specific CSS override that is only injected in DEV mode).

**Approach:** Add a `[data-hbc-dev-toolbar]` CSS scope in the DevToolbar container so these variables apply only within the toolbar and do not leak into the app.

In `packages/shell/src/devToolbar/DevToolbar.tsx`, add `data-hbc-dev-toolbar` attribute to the root `div`:
```tsx
<div className={styles.toolbar} data-hbc-dev-toolbar>
```

Create `packages/shell/src/devToolbar/devToolbarTokens.css` — a standalone stylesheet imported in the DevToolbar component (dev builds only):

```css
/* packages/shell/src/devToolbar/devToolbarTokens.css */
/* Dev-toolbar CSS variable definitions — dark palette for developer tooling */
/* Applied under [data-hbc-dev-toolbar] scope; does not leak into app theme */

[data-hbc-dev-toolbar] {
  /* Base surfaces */
  --hbc-dev-surface-base:    #1a1a1a;
  --hbc-dev-surface-raised:  #222222;
  --hbc-dev-surface-overlay: #000000;

  /* Brand accent — HBC cyan/blue */
  --hbc-dev-accent:          #00a0e9;
  --hbc-dev-accent-hover:    #00c4ff;
  --hbc-dev-accent-text:     #ffffff;

  /* Borders and dividers */
  --hbc-dev-border:          #333333;
  --hbc-dev-border-active:   #00a0e9;

  /* Text hierarchy */
  --hbc-dev-text-primary:    #e0e0e0;
  --hbc-dev-text-secondary:  #b0b0b0;
  --hbc-dev-text-muted:      #666666;
  --hbc-dev-text-code:       #00a0e9;

  /* Interactive states */
  --hbc-dev-hover-bg:        #2a2a2a;
  --hbc-dev-selected-bg:     #1a2a3a;
  --hbc-dev-selected-border: #00a0e9;

  /* Status — session active/expired */
  --hbc-dev-status-active:   #00a0e9;
  --hbc-dev-status-expired:  #ff6b6b;
  --hbc-dev-status-pending:  #f0a500;

  /* Shadows */
  --hbc-dev-shadow:          0 -2px 8px rgba(0, 0, 0, 0.5);
}
```

Import this CSS file in `DevToolbar.tsx`:
```tsx
// Only import in DEV builds — Vite will tree-shake this in production
if (import.meta.env.DEV) {
  // CSS import is handled by the module bundler; no runtime call needed
}
import './devToolbarTokens.css';
```

> **Note:** The `import './devToolbarTokens.css'` will be included in the DEV bundle only because the entire `DevToolbar.tsx` module is guarded behind `import.meta.env.DEV` in `ShellCore.tsx`. The lazy `React.lazy(() => import('./devToolbar/DevToolbar'))` call is itself inside the DEV guard, so this CSS never enters the production bundle.

---

## 4C.10.4 — Replace `DevToolbar.module.css` with Fluent `makeStyles`

Remove `DevToolbar.module.css`. Replace all style definitions with a `makeStyles` hook in `DevToolbar.tsx`.

**`packages/shell/src/devToolbar/DevToolbar.tsx`** — add makeStyles:

```tsx
import { makeStyles, tokens } from '@fluentui/react-components';

const useDevToolbarStyles = makeStyles({
  toolbar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'var(--hbc-dev-surface-base)',
    borderTop: '2px solid var(--hbc-dev-border-active)',
    color: 'var(--hbc-dev-text-primary)',
    fontFamily: tokens.fontFamilyBase,
    fontSize: tokens.fontSizeBase200,
    zIndex: 99999,
    boxShadow: 'var(--hbc-dev-shadow)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    height: '36px',
    padding: `0 ${tokens.spacingHorizontalM}`,
    backgroundColor: 'var(--hbc-dev-surface-raised)',
    borderBottom: '1px solid var(--hbc-dev-border)',
  },
  content: {
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--hbc-dev-surface-base)',
    overflow: 'hidden',
  },
  tabContent: {
    flex: 1,
    overflowY: 'auto',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: 'var(--hbc-dev-surface-base)',
  },
  personasGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: tokens.spacingHorizontalS,
  },
  settingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
  },
  settingRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
  },
  settingLabel: {
    fontSize: tokens.fontSizeBase100,
    color: 'var(--hbc-dev-text-secondary)',
    fontFamily: tokens.fontFamilyBase,
  },
  sessionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  sessionStatusRow: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
    alignItems: 'center',
  },
  sessionMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
    backgroundColor: 'var(--hbc-dev-surface-raised)',
    borderRadius: tokens.borderRadiusMedium,
    border: '1px solid var(--hbc-dev-border)',
    fontSize: tokens.fontSizeBase100,
    color: 'var(--hbc-dev-text-secondary)',
  },
  sessionJson: {
    backgroundColor: 'var(--hbc-dev-surface-overlay)',
    border: '1px solid var(--hbc-dev-border)',
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingVerticalXS,
    overflowX: 'auto',
    flex: 1,
  },
  sessionJsonPre: {
    margin: 0,
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: tokens.fontSizeBase100,
    color: 'var(--hbc-dev-text-code)',
    lineHeight: tokens.lineHeightBase200,
  },
  sessionActions: {
    display: 'flex',
    gap: tokens.spacingHorizontalS,
  },
  noSession: {
    padding: tokens.spacingVerticalXL,
    textAlign: 'center',
    color: 'var(--hbc-dev-text-muted)',
    fontStyle: 'italic',
  },
  titleText: {
    fontFamily: tokens.fontFamilyMonospace,
    color: 'var(--hbc-dev-accent)',
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
});
```

Remove the `import styles from './DevToolbar.module.css'` line after the makeStyles hook is in place.

---

## 4C.10.5 — Replace Toggle `<button>` with `HbcButton`

In `DevToolbar.tsx`, replace the expand/collapse toggle:

```tsx
// BEFORE
import styles from './DevToolbar.module.css';
<button
  className={styles.toggleButton}
  onClick={() => setIsExpanded(!isExpanded)}
  title={isExpanded ? 'Collapse dev toolbar' : 'Expand dev toolbar'}
>
  <span className={styles.title}>HB-AUTH-DEV</span>
  <span className={styles.icon}>{isExpanded ? '▼' : '▲'}</span>
</button>

// AFTER
import { HbcButton } from '@hbc/ui-kit';
// (makeStyles defined in 4C.10.4 — use devToolbarStyles.titleText)
<HbcButton
  appearance="transparent"
  onClick={() => setIsExpanded(!isExpanded)}
  title={isExpanded ? 'Collapse dev toolbar' : 'Expand dev toolbar'}
  style={{ color: 'var(--hbc-dev-accent)', padding: 0 }}
  icon={isExpanded
    ? <span aria-hidden="true">▼</span>
    : <span aria-hidden="true">▲</span>
  }
  iconPosition="after"
>
  <span className={devToolbarStyles.titleText}>HB-AUTH-DEV</span>
</HbcButton>
```

---

## 4C.10.6 — Replace Tab Navigation `<button>` Elements with `HbcTabs`

The three-tab navigation (Personas / Settings / Session) should use the `HbcTabs` component from `@hbc/ui-kit`.

```tsx
// BEFORE — three raw <button> elements with manual active class
<div className={styles.tabNavigation}>
  <button className={`${styles.tab} ${activeTab === 'personas' ? styles.tabActive : ''}`}
    onClick={() => setActiveTab('personas')}>Personas</button>
  <button className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`}
    onClick={() => setActiveTab('settings')}>Settings</button>
  <button className={`${styles.tab} ${activeTab === 'session' ? styles.tabActive : ''}`}
    onClick={() => setActiveTab('session')}>Session</button>
</div>
<div className={styles.tabContent}>{/* tab panels */}</div>

// AFTER — HbcTabs with dev-toolbar style overrides
import { HbcTabs } from '@hbc/ui-kit';

// Map tab key to content
const TAB_ITEMS = [
  { value: 'personas', label: 'Personas' },
  { value: 'settings', label: 'Settings' },
  { value: 'session',  label: 'Session'  },
] as const;

<HbcTabs
  selectedValue={activeTab}
  onTabSelect={(_, data) => setActiveTab(data.value as TabType)}
  style={{
    '--colorNeutralBackground1': 'var(--hbc-dev-surface-raised)',
    '--colorBrandForeground1':   'var(--hbc-dev-accent)',
    '--colorNeutralForeground1': 'var(--hbc-dev-text-primary)',
    '--colorNeutralStroke1':     'var(--hbc-dev-border)',
    '--colorNeutralForeground2': 'var(--hbc-dev-text-secondary)',
  } as React.CSSProperties}
>
  {TAB_ITEMS.map((tab) => (
    <HbcTabs.Tab key={tab.value} value={tab.value}>
      {tab.label}
    </HbcTabs.Tab>
  ))}
  {TAB_ITEMS.map((tab) => (
    <HbcTabs.Panel key={tab.value} value={tab.value}
      className={devToolbarStyles.tabContent}>
      {tab.value === 'personas' && (/* personas content */)}
      {tab.value === 'settings' && (/* settings content */)}
      {tab.value === 'session'  && (/* session content */)}
    </HbcTabs.Panel>
  ))}
</HbcTabs>
```

> **Fluent CSS variable override note:** The `style` prop with `--colorBrandForeground1` etc. is the approved Fluent UI v9 pattern for scoped token overrides without a full `FluentProvider` re-wrap. This works because Fluent v9 reads its palette from CSS custom properties. Since the DevToolbar container has `data-hbc-dev-toolbar` scoped variables from step 4C.10.3, the overrides apply cleanly within the toolbar without affecting the app.

---

## 4C.10.7 — Replace Session Status `<span>` with `HbcStatusBadge`

In the Session tab, replace the hardcoded status badge:

```tsx
// BEFORE
<span className={styles.statusBadge}>
  {sessionExpiresIn && sessionExpiresIn > 0 ? 'Active' : 'Expired'}
</span>

// AFTER
import { HbcStatusBadge } from '@hbc/ui-kit';

<HbcStatusBadge
  status={sessionExpiresIn && sessionExpiresIn > 0 ? 'active' : 'expired'}
  // HbcStatusBadge maps status values to colors via its makeStyles definition
  // Forced-colors support is inherited from the PH4C.6 fix
/>
```

If `HbcStatusBadge` does not have `'active'` and `'expired'` as named status values, use the nearest equivalent (e.g., `'success'` / `'error'`) or extend the component's status map as part of this task.

---

## 4C.10.8 — Replace Action `<button>` Elements with `HbcButton`

Replace all remaining plain `<button>` elements in the Settings and Session tabs:

```tsx
// BEFORE — Settings tab
<button className={styles.button} onClick={() => { sessionStorage.clear(); }}>
  Clear SessionStorage
</button>

// AFTER
import { HbcButton } from '@hbc/ui-kit';
<HbcButton
  appearance="secondary"
  size="small"
  onClick={() => { sessionStorage.clear(); console.log('[HB-AUTH-DEV] Cleared sessionStorage'); }}
  style={{ color: 'var(--hbc-dev-text-primary)', borderColor: 'var(--hbc-dev-border)' }}
>
  Clear SessionStorage
</HbcButton>

// BEFORE — Session tab actions
<button className={styles.button} onClick={expireSession}>Expire Session</button>
<button className={styles.button} onClick={refreshSession}>Refresh Session</button>

// AFTER
<HbcButton appearance="secondary" size="small" onClick={expireSession}
  style={{ color: 'var(--hbc-dev-status-expired)', borderColor: 'var(--hbc-dev-status-expired)' }}>
  Expire Session
</HbcButton>
<HbcButton appearance="secondary" size="small" onClick={refreshSession}
  style={{ color: 'var(--hbc-dev-accent)', borderColor: 'var(--hbc-dev-border)' }}>
  Refresh Session
</HbcButton>
```

---

## 4C.10.9 — Apply `@hbc/ui-kit` to `PersonaCard.tsx`

Replace `PersonaCard.module.css` with a `makeStyles` hook. Replace the `<button>` wrapper with an `HbcCard`-derived pattern. Replace role `<span>` tags with `HbcStatusBadge`.

**Remove:** `import styles from './PersonaCard.module.css'`

**Add makeStyles to `PersonaCard.tsx`:**

```tsx
import React from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { HbcButton, HbcStatusBadge } from '@hbc/ui-kit';
import type { IPersona } from '@hbc/auth/dev';

const usePersonaCardStyles = makeStyles({
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalXS,
    padding: tokens.spacingVerticalS,
    backgroundColor: 'var(--hbc-dev-surface-raised)',
    border: '1px solid var(--hbc-dev-border)',
    borderRadius: tokens.borderRadiusMedium,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
    ':hover': {
      backgroundColor: 'var(--hbc-dev-hover-bg)',
      borderColor: 'var(--hbc-dev-accent)',
    },
    ':focus-visible': {
      outlineStyle: 'solid',
      outlineWidth: '2px',
      outlineColor: tokens.colorBrandForeground1,
    },
  },
  cardSelected: {
    backgroundColor: 'var(--hbc-dev-selected-bg)',
    borderColor: 'var(--hbc-dev-selected-border)',
    borderWidth: '2px',
  },
  personaName: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
    color: 'var(--hbc-dev-text-primary)',
    fontFamily: tokens.fontFamilyBase,
    lineHeight: tokens.lineHeightBase200,
  },
  personaEmail: {
    fontSize: tokens.fontSizeBase100,
    color: 'var(--hbc-dev-text-muted)',
    fontFamily: tokens.fontFamilyBase,
  },
  rolesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalXS,
    marginTop: tokens.spacingVerticalXS,
  },
});

export const PersonaCard: React.FC<PersonaCardProps> = ({ persona, isSelected, onSelect }) => {
  const styles = usePersonaCardStyles();

  return (
    <button
      className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
      onClick={onSelect}
      title={persona.description}
      aria-pressed={isSelected}
      aria-label={`Select persona: ${persona.name}`}
    >
      <span className={styles.personaName}>{persona.name}</span>
      <span className={styles.personaEmail}>{persona.email}</span>
      <div className={styles.rolesRow}>
        {persona.roles.slice(0, 3).map((role) => (
          <HbcStatusBadge
            key={role}
            status="informative"
            label={role}
            size="small"
          />
        ))}
      </div>
    </button>
  );
};
```

Delete `packages/shell/src/devToolbar/PersonaCard.module.css` after confirming the makeStyles implementation is complete:

```bash
# Verify no remaining imports of the old module CSS
grep -r "PersonaCard.module.css" packages/shell/src/devToolbar/
# Expected: zero matches

# Then delete
rm packages/shell/src/devToolbar/PersonaCard.module.css
```

---

## 4C.10.10 — Verify Production Bundle Boundary Is Intact

After all component changes, re-run the PH5C production bundle safety check to confirm no `@hbc/ui-kit` elements leak through the DevToolbar into the production bundle through an unguarded path:

```bash
# Build the production bundle
pnpm --filter @hbc/dev-harness build
# Expected: EXIT 0

# Confirm DevToolbar markers are absent from production bundle
rg -n "HB-AUTH-DEV|DevToolbar|devToolbar|hbc-dev-surface|hbc-dev-accent" \
  apps/dev-harness/dist --glob "*.js"
# Expected: zero matches

# Confirm ui-kit components used in DevToolbar are NOT newly introduced to production bundle
# (They should already be in the bundle if @hbc/ui-kit is a production dep of @hbc/shell)
# What matters is that HbcButton, HbcTabs etc are NOT loaded through the DevToolbar lazy path
# The existing ui-kit production bundle presence is acceptable; new additions from DevToolbar lazy path are not
rg -n "devToolbarTokens" apps/dev-harness/dist --glob "*.js"
# Expected: zero matches (CSS vars only loaded through lazy DevToolbar module)
```

---

## 4C.10.11 — Update DevToolbar Tests

The existing DevToolbar test suite (`packages/shell/src/devToolbar/DevToolbar.test.tsx` and `useDevAuthBypass.test.tsx`) must be updated to account for the new `@hbc/ui-kit` component usage:

1. Add `@hbc/ui-kit` mock or wrapper to the test setup if not already present:
   ```ts
   // In vitest setup or test wrapper
   import { FluentProvider, webLightTheme } from '@fluentui/react-components';

   const renderWithProviders = (ui: React.ReactElement) => render(
     <FluentProvider theme={webLightTheme}>{ui}</FluentProvider>
   );
   ```

2. Update assertions for button elements — `HbcButton` renders as `<button role="button">` internally so existing `getByRole('button')` queries should remain valid.

3. Update assertions for tab elements — `HbcTabs` renders tabs as `<button role="tab">`, so `getByRole('tab', { name: 'Personas' })` pattern is correct.

4. Confirm `aria-pressed` assertion on `PersonaCard` works correctly with the new `makeStyles` card.

5. Re-run tests and confirm ≥95% coverage is maintained:
   ```bash
   pnpm exec vitest run \
     packages/shell/src/devToolbar/DevToolbar.test.tsx \
     packages/shell/src/devToolbar/useDevAuthBypass.test.tsx \
     --coverage
   # Expected: ≥95% coverage on devToolbar files
   ```

---

## 4C.10.12 — Update Storybook Story for DevToolbar (if present)

Check if a Storybook story exists for DevToolbar:
```bash
find packages/ui-kit/src packages/shell/src -name "DevToolbar.stories.*" 2>/dev/null
```

If a story exists, update it to use the `withMockAuth` decorator from PH4C.9 so the DevToolbar renders with a complete mock session. If no story exists, create a basic one:

```tsx
// packages/shell/src/devToolbar/DevToolbar.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { DevToolbar } from './DevToolbar';

const meta: Meta<typeof DevToolbar> = {
  title: 'Shell/DevToolbar',
  component: DevToolbar,
  parameters: {
    // Force DEV mode for Storybook rendering
    // Note: DevToolbar guards on import.meta.env.DEV which is true in Storybook
    layout: 'fullscreen',
  },
};
export default meta;
type Story = StoryObj<typeof DevToolbar>;

export const Default: Story = {};
export const InitiallyExpanded: Story = {
  // Controlled story showing expanded state — requires isExpanded prop or
  // Storybook play function to click expand
  play: async ({ canvas }) => {
    const toggleButton = canvas.getByTitle('Expand dev toolbar');
    await userEvent.click(toggleButton);
  },
};
```

---

## Success Criteria Checklist

- [ ] **4C.10.1** `@hbc/ui-kit` is confirmed as a dependency of `packages/shell`; `pnpm install` and `pnpm turbo run build --filter=@hbc/shell` pass
- [ ] **4C.10.2** Full inventory of hardcoded values and raw HTML elements documented in progress notes; zero items unaccounted for before coding begins
- [ ] **4C.10.3** `devToolbarTokens.css` created with full dark-palette CSS variable set under `[data-hbc-dev-toolbar]` scope; `data-hbc-dev-toolbar` attribute added to toolbar root element
- [ ] **4C.10.4** `DevToolbar.module.css` replaced with `makeStyles` hook; no CSS module import remains in `DevToolbar.tsx`; all spacing and typography use Fluent `tokens`
- [ ] **4C.10.5** Toggle `<button>` replaced with `HbcButton` (appearance=`transparent`); visual and keyboard behavior unchanged
- [ ] **4C.10.6** Tab navigation replaced with `HbcTabs`; tab selection behavior identical to original; Fluent token overrides applied for dark theme
- [ ] **4C.10.7** Session status `<span>` replaced with `HbcStatusBadge`; Active and Expired states visually distinct
- [ ] **4C.10.8** All action `<button>` elements in Settings and Session tabs replaced with `HbcButton`; `size="small"` and appropriate `appearance` variant applied
- [ ] **4C.10.9** `PersonaCard.tsx` uses `makeStyles` with `HbcStatusBadge` for role tags; `PersonaCard.module.css` deleted; `aria-pressed` and `aria-label` present
- [ ] **4C.10.10** Production bundle scan passes — zero DevToolbar tokens or `devToolbarTokens` in production JS; PH5C production safety guarantee maintained
- [ ] **4C.10.11** DevToolbar test suite updated for new component patterns; `≥95%` coverage maintained on `devToolbar/` files
- [ ] **4C.10.12** Storybook story present for DevToolbar; Default and Expanded stories verified
- [ ] Zero hardcoded hex color values remain in any DevToolbar file
- [ ] `pnpm turbo run build --filter=@hbc/shell` exits 0 with zero warnings
- [ ] `pnpm turbo run lint --filter=@hbc/shell` exits 0 — no `no-direct-fluent-import` violations (all Fluent imports are through `@hbc/ui-kit`)
- [ ] `pnpm turbo run check-types --filter=@hbc/shell` exits 0 with zero type errors
- [ ] Visual inspection in Storybook confirms dark-themed toolbar aesthetic is preserved

---

## Verification Commands

```bash
# 1. No hardcoded hex values remain in any devToolbar file
grep -rn "#[0-9a-fA-F]\{3,6\}" \
  packages/shell/src/devToolbar/ \
  --include="*.tsx" --include="*.ts" --include="*.css"
# Expected: zero matches (devToolbarTokens.css is the only CSS file and uses var() not hex)

# 2. No CSS module imports remain in DevToolbar files
grep -rn "\.module\.css" packages/shell/src/devToolbar/
# Expected: zero matches (DevToolbar.module.css and PersonaCard.module.css deleted)

# 3. Shell package builds
pnpm turbo run build --filter=@hbc/shell
# Expected: EXIT 0, zero warnings

# 4. Shell lint passes
pnpm turbo run lint --filter=@hbc/shell
# Expected: EXIT 0, zero violations

# 5. Type check
pnpm turbo run check-types --filter=@hbc/shell
# Expected: EXIT 0, zero errors

# 6. Tests pass with coverage
pnpm exec vitest run \
  packages/shell/src/devToolbar/DevToolbar.test.tsx \
  packages/shell/src/devToolbar/useDevAuthBypass.test.tsx \
  --coverage --coverage.include='packages/shell/src/devToolbar/**' \
  --coverage.exclude='**/*.test.*' --coverage.all=false
# Expected: ≥95% coverage, zero test failures

# 7. Production bundle safety
pnpm --filter @hbc/dev-harness build && \
  rg -n "HB-AUTH-DEV|DevToolbar|devToolbar|hbc-dev-surface|devToolbarTokens" \
  apps/dev-harness/dist --glob "*.js"
# Expected: build EXIT 0, zero matches in production bundle

# 8. Full monorepo build (regression check)
pnpm turbo run build
# Expected: EXIT 0, all packages build successfully
```

---

## PH4C.10 Progress Notes

_(To be completed during implementation)_

- 4C.10.1 completed: YYYY-MM-DD — `@hbc/ui-kit` dependency confirmed/added to `packages/shell`
- 4C.10.2 completed: YYYY-MM-DD — Full hardcoded value inventory documented (N hex values, N raw elements)
- 4C.10.3 completed: YYYY-MM-DD — `devToolbarTokens.css` created; `data-hbc-dev-toolbar` attribute added
- 4C.10.4 completed: YYYY-MM-DD — `DevToolbar.module.css` removed; `makeStyles` hook in place
- 4C.10.5 completed: YYYY-MM-DD — Toggle `<button>` → `HbcButton`
- 4C.10.6 completed: YYYY-MM-DD — Tab nav → `HbcTabs`
- 4C.10.7 completed: YYYY-MM-DD — Status `<span>` → `HbcStatusBadge`
- 4C.10.8 completed: YYYY-MM-DD — Action buttons → `HbcButton`
- 4C.10.9 completed: YYYY-MM-DD — `PersonaCard.tsx` + `PersonaCard.module.css` replaced
- 4C.10.10 completed: YYYY-MM-DD — Production bundle scan PASS
- 4C.10.11 completed: YYYY-MM-DD — DevToolbar tests updated; ≥95% coverage confirmed
- 4C.10.12 completed: YYYY-MM-DD — Storybook story verified

### Verification Evidence

- `grep -rn "#[0-9a-fA-F]{3,6}" packages/shell/src/devToolbar/` → 0 matches — PASS / FAIL
- `grep -rn "\.module\.css" packages/shell/src/devToolbar/` → 0 matches — PASS / FAIL
- `pnpm turbo run build --filter=@hbc/shell` → EXIT 0 — PASS / FAIL
- `pnpm turbo run lint --filter=@hbc/shell` → EXIT 0 — PASS / FAIL
- `pnpm turbo run check-types --filter=@hbc/shell` → EXIT 0 — PASS / FAIL
- DevToolbar coverage → ≥95% — PASS / FAIL
- Production bundle grep → 0 matches — PASS / FAIL
- `pnpm turbo run build` (full monorepo) → EXIT 0 — PASS / FAIL
