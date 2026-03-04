# Phase 4 Development Plan — UI Foundation & HB Intel Design System - Task 11
**Version:** 2.1
**Supersedes:** PH4-UI-Design-Plan.md V2.0
**Governed by:** HB-Intel-Blueprint-V4.md · CLAUDE.md v1.2
**Date:** March 2026

## 11. Form Architecture

All forms in HB Intel use the `HbcForm` / `HbcFormSection` component system. Direct HTML `<form>` elements are prohibited.

### Form Composition Pattern

```tsx
<HbcForm onSubmit={handleSubmit} onDirtyChange={setIsDirty}>
  <HbcFormSection title="General Information" collapsible={false}>
    <HbcFormRow>
      <HbcTextInput name="subject" label="Subject" required />
      <HbcSingleSelect name="type" label="Type" options={typeOptions} />
    </HbcFormRow>
    <HbcFormRow>
      <HbcContactPicker name="assignee" label="Assignee" required />
      <HbcDateSelect name="dueDate" label="Due Date" />
    </HbcFormRow>
    {/* voiceDictation prop enables microphone button — [V2.1] */}
    <HbcRichTextEditor name="description" label="Description" fullWidth voiceDictation />
  </HbcFormSection>

  <HbcFormSection title="Cost Impact" collapsible defaultCollapsed={false}>
    <HbcFormRow>
      <HbcSingleSelect name="costImpact" label="Cost Impact" options={['Yes','No','TBD']} />
      <HbcCurrencyInput name="costAmount" label="Amount" />
    </HbcFormRow>
  </HbcFormSection>

  <HbcFormSection title="Attachments" collapsible defaultCollapsed={false}>
    <HbcDropzone accept={['image/*', '.pdf', '.dwg']} maxSize={25 * 1024 * 1024} />
  </HbcFormSection>

  <HbcFormSection title="Notes" collapsible defaultCollapsed={false}>
    {/* voiceDictation on HbcTextArea for field use — [V2.1] */}
    <HbcTextArea name="notes" label="General Notes" voiceDictation />
  </HbcFormSection>

  <HbcFormSection title="Related Items" collapsible defaultCollapsed>
    <HbcRelatedItemsPicker types={['drawing', 'specification', 'photo']} />
  </HbcFormSection>

  <HbcStickyFormFooter>
    <HbcButton variant="ghost" onClick={onCancel}>Cancel</HbcButton>
    <HbcButton variant="primary" type="submit" loading={isSubmitting}>Save</HbcButton>
  </HbcStickyFormFooter>
</HbcForm>
```

### Inline Error Validation Rules

1. Validate on blur for text inputs. Validate on change for selects, dates, checkboxes.
2. Red (`#FF4D4D`) border + red error text (`body-small`) directly below field. Error icon in field right region.
3. Required indicator: asterisk `*` on label. Tooltip: `"This field is required"`.
4. Form-level error summary: `HbcBanner` (error variant) at form top. Each item is an anchor link.
5. Never clear user data on validation failure.

### Dropzone Specification

- Default: `2px dashed --hbc-border-default`, upload icon, `"Drag files here or click to browse"`.
- Drag-over: Border `#004B87`, background `#E8F1F8`.
- Upload progress: inline per file. File-level errors inline with red icon.

### `HbcStickyFormFooter`

Fixed to viewport bottom. `z-index: 100`. `box-shadow: 0 -2px 8px rgba(0,0,0,0.1)`.

### Touch Target Specification **[V2.1]**

| Density Tier | Minimum Touch Target | Rationale |
|---|---|---|
| Compact | 36px (mouse use — no gloves) | Desktop mouse users |
| Standard | 44px (WCAG recommendation) | Mixed office/tablet use |
| **Touch** | **56×56px** | **Gloved hand construction field use** |

All interactive elements in the Touch density tier must meet the 56×56px minimum. This includes buttons, icon buttons, table row action icons, form field inputs, checkboxes, and the microphone dictation button.