# HbcInput

Text input components suite including HbcTextArea, HbcRichTextEditor, and useVoiceDictation hook.

## Import

```tsx
import { HbcTextArea, HbcRichTextEditor, useVoiceDictation } from '@hbc/ui-kit';
```

## Props (HbcTextArea)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | undefined | Input label text |
| placeholder | string | undefined | Placeholder text |
| value | string | required | Current input value |
| onChange | (value: string) => void | required | Change handler |
| rows | number | 4 | Number of visible text rows |
| maxLength | number | undefined | Maximum character count |
| error | string | undefined | Error message to display |

## Usage

```tsx
<HbcTextArea
  label="Comments"
  placeholder="Enter your comments here..."
  value={comments}
  onChange={setComments}
  rows={6}
  error={commentsError}
/>

const { transcript, isListening, startListening } = useVoiceDictation();
<HbcButton onClick={startListening} disabled={isListening}>
  {isListening ? 'Listening...' : 'Dictate'}
</HbcButton>

<HbcRichTextEditor
  value={richContent}
  onChange={setRichContent}
  placeholder="Enter rich text..."
/>
```

## Field Mode Behavior

Input styling adapts to Field Mode with dark backgrounds. Text color increases in brightness, focus rings use hbcFieldTheme accent colors, borders appear lighter for visibility on dark surfaces.

## Accessibility

- Inputs have associated `<label>` elements for screen readers
- `aria-label` provides fallback labeling
- `aria-describedby` links error messages to inputs
- Focus indicators are visible with 2px outline
- Voice dictation uses Web Speech API with user permission

## SPFx Constraints

No SPFx-specific constraints.
