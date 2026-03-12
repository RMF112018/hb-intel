import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createMockStrategicIntelligenceState } from '@hbc/strategic-intelligence/testing';
import { IntelligenceEntryForm } from './IntelligenceEntryForm.js';

const createProps = () => {
  const state = createMockStrategicIntelligenceState('entry-form-test');
  return {
    actorUserId: 'author-1',
    defaultMetadata: {
      client: 'Acme Health',
      ownerOrganization: 'Acme',
      projectType: 'Hospital',
      sector: 'Healthcare',
      deliveryMethod: 'Design-Build',
      geography: 'Midwest',
      lifecyclePhase: 'Preconstruction',
      riskCategory: 'Schedule',
    },
    commitments: state.commitmentRegister,
    queue: [
      {
        queueItemId: 'queue-author',
        entryId: 'entry-author',
        submittedBy: 'author-1',
        submittedAt: new Date().toISOString(),
        approvalStatus: 'revision-requested' as const,
        reviewNotes: 'Please provide citation links.',
      },
    ],
  };
};

describe('IntelligenceEntryForm', () => {
  it('renders unauthorized state when contributor permissions are missing', () => {
    const props = createProps();

    render(
      <IntelligenceEntryForm
        canContribute={false}
        actorUserId={props.actorUserId}
        defaultMetadata={props.defaultMetadata}
        commitments={props.commitments}
        queue={props.queue}
      />
    );

    expect(screen.getByTestId('intelligence-entry-form-unauthorized')).toBeInTheDocument();
  });

  it('validates required fields and accessible errors', () => {
    const onSubmit = vi.fn();
    const props = createProps();

    render(
      <IntelligenceEntryForm
        canContribute
        actorUserId={props.actorUserId}
        defaultMetadata={{}}
        commitments={props.commitments}
        queue={props.queue}
        onSubmit={onSubmit}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit intelligence entry' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('Type is required.')).toBeInTheDocument();
    expect(screen.getByText('Title is required.')).toBeInTheDocument();
    expect(screen.getByText('Body is required.')).toBeInTheDocument();
  });

  it('requires explicit AI approval before persistence when AI text is inserted', () => {
    const onSubmit = vi.fn();
    const props = createProps();

    render(
      <IntelligenceEntryForm
        canContribute
        actorUserId={props.actorUserId}
        defaultMetadata={props.defaultMetadata}
        commitments={props.commitments}
        queue={props.queue}
        onSubmit={onSubmit}
        aiSuggestion={{
          suggestionId: 'ai-1',
          text: 'AI-generated strategic narrative',
          citations: ['https://citation-1'],
        }}
      />
    );

    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'risk-gap' } });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Risk Gap Entry' } });
    fireEvent.click(screen.getByRole('button', { name: 'Insert AI suggestion' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit intelligence entry' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText('AI-assisted content requires explicit approval before submission.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('checkbox', {
      name: 'I explicitly approve AI-assisted content for persistence.',
    }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit intelligence entry' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0].provenanceClass).toBe('ai-assisted-draft');
    expect(onSubmit.mock.calls[0]?.[0].aiCitationMetadata).toEqual(['https://citation-1']);
  });

  it('shows contributor status strip with revision reason', () => {
    const props = createProps();

    render(
      <IntelligenceEntryForm
        canContribute
        actorUserId={props.actorUserId}
        defaultMetadata={props.defaultMetadata}
        commitments={props.commitments}
        queue={props.queue}
      />
    );

    expect(screen.getByTestId('intelligence-entry-status-strip')).toHaveTextContent(
      'revision-requested'
    );
    expect(screen.getByText('Review rationale: Please provide citation links.')).toBeInTheDocument();
  });

  it('submits non-AI draft with optional links and commitments', () => {
    const onSubmit = vi.fn();
    const props = createProps();

    render(
      <IntelligenceEntryForm
        canContribute
        actorUserId={props.actorUserId}
        defaultMetadata={props.defaultMetadata}
        commitments={props.commitments}
        queue={props.queue}
        onSubmit={onSubmit}
      />
    );

    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'relationship-intelligence' } });
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Relationship summary' } });
    fireEvent.change(screen.getByLabelText('Body'), { target: { value: 'Contributor-authored intelligence.' } });
    fireEvent.change(screen.getByLabelText('Supporting links (comma-separated)'), {
      target: { value: 'https://one.example, https://two.example' },
    });
    const commitmentsSelect = screen.getByLabelText('Related commitments') as HTMLSelectElement;
    commitmentsSelect.options[0].selected = true;
    fireEvent.change(commitmentsSelect);
    fireEvent.click(screen.getByRole('button', { name: 'Submit intelligence entry' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0].provenanceClass).toBe('meeting-summary');
    expect(onSubmit.mock.calls[0]?.[0].supportingLinks).toEqual([
      'https://one.example',
      'https://two.example',
    ]);
    expect(onSubmit.mock.calls[0]?.[0].relatedCommitmentIds).toEqual([
      props.commitments[0]?.commitmentId,
    ]);
  });
});
