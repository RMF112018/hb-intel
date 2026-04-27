import { useMemo } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type {
  FoleonManagedContent,
  FoleonPlacement,
} from '../../types/foleon-management.types.js';
import {
  displayLaneState,
  laneStateConsumerHint,
  placementStatusPlain,
  summarizePublishReadinessForCard,
  type FoleonLaneViewModel,
} from './manageLaneViewModel.js';
import { readerLaneForContent } from './manageMutationUtils.js';
// Legacy nav id helpers retained inline. This component is no longer mounted by
// the active shell; new shell ids live in feedManagerViewModel.ts.
const navButtonId = (key: string): string => `foleon-manage-nav-${key}`;
const navPanelId = (key: string): string => `foleon-manage-panel-${key}`;
import shell from './manageShell.module.css';
import f from './manageFields.module.css';

export interface LaneBoardProps {
  readonly lanes: ReadonlyArray<FoleonLaneViewModel>;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly onSelectRecord: (id: string) => void;
  readonly onTriggerSync: () => void;
  readonly canSync: boolean;
  readonly canWrite: boolean;
  readonly writeBlockReason: string;
}

/**
 * Real Lane Board (replaces the Wave 1 placeholder).
 *
 * Surfaces only fields derivable from current schema. No invented data, counts, or
 * preview output. "Available content candidates" are content records whose readerKey
 * matches the lane and that are not already the active or staged edition for that lane.
 */
export function LaneBoard(props: LaneBoardProps): React.ReactNode {
  return (
    <section
      role="tabpanel"
      id={navPanelId('lane-board')}
      aria-labelledby={navButtonId('lane-board')}
      aria-label="Lane Board"
      className={shell.laneBoard}
    >
      <header className={shell.laneBoardHeader}>
        <p className={f.guidanceKicker}>Workspace</p>
        <h3 className={f.sectionTitle}>Lane Board</h3>
        <p className={f.metaMuted}>
          One column per homepage lane. Each column shows what is live, what is staged, and
          what content can be promoted into the lane next.
        </p>
      </header>
      <div className={shell.laneBoardColumns} role="list">
        {props.lanes.map((lane) => (
          <LaneBoardColumn
            key={lane.lane}
            lane={lane}
            content={props.content}
            onSelectRecord={props.onSelectRecord}
            onTriggerSync={props.onTriggerSync}
            canSync={props.canSync}
            canWrite={props.canWrite}
            writeBlockReason={props.writeBlockReason}
          />
        ))}
      </div>
    </section>
  );
}

function LaneBoardColumn(props: {
  readonly lane: FoleonLaneViewModel;
  readonly content: ReadonlyArray<FoleonManagedContent>;
  readonly onSelectRecord: (id: string) => void;
  readonly onTriggerSync: () => void;
  readonly canSync: boolean;
  readonly canWrite: boolean;
  readonly writeBlockReason: string;
}): React.ReactNode {
  const candidates = useMemo(() => {
    const occupiedIds = new Set(
      [props.lane.activeContent?.id, props.lane.stagedContent?.id].filter(
        (id): id is string => Boolean(id),
      ),
    );
    return props.content.filter(
      (record) => readerLaneForContent(record) === props.lane.lane && !occupiedIds.has(record.id),
    );
  }, [props.content, props.lane]);

  const displayWindow = formatWindow(props.lane.placement);
  const placementStatus = placementStatusPlain(props.lane.placement);
  const readinessSummary = summarizePublishReadinessForCard(props.lane.checklist);

  return (
    <article
      role="listitem"
      className={shell.laneBoardColumn}
      data-lane-key={props.lane.lane}
      data-lane-state={props.lane.state}
      aria-label={`${props.lane.label} lane`}
    >
      <header className={shell.laneBoardColumnHeader}>
        <div>
          <h4 className={shell.laneBoardColumnTitle}>{props.lane.label}</h4>
          <p className={shell.laneBoardColumnHint}>{laneStateConsumerHint(props.lane.state)}</p>
        </div>
        <span
          className={shell.laneBoardStatePill}
          data-lane-state={props.lane.state}
        >
          {displayLaneState(props.lane.state)}
        </span>
      </header>

      <LaneBoardSection title="Live edition">
        {props.lane.activeContent ? (
          <LaneBoardRecordCard
            record={props.lane.activeContent}
            onSelect={(): void => props.onSelectRecord(props.lane.activeContent!.id)}
            ctaLabel="Open live in workflow"
            canWrite={props.canWrite}
            writeBlockReason={props.writeBlockReason}
          />
        ) : (
          <p className={shell.laneBoardSectionEmpty}>No live edition for this lane yet.</p>
        )}
      </LaneBoardSection>

      <LaneBoardSection title="Staged or draft">
        {props.lane.stagedContent ? (
          <LaneBoardRecordCard
            record={props.lane.stagedContent}
            onSelect={(): void => props.onSelectRecord(props.lane.stagedContent!.id)}
            ctaLabel="Open staged in workflow"
            canWrite={props.canWrite}
            writeBlockReason={props.writeBlockReason}
          />
        ) : (
          <p className={shell.laneBoardSectionEmpty}>
            {props.lane.activeContent
              ? 'No separate staged record is queued.'
              : 'Sync content to stage a lane record.'}
          </p>
        )}
      </LaneBoardSection>

      <dl className={shell.laneBoardFacts}>
        <div>
          <dt>Placement status</dt>
          <dd>{placementStatus}</dd>
        </div>
        <div>
          <dt>Display window</dt>
          <dd>{displayWindow}</dd>
        </div>
        <div>
          <dt>Readiness</dt>
          <dd>{readinessSummary}</dd>
        </div>
      </dl>

      {props.lane.warnings.length > 0 ? (
        <LaneBoardSection title="Blocking reasons">
          <ul className={shell.laneBoardWarnings} role="list">
            {props.lane.warnings.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </LaneBoardSection>
      ) : null}

      <LaneBoardSection title="Next recommended action">
        <p className={shell.laneBoardNextAction}>{props.lane.nextAction}</p>
      </LaneBoardSection>

      {candidates.length > 0 ? (
        <LaneBoardSection title="Available content candidates">
          <ul className={shell.laneBoardCandidates} role="list">
            {candidates.map((record) => (
              <li key={record.id}>
                <button
                  type="button"
                  className={shell.laneBoardCandidateButton}
                  onClick={(): void => props.onSelectRecord(record.id)}
                >
                  <strong>{record.title}</strong>
                  <span>{record.publishStatus} · {record.validationStatus}</span>
                </button>
              </li>
            ))}
          </ul>
        </LaneBoardSection>
      ) : null}

      <footer className={shell.laneBoardFooter}>
        {!props.lane.activeContent && !props.lane.stagedContent ? (
          <HbcButton
            variant="secondary"
            disabled={!props.canSync}
            aria-describedby={!props.canSync ? 'foleon-manage-sync-readiness' : undefined}
            onClick={props.onTriggerSync}
          >
            {props.canSync ? 'Add or sync content' : 'Sync blocked'}
          </HbcButton>
        ) : null}
      </footer>
    </article>
  );
}

function LaneBoardSection(props: {
  readonly title: string;
  readonly children: React.ReactNode;
}): React.ReactNode {
  return (
    <section className={shell.laneBoardSection} aria-label={props.title}>
      <h5 className={shell.laneBoardSectionTitle}>{props.title}</h5>
      {props.children}
    </section>
  );
}

function LaneBoardRecordCard(props: {
  readonly record: FoleonManagedContent;
  readonly onSelect: () => void;
  readonly ctaLabel: string;
  readonly canWrite: boolean;
  readonly writeBlockReason: string;
}): React.ReactNode {
  return (
    <div className={shell.laneBoardRecordCard}>
      <strong className={shell.laneBoardRecordTitle}>{props.record.title}</strong>
      <p className={shell.laneBoardRecordMeta}>
        {props.record.publishStatus} · Doc {props.record.foleonDocId} · {props.record.validationStatus}
      </p>
      <HbcButton variant="secondary" onClick={props.onSelect}>
        {props.ctaLabel}
      </HbcButton>
      {!props.canWrite ? (
        <p className={shell.laneBoardWriteNotice}>{props.writeBlockReason}</p>
      ) : null}
    </div>
  );
}

function formatWindow(placement: FoleonLaneViewModel['placement']): string {
  if (!placement) return 'Not set';
  return `${placement.displayFrom ?? 'Now'} to ${placement.displayThrough ?? 'Open'}`;
}
