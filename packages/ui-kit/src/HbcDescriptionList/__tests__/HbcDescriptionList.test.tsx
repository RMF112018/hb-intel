import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcDescriptionList } from '../index.js';

const ITEMS = [
  { label: 'Client', value: 'ACME Corp' },
  { label: 'Location', value: 'Denver, CO' },
  { label: 'Type', value: 'Commercial' },
];

describe('HbcDescriptionList', () => {
  it('renders with data-hbc-ui="description-list"', () => {
    const { container } = render(<HbcDescriptionList items={ITEMS} />);
    expect(container.querySelector('[data-hbc-ui="description-list"]')).toBeInTheDocument();
  });

  it('renders semantic <dl>, <dt>, <dd> elements', () => {
    const { container } = render(<HbcDescriptionList items={ITEMS} />);
    expect(container.querySelector('dl')).toBeInTheDocument();
    expect(container.querySelectorAll('dt')).toHaveLength(3);
    expect(container.querySelectorAll('dd')).toHaveLength(3);
  });

  it('renders label text in <dt> and value text in <dd>', () => {
    render(<HbcDescriptionList items={ITEMS} />);
    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('ACME Corp')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Denver, CO')).toBeInTheDocument();
  });

  it('renders nothing when items is empty', () => {
    const { container } = render(<HbcDescriptionList items={[]} />);
    expect(container.querySelector('dl')).not.toBeInTheDocument();
  });

  it('accepts dense prop', () => {
    const { container } = render(<HbcDescriptionList items={ITEMS} dense />);
    expect(container.querySelector('dl')).toBeInTheDocument();
  });

  it('accepts ReactNode as value', () => {
    const items = [
      { label: 'Status', value: <strong>Active</strong> },
    ];
    render(<HbcDescriptionList items={items} />);
    expect(screen.getByText('Active').tagName).toBe('STRONG');
  });

  it('applies additional className', () => {
    const { container } = render(
      <HbcDescriptionList items={ITEMS} className="custom-class" />,
    );
    expect(container.querySelector('dl')).toHaveClass('custom-class');
  });
});
