import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { HbcComplexityDial } from '../components/HbcComplexityDial';
import { ComplexityTestProvider, mockComplexityContext } from '../../testing';

describe('HbcComplexityDial — header variant', () => {
  it('renders three tier buttons', () => {
    render(
      <ComplexityTestProvider tier="standard">
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    expect(screen.getByRole('button', { name: /essential/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /standard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /expert/i })).toBeInTheDocument();
  });

  it('marks current tier as active (aria-pressed)', () => {
    render(
      <ComplexityTestProvider tier="expert">
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    expect(screen.getByRole('button', { name: /expert/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /standard/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls setTier when a segment is clicked', async () => {
    const ctx = mockComplexityContext({ tier: 'standard' });
    render(
      <ComplexityTestProvider value={ctx}>
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    await userEvent.click(screen.getByRole('button', { name: /expert/i }));
    expect(ctx.setTier).toHaveBeenCalledWith('expert');
  });
});

describe('HbcComplexityDial — locked state (D-06)', () => {
  it('disables all buttons when locked', () => {
    render(
      <ComplexityTestProvider tier="essential" isLocked lockedBy="onboarding">
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });

  it('shows lock icon when locked', () => {
    render(
      <ComplexityTestProvider tier="essential" isLocked lockedBy="admin">
        <HbcComplexityDial variant="header" />
      </ComplexityTestProvider>
    );
    expect(screen.getByLabelText(/managed by your organization/i)).toBeInTheDocument();
  });
});

describe('HbcComplexityDial — showCoaching toggle (D-07)', () => {
  it('renders coaching toggle in settings variant when showCoachingToggle=true', () => {
    render(
      <ComplexityTestProvider tier="standard">
        <HbcComplexityDial variant="settings" showCoachingToggle />
      </ComplexityTestProvider>
    );
    expect(screen.getByRole('checkbox', { name: /guidance prompts/i })).toBeInTheDocument();
  });

  it('calls setShowCoaching when toggle is clicked', async () => {
    const ctx = mockComplexityContext({ tier: 'standard', showCoaching: false });
    render(
      <ComplexityTestProvider value={ctx}>
        <HbcComplexityDial variant="settings" showCoachingToggle />
      </ComplexityTestProvider>
    );
    await userEvent.click(screen.getByRole('checkbox', { name: /guidance prompts/i }));
    expect(ctx.setShowCoaching).toHaveBeenCalledWith(true);
  });
});

describe('HbcComplexityDial — settings variant locked (D-06)', () => {
  it('renders lock notice in settings variant when locked', () => {
    render(
      <ComplexityTestProvider tier="standard" isLocked lockedBy="admin">
        <HbcComplexityDial variant="settings" />
      </ComplexityTestProvider>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/managed by your organization/i)).toBeInTheDocument();
  });

  it('renders lock notice with expiry date when lockedUntil is set', () => {
    render(
      <ComplexityTestProvider tier="standard" isLocked lockedBy="admin" lockedUntil="2026-12-31T23:59:59Z">
        <HbcComplexityDial variant="settings" />
      </ComplexityTestProvider>
    );
    expect(screen.getByText(/unlock automatically/i)).toBeInTheDocument();
  });

  it('disables radio buttons in settings when locked', () => {
    render(
      <ComplexityTestProvider tier="standard" isLocked lockedBy="admin">
        <HbcComplexityDial variant="settings" />
      </ComplexityTestProvider>
    );
    const radios = screen.getAllByRole('radio');
    radios.forEach(radio => expect(radio).toBeDisabled());
  });
});
