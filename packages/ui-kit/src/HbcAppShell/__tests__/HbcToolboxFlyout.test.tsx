import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcThemeProvider } from '../HbcThemeContext.js';
import { HbcToolboxFlyout } from '../HbcToolboxFlyout.js';

function renderFlyout(props: Parameters<typeof HbcToolboxFlyout>[0] = {}) {
  return render(
    <HbcThemeProvider>
      <HbcToolboxFlyout {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcToolboxFlyout', () => {
  it('renders a trigger button with "Open toolbox" label', () => {
    renderFlyout();
    expect(screen.getByLabelText('Open toolbox')).toBeInTheDocument();
  });

  it('opens flyout with role="dialog" on click', async () => {
    const user = userEvent.setup();
    renderFlyout();
    await user.click(screen.getByLabelText('Open toolbox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes flyout on Escape key', async () => {
    const user = userEvent.setup();
    renderFlyout();
    await user.click(screen.getByLabelText('Open toolbox'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onToolboxOpen callback when flyout opens', async () => {
    const user = userEvent.setup();
    const handleOpen = vi.fn();
    renderFlyout({ onToolboxOpen: handleOpen });
    await user.click(screen.getByLabelText('Open toolbox'));
    expect(handleOpen).toHaveBeenCalledOnce();
  });

  it('sets aria-expanded on the trigger button', async () => {
    const user = userEvent.setup();
    renderFlyout();
    const trigger = screen.getByLabelText('Open toolbox');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
