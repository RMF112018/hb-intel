import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcTextArea } from '../HbcTextArea.js';

function renderTextArea(props: Partial<React.ComponentProps<typeof HbcTextArea>> = {}) {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
  };
  return render(
    <HbcThemeProvider>
      <HbcTextArea {...defaultProps} {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcTextArea', () => {
  it('renders with data-hbc-ui="text-area"', () => {
    const { container } = renderTextArea();
    const el = container.querySelector('[data-hbc-ui="text-area"]');
    expect(el).toBeInTheDocument();
  });

  it('renders label text', () => {
    renderTextArea({ label: 'Description' });
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('renders textarea with value', () => {
    renderTextArea({ value: 'Hello world' });
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Hello world');
  });

  it('onChange fires when text is typed', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderTextArea({ onChange });

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'a');

    expect(onChange).toHaveBeenCalled();
  });

  it('required shows required indicator', () => {
    renderTextArea({ required: true, label: 'Notes' });
    // Fluent Field renders an asterisk for required fields
    const asterisk = screen.getByText('*');
    expect(asterisk).toBeInTheDocument();
  });

  it('disabled state applies', () => {
    renderTextArea({ disabled: true });
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('validation message renders when provided', () => {
    renderTextArea({ validationMessage: 'Field is required' });
    expect(screen.getByText('Field is required')).toBeInTheDocument();
  });

  it('maxLength shows character count', () => {
    renderTextArea({ value: 'Hello', maxLength: 100 });
    expect(screen.getByText('5/100')).toBeInTheDocument();
  });

  it('rows prop is forwarded to textarea', () => {
    renderTextArea({ rows: 8 });
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '8');
  });
});
