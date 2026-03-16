import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcCard } from '../index.js';

describe('HbcCard', () => {
  it('renders with data-hbc-ui="card"', () => {
    const { container } = render(<HbcCard>Content</HbcCard>);
    expect(container.querySelector('[data-hbc-ui="card"]')).toBeInTheDocument();
  });

  it('default weight is "standard" (data-hbc-card-weight="standard")', () => {
    const { container } = render(<HbcCard>Content</HbcCard>);
    const card = container.querySelector('[data-hbc-ui="card"]');
    expect(card).toHaveAttribute('data-hbc-card-weight', 'standard');
  });

  it('weight "primary" renders with data-hbc-card-weight="primary"', () => {
    const { container } = render(<HbcCard weight="primary">Content</HbcCard>);
    const card = container.querySelector('[data-hbc-ui="card"]');
    expect(card).toHaveAttribute('data-hbc-card-weight', 'primary');
  });

  it('weight "supporting" renders with data-hbc-card-weight="supporting"', () => {
    const { container } = render(<HbcCard weight="supporting">Content</HbcCard>);
    const card = container.querySelector('[data-hbc-ui="card"]');
    expect(card).toHaveAttribute('data-hbc-card-weight', 'supporting');
  });

  it('header renders when provided', () => {
    render(<HbcCard header={<span>Card Header</span>}>Body</HbcCard>);
    expect(screen.getByText('Card Header')).toBeInTheDocument();
  });

  it('footer renders when provided', () => {
    render(<HbcCard footer={<span>Card Footer</span>}>Body</HbcCard>);
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });

  it('header and footer absent when not provided', () => {
    render(<HbcCard>Body only</HbcCard>);
    // The card should have exactly one child div (the body)
    const card = document.querySelector('[data-hbc-ui="card"]')!;
    expect(card.children).toHaveLength(1);
    expect(screen.getByText('Body only')).toBeInTheDocument();
  });

  it('children (body) renders', () => {
    render(<HbcCard><p>Body content here</p></HbcCard>);
    expect(screen.getByText('Body content here')).toBeInTheDocument();
  });

  it('className merges', () => {
    const { container } = render(<HbcCard className="custom-class">Content</HbcCard>);
    const card = container.querySelector('[data-hbc-ui="card"]');
    expect(card).toHaveClass('custom-class');
  });
});
