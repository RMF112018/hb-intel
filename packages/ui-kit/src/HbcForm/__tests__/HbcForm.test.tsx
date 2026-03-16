import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HbcForm } from '../HbcForm.js';
import { useHbcFormContext } from '../HbcFormContext.js';

/** Helper that renders inside HbcForm and exposes context values. */
function ContextConsumer({ onContext }: { onContext: (ctx: ReturnType<typeof useHbcFormContext>) => void }) {
  const ctx = useHbcFormContext();
  onContext(ctx);
  return <span data-testid="consumer">inside</span>;
}

describe('HbcForm', () => {
  it('renders a form element with data-hbc-ui="form"', () => {
    const { container } = render(
      <HbcForm>
        <span>field</span>
      </HbcForm>,
    );
    const form = container.querySelector('form');
    expect(form).toHaveAttribute('data-hbc-ui', 'form');
  });

  it('renders children', () => {
    render(
      <HbcForm>
        <span>child content</span>
      </HbcForm>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('fires onSubmit on form submission', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(
      <HbcForm onSubmit={handleSubmit}>
        <button type="submit">Go</button>
      </HbcForm>,
    );
    await user.click(screen.getByRole('button', { name: 'Go' }));
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledOnce();
    });
  });

  it('provides form context to descendants', () => {
    let captured: ReturnType<typeof useHbcFormContext> | undefined;
    render(
      <HbcForm>
        <ContextConsumer onContext={(ctx) => { captured = ctx; }} />
      </HbcForm>,
    );
    expect(captured).toBeDefined();
    expect(captured!.isFormContextActive).toBe(true);
    expect(typeof captured!.register).toBe('function');
    expect(typeof captured!.setValue).toBe('function');
  });

  it('merges className onto the form element', () => {
    const { container } = render(
      <HbcForm className="custom-class">
        <span>field</span>
      </HbcForm>,
    );
    const form = container.querySelector('form');
    expect(form?.className).toContain('custom-class');
  });
});
