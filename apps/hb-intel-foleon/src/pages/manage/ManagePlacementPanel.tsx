import { useEffect, useState } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import { LayoutGrid, LockKeyhole } from 'lucide-react';
import type { FoleonManagementApi } from '../../services/FoleonManagementApi.js';
import type {
  FoleonManagedContent,
  FoleonPlacement,
  FoleonPlacementMutation,
} from '../../types/foleon-management.types.js';
import type { FoleonReaderLane } from './manageMutationUtils.js';
import { ManageCheckbox, ManageSelectField, ManageTextField } from './ManageFieldPrimitives.js';
import { placementAlignmentWarnings } from './manageMutationUtils.js';
import shell from './manageShell.module.css';
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
  readonly focusedLane?: FoleonReaderLane;
  readonly focusedLaneLabel?: string;
  readonly focusedPlacementKey?: string;
  readonly focusedContent?: FoleonManagedContent;
}): React.ReactNode {
  const firstContent = props.focusedContent ?? props.content[0];
  const focusedPlacementKey = normalizePlacementKey(props.focusedPlacementKey);
  const [draft, setDraft] = useState<FoleonPlacementMutation>({
    title: props.focusedLaneLabel ? `${props.focusedLaneLabel} homepage placement` : 'Homepage feature',
    placementKey: focusedPlacementKey,
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

  useEffect(() => {
    if (!props.focusedPlacementKey && !props.focusedLaneLabel) return;
    setDraft((current) => ({
      ...current,
      title: props.focusedLaneLabel ? `${props.focusedLaneLabel} homepage placement` : current.title,
      placementKey: focusedPlacementKey,
      contentItemId: firstContent?.sharePointItemId ?? current.contentItemId,
    }));
  }, [firstContent?.sharePointItemId, focusedPlacementKey, props.focusedLaneLabel]);

  const draftWarnings = placementAlignmentWarnings({
    placementKey: draft.placementKey,
    contentItemId: draft.contentItemId,
    content: props.content,
  });
  const visiblePlacements = props.focusedPlacementKey
    ? props.placements.filter((placement) => placement.placementKey === props.focusedPlacementKey)
    : props.placements;

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
    <section className={shell.placementRailPanel} aria-label="Placement manager">
      <div className={shell.panelTitleRow}>
        <LayoutGrid size={18} aria-hidden />
        <div>
          <p className={f.guidanceKicker}>Placement manager</p>
          <h3 className={f.sectionTitle}>{props.focusedLaneLabel ?? 'Homepage placements'}</h3>
        </div>
      </div>
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
      <div className={shell.placementCheckboxRow}>
        <ManageCheckbox
          id="pl-active"
          label="Active placement"
          checked={draft.isActive}
          onChange={(isActive): void => setDraft({ ...draft, isActive })}
        />
      </div>
      {props.canWrite === false ? (
        <p className={shell.placementWriteNotice} role="status" id="foleon-manage-placement-write-reason">
          <LockKeyhole size={15} aria-hidden />
          <span>Placement writes are disabled: {props.writeBlockReason ?? 'write path is not ready'}.</span>
        </p>
      ) : null}
      <div className={shell.placementActionRow}>
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
      <div className={shell.placementList}>
        {visiblePlacements.length === 0 ? (
          <p className={f.metaMuted}>No placement record is assigned to this lane yet.</p>
        ) : null}
        {visiblePlacements.map((placement) => {
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

function normalizePlacementKey(value: string | undefined): FoleonPlacementMutation['placementKey'] {
  const allowed: ReadonlyArray<FoleonPlacementMutation['placementKey']> = [
    'Hero',
    'Primary Card',
    'Secondary Card',
    'Carousel',
    'Archive Rail',
    'Project Spotlight Active',
    'Company Pulse Active',
    'Leadership Message Active',
  ];
  return allowed.find((entry) => entry === value) ?? 'Hero';
}
