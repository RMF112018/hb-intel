# HbcForm

Form system providing composable form containers and sections with validation support.

## Import

```tsx
import { HbcForm, HbcFormLayout, HbcFormSection, HbcFormRow, HbcStickyFormFooter } from '@hbc/ui-kit';
```

## Props (HbcForm)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onSubmit | (data: T) => Promise<void> \| void | required | Form submission handler |
| children | ReactNode | required | Form fields and sections |
| defaultValues | Record<string, unknown> | undefined | Initial field values |

## Props (HbcFormSection)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | undefined | Section heading |
| description | string | undefined | Optional section description |
| children | ReactNode | required | Form fields within section |

## Props (HbcFormRow)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | 1 \| 2 \| 3 \| 4 | 1 | Number of columns for layout |
| children | ReactNode | required | Form fields in row |

## Usage

```tsx
<HbcForm onSubmit={handleSubmit} defaultValues={{ name: '', email: '' }}>
  <HbcFormLayout>
    <HbcFormSection title="Contact Information">
      <HbcFormRow>
        <input type="text" placeholder="Name" />
      </HbcFormRow>
    </HbcFormSection>

    <HbcStickyFormFooter>
      <HbcButton type="submit">Save</HbcButton>
    </HbcStickyFormFooter>
  </HbcFormLayout>
</HbcForm>
```

## Field Mode Behavior

Form surfaces adapt to Field Mode with darker backgrounds. Input fields use hbcFieldTheme tokens. Section dividers and borders appear lighter for contrast on dark backgrounds.

## Accessibility

- Form wrapper has `role="form"` with optional `aria-label`
- Required fields marked with `aria-required="true"`
- Error messages linked via `aria-describedby`
- Submit button clearly labeled
- Keyboard navigation flows naturally through fields

## SPFx Constraints

No SPFx-specific constraints.
