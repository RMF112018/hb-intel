import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcPhotoGrid } from '../index.js';
import type { PhotoItem } from '../types.js';

const photos: PhotoItem[] = [
  { id: '1', src: '/a.jpg', alt: 'Photo A' },
  { id: '2', src: '/b.jpg', alt: 'Photo B' },
  { id: '3', src: '/c.jpg', alt: 'Photo C' },
  { id: '4', src: '/d.jpg', alt: 'Photo D' },
];

describe('HbcPhotoGrid', () => {
  it('renders with data-hbc-ui="photo-grid"', () => {
    const { container } = render(<HbcPhotoGrid photos={photos} />);
    expect(container.querySelector('[data-hbc-ui="photo-grid"]')).toBeInTheDocument();
  });

  it('renders photo tiles with images', () => {
    render(<HbcPhotoGrid photos={photos} />);
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(4);
    expect(images[0]).toHaveAttribute('alt', 'Photo A');
  });

  it('shows "No photos available" when empty and no onAddPhoto', () => {
    render(<HbcPhotoGrid photos={[]} />);
    expect(screen.getByText('No photos available')).toBeInTheDocument();
  });

  it('shows "+N more" tile when maxDisplay exceeded', () => {
    render(<HbcPhotoGrid photos={photos} maxDisplay={3} />);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('shows add tile when onAddPhoto provided', () => {
    render(<HbcPhotoGrid photos={[]} onAddPhoto={() => {}} />);
    expect(screen.getByLabelText('Add photo')).toBeInTheDocument();
  });

  it('fires onPhotoClick on tile click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<HbcPhotoGrid photos={photos} onPhotoClick={onClick} />);

    const tiles = screen.getAllByRole('gridcell');
    await user.click(tiles[0]);

    expect(onClick).toHaveBeenCalledWith(photos[0]);
  });
});
