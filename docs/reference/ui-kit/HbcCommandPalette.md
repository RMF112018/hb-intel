# HbcCommandPalette

Cmd+K command palette for rapid command discovery and execution.

## Import

```tsx
import { HbcCommandPalette } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| results | CommandPaletteResult[] | required | Array of command results to display |
| categories | CommandPaletteCategory[] | undefined | Grouped command categories |
| onSelect | (result: CommandPaletteResult) => void | required | Selection handler |
| placeholder | string | 'Type a command...' | Placeholder text |

## Usage

```tsx
const [open, setOpen] = useState(false);

useEffect(() => {
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      setOpen(!open);
    }
  };
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [open]);

<HbcCommandPalette
  open={open}
  results={commands}
  categories={commandCategories}
  onSelect={(cmd) => {
    cmd.action();
    setOpen(false);
  }}
  placeholder="Search commands..."
/>
```

## Field Mode Behavior

Command palette overlay uses Field Mode dark background. Result items adapt with lighter text and darker hover states. The input field follows hbcFieldTheme styling with increased contrast for visibility.

## Accessibility

- Implements `role="combobox"` with `aria-expanded`
- Arrow keys navigate results
- Enter selects highlighted item
- Escape closes palette
- Screen readers announce result count and categories
- All results are keyboard accessible

## SPFx Constraints

No SPFx-specific constraints.
