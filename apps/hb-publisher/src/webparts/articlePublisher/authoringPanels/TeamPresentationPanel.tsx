import * as React from 'react';
import {
  TEAM_VIEWER_GROUPING_MODE_VALUES,
  TEAM_VIEWER_MODE_VALUES,
  TEAM_VIEWER_SORT_MODE_VALUES,
  type TeamViewerGroupingMode,
  type TeamViewerMode,
  type TeamViewerSortMode,
} from '../../../data/publisherAdapter/index.js';
import {
  teamViewerGroupingModeLabel,
  teamViewerModeLabel,
  teamViewerSortModeLabel,
} from '../authorLabels.js';
import { defaultTeamHeading } from '../metadataDefaults.js';
import { ChooserGroup, Field } from '../sharedChrome/index.js';
import styles from '../article-publisher.module.css';
import { update, type PanelProps } from './draftHelpers.js';

export function TeamPresentationPanel({ draft, onChange }: PanelProps) {
  return (
    <div className={styles.editorialForm}>
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={draft.ShowTeamViewer !== false}
          onChange={(e) => onChange(update(draft, 'ShowTeamViewer', e.target.checked))}
        />
        <span>Include a team section on the published page</span>
      </label>
      <Field label="Team heading">
        <input
          className={styles.input}
          value={draft.TeamViewerTitle ?? ''}
          placeholder={defaultTeamHeading(draft.ProjectName)}
          onChange={(e) =>
            onChange(update(draft, 'TeamViewerTitle', e.target.value || undefined))
          }
        />
      </Field>
      <Field label="Team intro (optional)">
        <textarea
          className={styles.textarea}
          value={draft.TeamViewerIntro ?? ''}
          placeholder="A short intro shown above the team"
          onChange={(e) =>
            onChange(update(draft, 'TeamViewerIntro', e.target.value || undefined))
          }
        />
      </Field>
      <ChooserGroup
        label="Team layout"
        value={draft.TeamViewerMode}
        options={TEAM_VIEWER_MODE_VALUES}
        getLabel={teamViewerModeLabel}
        onChange={(next) =>
          onChange(update(draft, 'TeamViewerMode', next as TeamViewerMode | undefined))
        }
        allowClear
        clearLabel="Default"
      />
      <ChooserGroup
        label="Grouping"
        value={draft.TeamViewerGroupingMode}
        options={TEAM_VIEWER_GROUPING_MODE_VALUES}
        getLabel={teamViewerGroupingModeLabel}
        onChange={(next) =>
          onChange(
            update(draft, 'TeamViewerGroupingMode', next as TeamViewerGroupingMode | undefined),
          )
        }
        allowClear
        clearLabel="No grouping"
      />
      <ChooserGroup
        label="Sort order"
        value={draft.TeamViewerSortMode}
        options={TEAM_VIEWER_SORT_MODE_VALUES}
        getLabel={teamViewerSortModeLabel}
        onChange={(next) =>
          onChange(update(draft, 'TeamViewerSortMode', next as TeamViewerSortMode | undefined))
        }
        allowClear
        clearLabel="Default"
      />
      <Field label="How many members visible before expanding">
        <input
          className={styles.input}
          value={draft.TeamViewerMaxInitialVisible ?? ''}
          placeholder="e.g. 6"
          onChange={(e) =>
            onChange(update(draft, 'TeamViewerMaxInitialVisible', (() => {
              const raw = e.target.value.trim();
              if (raw.length === 0) return undefined;
              const parsed = Number(raw);
              return Number.isFinite(parsed) ? parsed : undefined;
            })()))
          }
        />
      </Field>
      <label className={styles.toggleRow}>
        <input
          type="checkbox"
          checked={draft.TeamViewerAllowExpand === true}
          onChange={(e) => onChange(update(draft, 'TeamViewerAllowExpand', e.target.checked))}
        />
        <span>Allow readers to expand the full team list</span>
      </label>
    </div>
  );
}
