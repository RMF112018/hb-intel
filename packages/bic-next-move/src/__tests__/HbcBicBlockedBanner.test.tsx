import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HbcBicBlockedBanner } from '../components/HbcBicBlockedBanner';

describe('HbcBicBlockedBanner', () => {
  const blockedReason = 'Waiting on Structural Engineering to complete their section';

  it('renders reason text', () => {
    render(<HbcBicBlockedBanner blockedReason={blockedReason} />);
    expect(screen.getByText(blockedReason)).toBeInTheDocument();
  });

  it('renders as alert role', () => {
    render(<HbcBicBlockedBanner blockedReason={blockedReason} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders SPA link when onNavigate is provided (D-09)', () => {
    const onNavigate = vi.fn();
    render(
      <HbcBicBlockedBanner
        blockedReason={blockedReason}
        blockedByItem={{ label: 'Structural Review', href: '/structural/review/123' }}
        onNavigate={onNavigate}
      />
    );
    const link = screen.getByText(/view blocking item/i);
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe('BUTTON');
    expect(link.className).toContain('--spa');
  });

  it('fires onNavigate callback with href when SPA link clicked (D-09)', () => {
    const onNavigate = vi.fn();
    render(
      <HbcBicBlockedBanner
        blockedReason={blockedReason}
        blockedByItem={{ label: 'Structural Review', href: '/structural/review/123' }}
        onNavigate={onNavigate}
      />
    );
    fireEvent.click(screen.getByText(/view blocking item/i));
    expect(onNavigate).toHaveBeenCalledWith('/structural/review/123');
  });

  it('renders plain anchor when onNavigate is absent (D-09)', () => {
    render(
      <HbcBicBlockedBanner
        blockedReason={blockedReason}
        blockedByItem={{ label: 'External Drawing Set', href: 'https://external.example.com/drawings/456' }}
      />
    );
    const link = screen.getByText(/view blocking item/i);
    expect(link.tagName).toBe('A');
    expect(link.className).toContain('--anchor');
    expect(link).toHaveAttribute('href', 'https://external.example.com/drawings/456');
  });

  it('hides blocked-by link in essential variant (D-05)', () => {
    render(
      <HbcBicBlockedBanner
        blockedReason={blockedReason}
        blockedByItem={{ label: 'Drawing Set', href: '/drawings/456' }}
        forceVariant="essential"
      />
    );
    expect(screen.queryByText(/view blocking item/i)).not.toBeInTheDocument();
  });

  it('shows escalation note in expert variant (D-05)', () => {
    render(
      <HbcBicBlockedBanner
        blockedReason={blockedReason}
        forceVariant="expert"
      />
    );
    expect(screen.getByText(/cannot advance/i)).toBeInTheDocument();
  });

  it('hides escalation note in standard variant (D-05)', () => {
    render(
      <HbcBicBlockedBanner
        blockedReason={blockedReason}
        forceVariant="standard"
      />
    );
    expect(screen.queryByText(/cannot advance/i)).not.toBeInTheDocument();
  });

  it('emits dev warning when onNavigate absent with relative href (D-09)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <HbcBicBlockedBanner
        blockedReason={blockedReason}
        blockedByItem={{ label: 'Item', href: '/relative/path' }}
      />
    );
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('onNavigate is not provided')
    );
    warnSpy.mockRestore();
  });

  it('applies custom className', () => {
    const { container } = render(
      <HbcBicBlockedBanner blockedReason={blockedReason} className="my-banner" />
    );
    expect(container.querySelector('.my-banner')).toBeInTheDocument();
  });
});
