import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcSearch } from '../index.js';

describe('HbcSearch', () => {
  it('renders with data-hbc-ui="search"', () => {
    const { container } = render(
      <HbcSearch variant="local" value="" onSearch={() => {}} />,
    );
    expect(container.querySelector('[data-hbc-ui="search"]')).toBeInTheDocument();
  });

  it('local variant renders input', () => {
    render(<HbcSearch variant="local" value="" onSearch={() => {}} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('data-hbc-variant="local"/"global"', () => {
    const { container: localContainer } = render(
      <HbcSearch variant="local" value="" onSearch={() => {}} />,
    );
    expect(localContainer.querySelector('[data-hbc-variant="local"]')).toBeInTheDocument();

    const { container: globalContainer } = render(
      <HbcSearch variant="global" />,
    );
    expect(globalContainer.querySelector('[data-hbc-variant="global"]')).toBeInTheDocument();
  });

  it('placeholder text', () => {
    render(
      <HbcSearch variant="local" value="" onSearch={() => {}} placeholder="Find items..." />,
    );
    expect(screen.getByPlaceholderText('Find items...')).toBeInTheDocument();
  });
});
