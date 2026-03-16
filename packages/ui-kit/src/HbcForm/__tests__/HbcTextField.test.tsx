import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcTextField } from '../HbcTextField.js';

/**
 * HbcTextField uses dual-mode (RHF + controlled). These tests exercise the
 * controlled fallback path which renders without an HbcForm provider.
 */

function renderTextField(props: Partial<React.ComponentProps<typeof HbcTextField>> = {}) {
  return render(
    <HbcThemeProvider>
      <HbcTextField label="Test Label" {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcTextField', () => {
  it('renders with data-hbc-ui="text-field"', () => {
    const { container } = renderTextField();
    const el = container.querySelector('[data-hbc-ui="text-field"]');
    expect(el).toBeInTheDocument();
  });

  it('renders label text', () => {
    renderTextField({ label: 'Email Address' });
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('renders required marker when required is true', () => {
    renderTextField({ required: true, label: 'Username' });
    // Fluent Field renders an asterisk for required fields
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
  });

  it('renders disabled input when disabled is true', () => {
    renderTextField({ disabled: true });
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('shows validation message when provided', () => {
    renderTextField({ validationMessage: 'This field is required' });
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('forwards input type prop', () => {
    const { container } = renderTextField({ type: 'email' });
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'email');
  });
});
