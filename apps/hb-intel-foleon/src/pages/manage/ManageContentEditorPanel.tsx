import { useEffect, useMemo, useState } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import { cva } from 'class-variance-authority';
import { Save } from 'lucide-react';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import { FoleonManagementApiError } from '../../services/FoleonManagementApi.js';
import type {
  FoleonCadence,
  FoleonContentMutation,
  FoleonHomepageSlot,
  FoleonManagedContent,
  FoleonPrimaryAudience,
  FoleonReaderKey,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import {
  ManageCheckbox,
  ManageFieldLabel,
  ManageSelectField,
  ManageTextField,
} from './ManageFieldPrimitives.js';
import { runContentPublish, runContentSuppress, runContentValidate } from './manageWorkflows.js';
import {
  applyReaderLanePreset,
  buildReaderLaneWarnings,
  contentMutationFingerprint,
  toContentMutation,
} from './manageMutationUtils.js';
import f from './manageFields.module.css';

const statusPill = cva(f.statusPill, {
  variants: {
    status: {
      valid: f.pillValid,
      warning: f.pillWarning,
      blocked: f.pillBlocked,
      unknown: f.pillUnknown,
    },
  },
  defaultVariants: { status: 'unknown' },
});

function ValidationList(props: { readonly reasons: ReadonlyArray<string> }): React.ReactNode {
  if (props.reasons.length === 0) {
    return <p className={f.validationOk}>Validation clear.</p>;
  }
  return (
    <ul className={f.validationBad}>
      {props.reasons.map((reason) => (
        <li key={reason}>{reason}</li>
      ))}
    </ul>
  );
}

export function ManageContentEditorPanel(props: {
  readonly record: FoleonManagedContent;
  readonly allContent: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly api: FoleonManagementApi;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
}): React.ReactNode {
  const [draft, setDraft] = useState(() => toContentMutation(props.record));
  useEffect(() => setDraft(toContentMutation(props.record)), [props.record]);

  const baselineFingerprint = useMemo(
    () => contentMutationFingerprint(toContentMutation(props.record)),
    [props.record],
  );
  const dirty = contentMutationFingerprint(draft) !== baselineFingerprint;
  const laneWarnings = useMemo(
    () => buildReaderLaneWarnings({
      draft,
      record: props.record,
      allContent: props.allContent,
      placements: props.placements,
    }),
    [draft, props.record, props.allContent, props.placements],
  );

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return (): void => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const save = async (): Promise<void> => {
    try {
      await props.api.updateContent(props.record.id, draft);
      props.setMessage('Content metadata saved through the backend route.');
      await props.onRefresh();
    } catch (err) {
      if (err instanceof FoleonManagementApiError && err.isGraphConflict) {
        props.setMessage(
          `Save conflict: another editor changed this item. Refresh and retry. Correlation: ${err.requestId ?? 'n/a'}.`,
        );
        return;
      }
      props.setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <section className={f.editorSection} aria-label="Content detail editor">
      {dirty ? (
        <div className={f.dirtyBanner} role="status">
          Unsaved changes — save before leaving this page or you may lose edits.
        </div>
      ) : null}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h3 className={f.sectionTitle}>Content Detail</h3>
        <span className={statusPill({ status: props.record.validationStatus })}>{props.record.validationStatus}</span>
      </div>
      <div className={f.gridFields}>
        <ManageTextField id="foleon-title" label="Title" value={draft.title} onChange={(title): void => setDraft({ ...draft, title })} />
        <ManageSelectField
          id="foleon-content-type"
          label="Content type"
          value={draft.contentTypeKey}
          options={[
            'Project Highlight',
            'Newsletter',
            'Company News',
            'Market Update',
            'Leadership',
            'Other',
            'Project Spotlight',
            'Company Pulse',
          ]}
          onChange={(contentTypeKey): void => setDraft({ ...draft, contentTypeKey })}
        />
        <ManageTextField
          id="foleon-docid"
          label="Foleon Doc ID"
          helpText="Positive integer matching the Foleon document identifier in the governed registry."
          value={String(draft.foleonDocId)}
          onChange={(value): void => setDraft({ ...draft, foleonDocId: Number.parseInt(value, 10) || 0 })}
        />
        <ManageSelectField
          id="foleon-reader-key"
          label="Reader key"
          helpText="Lane key used by the Project Spotlight and Company Pulse public reader resolvers."
          value={draft.readerKey ?? ''}
          options={['', 'project-spotlight', 'company-pulse']}
          onChange={(readerKey): void =>
            setDraft({ ...draft, readerKey: readerKey ? readerKey as FoleonReaderKey : undefined })
          }
        />
        <ManageSelectField
          id="foleon-cadence"
          label="Cadence"
          value={draft.cadence ?? ''}
          options={['', 'Monthly', 'Weekly', 'Frequent', 'Ad Hoc']}
          onChange={(cadence): void =>
            setDraft({ ...draft, cadence: cadence ? cadence as FoleonCadence : undefined })
          }
        />
        <ManageSelectField
          id="foleon-homepage-slot"
          label="Homepage slot"
          value={draft.homepageSlot ?? ''}
          options={['', 'Project Spotlight Reader', 'Company Pulse Reader']}
          onChange={(homepageSlot): void =>
            setDraft({ ...draft, homepageSlot: homepageSlot ? homepageSlot as FoleonHomepageSlot : undefined })
          }
        />
        <ManageTextField
          id="foleon-archive-group"
          label="Archive group"
          value={draft.archiveGroup ?? ''}
          onChange={(archiveGroup): void => setDraft({ ...draft, archiveGroup })}
        />
        <ManageSelectField
          id="foleon-primary-audience"
          label="Primary audience"
          value={draft.primaryAudience ?? ''}
          options={['', 'Companywide', 'Operations', 'Field', 'Leadership', 'Marketing', 'Safety', 'IT']}
          onChange={(primaryAudience): void =>
            setDraft({
              ...draft,
              primaryAudience: primaryAudience ? primaryAudience as FoleonPrimaryAudience : undefined,
            })
          }
        />
        <ManageTextField
          id="foleon-last-editorial-update"
          label="Last editorial update"
          helpText="Use an ISO date or datetime. Company Pulse readers use this as the latest update label."
          value={draft.lastEditorialUpdate ?? ''}
          onChange={(lastEditorialUpdate): void => setDraft({ ...draft, lastEditorialUpdate })}
        />
        <ManageSelectField
          id="foleon-status"
          label="Status"
          value={draft.publishStatus}
          options={['Draft', 'Preview', 'Published', 'Archived', 'Offline', 'Suppressed']}
          onChange={(publishStatus): void => setDraft({ ...draft, publishStatus })}
        />
        <ManageSelectField
          id="foleon-openmode"
          label="Open mode"
          value={draft.openMode}
          options={['Inline Reader', 'Fullscreen Reader', 'New Tab Only']}
          onChange={(openMode): void =>
            setDraft({ ...draft, openMode: openMode as FoleonContentMutation['openMode'] })
          }
        />
        <ManageTextField
          id="foleon-puburl"
          label="Published URL"
          value={draft.publishedUrl ?? ''}
          onChange={(publishedUrl): void => setDraft({ ...draft, publishedUrl })}
        />
        <ManageTextField
          id="foleon-embedurl"
          label="Embed URL"
          value={draft.embedUrl ?? ''}
          onChange={(embedUrl): void => setDraft({ ...draft, embedUrl })}
        />
        <ManageTextField
          id="foleon-region"
          label="Region"
          value={draft.region ?? ''}
          onChange={(region): void => setDraft({ ...draft, region })}
        />
        <ManageTextField
          id="foleon-sector"
          label="Sector"
          value={draft.sector ?? ''}
          onChange={(sector): void => setDraft({ ...draft, sector })}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <ManageFieldLabel label="Summary" />
        <textarea
          value={draft.summary ?? ''}
          onChange={(event): void => setDraft({ ...draft, summary: event.currentTarget.value })}
          rows={4}
          className={f.fieldInput}
          aria-label="Summary"
        />
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '14px 0' }}>
        <ManageCheckbox
          id="foleon-active-edition"
          label="Active reader edition"
          checked={draft.activeEdition === true}
          onChange={(activeEdition): void => setDraft({ ...draft, activeEdition })}
        />
        <ManageCheckbox
          id="foleon-visible"
          label="Visible"
          checked={draft.isVisible}
          onChange={(isVisible): void => setDraft({ ...draft, isVisible })}
        />
        <ManageCheckbox
          id="foleon-hp"
          label="Homepage eligible"
          checked={draft.isHomepageEligible}
          onChange={(isHomepageEligible): void => setDraft({ ...draft, isHomepageEligible })}
        />
        <ManageCheckbox
          id="foleon-embed"
          label="Allow embed"
          checked={draft.allowEmbed}
          onChange={(allowEmbed): void => setDraft({ ...draft, allowEmbed })}
        />
        <ManageCheckbox
          id="foleon-ext"
          label="Requires external open"
          checked={draft.requiresExternalOpen}
          onChange={(requiresExternalOpen): void => setDraft({ ...draft, requiresExternalOpen })}
        />
      </div>
      <div className={f.flexToolbar} aria-label="Reader lane presets">
        <HbcButton
          variant="secondary"
          onClick={(): void => setDraft((current) => applyReaderLanePreset(current, 'project-spotlight'))}
        >
          Configure as Project Spotlight
        </HbcButton>
        <HbcButton
          variant="secondary"
          onClick={(): void => setDraft((current) => applyReaderLanePreset(current, 'company-pulse'))}
        >
          Configure as Company Pulse
        </HbcButton>
      </div>
      {laneWarnings.length > 0 ? (
        <div role="status" aria-label="Reader lane guidance">
          <ValidationList reasons={laneWarnings} />
        </div>
      ) : null}
      <ValidationList reasons={props.record.blockingReasons} />
      <div className={f.flexToolbar}>
        <HbcButton variant="primary" onClick={(): void => void save()}>
          <Save size={16} style={{ marginRight: 6, verticalAlign: 'text-bottom' }} aria-hidden />
          Save
        </HbcButton>
        <HbcButton
          variant="secondary"
          onClick={(): void => void runContentValidate(props.api, props.record.id, props.onRefresh, props.setMessage)}
        >
          Validate
        </HbcButton>
        <HbcButton
          variant="secondary"
          onClick={(): void => void runContentPublish(props.api, props.record.id, props.onRefresh, props.setMessage)}
        >
          Publish
        </HbcButton>
        <HbcButton
          variant="secondary"
          onClick={(): void => void runContentSuppress(props.api, props.record.id, props.onRefresh, props.setMessage)}
        >
          Suppress
        </HbcButton>
      </div>
    </section>
  );
}
