import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcThemeProvider } from '../HbcThemeContext.js';
import { HbcCreateButton } from '../HbcCreateButton.js';

function renderButton(props: Parameters<typeof HbcCreateButton>[0] = {}) {
  return render(
    <HbcThemeProvider>
      <HbcCreateButton {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcCreateButton', () => {
  it('renders with "Create" text', () => {
    renderButton();
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders as type="button"', () => {
    renderButton();
    const btn = screen.getByRole('button', { name: /create/i });
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderButton({ onClick: handleClick });
    await user.click(screen.getByRole('button', { name: /create/i }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('has an accessible label mentioning "Create new item"', () => {
    renderButton();
    expect(screen.getByLabelText(/create new item/i)).toBeInTheDocument();
  });
});
