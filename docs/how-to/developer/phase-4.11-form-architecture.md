# Phase 4.11 — Form Architecture Developer Guide

**Reference:** PH4.11-UI-Design-Plan.md §11, Blueprint §1d

## Overview

Phase 4.11 enhances the HbcForm system with form-level context for validation state, dirty tracking, error summary, and new layout/footer components. All enhancements are backward-compatible — existing consumers require zero changes.

## Components

### HbcForm (enhanced)

The form wrapper now provides a React context to descendant fields. New optional props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onDirtyChange` | `(isDirty: boolean) => void` | — | Called when form dirty state changes |
| `showErrorSummary` | `boolean` | `true` | Show error summary banner when errors exist |

```tsx
<HbcForm onSubmit={handleSubmit} onDirtyChange={setIsDirty} showErrorSummary>
  {/* fields */}
</HbcForm>
```

### HbcFormRow

Responsive flex row: side-by-side above 768px, stacked below. Not the same as `HbcFormLayout` (CSS Grid).

```tsx
<HbcFormRow gap="12px">
  <HbcTextField label="First Name" value={first} onChange={setFirst} />
  <HbcTextField label="Last Name" value={last} onChange={setLast} />
</HbcFormRow>
```

### HbcStickyFormFooter

Standalone Cancel + Save footer. Positioning-agnostic (no `position: sticky`). Use via HbcForm's `stickyFooter` prop for sticky behavior.

```tsx
<HbcForm
  onSubmit={handleSubmit}
  stickyFooter={
    <HbcStickyFormFooter onCancel={handleCancel} primaryLoading={saving} />
  }
>
  {/* fields */}
</HbcForm>
```

## Form Context & Validation

### Field Registration

Fields with a `fieldId` prop automatically register with the form context:

```tsx
<HbcTextField
  label="Project Name"
  value={name}
  onChange={setName}
  fieldId="name"
  required
  onBlurValidate={(v) => (!v ? 'Project name is required' : undefined)}
/>
```

### Validation Triggers

| Component | Trigger | Prop |
|-----------|---------|------|
| `HbcTextField` | Blur | `onBlurValidate` |
| `HbcSelect` | Change | `onChangeValidate` |
| `HbcCheckbox` | — | Dirty tracking only |

### Error Summary

When fields report errors via context, HbcForm renders an `HbcBanner variant="error"` at the top with clickable links that scroll to and focus each errored field.

### Dirty Tracking

Any field with `fieldId` that receives user input calls `markDirty()` on the context. The form fires `onDirtyChange(true)` on the first edit.

## Touch Target Enforcement

The `useFormDensity` hook (wrapping `useAdaptiveDensity`) provides `inputMinHeight` per density tier:

| Tier | Min Height | Condition |
|------|-----------|-----------|
| Touch | 56px | `pointer: coarse` + width < 1024px |
| Standard | 36px | Default |
| Compact | 28px | `pointer: fine` + width >= 1440px |

HbcTextField and HbcSelect apply `minHeight` automatically when tier is `touch`.

## Z-Index

Form sticky footer uses `Z_INDEX.stickyFooter` (50) — above content (0) but below sidebar (100).

## Fields Outside HbcForm

Fields used without an HbcForm parent receive a noop context — they render normally but don't participate in error summary or dirty tracking. Zero breaking changes.

## Voice Dictation

Voice dictation is available on `HbcTextArea` and `HbcRichTextEditor` (from `HbcInput` module) via the `enableVoice` prop. These are separate components, not part of HbcTextField.

## Exports

From `@hbc/ui-kit`:

**Components:** `HbcFormRow`, `HbcStickyFormFooter`
**Hooks:** `useHbcFormContext`
**Types:** `HbcFormRowProps`, `HbcStickyFormFooterProps`, `HbcFormContextValue`, `FormFieldError`
