import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcFormGuard, useFormGuardContext } from '../HbcFormGuard.js';

/** Helper that renders inside HbcFormGuard and exposes context. */
function GuardContextConsumer({
  onContext,
}: {
  onContext: (ctx: ReturnType<typeof useFormGuardContext>) => void;
}) {
  const ctx = useFormGuardContext();
  onContext(ctx);
  return <span data-testid="guard-consumer">guarded</span>;
}

describe('HbcFormGuard', () => {
  it('renders children', () => {
    render(
      <HbcFormGuard isDirty={false}>
        <span>form content</span>
      </HbcFormGuard>,
    );
    expect(screen.getByText('form content')).toBeInTheDocument();
  });

  it('provides context via useFormGuardContext', () => {
    let captured: ReturnType<typeof useFormGuardContext> | undefined;
    render(
      <HbcFormGuard isDirty={false}>
        <GuardContextConsumer onContext={(ctx) => { captured = ctx; }} />
      </HbcFormGuard>,
    );
    expect(captured).toBeDefined();
    expect(typeof captured!.setShowPrompt).toBe('function');
    expect(typeof captured!.confirmNavigation).toBe('function');
    expect(typeof captured!.cancelNavigation).toBe('function');
  });

  it('attaches beforeunload listener when isDirty is true', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    render(
      <HbcFormGuard isDirty={true}>
        <span>dirty form</span>
      </HbcFormGuard>,
    );
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    addSpy.mockRestore();
  });

  it('does not attach beforeunload listener when isDirty is false', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    render(
      <HbcFormGuard isDirty={false}>
        <span>clean form</span>
      </HbcFormGuard>,
    );
    const beforeUnloadCalls = addSpy.mock.calls.filter(
      ([event]) => event === 'beforeunload',
    );
    expect(beforeUnloadCalls).toHaveLength(0);
    addSpy.mockRestore();
  });
});
