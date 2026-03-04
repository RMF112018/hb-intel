# HbcSearch

Search input component with support for global and local search variants.

## Import

```tsx
import { HbcSearch } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | HbcSearchVariant | 'local' | Search scope: 'global' \| 'local' |
| placeholder | string | 'Search...' | Input placeholder text |
| value | string | required | Current search query |
| onChange | (value: string) => void | required | Callback on input change |
| onSearch | (query: string) => void | - | Callback when search is submitted |
| debounce | number | 300 | Debounce delay in milliseconds |

## Usage

```tsx
const [searchQuery, setSearchQuery] = useState('');

<HbcSearch
  variant="global"
  placeholder="Search projects, teams, documents..."
  value={searchQuery}
  onChange={setSearchQuery}
  onSearch={(query) => navigate(`/search?q=${query}`)}
  debounce={300}
/>
```

## Field Mode Behavior

Search input background and text color adapt for dark surfaces in Field Mode. Input border and focus state remain visible and accessible. Search icon and clear button maintain contrast.

## Accessibility

- `role="searchbox"` on input element
- `aria-label` describes search scope (e.g., "Search all projects")
- `aria-autocomplete="list"` if search results appear
- Clear button has aria-label "Clear search"
- Placeholder text is supplementary (label or aria-label required)
- Enter key submits search via onSearch callback
- Escape key clears search
- Focus indicator clearly visible
- Search results, if shown, are in ARIA live region

## SPFx Constraints

No SPFx-specific constraints.
