import { useEffect, useState } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import { LayoutGrid } from 'lucide-react';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonPlacementMutation,
} from '../../types/foleon-management.types.js';
import { ManageCheckbox, ManageSelectField, ManageTextField } from './ManageFieldPrimitives.js';
import { placementAlignmentWarnings } from './manageMutationUtils.js';
import f from './manageFields.module.css';

function ValidationList(props: { readonly reasons: ReadonlyArray<string> }): React.ReactNode {
  if (props.reasons.length === 0) {
    return <p className={f.validationOk}>Placement validation clear.</p>;
  }
  return (
    <ul className={f.validationBad}>
      {props.reasons.map((reason) => (
        <li key={reason}>{reason}</li>
      ))}
    </ul>
  );
}

export function ManagePlacementPanel(props: {
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly placements: ReadonlyArray<FoleonPlacement>;
  readonly api: FoleonManagementApi;
  readonly onRefresh: () => Promise<void>;
  readonly setMessage: (message: string | null) => void;
  readonly canWrite?: boolean;
  readonly writeBlockReason?: string;
}): React.ReactNode {
  const firstContent = props.content[0];
  const [draft, setDraft] = useState<FoleonPlacementMutation>({
    title: 'Homepage feature',
    placementKey: 'Hero',
    contentItemId: firstContent?.sharePointItemId ?? 0,
    isActive: true,
    sortRank: 1,
    layoutVariant: 'Large Feature',
  });

  useEffect(() => {
    if (firstContent && draft.contentItemId === 0) {
      setDraft((current) => ({ ...current, contentItemId: firstContent.sharePointItemId }));
    }
  }, [draft.contentItemId, firstContent]);

  const draftWarnings = placementAlignmentWarnings({
    placementKey: draft.placementKey,
    contentItemId: draft.contentItemId,
    content: props.content,
  });

  const create = async (): Promise<void> => {
    if (props.canWrite === false) {
      props.setMessage(`Placement writes are blocked: ${props.writeBlockReason ?? 'write path is not ready'}.`);
      return;
    }
    await props.api.createPlacement(draft);
    props.setMessage('Homepage placement saved with backend ContentIdCache validation.');
    await props.onRefresh();
  };

  return (
    <section className={f.editorSection} aria-label="Placement manager">
      <h3 className={f.sectionTitle}>
        <LayoutGrid size={18} style={{ verticalAlign: 'text-bottom', marginRight: 6 }} aria-hidden />
        Placement Manager
      </h3>
      <div className={f.gridPlacement}>
        <ManageTextField
          id="pl-title"
          label="Placement title"
          value={draft.title}
          onChange={(title): void => setDraft({ ...draft, title })}
        />
        <ManageSelectField
          id="pl-key"
          label="Placement"
          value={draft.placementKey}
          options={[
            'Hero',
            'Primary Card',
            'Secondary Card',
            'Carousel',
            'Archive Rail',
            'Project Spotlight Active',
            'Company Pulse Active',
            'Leadership Message Active',
          ]}
          onChange={(placementKey): void =>
            setDraft({ ...draft, placementKey: placementKey as FoleonPlacementMutation['placementKey'] })
          }
        />
        <ManageSelectField
          id="pl-content"
          label="Content"
          helpText="Maps to SharePoint ContentLookupId; backend stamps ContentIdCache from the selected Foleon Doc ID."
          value={String(draft.contentItemId)}
          options={props.content.map((record) => `${record.sharePointItemId}:${record.title}`)}
          onChange={(value): void =>
            setDraft({ ...draft, contentItemId: Number.parseInt(value.split(':')[0] ?? '0', 10) })
          }
        />
        <ManageTextField
          id="pl-rank"
          label="Sort rank"
          value={String(draft.sortRank)}
          onChange={(value): void => setDraft({ ...draft, sortRank: Number.parseInt(value, 10) || 0 })}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <ManageCheckbox
          id="pl-active"
          label="Active placement"
          checked={draft.isActive}
          onChange={(isActive): void => setDraft({ ...draft, isActive })}
        />
      </div>
      {props.canWrite === false ? (
        <p className={f.metaMuted} role="status" id="foleon-manage-placement-write-reason">
          Placement writes are disabled: {props.writeBlockReason ?? 'write path is not ready'}.
        </p>
      ) : null}
      <div style={{ marginTop: 12 }}>
        <HbcButton
          variant="primary"
          disabled={props.canWrite === false}
          aria-describedby={props.canWrite === false ? 'foleon-manage-placement-write-reason' : undefined}
          onClick={(): void => void create()}
        >
          {props.canWrite === false ? 'Create placement blocked' : 'Create placement'}
        </HbcButton>
      </div>
      {draftWarnings.length > 0 ? (
        <div role="status" aria-label="Placement lane guidance">
          <ValidationList reasons={draftWarnings} />
        </div>
      ) : null}
      <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
        {props.placements.map((placement) => {
          const alignmentWarnings = placementAlignmentWarnings({
            placementKey: placement.placementKey,
            contentItemId: placement.contentItemId,
            content: props.content,
          });
          return (
            <article key={placement.id} className={f.placementCard}>
              <strong>{placement.title}</strong>
              <div className={f.metaMuted}>
                {placement.placementKey} • Doc {placement.foleonDocId} • Rank {placement.sortRank}
              </div>
              <ValidationList reasons={[...placement.blockingReasons, ...alignmentWarnings]} />
            </article>
          );
        })}
      </div>
    </section>
  );
}
