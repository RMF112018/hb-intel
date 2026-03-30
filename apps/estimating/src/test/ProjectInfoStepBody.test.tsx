import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import React from 'react';
import { ProjectInfoStepBody } from '../components/project-setup/ProjectInfoStepBody.js';
import { renderWithProviders } from './renderWithProviders.js';

describe('ProjectInfoStepBody', () => {
  it('renders fields in three logical groups', () => {
    renderWithProviders(
      <ProjectInfoStepBody
        request={{}}
        onChange={vi.fn()}
        mode="new-request"
      />,
    );

    // Three section headings
    expect(screen.getByText('Project Identity')).toBeInTheDocument();
    expect(screen.getByText('Project Location')).toBeInTheDocument();
    expect(screen.getByText('Project Details')).toBeInTheDocument();

    // Key fields present
    const text = document.body.textContent ?? '';
    expect(text.indexOf('Project Name')).toBeLessThan(text.indexOf('Client Name'));
    expect(text.indexOf('Street Address')).toBeLessThan(text.indexOf('City'));
    expect(text.indexOf('City')).toBeLessThan(text.indexOf('State'));
    expect(text.indexOf('Estimated Value')).toBeLessThan(text.indexOf('Expected Start Date'));
    expect(text.indexOf('Expected Start Date')).toBeLessThan(text.indexOf('Procore Project'));
  });
});
