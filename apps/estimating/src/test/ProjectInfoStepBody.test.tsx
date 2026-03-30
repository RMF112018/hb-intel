import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import React from 'react';
import { ProjectInfoStepBody } from '../components/project-setup/ProjectInfoStepBody.js';
import { renderWithProviders } from './renderWithProviders.js';

describe('ProjectInfoStepBody', () => {
  it('renders the requested Step 1 fields in the revised order', () => {
    renderWithProviders(
      <ProjectInfoStepBody
        request={{}}
        onChange={vi.fn()}
        mode="new-request"
      />,
    );

    const text = document.body.textContent ?? '';
    expect(text.indexOf('Project Name')).toBeLessThan(text.indexOf('Client Name'));
    expect(text.indexOf('Client Name')).toBeLessThan(text.indexOf('Project Location'));
    expect(text.indexOf('Project Location')).toBeLessThan(text.indexOf('Street Address'));
    expect(text.indexOf('Street Address')).toBeLessThan(text.indexOf('City'));
    expect(text.indexOf('City')).toBeLessThan(text.indexOf('County'));
    expect(text.indexOf('County')).toBeLessThan(text.indexOf('State'));
    expect(text.indexOf('State')).toBeLessThan(text.indexOf('Zip'));
    expect(text.indexOf('Zip')).toBeLessThan(text.indexOf('Estimated Value'));
    expect(text.indexOf('Estimated Value')).toBeLessThan(
      text.indexOf('Expected Project Start Date'),
    );
    expect(text.indexOf('Expected Project Start Date')).toBeLessThan(
      text.indexOf('Procore Project'),
    );

    expect(screen.queryByText('Project Location', { selector: 'label' })).not.toBeInTheDocument();
  });
});
