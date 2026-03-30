import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HbcPeoplePicker } from '../index.js';
import type { PersonEntry, PeopleSearchFn } from '../types.js';

const ALICE: PersonEntry = { upn: 'alice@hb.com', displayName: 'Alice Johnson', jobTitle: 'PM' };
const BOB: PersonEntry = { upn: 'bob@hb.com', displayName: 'Bob Smith', jobTitle: 'Estimator' };

const mockSearch: PeopleSearchFn = vi.fn(async (query: string) => {
  if (query.length < 2) return [];
  const people = [ALICE, BOB];
  return people.filter((p) => p.displayName.toLowerCase().includes(query.toLowerCase()));
});

describe('HbcPeoplePicker', () => {
  it('renders with data-hbc-ui="people-picker"', () => {
    const { container } = render(
      <HbcPeoplePicker label="Executive" value={[]} onChange={() => {}} />,
    );
    expect(container.querySelector('[data-hbc-ui="people-picker"]')).toBeInTheDocument();
  });

  it('renders the label', () => {
    render(<HbcPeoplePicker label="Project Manager" value={[]} onChange={() => {}} />);
    expect(screen.getByText('Project Manager')).toBeInTheDocument();
  });

  it('renders selected person as chip', () => {
    render(
      <HbcPeoplePicker label="PM" value={[ALICE]} onChange={() => {}} />,
    );
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
  });

  it('renders UPN strings as chips (backward compat)', () => {
    render(
      <HbcPeoplePicker label="PM" value={['alice@hb.com']} onChange={() => {}} />,
    );
    expect(screen.getByText('alice@hb.com')).toBeInTheDocument();
  });

  it('removes a person when chip remove button is clicked', () => {
    const onChange = vi.fn();
    render(
      <HbcPeoplePicker label="PM" value={[ALICE]} onChange={onChange} />,
    );
    fireEvent.click(screen.getByLabelText('Remove Alice Johnson'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('does not show remove button when disabled', () => {
    render(
      <HbcPeoplePicker label="PM" value={[ALICE]} onChange={() => {}} disabled />,
    );
    expect(screen.queryByLabelText('Remove Alice Johnson')).not.toBeInTheDocument();
  });

  it('shows search results after typing', async () => {
    render(
      <HbcPeoplePicker label="PM" value={[]} onChange={() => {}} searchPeople={mockSearch} />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Ali' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('selects a person from results', async () => {
    const onChange = vi.fn();
    render(
      <HbcPeoplePicker label="PM" value={[]} onChange={onChange} searchPeople={mockSearch} />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Ali' } });

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Alice Johnson'));
    expect(onChange).toHaveBeenCalledWith([ALICE]);
  });

  it('shows "No people found" when search returns empty', async () => {
    const emptySearch: PeopleSearchFn = async () => [];
    render(
      <HbcPeoplePicker label="PM" value={[]} onChange={() => {}} searchPeople={emptySearch} />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'xyz' } });

    await waitFor(() => {
      expect(screen.getByText(/No people found/)).toBeInTheDocument();
    });
  });

  it('has combobox role with aria-expanded', () => {
    render(
      <HbcPeoplePicker label="PM" value={[]} onChange={() => {}} />,
    );
    const input = screen.getByRole('combobox');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('navigates results with ArrowDown and selects with Enter', async () => {
    const onChange = vi.fn();
    render(
      <HbcPeoplePicker label="PM" value={[]} onChange={onChange} searchPeople={mockSearch} />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'b' } });

    // Wait for results — "b" is only 1 char, should not trigger
    await new Promise((r) => setTimeout(r, 400));

    // Now type enough
    fireEvent.change(input, { target: { value: 'bo' } });

    await waitFor(() => {
      expect(screen.getByText('Bob Smith')).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith([BOB]);
  });

  it('removes last chip on Backspace when input is empty', () => {
    const onChange = vi.fn();
    render(
      <HbcPeoplePicker label="Team" value={[ALICE, BOB]} onChange={onChange} mode="multi" />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    expect(onChange).toHaveBeenCalledWith([ALICE]);
  });

  it('supports manual UPN entry when no searchPeople provided', () => {
    const onChange = vi.fn();
    render(
      <HbcPeoplePicker label="PM" value={[]} onChange={onChange} />,
    );
    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'test@hb.com' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith([{ upn: 'test@hb.com', displayName: 'test@hb.com' }]);
  });

  it('shows validation message', () => {
    render(
      <HbcPeoplePicker
        label="PM"
        value={[]}
        onChange={() => {}}
        validationMessage="This field is required"
      />,
    );
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('in single mode, hides input after selection', () => {
    render(
      <HbcPeoplePicker label="PM" value={[ALICE]} onChange={() => {}} mode="single" />,
    );
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('in multi mode, keeps input after selection', () => {
    render(
      <HbcPeoplePicker label="Team" value={[ALICE]} onChange={() => {}} mode="multi" />,
    );
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });
});
