import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcSpinner } from '../index.js';

describe('HbcSpinner', () => {
  it('renders with role="status"', () => {
    render(<HbcSpinner />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders with data-hbc-ui="spinner"', () => {
    render(<HbcSpinner />);

    expect(screen.getByRole('status')).toHaveAttribute('data-hbc-ui', 'spinner');
  });

  it('defaults to md size (40px dimension, 3px borderWidth)', () => {
    render(<HbcSpinner />);

    const spinner = screen.getByRole('status').querySelector('span:first-child') as HTMLElement;
    expect(spinner.style.width).toBe('40px');
    expect(spinner.style.height).toBe('40px');
    expect(spinner.style.borderWidth).toBe('3px');
  });

  it('renders sm size with 20px dimension and 2px borderWidth', () => {
    render(<HbcSpinner size="sm" />);

    const spinner = screen.getByRole('status').querySelector('span:first-child') as HTMLElement;
    expect(spinner.style.width).toBe('20px');
    expect(spinner.style.height).toBe('20px');
    expect(spinner.style.borderWidth).toBe('2px');
  });

  it('renders lg size with 64px dimension and 4px borderWidth', () => {
    render(<HbcSpinner size="lg" />);

    const spinner = screen.getByRole('status').querySelector('span:first-child') as HTMLElement;
    expect(spinner.style.width).toBe('64px');
    expect(spinner.style.height).toBe('64px');
    expect(spinner.style.borderWidth).toBe('4px');
  });

  it('renders default "Loading" label in sr-only span', () => {
    render(<HbcSpinner />);

    expect(screen.getByText('Loading')).toBeInTheDocument();
  });

  it('renders custom label in sr-only span', () => {
    render(<HbcSpinner label="Please wait" />);

    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('applies custom color to borderTopColor via inline style', () => {
    render(<HbcSpinner color="#ff0000" />);

    const spinner = screen.getByRole('status').querySelector('span:first-child') as HTMLElement;
    expect(spinner.style.borderTopColor).toBe('rgb(255, 0, 0)');
  });

  it('uses Griffel class for default borderTopColor when no color prop is set', () => {
    render(<HbcSpinner />);

    const spinner = screen.getByRole('status').querySelector('span:first-child') as HTMLElement;
    // When no custom color is provided, borderTopColor is NOT set via inline style
    // (it comes from the Griffel class instead)
    expect(spinner.style.borderTopColor).toBe('');
  });
});
