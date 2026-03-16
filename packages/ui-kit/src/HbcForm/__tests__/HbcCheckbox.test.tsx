import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcCheckbox } from '../HbcCheckbox.js';

function renderCheckbox(props: Partial<React.ComponentProps<typeof HbcCheckbox>> = {}) {
  return render(
    <HbcThemeProvider>
      <HbcCheckbox label="Accept terms" {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcCheckbox', () => {
  it('renders with data-hbc-ui="checkbox"', () => {
    const { container } = renderCheckbox();
    const el = container.querySelector('[data-hbc-ui="checkbox"]');
    expect(el).toBeInTheDocument();
  });

  it('renders label text', () => {
    renderCheckbox({ label: 'Remember me' });
    expect(screen.getByText('Remember me')).toBeInTheDocument();
  });

  it('reflects checked state', () => {
    renderCheckbox({ checked: true });
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('fires onChange when clicked', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    renderCheckbox({ onChange: handleChange });
    await user.click(screen.getByRole('checkbox'));
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
