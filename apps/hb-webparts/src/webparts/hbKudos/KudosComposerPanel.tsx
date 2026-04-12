/**
 * KudosComposerPanel — composer flyout composition.
 *
 * Extracted from HbKudos.tsx (phase-19 Wave 2). Owns the mapping from
 * composer state (editing / submitting / success / error) to the
 * HbcKudosComposerFlyout chrome: flyout title, primary/secondary
 * actions, composer form + preview, success and error subviews.
 * Keeps HbKudos.tsx as a thin shell over composer, archive, reader,
 * feed, and discard-dialog controllers.
 */
import * as React from 'react';
import {
  HbcKudosComposerFlyout,
  HbcKudosComposerForm,
  HbcKudosComposerPreview,
  HbcKudosComposerSuccess,
  HbcKudosComposerError,
} from '@hbc/ui-kit/homepage';
import type { useKudosComposer } from '../../homepage/data/useKudosComposer.js';
import type { useSharePointPeopleSearch } from '../../homepage/data/useSharePointPeopleSearch.js';
import type { createGraphPersonPhotoFn } from '@hbc/ui-kit/homepage';
import flyoutStyles from './kudosFlyout.module.css';

type ComposerRuntime = ReturnType<typeof useKudosComposer>;
type PeopleSearchFn = ReturnType<typeof useSharePointPeopleSearch>;
type PhotoFn = ReturnType<typeof createGraphPersonPhotoFn>;

export interface KudosComposerPanelProps {
  composer: ComposerRuntime;
  submitterName?: string;
  searchPeople: PeopleSearchFn;
  fetchPersonPhoto?: PhotoFn;
  onRequestClose: () => void;
}

export function KudosComposerPanel({
  composer,
  submitterName,
  searchPeople,
  fetchPersonPhoto,
  onRequestClose,
}: KudosComposerPanelProps): React.JSX.Element {
  const { state, actions } = composer;
  const isEditing =
    state.status === 'editing' ||
    state.status === 'error' ||
    state.status === 'submitting';

  const primaryAction =
    state.status === 'success'
      ? { label: 'Done', onClick: actions.close }
      : {
          label: 'Send Kudos',
          onClick: actions.submit,
          loading: state.status === 'submitting',
        };

  const secondaryAction =
    state.status === 'success'
      ? { label: 'Send Another', onClick: () => actions.reset() }
      : { label: 'Cancel', onClick: onRequestClose };

  return (
    <HbcKudosComposerFlyout
      open={state.isOpen}
      onClose={onRequestClose}
      title="Give Kudos"
      subtitle="Celebrate a teammate with a warm recognition note"
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    >
      <div
        className={flyoutStyles.body}
        data-hbc-testid="hb-kudos-composer-body"
        aria-label="Give Kudos composer"
      >
        {state.status === 'success' ? (
          <div data-hbc-testid="hb-kudos-composer-success">
            <HbcKudosComposerSuccess />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div role="alert" data-hbc-testid="hb-kudos-composer-error">
            <HbcKudosComposerError
              body={state.submitError || 'An unexpected error occurred. Please try again.'}
            />
          </div>
        ) : null}

        {isEditing ? (
          <>
            <div data-hbc-testid="hb-kudos-composer-form">
              <HbcKudosComposerForm
                draft={state.draft}
                onDraftChange={actions.updateDraft}
                errors={state.validationErrors}
                disabled={state.status === 'submitting'}
                recipientsMode="typed"
                searchPeople={searchPeople}
                fetchPersonPhoto={fetchPersonPhoto}
              />
            </div>
            <div data-hbc-testid="hb-kudos-composer-preview">
              <HbcKudosComposerPreview
                draft={state.draft}
                submitterName={submitterName ?? ''}
              />
            </div>
          </>
        ) : null}
      </div>
    </HbcKudosComposerFlyout>
  );
}
