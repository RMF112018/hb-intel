/**
 * Phase-16 — composer state seam validation.
 *
 * Proves dirty detection, recipient / headline / excerpt validation,
 * success / error transitions, and reset behavior for the composer
 * state hook that backs HbKudos.
 */
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useKudosComposer } from '../data/useKudosComposer.js';
import { EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS } from '@hbc/ui-kit/homepage';

describe('useKudosComposer — state seam', () => {
  it('starts closed / idle / not dirty', () => {
    const { result } = renderHook(() => useKudosComposer());
    expect(result.current.state.isOpen).toBe(false);
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.isDirty).toBe(false);
    expect(result.current.state.validationErrors).toEqual({});
  });

  it('open() flips to editing', () => {
    const { result } = renderHook(() => useKudosComposer());
    act(() => result.current.actions.open());
    expect(result.current.state.isOpen).toBe(true);
    expect(result.current.state.status).toBe('editing');
  });

  it('dirty detection fires on any content change', () => {
    const { result } = renderHook(() => useKudosComposer());
    act(() => result.current.actions.updateDraft({ headline: 'hi' }));
    expect(result.current.state.isDirty).toBe(true);
  });

  it('pristine close resets draft and clears dirty', () => {
    const { result } = renderHook(() => useKudosComposer());
    act(() => result.current.actions.open());
    act(() => result.current.actions.updateDraft({ headline: 'x' }));
    act(() => result.current.actions.close());
    expect(result.current.state.isOpen).toBe(false);
    expect(result.current.state.isDirty).toBe(false);
    expect(result.current.state.draft.headline).toBe('');
  });

  it('text-mode: requires recipientNames + headline + excerpt', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useKudosComposer(onSubmit));
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(result.current.state.validationErrors.recipientNames).toBeTruthy();
    expect(result.current.state.validationErrors.headline).toBeTruthy();
    expect(result.current.state.validationErrors.excerpt).toBeTruthy();
  });

  it('typed-mode: requires at least one recipient bucket entry', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useKudosComposer(onSubmit, { recipientsMode: 'typed' }),
    );
    act(() =>
      result.current.actions.updateDraft({
        headline: 'good job',
        excerpt: 'nice',
        recipients: { ...EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS },
      }),
    );
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.state.validationErrors.recipients).toMatch(/recipient/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('typed-mode: rejects malformed email in individualEmails', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useKudosComposer(onSubmit, { recipientsMode: 'typed' }),
    );
    act(() =>
      result.current.actions.updateDraft({
        headline: 'h',
        excerpt: 'e',
        recipients: {
          ...EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS,
          individualEmails: ['not-an-email'],
        },
      }),
    );
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.state.validationErrors.recipients).toMatch(/not-an-email/);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('headline > 120 chars is rejected', async () => {
    const { result } = renderHook(() => useKudosComposer(async () => {}));
    act(() =>
      result.current.actions.updateDraft({
        recipientNames: 'Someone',
        headline: 'x'.repeat(121),
        excerpt: 'ok',
      }),
    );
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.state.validationErrors.headline).toMatch(/120/);
  });

  it('submit success transitions to "success"', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useKudosComposer(onSubmit));
    act(() =>
      result.current.actions.updateDraft({
        recipientNames: 'Ren',
        headline: 'Great work',
        excerpt: 'You did it',
      }),
    );
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(onSubmit).toHaveBeenCalledOnce();
    expect(result.current.state.status).toBe('success');
    expect(result.current.state.submitError).toBeUndefined();
  });

  it('submit error captures error message and transitions to "error"', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useKudosComposer(onSubmit));
    act(() =>
      result.current.actions.updateDraft({
        recipientNames: 'Ren',
        headline: 'Great work',
        excerpt: 'You did it',
      }),
    );
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.state.status).toBe('error');
    expect(result.current.state.submitError).toBe('network');
  });

  it('updateDraft clears field-level validation errors for the changed key', async () => {
    const { result } = renderHook(() => useKudosComposer(async () => {}));
    await act(async () => {
      await result.current.actions.submit();
    });
    expect(result.current.state.validationErrors.headline).toBeTruthy();
    act(() => result.current.actions.updateDraft({ headline: 'new' }));
    expect(result.current.state.validationErrors.headline).toBeUndefined();
  });

  it('reset() returns to empty editing draft (Send Another)', async () => {
    const { result } = renderHook(() => useKudosComposer(async () => {}));
    act(() =>
      result.current.actions.updateDraft({
        recipientNames: 'Ren',
        headline: 'H',
        excerpt: 'E',
      }),
    );
    act(() => result.current.actions.reset());
    expect(result.current.state.draft.headline).toBe('');
    expect(result.current.state.draft.excerpt).toBe('');
    expect(result.current.state.status).toBe('editing');
  });
});
