import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { useComplexity } from '@hbc/complexity';
import { HbcNotificationPreferences } from '../HbcNotificationPreferences';
import { NotificationRegistry } from '../../registry/NotificationRegistry';
import type { INotificationPreferences } from '../../types/INotification';

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockUpdatePreferences = vi.fn();

const defaultPreferences: INotificationPreferences = {
  userId: 'u1',
  tierOverrides: {},
  pushEnabled: false,
  digestDay: 0,
  digestHour: 8,
};

const mockUseNotificationPreferences = vi.fn().mockReturnValue({
  preferences: defaultPreferences,
  isLoading: false,
  updatePreferences: mockUpdatePreferences,
  isUpdating: false,
});

vi.mock('../../hooks/useNotificationPreferences', () => ({
  useNotificationPreferences: (...args: unknown[]) => mockUseNotificationPreferences(...args),
}));

// ─── Registry Fixtures ──────────────────────────────────────────────────────

const registryFixtures = [
  {
    eventType: 'bic.transfer',
    defaultTier: 'immediate' as const,
    description: 'BIC Transfer',
    tierOverridable: false,
    channels: ['push' as const, 'email' as const, 'in-app' as const],
  },
  {
    eventType: 'bic.update',
    defaultTier: 'watch' as const,
    description: 'BIC Update',
    tierOverridable: true,
    channels: ['in-app' as const],
  },
  {
    eventType: 'handoff.received',
    defaultTier: 'immediate' as const,
    description: 'Handoff Received',
    tierOverridable: true,
    channels: ['push' as const, 'in-app' as const],
  },
];

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('HbcNotificationPreferences', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(useComplexity).mockReturnValue({ tier: 'expert' });
    mockUpdatePreferences.mockClear();
    mockUseNotificationPreferences.mockReturnValue({
      preferences: { ...defaultPreferences },
      isLoading: false,
      updatePreferences: mockUpdatePreferences,
      isUpdating: false,
    });
    // Set up registry
    NotificationRegistry._clearForTesting();
    NotificationRegistry.register(registryFixtures);
  });

  afterEach(() => {
    vi.useRealTimers();
    NotificationRegistry._clearForTesting();
  });

  it('returns null when tier is standard (D-08)', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'standard' });
    const { container } = render(<HbcNotificationPreferences />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null when tier is essential (D-08)', () => {
    vi.mocked(useComplexity).mockReturnValue({ tier: 'essential' });
    const { container } = render(<HbcNotificationPreferences />);
    expect(container.innerHTML).toBe('');
  });

  it('renders preferences panel in Expert mode', () => {
    render(<HbcNotificationPreferences />);
    expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
  });

  it('shows loading state when isLoading', () => {
    mockUseNotificationPreferences.mockReturnValue({
      preferences: null,
      isLoading: true,
      updatePreferences: mockUpdatePreferences,
      isUpdating: false,
    });
    render(<HbcNotificationPreferences />);
    expect(screen.getByText('Loading preferences…')).toBeInTheDocument();
  });

  it('lists registry event types grouped by module', () => {
    render(<HbcNotificationPreferences />);
    // Module headings
    expect(screen.getByText('bic')).toBeInTheDocument();
    expect(screen.getByText('handoff')).toBeInTheDocument();
    // Event descriptions
    expect(screen.getByText('BIC Transfer')).toBeInTheDocument();
    expect(screen.getByText('BIC Update')).toBeInTheDocument();
    expect(screen.getByText('Handoff Received')).toBeInTheDocument();
  });

  it('shows lock icon for non-overridable event types', () => {
    render(<HbcNotificationPreferences />);
    const lockIcons = screen.getAllByLabelText('Tier locked');
    // Only bic.transfer is non-overridable
    expect(lockIcons).toHaveLength(1);
  });

  it('tier selector disabled for non-overridable types', () => {
    render(<HbcNotificationPreferences />);
    const bicTransferSelect = screen.getByLabelText('Notification tier for BIC Transfer');
    expect(bicTransferSelect).toBeDisabled();
  });

  it('tier override change calls updatePreferences with merged tierOverrides', () => {
    render(<HbcNotificationPreferences />);
    const bicUpdateSelect = screen.getByLabelText('Notification tier for BIC Update');
    fireEvent.change(bicUpdateSelect, { target: { value: 'digest' } });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({
      tierOverrides: { 'bic.update': 'digest' },
    });
  });

  it('digest day select renders all 7 days', () => {
    render(<HbcNotificationPreferences />);
    const daySelect = screen.getByLabelText('Delivery day');
    const options = daySelect.querySelectorAll('option');
    expect(options).toHaveLength(7);
    expect(options[0]).toHaveTextContent('Sunday');
    expect(options[6]).toHaveTextContent('Saturday');
  });

  it('digest day change calls updatePreferences with digestDay', () => {
    render(<HbcNotificationPreferences />);
    const daySelect = screen.getByLabelText('Delivery day');
    fireEvent.change(daySelect, { target: { value: '3' } });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ digestDay: 3 });
  });

  it('digest hour select renders 24 hours', () => {
    render(<HbcNotificationPreferences />);
    const hourSelect = screen.getByLabelText('Delivery time');
    const options = hourSelect.querySelectorAll('option');
    expect(options).toHaveLength(24);
    expect(options[0]).toHaveTextContent('00:00');
    expect(options[23]).toHaveTextContent('23:00');
  });

  it('digest hour change calls updatePreferences with digestHour', () => {
    render(<HbcNotificationPreferences />);
    const hourSelect = screen.getByLabelText('Delivery time');
    fireEvent.change(hourSelect, { target: { value: '14' } });
    expect(mockUpdatePreferences).toHaveBeenCalledWith({ digestHour: 14 });
  });

  it('push toggle visible in PWA context (IS_SPFx is false in test env)', () => {
    render(<HbcNotificationPreferences />);
    expect(screen.getByText('Push Notifications')).toBeInTheDocument();
    expect(screen.getByText('Enable push notifications (Immediate tier only)')).toBeInTheDocument();
  });

  it('save button click calls onSave and shows "✓ Saved"', () => {
    const onSave = vi.fn();
    render(<HbcNotificationPreferences onSave={onSave} />);
    const saveBtn = screen.getByText('Save Preferences');
    fireEvent.click(saveBtn);
    expect(onSave).toHaveBeenCalledOnce();
    expect(screen.getByText('✓ Saved')).toBeInTheDocument();
    // Resets after 2000ms
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Save Preferences')).toBeInTheDocument();
  });

  it('save button disabled while isUpdating', () => {
    mockUseNotificationPreferences.mockReturnValue({
      preferences: { ...defaultPreferences },
      isLoading: false,
      updatePreferences: mockUpdatePreferences,
      isUpdating: true,
    });
    render(<HbcNotificationPreferences />);
    expect(screen.getByText('Save Preferences')).toBeDisabled();
  });
});
