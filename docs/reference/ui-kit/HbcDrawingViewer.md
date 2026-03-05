# HbcDrawingViewer

3-layer PDF drawing viewer with markup overlay system. Enables pan/zoom, page navigation, sheet/revision selection, and real-time markup annotations.

## Import

```tsx
import { HbcDrawingViewer } from '@hbc/ui-kit';
import type {
  HbcDrawingViewerProps,
  DrawingMarkup,
  MarkupShapeType,
  SheetOption,
  RevisionOption,
} from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| pdfUrl | string | required | URL of the PDF to render |
| currentSheet | string | undefined | Current sheet identifier |
| currentRevision | string | undefined | Current revision identifier |
| markups | DrawingMarkup[] | [] | Existing markup annotations |
| enableMarkup | boolean | false | Enable markup drawing mode |
| sheetOptions | SheetOption[] | [] | Available sheets for selector |
| revisionOptions | RevisionOption[] | [] | Available revisions for selector |
| onSheetChange | (sheetId: string) => void | undefined | Sheet change handler |
| onRevisionChange | (revisionId: string) => void | undefined | Revision change handler |
| onMarkupCreate | (markup: Omit\<DrawingMarkup, 'id'\>) => void | undefined | Markup created handler |
| onMarkupDelete | (markupId: string) => void | undefined | Markup deleted handler |
| className | string | undefined | Additional CSS class |

### DrawingMarkup

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique markup identifier |
| type | MarkupShapeType | yes | Shape type |
| points | Array\<{ x: number; y: number }\> | yes | SVG path points |
| bounds | { x, y, width, height } | no | Bounding box |
| text | string | no | Text content for text/measurement markups |
| color | string | yes | Stroke/fill color |
| linkedItem | { type, id, label } | no | Optional linked item reference |
| createdBy | string | no | Creator user ID |
| createdAt | string | no | ISO timestamp |

### MarkupShapeType

`'freehand' | 'cloud' | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'text' | 'measurement' | 'pin'`

## Usage

```tsx
<HbcDrawingViewer
  pdfUrl="/api/drawings/A101.pdf"
  sheetOptions={[{ id: 'A101', label: 'Floor Plan Level 1' }]}
  revisionOptions={[{ id: 'rev3', label: 'Rev 3' }]}
  currentSheet="A101"
  enableMarkup
  markups={existingMarkups}
  onMarkupCreate={handleCreate}
/>
```

## Field Mode Behavior

In Field Mode, toolbar and controls adapt to dark background. PDF canvas rendering is unaffected. Markup colors maintain visibility against the field theme.

## Accessibility

- Page navigation buttons have descriptive aria-labels
- Markup toolbar items are keyboard-focusable
- Loading and error states announced to screen readers
- Zoom controls accessible via keyboard

## SPFx Constraints

Requires `pdfjs-dist` as a peer dependency. The PDF worker is loaded dynamically via `await import('pdfjs-dist')` to avoid bundling in SPFx webparts that do not use drawings.
