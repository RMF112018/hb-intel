import type * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { PccDisabledAffordance } from './PccDisabledAffordance';

afterEach(() => {
  cleanup();
});

describe('PccDisabledAffordance', () => {
  it('renders an aria-disabled button labeled with the supplied label', () => {
    const { getByRole } = render(
      <PccDisabledAffordance label="Open" reason="This step is managed elsewhere." />,
    );
    const button = getByRole('button', { name: /Open/ });
    expect(button.getAttribute('aria-disabled')).toBe('true');
  });

  it('wires aria-describedby to a node containing the supplied reason', () => {
    const { container, getByRole } = render(
      <PccDisabledAffordance label="Open" reason="This step is managed in SharePoint." />,
    );
    const button = getByRole('button', { name: /Open/ });
    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const reasonNode = container.querySelector('[data-pcc-disabled-affordance-reason]');
    expect(reasonNode).not.toBeNull();
    expect(reasonNode?.id).toBe(describedBy?.split(' ')[0]);
    expect(reasonNode?.textContent).toBe('This step is managed in SharePoint.');
  });

  it('renders a next-step node only when nextStep is provided', () => {
    const { container: withNext } = render(
      <PccDisabledAffordance
        label="Save"
        reason="Saving is handled by the source system."
        nextStep="Open the source system to save."
      />,
    );
    expect(withNext.querySelector('[data-pcc-disabled-affordance-next-step]')?.textContent).toBe(
      'Open the source system to save.',
    );

    cleanup();

    const { container: withoutNext } = render(
      <PccDisabledAffordance label="Save" reason="Saving is handled by the source system." />,
    );
    expect(withoutNext.querySelector('[data-pcc-disabled-affordance-next-step]')).toBeNull();
  });

  it('suppresses click activation even if a caller bypasses the type system', () => {
    const onClickSpy = vi.fn();
    const props = {
      label: 'Open',
      reason: 'This step is managed elsewhere.',
      onClick: onClickSpy,
    } as unknown as React.ComponentProps<typeof PccDisabledAffordance>;
    const { getByRole } = render(<PccDisabledAffordance {...props} />);
    const button = getByRole('button', { name: /Open/ });
    fireEvent.click(button);
    expect(onClickSpy).not.toHaveBeenCalled();
  });
});
