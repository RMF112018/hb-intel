import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { BottomPlaceholder } from '../placeholders/BottomPlaceholder.js';
import { TopPlaceholder } from '../placeholders/TopPlaceholder.js';
import { ACTIVATION_GOVERNANCE } from '../placeholders/types.js';

describe('BottomPlaceholder rendering', () => {
  it('renders nothing when not available', () => {
    const { container } = render(<BottomPlaceholder available={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when available but no config (true non-render)', () => {
    const { container } = render(<BottomPlaceholder available />);
    expect(container.firstChild).toBeNull();
  });

  it('renders footer links when configured', () => {
    render(
      <BottomPlaceholder
        available
        config={{
          footerLinks: [
            { id: 'help', label: 'Help', href: '/help' },
            { id: 'feedback', label: 'Feedback', href: '/feedback' },
          ],
        }}
      />,
    );
    expect(screen.getByRole('link', { name: 'Help' })).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Feedback' })).not.toBeNull();
    expect(screen.getByRole('navigation', { name: 'Footer utilities' })).not.toBeNull();
  });

  it('renders support items and operational text', () => {
    render(
      <BottomPlaceholder
        available
        config={{
          supportItems: [
            { id: 's1', label: 'IT Support', href: '/it', description: 'Mon–Fri 8am–5pm' },
          ],
          operationalText: 'HB Central — Hedrick Brothers',
        }}
      />,
    );
    expect(screen.getByRole('link', { name: 'IT Support' })).not.toBeNull();
    expect(screen.getByText('Mon–Fri 8am–5pm')).not.toBeNull();
    expect(screen.getByText('HB Central — Hedrick Brothers')).not.toBeNull();
  });

  it('renders support items without href as plain text', () => {
    render(
      <BottomPlaceholder
        available
        config={{
          supportItems: [
            { id: 's1', label: 'System Status: Normal' },
          ],
        }}
      />,
    );
    expect(screen.getByText('System Status: Normal')).not.toBeNull();
    expect(screen.queryByRole('link', { name: 'System Status: Normal' })).toBeNull();
  });
});

describe('Top and bottom coexistence', () => {
  it('both placeholders render independently without conflict', () => {
    const { container } = render(
      <div>
        <TopPlaceholder
          available
          config={{ ribbon: { items: [{ id: 'r1', label: 'Top Link', href: '/top' }] } }}
        />
        <BottomPlaceholder
          available
          config={{ footerLinks: [{ id: 'f1', label: 'Bottom Link', href: '/bottom' }] }}
        />
      </div>,
    );
    expect(container.querySelector('[data-hbc-shell-extension="top-placeholder"]')).not.toBeNull();
    expect(container.querySelector('[data-hbc-shell-extension="bottom-placeholder"]')).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Top Link' })).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Bottom Link' })).not.toBeNull();
  });
});

describe('Activation governance', () => {
  it('ACTIVATION_GOVERNANCE defines expected posture', () => {
    expect(ACTIVATION_GOVERNANCE.scope).toBe('tenant-wide');
    expect(ACTIVATION_GOVERNANCE.activationGate).toBe('placeholder-availability');
    expect(ACTIVATION_GOVERNANCE.missingPlaceholderBehavior).toBe('no-op');
    expect(ACTIVATION_GOVERNANCE.missingConfigBehavior).toBe('empty-container');
    expect(ACTIVATION_GOVERNANCE.partialAvailability).toBe('independent-surfaces');
  });
});

describe('Bottom placeholder CSS classes', () => {
  const cssPath = resolve(__dirname, '../shell-extension.module.css');
  const cssSource = readFileSync(cssPath, 'utf8');

  it('defines bottom container and support band classes', () => {
    expect(cssSource).toContain('.bottomContainer');
    expect(cssSource).toContain('.footerNav');
    expect(cssSource).toContain('.footerLink');
    expect(cssSource).toContain('.supportBand');
    expect(cssSource).toContain('.supportItem');
    expect(cssSource).toContain('.operationalText');
  });
});
