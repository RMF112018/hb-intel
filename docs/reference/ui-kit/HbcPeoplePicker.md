# HbcPeoplePicker

Production-grade people selection with Microsoft Graph live lookup. Replaces the D-PH6-10 textarea stub with a governed combobox + chip pattern.

## Architecture

Three-layer design for cross-surface reuse:

1. **`HbcPeoplePicker`** (visual) — combobox input, person chips, dropdown results, keyboard navigation
2. **`useGraphPeopleSearch`** (adapter) — debounced Graph `/users` search, takes a `getAccessToken` provider
3. **`createSpfxGraphTokenProvider`** (auth, in `@hbc/auth/spfx`) — acquires Graph-scoped tokens from SPFx context

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Field label |
| `value` | `string[] \| PersonEntry[]` | required | Selected people (UPN strings or PersonEntry objects) |
| `onChange` | `(people: PersonEntry[]) => void` | required | Selection callback |
| `searchPeople` | `PeopleSearchFn` | — | Search adapter (Graph, static, or custom) |
| `mode` | `'single' \| 'multi'` | `'single'` | Selection mode |
| `placeholder` | `string` | auto | Search input placeholder |
| `required` | `boolean` | `false` | Required field indicator |
| `disabled` | `boolean` | `false` | Disable the picker |
| `validationMessage` | `string` | — | Error message |
| `className` | `string` | — | Additional CSS class |

### PersonEntry

| Field | Type | Description |
|-------|------|-------------|
| `upn` | `string` | User principal name (email) — primary key |
| `displayName` | `string` | Display name from directory |
| `jobTitle` | `string?` | Job title |
| `department` | `string?` | Department |

## Usage

### With Graph live search (SPFx)

```tsx
import { HbcPeoplePicker, useGraphPeopleSearch } from '@hbc/ui-kit';
import { createSpfxGraphTokenProvider, getSpfxContext } from '@hbc/auth/spfx';

const getGraphToken = createSpfxGraphTokenProvider(getSpfxContext());
const searchPeople = useGraphPeopleSearch(getGraphToken);

<HbcPeoplePicker
  label="Project Manager"
  value={selected}
  onChange={setSelected}
  searchPeople={searchPeople}
  mode="single"
  required
/>
```

### With static mock search (dev/storybook)

```tsx
import { HbcPeoplePicker, createStaticPeopleSearch } from '@hbc/ui-kit';

const mockPeople = [
  { upn: 'john@hb.com', displayName: 'John Smith', jobTitle: 'PM' },
  { upn: 'jane@hb.com', displayName: 'Jane Doe', jobTitle: 'Estimator' },
];
const searchPeople = createStaticPeopleSearch(mockPeople);

<HbcPeoplePicker label="Team Member" value={[]} onChange={setSelected} searchPeople={searchPeople} mode="multi" />
```

### Manual UPN entry (fallback)

When `searchPeople` is not provided, the picker falls back to manual email entry with Enter to confirm.

```tsx
<HbcPeoplePicker label="Reviewer" value={[]} onChange={setSelected} />
```

## Keyboard interaction

- **ArrowDown/Up** — navigate dropdown results
- **Enter** — select highlighted result (or confirm manual UPN entry)
- **Escape** — close dropdown
- **Backspace** (empty input) — remove last selected person

## Accessibility

- `role="combobox"` with `aria-expanded`, `aria-controls`, `aria-activedescendant`
- Dropdown has `role="listbox"` with `role="option"` items
- Chip remove buttons have `aria-label="Remove {name}"`
- Validation messages linked via Fluent `<Field>` component

## States

- **Loading**: "Searching..." message in dropdown during Graph query
- **No results**: "No people found for ..." message
- **Disabled**: Reduced opacity, no interaction
- **Validation error**: Red border + error message below field
- **Single-select with value**: Input hidden, chip displayed
- **Multi-select**: Input always visible alongside chips

## Graph API requirements

The `useGraphPeopleSearch` hook queries `GET /v1.0/users?$filter=startswith(displayName,'{query}')...` which requires the SPFx app to have **User.Read.All** API permission approved in the SharePoint admin center.

## Data attribute

`data-hbc-ui="people-picker"` on the wrapper element.
