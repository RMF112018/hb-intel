import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcButton } from '../index.js';

describe('HbcButton', () => {
  it('renders as a button element with type="button" by default', () => {
    render(<HbcButton>Click me</HbcButton>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('forwards the type prop', () => {
    render(<HbcButton type="submit">Submit</HbcButton>);
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit');
  });

  it('fires onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<HbcButton onClick={handleClick}>Press</HbcButton>);
    await user.click(screen.getByRole('button', { name: 'Press' }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('does not fire onClick when disabled', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <HbcButton disabled onClick={handleClick}>
        Press
      </HbcButton>,
    );
    await user.click(screen.getByRole('button', { name: 'Press' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not fire onClick when loading', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <HbcButton loading onClick={handleClick}>
        Press
      </HbcButton>,
    );
    await user.click(screen.getByRole('button'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('shows a spinner when loading', () => {
    render(<HbcButton loading>Loading</HbcButton>);
    // Fluent Spinner renders with role="progressbar"
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('disables the button when loading', () => {
    render(<HbcButton loading>Loading</HbcButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('has the disabled attribute when disabled prop is true', () => {
    render(<HbcButton disabled>Disabled</HbcButton>);
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });

  it('renders with data-hbc-ui="button"', () => {
    render(<HbcButton>Click</HbcButton>);
    expect(screen.getByRole('button')).toHaveAttribute('data-hbc-ui', 'button');
  });

  it('renders children text', () => {
    render(<HbcButton>Save Changes</HbcButton>);
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
  });
});
