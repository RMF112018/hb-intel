import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { TopPlaceholder } from '../placeholders/TopPlaceholder.js';

describe('TopPlaceholder rendering', () => {
  it('renders nothing when not available', () => {
    const { container } = render(<TopPlaceholder available={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when available but no config (true non-render)', () => {
    const { container } = render(<TopPlaceholder available />);
    expect(container.firstChild).toBeNull();
  });

  it('renders ribbon links when ribbon config provided', () => {
    render(
      <TopPlaceholder
        available
        config={{
          ribbon: {
            items: [
              { id: 'item-1', label: 'Safety Hub', href: '/safety' },
              { id: 'item-2', label: 'Reports', href: '/reports', iconKey: 'rpt' },
            ],
          },
        }}
      />,
    );
    expect(screen.getByRole('link', { name: 'Safety Hub' })).not.toBeNull();
    expect(screen.getByRole('link', { name: 'Reports' })).not.toBeNull();
    expect(screen.getByRole('navigation', { name: 'Quick utilities' })).not.toBeNull();
  });

  it('renders alert band with severity classes', () => {
    const { container } = render(
      <TopPlaceholder
        available
        config={{
          alerts: {
            items: [
              { id: 'a1', severity: 'info', message: 'Maintenance tonight' },
              { id: 'a2', severity: 'warning', message: 'Weather advisory' },
              { id: 'a3', severity: 'critical', message: 'Site shutdown' },
            ],
          },
        }}
      />,
    );
    expect(screen.getByText('Maintenance tonight')).not.toBeNull();
    expect(screen.getByText('Weather advisory')).not.toBeNull();
    expect(screen.getByText('Site shutdown')).not.toBeNull();

    const alertItems = container.querySelectorAll('[data-severity]');
    expect(alertItems.length).toBe(3);
    expect(alertItems[0].getAttribute('data-severity')).toBe('info');
    expect(alertItems[1].getAttribute('data-severity')).toBe('warning');
    expect(alertItems[2].getAttribute('data-severity')).toBe('critical');
  });

  it('renders alert CTA links', () => {
    render(
      <TopPlaceholder
        available
        config={{
          alerts: {
            items: [
              { id: 'a1', severity: 'info', message: 'Update available', href: '/updates', ctaLabel: 'View' },
            ],
          },
        }}
      />,
    );
    const link = screen.getByRole('link', { name: 'View' });
    expect(link.getAttribute('href')).toBe('/updates');
  });

  it('supports dismissible alerts', () => {
    render(
      <TopPlaceholder
        available
        config={{
          alerts: {
            items: [
              { id: 'a1', severity: 'warning', message: 'Dismissible alert', dismissible: true },
            ],
          },
        }}
      />,
    );
    expect(screen.getByText('Dismissible alert')).not.toBeNull();
    const dismissBtn = screen.getByRole('button', { name: /Dismiss/ });
    fireEvent.click(dismissBtn);
    expect(screen.queryByText('Dismissible alert')).toBeNull();
  });
});

describe('TopPlaceholder CSS module', () => {
  const cssPath = resolve(__dirname, '../shell-extension.module.css');
  const cssSource = readFileSync(cssPath, 'utf8');

  it('defines ribbon and alert band classes', () => {
    expect(cssSource).toContain('.ribbon');
    expect(cssSource).toContain('.ribbonLink');
    expect(cssSource).toContain('.alertBand');
    expect(cssSource).toContain('.alertItem');
    expect(cssSource).toContain('.alertInfo');
    expect(cssSource).toContain('.alertWarning');
    expect(cssSource).toContain('.alertCritical');
  });

  it('includes focus-visible states', () => {
    expect(cssSource).toContain('.ribbonLink:focus-visible');
    expect(cssSource).toContain('.alertCta:focus-visible');
    expect(cssSource).toContain('.alertDismiss:focus-visible');
  });

  it('includes reduced-motion blanket', () => {
    expect(cssSource).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssSource).toContain('transition: none');
  });
});
