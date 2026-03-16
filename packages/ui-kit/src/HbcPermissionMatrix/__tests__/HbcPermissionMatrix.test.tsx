import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createComplexityWrapper } from '@hbc/complexity/testing';
import { HbcPermissionMatrix } from '../index.js';

const roles = [
  { id: 'r1', name: 'Admin' },
  { id: 'r2', name: 'Editor' },
];
const permissions = [
  { id: 'p1', name: 'Read' },
  { id: 'p2', name: 'Write' },
];

describe('HbcPermissionMatrix', () => {
  it('renders with data-hbc-ui="HbcPermissionMatrix" at expert tier', () => {
    const { container } = render(
      <HbcPermissionMatrix roles={roles} permissions={permissions} onPermissionChange={() => {}} />,
      { wrapper: createComplexityWrapper('expert') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcPermissionMatrix"]'),
    ).toBeInTheDocument();
  });

  it('renders role names in table rows', () => {
    render(
      <HbcPermissionMatrix roles={roles} permissions={permissions} onPermissionChange={() => {}} />,
      { wrapper: createComplexityWrapper('expert') },
    );
    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('renders permission names as column headers', () => {
    render(
      <HbcPermissionMatrix roles={roles} permissions={permissions} onPermissionChange={() => {}} />,
      { wrapper: createComplexityWrapper('expert') },
    );
    expect(screen.getByText('Read')).toBeInTheDocument();
    expect(screen.getByText('Write')).toBeInTheDocument();
  });

  it('checkboxes have aria-label with role and permission names', () => {
    render(
      <HbcPermissionMatrix roles={roles} permissions={permissions} onPermissionChange={() => {}} />,
      { wrapper: createComplexityWrapper('expert') },
    );
    expect(screen.getByLabelText('Admin — Read')).toBeInTheDocument();
    expect(screen.getByLabelText('Editor — Write')).toBeInTheDocument();
  });

  it('fires onPermissionChange with correct args on checkbox toggle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <HbcPermissionMatrix roles={roles} permissions={permissions} onPermissionChange={onChange} />,
      { wrapper: createComplexityWrapper('expert') },
    );
    await user.click(screen.getByLabelText('Admin — Write'));
    expect(onChange).toHaveBeenCalledWith('r1', 'p2', true);
  });

  it('returns null at standard tier (expert-gated)', () => {
    const { container } = render(
      <HbcPermissionMatrix roles={roles} permissions={permissions} onPermissionChange={() => {}} />,
      { wrapper: createComplexityWrapper('standard') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcPermissionMatrix"]'),
    ).not.toBeInTheDocument();
  });

  it('returns null at essential tier', () => {
    const { container } = render(
      <HbcPermissionMatrix roles={roles} permissions={permissions} onPermissionChange={() => {}} />,
      { wrapper: createComplexityWrapper('essential') },
    );
    expect(
      container.querySelector('[data-hbc-ui="HbcPermissionMatrix"]'),
    ).not.toBeInTheDocument();
  });
});
