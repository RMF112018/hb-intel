# Phase 4b.8 — Form Architecture Guide

**Binding Decision:** D-07 — All data entry forms must use `HbcForm`, `HbcFormLayout`, `HbcFormSection`, and `HbcStickyFormFooter`. Raw form elements are prohibited.

## Canonical Form Page Pattern

Every form page follows this structure:

```tsx
import { WorkspacePageShell, HbcForm, HbcFormSection, HbcFormLayout,
  HbcTextField, HbcSelect, HbcStickyFormFooter, HbcFormGuard } from '@hbc/ui-kit';
import { useFormDraft } from '@hbc/query-hooks';

function NewRiskItemPage() {
  const { mutate, isLoading } = useCreateRiskItem();
  const navigate = useNavigate();
  const [isDirty, setIsDirty] = useState(false);

  // Draft auto-save/restore (4b.8.2)
  const { draft, saveDraft, clearDraft } = useFormDraft('risk:new');
  const [formData, setFormData] = useState(() => draft ?? RISK_DEFAULTS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(formData, { onSuccess: () => { clearDraft(); navigate('/risk'); } });
  };

  return (
    <WorkspacePageShell layout="form" title="New Risk Item">
      <HbcFormGuard isDirty={isDirty}>
        <HbcForm
          onSubmit={handleSubmit}
          onDirtyChange={(dirty) => {
            setIsDirty(dirty);
            if (dirty) saveDraft(formData);
          }}
          stickyFooter={
            <HbcStickyFormFooter
              onCancel={() => { clearDraft(); navigate('/risk'); }}
              primaryLoading={isLoading}
            />
          }
        >
          <HbcFormSection title="Risk Details">
            <HbcFormLayout columns={2}>
              <HbcTextField
                label="Risk Title"
                value={formData.title}
                onChange={(v) => setFormData({ ...formData, title: v })}
                fieldId="title"
                required
              />
              <HbcSelect
                label="Category"
                value={formData.category}
                onChange={(v) => setFormData({ ...formData, category: v })}
                options={RISK_CATEGORIES}
                fieldId="category"
              />
            </HbcFormLayout>
          </HbcFormSection>
        </HbcForm>
      </HbcFormGuard>
    </WorkspacePageShell>
  );
}
```

## Draft Auto-Save/Restore (4b.8.2)

The `useFormDraft` hook from `@hbc/query-hooks` provides automatic draft persistence:

```tsx
const { draft, saveDraft, clearDraft, hasDraft } = useFormDraft('domain:entityId');
```

| Method | Description |
|--------|-------------|
| `draft` | Current draft data, or `undefined` if none exists |
| `hasDraft` | Boolean indicating if a draft exists |
| `saveDraft(data)` | Save form data as a draft (call on every dirty change) |
| `clearDraft()` | Clear the draft (call on submit or cancel) |

The `formId` key format follows `"domain:entityId"` convention (e.g., `risk:new`, `rfi:123`).

### Restoring drafts on mount

```tsx
const { draft } = useFormDraft('risk:new');
const [formData, setFormData] = useState(() => draft ?? DEFAULT_VALUES);
```

## Unsaved Changes Protection (4b.8.3)

`HbcFormGuard` provides two layers of protection:

1. **Browser tab close**: Prevents closing/refreshing the tab via `beforeunload`
2. **In-app navigation**: Shows `HbcConfirmDialog` with "Unsaved Changes" warning

```tsx
<HbcFormGuard isDirty={isDirty}>
  <HbcForm onDirtyChange={setIsDirty} ...>
    ...
  </HbcForm>
</HbcFormGuard>
```

### Router integration

For TanStack Router integration, use `useFormGuardContext()` inside the guard:

```tsx
function RouterBlockerIntegration() {
  const { setShowPrompt } = useFormGuardContext();
  // Wire to router's useBlocker to call setShowPrompt(true) on navigation attempt
}
```

## Form Density (4b.8.5)

Form inputs automatically respond to the density tier from `useDensity()`:

| Density Tier | Input Min Height | Footer Height | Use Case |
|-------------|-----------------|---------------|----------|
| `touch` | 56px | 64px | Touch devices (WCAG 2.5.8) |
| `comfortable` | 36px | 56px | Default desktop |
| `compact` | 28px | 48px | Dense desktop layouts |

Page authors never set density manually — it's detected automatically via `pointer: coarse` media query and can be overridden at the shell level.

## Component Reference

| Component | Purpose |
|-----------|---------|
| `HbcForm` | Root form container with context, error summary, dirty tracking |
| `HbcFormLayout` | Responsive grid (1-4 columns) |
| `HbcFormSection` | Named section with divider, optional collapse |
| `HbcFormRow` | Single row within a layout |
| `HbcTextField` | Text input wired to form context |
| `HbcSelect` | Dropdown wired to form context |
| `HbcCheckbox` | Checkbox wired to form context |
| `HbcStickyFormFooter` | Always-visible Save/Cancel footer |
| `HbcFormGuard` | Unsaved changes protection wrapper |

## Anti-Patterns

### Never use raw HTML form elements

```tsx
// WRONG — violates D-07
<form onSubmit={handleSubmit}>
  <input type="text" value={name} onChange={...} />
  <button type="submit">Save</button>
</form>

// CORRECT — use HbcForm system
<HbcForm onSubmit={handleSubmit}>
  <HbcTextField label="Name" value={name} onChange={setName} fieldId="name" />
  <HbcStickyFormFooter onCancel={handleCancel} />
</HbcForm>
```

### Never render your own save/cancel buttons in content

```tsx
// WRONG — buttons should be in HbcStickyFormFooter
<HbcForm onSubmit={handleSubmit}>
  <HbcTextField ... />
  <div style={{ display: 'flex', gap: '8px' }}>
    <button onClick={handleCancel}>Cancel</button>
    <button type="submit">Save</button>
  </div>
</HbcForm>

// CORRECT
<HbcForm
  onSubmit={handleSubmit}
  stickyFooter={<HbcStickyFormFooter onCancel={handleCancel} />}
>
  <HbcTextField ... />
</HbcForm>
```

### Never implement your own unsaved changes dialog

```tsx
// WRONG — use HbcFormGuard
useEffect(() => {
  window.addEventListener('beforeunload', ...);
}, [isDirty]);

// CORRECT
<HbcFormGuard isDirty={isDirty}>
  <HbcForm ...>...</HbcForm>
</HbcFormGuard>
```
