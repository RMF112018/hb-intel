import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { TeamPresentationPanel } from './TeamPresentationPanel.js';
import type { PublisherArticleRow } from '../../../data/publisherAdapter/index.js';

afterEach(cleanup);

function baseDraft(overrides: Partial<PublisherArticleRow> = {}): PublisherArticleRow {
  return {
    ArticleId: 'art-1',
    Title: 'Untitled',
    ArticleContentType: 'monthlySpotlight',
    Destination: 'projectSpotlight',
    Slug: 'untitled',
    TemplateKey: 'ps-inprogress-monthly-v1',
    WorkflowState: 'draft',
    Subhead: '',
    SummaryExcerpt: '',
    BodyRichText: '',
    CreatedDateUtc: '2026-04-01T00:00:00Z',
    UpdatedDateUtc: '2026-04-01T00:00:00Z',
    HeroPrimaryImage: 'https://img.example/hero.jpg',
    HeroPrimaryImageAltText: 'Alt',
    ...overrides,
  } as PublisherArticleRow;
}

describe('TeamPresentationPanel progressive disclosure', () => {
  it('keeps the show-team toggle and team heading on the primary path', () => {
    render(<TeamPresentationPanel draft={baseDraft()} onChange={vi.fn()} />);
    expect(
      screen.getByLabelText(/Include a team section on the published page/i),
    ).toBeTruthy();
    expect(screen.getByLabelText(/Team heading/i)).toBeTruthy();
  });

  it('shows the live default-heading placeholder on the primary path', () => {
    render(
      <TeamPresentationPanel
        draft={baseDraft({ ProjectName: 'Bayshore Tower', TeamViewerTitle: '' })}
        onChange={vi.fn()}
      />,
    );
    const heading = screen.getByLabelText(/Team heading/i) as HTMLInputElement;
    expect(heading.placeholder).toBe('The Team at Bayshore Tower');
  });

  it('wraps intro, layout, grouping, sort, initial-visible, and allow-expand inside a collapsed disclosure', () => {
    render(<TeamPresentationPanel draft={baseDraft()} onChange={vi.fn()} />);
    const section = screen.getByTestId('team-advanced-section') as HTMLDetailsElement;
    expect(section.tagName).toBe('DETAILS');
    expect(section.open).toBe(false);
    expect(section.textContent).toMatch(/Team intro/);
    expect(section.textContent).toMatch(/Team layout/);
    expect(section.textContent).toMatch(/Grouping/);
    expect(section.textContent).toMatch(/Sort order/);
    expect(section.textContent).toMatch(/How many members visible/);
    expect(section.textContent).toMatch(/Allow readers to expand/);
  });

  it('starts the advanced section open when any advanced field is already set', () => {
    render(
      <TeamPresentationPanel
        draft={baseDraft({ TeamViewerMode: 'grouped' })}
        onChange={vi.fn()}
      />,
    );
    expect(
      (screen.getByTestId('team-advanced-section') as HTMLDetailsElement).open,
    ).toBe(true);
  });

  it('edits to the team heading still flow through onChange on the primary path', () => {
    const onChange = vi.fn();
    render(<TeamPresentationPanel draft={baseDraft()} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText(/Team heading/i), {
      target: { value: 'The Crew at Acme Tower' },
    });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ TeamViewerTitle: 'The Crew at Acme Tower' }),
    );
  });
});
