import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { FoleonPreviewFallback } from '../FoleonPreviewFallback.js';
import { getFoleonHighlightsPreviewRecords } from '../../preview/FoleonPreviewData.js';

afterEach(() => cleanup());

describe('FoleonPreviewFallback', () => {
  it('renders a clearly labeled structural preview of the highlights app', () => {
    render(<FoleonPreviewFallback route="highlights" records={getFoleonHighlightsPreviewRecords()} />);

    expect(screen.getByRole('region', { name: /Preview: Marketing highlights/i })).toBeTruthy();
    expect(screen.getByText(/Preview layout/i)).toBeTruthy();
    expect(screen.getByText(/sample content structure/i)).toBeTruthy();
    expect(screen.getByText(/Content coming soon/i)).toBeTruthy();
  });

  it('renders feature and compact placeholder containers with media and metadata zones', () => {
    render(<FoleonPreviewFallback route="highlights" records={getFoleonHighlightsPreviewRecords()} />);

    expect(screen.getByTestId('foleon-preview-feature-card')).toBeTruthy();
    expect(screen.getAllByTestId('foleon-preview-compact-card')).toHaveLength(3);
    expect(screen.getAllByTestId('foleon-preview-media').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByLabelText('Preview metadata').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByLabelText('Preview project and market metadata').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByLabelText('Future reader action location').length).toBeGreaterThanOrEqual(4);
    expect(screen.getAllByText(/Reader links will appear when published Foleon content is connected/i)).toHaveLength(4);
  });

  it('does not render live-reader affordances for preview placeholders', () => {
    const { container } = render(
      <FoleonPreviewFallback route="highlights" records={getFoleonHighlightsPreviewRecords()} />,
    );

    expect(container.querySelector('a')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText(/^Read$/i)).toBeNull();
    expect(screen.queryByText(/Open externally/i)).toBeNull();
  });
});
