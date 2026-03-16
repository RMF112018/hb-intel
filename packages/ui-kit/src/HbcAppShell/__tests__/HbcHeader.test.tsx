import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@hbc/shell', () => ({
  useProjectStore: () => ({ activeProject: null, availableProjects: [] }),
}));

import { HbcThemeProvider } from '../HbcThemeContext.js';
import { HbcHeader } from '../HbcHeader.js';

function renderHeader(props: Parameters<typeof HbcHeader>[0] = {}) {
  return render(
    <HbcThemeProvider>
      <HbcHeader {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcHeader', () => {
  it('renders with role="banner"', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('has data-hbc-ui="header"', () => {
    renderHeader();
    expect(screen.getByRole('banner')).toHaveAttribute('data-hbc-ui', 'header');
  });

  it('displays fallback logo text when no logo prop is provided', () => {
    renderHeader();
    expect(screen.getByText('HB')).toBeInTheDocument();
  });

  it('renders a custom logo when provided', () => {
    renderHeader({ logo: <img src="/logo.png" alt="Custom Logo" /> });
    expect(screen.getByAltText('Custom Logo')).toBeInTheDocument();
  });

  it('renders the "Project Home" link', () => {
    renderHeader();
    expect(screen.getByLabelText('Project Home')).toBeInTheDocument();
  });
});
