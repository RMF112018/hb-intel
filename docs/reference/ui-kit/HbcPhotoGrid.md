# HbcPhotoGrid

Responsive photo gallery grid with square thumbnails, hover caption overlays, optional add-photo tile, and "+N more" truncation.

## Import

```tsx
import { HbcPhotoGrid } from '@hbc/ui-kit';
import type { HbcPhotoGridProps, PhotoItem } from '@hbc/ui-kit';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| photos | PhotoItem[] | required | Photos to display |
| columns | 2 \| 3 \| 4 | 3 | Number of grid columns |
| onPhotoClick | (photo: PhotoItem) => void | undefined | Click handler for individual photos |
| onAddPhoto | () => void | undefined | Handler for add-photo tile (shows + tile when provided) |
| maxDisplay | number | undefined | Max photos before "+N more" truncation tile |
| className | string | undefined | Additional CSS class |

### PhotoItem

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | yes | Unique photo identifier |
| src | string | yes | Full-size image source URL |
| thumbnailSrc | string | no | Optional thumbnail URL (falls back to src) |
| alt | string | yes | Alt text for accessibility |
| caption | string | no | Optional caption text shown on hover |
| createdAt | string | no | ISO timestamp |

## Usage

```tsx
<HbcPhotoGrid
  photos={photos}
  columns={3}
  maxDisplay={9}
  onPhotoClick={(photo) => openLightbox(photo)}
  onAddPhoto={() => setShowUpload(true)}
/>
```

## Field Mode Behavior

In Field Mode, hover overlays and add-photo tile borders adapt via `hbcFieldTheme` tokens for dark background contrast.

## Accessibility

- Uses ARIA grid roles with proper cell structure
- Images include alt text from `PhotoItem.alt`
- Keyboard navigation via Enter/Space to select photos
- Lazy loading via `loading="lazy"` attribute
- Empty state message when no photos and no add handler

## SPFx Constraints

No SPFx-specific constraints. Images loaded via standard `<img>` elements with lazy loading.
