import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { handleSectionIndexClick } from './sectionFocus.js';

afterEach(cleanup);

function Harness(): JSX.Element {
  return (
    <>
      <nav aria-label="Workspace sections" onClick={handleSectionIndexClick}>
        <a href="#section-story">Story</a>
        <a href="#section-team">Team</a>
        <a href="#elsewhere">External</a>
        <a href="#section-missing">Missing</a>
      </nav>
      <section id="section-story" tabIndex={-1} data-testid="story-section">
        story body
      </section>
      <section id="section-team" tabIndex={-1} data-testid="team-section">
        team body
      </section>
    </>
  );
}

describe('handleSectionIndexClick', () => {
  it('moves focus to the target section when an in-canvas anchor is clicked', () => {
    render(<Harness />);
    const story = screen.getByTestId('story-section');
    fireEvent.click(screen.getByText('Story'));
    expect(document.activeElement).toBe(story);
  });

  it('calls scrollIntoView with smooth-block-start when available', () => {
    render(<Harness />);
    const team = screen.getByTestId('team-section');
    const spy = vi.fn();
    (team as unknown as { scrollIntoView: typeof spy }).scrollIntoView = spy;
    fireEvent.click(screen.getByText('Team'));
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' });
  });

  it('does nothing when the target element does not exist (external hash)', () => {
    render(<Harness />);
    const before = document.activeElement;
    fireEvent.click(screen.getByText('Missing'));
    // focus should not have landed on any canvas section
    expect(document.activeElement).toBe(before);
  });

  it('ignores clicks whose target is not an <a> element', () => {
    const event = {
      target: document.createElement('div'),
      preventDefault: vi.fn(),
    } as unknown as React.MouseEvent<HTMLElement>;
    handleSectionIndexClick(event);
    expect((event as unknown as { preventDefault: () => void }).preventDefault).not.toHaveBeenCalled();
  });
});
