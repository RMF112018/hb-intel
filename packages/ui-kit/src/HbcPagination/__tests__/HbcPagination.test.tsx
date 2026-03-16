import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HbcPagination } from '../index.js';

describe('HbcPagination', () => {
  it('renders with data-hbc-ui="pagination"', () => {
    const { container } = render(
      <HbcPagination totalItems={100} currentPage={1} pageSize={25} onPageChange={() => {}} />,
    );
    expect(container.querySelector('[data-hbc-ui="pagination"]')).toBeInTheDocument();
  });

  it('renders page buttons', () => {
    render(
      <HbcPagination totalItems={100} currentPage={1} pageSize={25} onPageChange={() => {}} />,
    );
    expect(screen.getByLabelText('Page 1')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 2')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 4')).toBeInTheDocument();
  });

  it('current page highlighted', () => {
    render(
      <HbcPagination totalItems={100} currentPage={2} pageSize={25} onPageChange={() => {}} />,
    );
    expect(screen.getByLabelText('Page 2')).toHaveAttribute('aria-current', 'page');
  });

  it('previous disabled on page 1', () => {
    render(
      <HbcPagination totalItems={100} currentPage={1} pageSize={25} onPageChange={() => {}} />,
    );
    expect(screen.getByLabelText('Previous page')).toBeDisabled();
  });

  it('hidden when single page', () => {
    const { container } = render(
      <HbcPagination totalItems={10} currentPage={1} pageSize={25} onPageChange={() => {}} />,
    );
    expect(container.querySelector('[data-hbc-ui="pagination"]')).not.toBeInTheDocument();
  });
});
