import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { recordBicTransfer, BIC_TRANSFER_EVENT } from '../transfer/recordBicTransfer';
import { _clearDeduplicatorForTests } from '../transfer/TransferDeduplicator';
import type { BicTransferPayload } from '../transfer/recordBicTransfer';

describe('recordBicTransfer', () => {
  beforeEach(() => _clearDeduplicatorForTests());
  afterEach(() => _clearDeduplicatorForTests());

  it('dispatches a DOM custom event on first call', () => {
    const handler = vi.fn();
    window.addEventListener(BIC_TRANSFER_EVENT, handler);

    recordBicTransfer({
      itemKey: 'bd-scorecard::001',
      fromOwner: { userId: 'u-alice', displayName: 'Alice', role: 'PM' },
      toOwner: { userId: 'u-bob', displayName: 'Bob', role: 'Director' },
      action: 'Submitted for review',
    });

    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0][0] as CustomEvent;
    expect(event.detail.itemKey).toBe('bd-scorecard::001');

    window.removeEventListener(BIC_TRANSFER_EVENT, handler);
  });

  it('does not dispatch duplicate events in same bucket (D-03)', () => {
    const handler = vi.fn();
    window.addEventListener(BIC_TRANSFER_EVENT, handler);

    const payload = {
      itemKey: 'bd-scorecard::002',
      fromOwner: { userId: 'u-alice', displayName: 'Alice', role: 'PM' },
      toOwner: { userId: 'u-bob', displayName: 'Bob', role: 'Director' },
      action: 'Submitted for review',
    };

    recordBicTransfer(payload);
    recordBicTransfer(payload);

    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener(BIC_TRANSFER_EVENT, handler);
  });

  it('handles null fromOwner', () => {
    const handler = vi.fn();
    window.addEventListener(BIC_TRANSFER_EVENT, handler);

    recordBicTransfer({
      itemKey: 'bd-scorecard::003',
      fromOwner: null,
      toOwner: { userId: 'u-bob', displayName: 'Bob', role: 'Director' },
      action: 'Initial assignment',
    });

    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener(BIC_TRANSFER_EVENT, handler);
  });

  it('handles null toOwner (unassignment)', () => {
    const handler = vi.fn();
    window.addEventListener(BIC_TRANSFER_EVENT, handler);

    recordBicTransfer({
      itemKey: 'bd-scorecard::004',
      fromOwner: { userId: 'u-alice', displayName: 'Alice', role: 'PM' },
      toOwner: null,
      action: 'Unassigned',
    });

    expect(handler).toHaveBeenCalledTimes(1);

    window.removeEventListener(BIC_TRANSFER_EVENT, handler);
  });

  it('registers notification with @hbc/notification-intelligence when toOwner present', async () => {
    const ni = await import('@hbc/notification-intelligence');
    const spy = vi.spyOn(ni.notificationIntelligence, 'registerEvent');

    recordBicTransfer({
      itemKey: 'bd-scorecard::005',
      fromOwner: { userId: 'u-alice', displayName: 'Alice', role: 'PM' },
      toOwner: { userId: 'u-bob', displayName: 'Bob', role: 'Director' },
      action: 'Submitted for review',
    });

    // Wait for async notification registration
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      tier: 'immediate',
      type: 'bic-transfer',
      itemKey: 'bd-scorecard::005',
      recipientUserId: 'u-bob',
    }));

    spy.mockRestore();
  });

  it('handles notification registration failure gracefully', async () => {
    const ni = await import('@hbc/notification-intelligence');
    vi.spyOn(ni.notificationIntelligence, 'registerEvent').mockImplementation(() => {
      throw new Error('Notification service unavailable');
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    recordBicTransfer({
      itemKey: 'bd-scorecard::006',
      fromOwner: null,
      toOwner: { userId: 'u-bob', displayName: 'Bob', role: 'Director' },
      action: 'Initial assignment',
    });

    // Wait for async notification registration
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to register BIC transfer notification'),
      expect.any(Error)
    );

    warnSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('skips notification when toOwner is null', async () => {
    const ni = await import('@hbc/notification-intelligence');
    const spy = vi.spyOn(ni.notificationIntelligence, 'registerEvent');

    recordBicTransfer({
      itemKey: 'bd-scorecard::007',
      fromOwner: { userId: 'u-alice', displayName: 'Alice', role: 'PM' },
      toOwner: null,
      action: 'Unassigned',
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    // Should NOT have been called since toOwner is null
    expect(spy).not.toHaveBeenCalledWith(expect.objectContaining({
      itemKey: 'bd-scorecard::007',
    }));

    spy.mockRestore();
  });

  it('builds correct notification title from itemKey', async () => {
    const ni = await import('@hbc/notification-intelligence');
    const spy = vi.spyOn(ni.notificationIntelligence, 'registerEvent');

    recordBicTransfer({
      itemKey: 'estimating-pursuit::abc',
      fromOwner: { userId: 'u-alice', displayName: 'Alice', role: 'PM' },
      toOwner: { userId: 'u-bob', displayName: 'Bob', role: 'Director' },
      action: 'Passed to Director',
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Ball in court: estimating pursuit',
      body: 'Alice passed this to you: Passed to Director',
    }));

    spy.mockRestore();
  });

  it('uses "the system" in notification body when fromOwner is null', async () => {
    const ni = await import('@hbc/notification-intelligence');
    const spy = vi.spyOn(ni.notificationIntelligence, 'registerEvent');

    recordBicTransfer({
      itemKey: 'bd-scorecard::008',
      fromOwner: null,
      toOwner: { userId: 'u-bob', displayName: 'Bob', role: 'Director' },
      action: 'Auto-assigned',
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({
      body: 'the system passed this to you: Auto-assigned',
    }));

    spy.mockRestore();
  });
});
