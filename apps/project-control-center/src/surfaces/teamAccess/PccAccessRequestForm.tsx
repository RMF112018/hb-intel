import type { FC, FormEvent } from 'react';
import { PccPreviewState } from '../../ui/PccPreviewState';
import styles from './PccTeamAccessSurface.module.css';

export interface PccAccessRequestFormProps {
  readonly introText: string;
  readonly requestAccessButtonLabel: string;
  readonly requestChangeButtonLabel: string;
  readonly requestAccessEnabled: boolean;
  readonly requestChangeEnabled: boolean;
  readonly deferredTitle: string;
  readonly deferredDescription: string;
}

function preventPreviewSubmit(event: FormEvent<HTMLFormElement>): void {
  event.preventDefault();
}

export const PccAccessRequestForm: FC<PccAccessRequestFormProps> = ({
  introText,
  requestAccessButtonLabel,
  requestChangeButtonLabel,
  requestAccessEnabled,
  requestChangeEnabled,
  deferredTitle,
  deferredDescription,
}) => {
  return (
    <form className={styles.body} data-pcc-access-request-form="" onSubmit={preventPreviewSubmit}>
      <p className={styles.previewCue}>{introText}</p>

      <div className={styles.metaRow}>
        <button
          type="submit"
          disabled={!requestAccessEnabled}
          className={styles.disabledAction}
          aria-label={requestAccessButtonLabel}
        >
          {requestAccessButtonLabel}
        </button>
        <button
          type="button"
          disabled={!requestChangeEnabled}
          className={styles.disabledAction}
          aria-label={requestChangeButtonLabel}
        >
          {requestChangeButtonLabel}
        </button>
      </div>

      <PccPreviewState
        state="not-yet-implemented-operation"
        title={deferredTitle}
        description={deferredDescription}
      />
    </form>
  );
};

export default PccAccessRequestForm;
