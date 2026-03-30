import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import React, { useState } from 'react';
import { DepartmentStepBody } from '../components/project-setup/DepartmentStepBody.js';
import { renderWithProviders } from './renderWithProviders.js';

function expectBefore(first: HTMLElement, second: HTMLElement): void {
  expect(
    first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).not.toBe(0);
}

describe('DepartmentStepBody', () => {
  it('renders the requested Step 2 fields in the revised order', () => {
    renderWithProviders(
      <DepartmentStepBody
        request={{ projectStage: 'Lead' }}
        onChange={() => {}}
        mode="new-request"
      />,
    );

    const projectStage = screen.getByText(/^Project Stage$/);
    const officeDivision = screen.getByText(/^Office & Division$/);
    const department = screen.getByText(/^Department$/);
    const projectType = screen.getByText(/^Project Type$/);
    const contractType = screen.getByText(/^Contract Type$/);

    expectBefore(projectStage, officeDivision);
    expectBefore(officeDivision, department);
    expectBefore(department, projectType);
    expectBefore(projectType, contractType);
  });

  it('shows the required Office & Division, Project Stage, and Contract Type options', async () => {
    renderWithProviders(
      <DepartmentStepBody
        request={{ projectStage: 'Lead' }}
        onChange={() => {}}
        mode="new-request"
      />,
    );

    fireEvent.click(screen.getByRole('combobox', { name: 'Office & Division' }));
    expect(screen.getByRole('option', { name: 'Luxury Residential (01-10)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Hedrick Overhead or Related Entity (01-05)' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Project Stage' }));
    expect(screen.getByRole('option', { name: 'Lead' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Warranty' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Contract Type' }));
    expect(screen.getByRole('option', { name: 'Lump Sum / Stipulated Sum Contract' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Indefinite Delivery / Indefinite Quantity (IDIQ) Contract' })).toBeInTheDocument();
  });

  it('uses a searchable combobox for Project Type and switches options by department', async () => {
    function Harness() {
      const [request, setRequest] = useState<any>({ projectStage: 'Lead', department: 'commercial' });
      return (
        <DepartmentStepBody
          request={request}
          onChange={(updates) => setRequest((prev: any) => ({ ...prev, ...updates }))}
          mode="new-request"
        />
      );
    }

    renderWithProviders(<Harness />);

    const projectTypeCombo = screen.getByRole('combobox', { name: 'Project Type' });
    expect(projectTypeCombo).toBeInTheDocument();

    fireEvent.click(projectTypeCombo);
    expect(screen.getByRole('option', { name: 'Retail Facilities' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('option', { name: 'Corporate headquarters' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Custom-built luxury residences' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('combobox', { name: 'Department' }));
    fireEvent.click(screen.getByRole('option', { name: 'Luxury Residential' }));

    fireEvent.click(screen.getByRole('combobox', { name: 'Project Type' }));
    expect(screen.getByRole('option', { name: 'Luxury and High-End Residential' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('option', { name: 'Custom-built luxury residences' })).toBeInTheDocument();
  });

  it('clears an incompatible project type when department changes', async () => {
    function Harness() {
      const [request, setRequest] = useState<any>({
        projectStage: 'Lead',
        department: 'commercial',
        projectType: 'Corporate headquarters',
      });
      return (
        <DepartmentStepBody
          request={request}
          onChange={(updates) => setRequest((prev: any) => ({ ...prev, ...updates }))}
          mode="new-request"
        />
      );
    }

    renderWithProviders(<Harness />);

    expect(screen.getByRole('combobox', { name: 'Project Type' })).toHaveValue('Corporate headquarters');

    fireEvent.click(screen.getByRole('combobox', { name: 'Department' }));
    fireEvent.click(screen.getByRole('option', { name: 'Luxury Residential' }));

    expect(screen.getByRole('combobox', { name: 'Project Type' })).toHaveValue('');
  });
});
