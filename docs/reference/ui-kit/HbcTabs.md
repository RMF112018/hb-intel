# HbcTabs

Tab navigation component for organizing related content into selectable panels.

## Import

```tsx
import { HbcTabs } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tabs | TabPanel[] | required | Array of tab panel objects with id, label, content |
| activeTab | string | required | ID of currently active tab |
| onTabChange | (tabId: string) => void | required | Callback when user selects tab |
| orientation | 'horizontal' \| 'vertical' | 'horizontal' | Layout direction |

### TabPanel

| Property | Type | Description |
|----------|------|-------------|
| id | string | Unique tab identifier |
| label | string | Tab display label |
| content | ReactNode | Panel content |

## Usage

```tsx
const [activeTab, setActiveTab] = useState('overview');

<HbcTabs
  tabs={[
    { id: 'overview', label: 'Overview', content: <OverviewPanel /> },
    { id: 'details', label: 'Details', content: <DetailsPanel /> },
    { id: 'team', label: 'Team', content: <TeamPanel /> },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  orientation="horizontal"
/>
```

## Field Mode Behavior

Tab bar background adapts to dark surface in Field Mode. Active tab indicator uses bright color for contrast. Inactive tab text remains readable but muted. Panel content inherits Field Mode styling.

## Accessibility

- `role="tablist"` on container
- `role="tab"` on each tab button with `aria-selected="true|false"`
- `role="tabpanel"` on content container with `aria-labelledby` linking to active tab
- Arrow key navigation: Left/Right arrows move between horizontal tabs, Up/Down for vertical
- Home/End keys jump to first/last tab
- Tab enters the tablist with focus, arrow keys navigate
- Only active tab is in tab order (roving tabindex pattern)

## SPFx Constraints

No SPFx-specific constraints.
