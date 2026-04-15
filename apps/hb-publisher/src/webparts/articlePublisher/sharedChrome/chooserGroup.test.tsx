import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ChooserGroup } from './ChooserGroup.js';

afterEach(cleanup);

type Flavor = 'apple' | 'banana' | 'cherry';

function Harness({
  initial,
  allowClear,
}: {
  readonly initial: Flavor | undefined;
  readonly allowClear?: boolean;
}) {
  const [value, setValue] = React.useState<Flavor | undefined>(initial);
  return (
    <ChooserGroup<Flavor>
      label="Flavor"
      value={value}
      options={['apple', 'banana', 'cherry']}
      onChange={setValue}
      getLabel={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
      allowClear={allowClear}
      clearLabel="Any"
    />
  );
}

function radios(): HTMLButtonElement[] {
  return screen.getAllByRole('radio') as HTMLButtonElement[];
}

describe('ChooserGroup', () => {
  it('exposes a radiogroup with accessible options and labels', () => {
    render(<Harness initial="banana" />);
    const group = screen.getByRole('radiogroup', { name: 'Flavor' });
    expect(group).toBeTruthy();
    const items = radios();
    expect(items.map((b) => b.textContent)).toEqual(['Apple', 'Banana', 'Cherry']);
  });

  it('applies the roving-tabindex model so only the checked option is tabbable', () => {
    render(<Harness initial="banana" />);
    const [apple, banana, cherry] = radios();
    expect(apple.tabIndex).toBe(-1);
    expect(banana.tabIndex).toBe(0);
    expect(cherry.tabIndex).toBe(-1);
    expect(banana.getAttribute('aria-checked')).toBe('true');
  });

  it('makes the first option the tab stop when nothing is checked', () => {
    render(<Harness initial={undefined} />);
    const [first, second] = radios();
    expect(first.tabIndex).toBe(0);
    expect(second.tabIndex).toBe(-1);
    expect(first.getAttribute('aria-checked')).toBe('false');
  });

  it('ArrowRight moves selection and focus to the next option and wraps', () => {
    render(<Harness initial="apple" />);
    let items = radios();
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'ArrowRight' });
    items = radios();
    expect(items[1].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(items[1]);
    fireEvent.keyDown(items[1], { key: 'ArrowRight' });
    items = radios();
    fireEvent.keyDown(items[2], { key: 'ArrowRight' });
    items = radios();
    expect(items[0].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(items[0]);
  });

  it('ArrowLeft wraps to the last option from the first', () => {
    render(<Harness initial="apple" />);
    const items = radios();
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'ArrowLeft' });
    const after = radios();
    expect(after[2].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(after[2]);
  });

  it('Home and End jump to the first and last options', () => {
    render(<Harness initial="banana" />);
    let items = radios();
    items[1].focus();
    fireEvent.keyDown(items[1], { key: 'End' });
    items = radios();
    expect(items[2].getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(items[2], { key: 'Home' });
    items = radios();
    expect(items[0].getAttribute('aria-checked')).toBe('true');
  });

  it('Space activates the focused option without scrolling', () => {
    const onChange = vi.fn();
    render(
      <ChooserGroup<Flavor>
        label="Flavor"
        value="apple"
        options={['apple', 'banana', 'cherry']}
        onChange={onChange}
        getLabel={(v) => v}
      />,
    );
    const items = radios();
    items[2].focus();
    const event = fireEvent.keyDown(items[2], { key: ' ' });
    expect(event).toBe(false);
    expect(onChange).toHaveBeenCalledWith('cherry');
  });

  it('treats the clear chip as part of the roving group when allowClear is set', () => {
    render(<Harness initial={undefined} allowClear />);
    const items = radios();
    expect(items.map((b) => b.textContent)).toEqual(['Any', 'Apple', 'Banana', 'Cherry']);
    expect(items[0].getAttribute('aria-checked')).toBe('true');
    expect(items[0].tabIndex).toBe(0);
    items[0].focus();
    fireEvent.keyDown(items[0], { key: 'ArrowRight' });
    const after = radios();
    expect(after[1].getAttribute('aria-checked')).toBe('true');
    expect(document.activeElement).toBe(after[1]);
  });

  it('clicking an option still selects it', () => {
    render(<Harness initial="apple" />);
    fireEvent.click(screen.getByRole('radio', { name: 'Cherry' }));
    const items = radios();
    expect(items[2].getAttribute('aria-checked')).toBe('true');
  });
});
