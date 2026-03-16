import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcThemeProvider } from '../../HbcAppShell/HbcThemeContext.js';
import { HbcSelect } from '../HbcSelect.js';

const TEST_OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
  { value: 'c', label: 'Charlie' },
];

function renderSelect(props: Partial<React.ComponentProps<typeof HbcSelect>> = {}) {
  return render(
    <HbcThemeProvider>
      <HbcSelect label="Pick one" options={TEST_OPTIONS} {...props} />
    </HbcThemeProvider>,
  );
}

describe('HbcSelect', () => {
  it('renders with data-hbc-ui="select"', () => {
    const { container } = renderSelect();
    const el = container.querySelector('[data-hbc-ui="select"]');
    expect(el).toBeInTheDocument();
  });

  it('renders label text', () => {
    renderSelect({ label: 'Country' });
    expect(screen.getByText('Country')).toBeInTheDocument();
  });

  it('renders the correct number of options in the DOM', async () => {
    const user = userEvent.setup();
    renderSelect();
    // Fluent Combobox only renders option text after opening the dropdown
    const combobox = screen.getByRole('combobox');
    await user.click(combobox);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3);
  });

  it('shows validation message when provided', () => {
    renderSelect({ validationMessage: 'Selection required' });
    expect(screen.getByText('Selection required')).toBeInTheDocument();
  });

  it('renders disabled combobox when disabled is true', () => {
    renderSelect({ disabled: true });
    const combobox = screen.getByRole('combobox');
    expect(combobox).toBeDisabled();
  });
});
