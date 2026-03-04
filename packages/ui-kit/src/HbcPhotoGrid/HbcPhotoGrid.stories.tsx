/**
 * HbcPhotoGrid — Storybook stories
 * PH4.13 §13.4 | Blueprint §1d
 */
import type { Meta, StoryObj } from '@storybook/react';
import { HbcPhotoGrid } from './index.js';
import type { PhotoItem } from './types.js';

const samplePhotos: PhotoItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `photo-${i + 1}`,
  src: `https://picsum.photos/seed/${i + 1}/400/400`,
  thumbnailSrc: `https://picsum.photos/seed/${i + 1}/200/200`,
  alt: `Construction site photo ${i + 1}`,
  caption: i % 3 === 0 ? `Foundation pour — Section ${i + 1}` : undefined,
  createdAt: new Date(2026, 2, i + 1).toISOString(),
}));

const meta: Meta<typeof HbcPhotoGrid> = {
  title: 'Components/HbcPhotoGrid',
  component: HbcPhotoGrid,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcPhotoGrid>;

export const Default: Story = {
  args: {
    photos: samplePhotos.slice(0, 6),
    columns: 3,
    onPhotoClick: (photo) => console.log('Clicked:', photo.id),
  },
};

export const WithAddButton: Story = {
  args: {
    photos: samplePhotos.slice(0, 4),
    columns: 3,
    onPhotoClick: (photo) => console.log('Clicked:', photo.id),
    onAddPhoto: () => console.log('Add photo clicked'),
  },
};

export const MaxDisplay: Story = {
  args: {
    photos: samplePhotos,
    columns: 4,
    maxDisplay: 8,
    onPhotoClick: (photo) => console.log('Clicked:', photo.id),
  },
};

export const EmptyState: Story = {
  args: {
    photos: [],
    columns: 3,
  },
};
