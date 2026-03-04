# HbcCommandBar

Toolbar with actions, filters, and saved views for data manipulation and discovery.

## Import

```tsx
import { HbcCommandBar } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| actions | CommandBarAction[] | required | Array of action items with key, label, icon, onClick |
| filters | CommandBarFilter[] | undefined | Filterable fields with options |
| savedViews | SavedView[] | undefined | Pre-configured view configurations |
| onSearch | (query: string) => void | undefined | Search callback |
| density | DensityTier | 'default' | Spacing density: 'compact', 'default', 'spacious' |

## Usage

```tsx
<HbcCommandBar
  actions={[
    { key: 'create', label: 'New', icon: <PlusIcon />, onClick: handleCreate },
    { key: 'export', label: 'Export', icon: <DownloadIcon />, onClick: handleExport }
  ]}
  filters={[
    { key: 'status', label: 'Status', options: ['Active', 'Inactive'] }
  ]}
  savedViews={[
    { id: 'view1', name: 'My View', config: {} }
  ]}
  onSearch={(query) => handleSearch(query)}
  density="default"
/>
```

## Field Mode Behavior

Toolbar background adapts to Field Mode with darker color. Action buttons use hbcFieldTheme tokens. Filter dropdowns and saved views adopt dark styling with lighter text and borders for visibility.

## Accessibility

- Implements `role="toolbar"` with `aria-label`
- Arrow keys navigate between action items
- All actions are keyboard accessible
- Filter and view selection use ARIA combobox patterns
- Search input has associated label

## SPFx Constraints

No SPFx-specific constraints.
