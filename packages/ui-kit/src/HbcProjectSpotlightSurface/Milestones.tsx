/**
 * Milestones — two flavors of the same source data:
 *
 *   `MilestoneProgressPill` — compact always-visible signal shown in
 *   the featured essentials block. Anchors portfolio-health recognition
 *   without exposing the full list.
 *
 *   `MilestoneList` — full checklist with progress bar; only rendered
 *   inside the featured details region when the mode's visibility
 *   matrix enables it (`showMilestoneList`).
 */
import * as React from 'react';
import { clsx } from 'clsx';
import { Check, CheckCircle2 } from 'lucide-react';
import type { ProjectSpotlightMilestone } from './types.js';
import styles from './project-spotlight-surface.module.css';

interface MilestoneCounts {
  completed: number;
  total: number;
  percent: number;
}

function computeCounts(
  milestones: ProjectSpotlightMilestone[],
): MilestoneCounts {
  const completed = milestones.filter((m) => m.completed).length;
  const total = milestones.length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { completed, total, percent };
}

export interface MilestoneProgressPillProps {
  milestones: ProjectSpotlightMilestone[];
}

export function MilestoneProgressPill({
  milestones,
}: MilestoneProgressPillProps): React.JSX.Element | null {
  if (milestones.length === 0) return null;
  const { completed, total, percent } = computeCounts(milestones);
  return (
    <div
      className={styles.milestoneSignal}
      aria-label={`Milestone progress: ${completed} of ${total} complete`}
    >
      <span className={styles.milestoneSignalLabel}>
        <CheckCircle2 size={11} aria-hidden="true" strokeWidth={2.5} />
        Milestones
      </span>
      <span className={styles.milestoneSignalCount}>
        {completed}/{total} · {percent}%
      </span>
      <span className={styles.milestoneSignalBar} aria-hidden="true">
        <span
          className={styles.milestoneSignalBarFill}
          style={{ width: `${percent}%` }}
        />
      </span>
    </div>
  );
}

export interface MilestoneListProps {
  milestones: ProjectSpotlightMilestone[];
}

export function MilestoneList({
  milestones,
}: MilestoneListProps): React.JSX.Element | null {
  if (milestones.length === 0) return null;
  const { completed, total, percent } = computeCounts(milestones);
  return (
    <div className={styles.milestones}>
      <div className={styles.milestonesHeader}>
        <span className={styles.milestonesLabel}>
          <CheckCircle2 size={12} aria-hidden="true" strokeWidth={2.5} />
          Milestones
        </span>
        <span className={styles.milestonesProgress}>
          {completed}/{total}  ·  {percent}%
        </span>
      </div>
      <div className={styles.milestonesBar}>
        <div
          className={styles.milestonesBarFill}
          style={{ width: `${percent}%` }}
          aria-hidden="true"
        />
      </div>
      <ul className={styles.milestonesList}>
        {milestones.map((milestone) => (
          <li
            key={milestone.id}
            className={clsx(
              styles.milestoneItem,
              milestone.completed && styles.milestoneItemDone,
            )}
          >
            {milestone.completed ? (
              <span className={styles.milestoneCheck} aria-hidden="true">
                <Check size={11} strokeWidth={3} />
              </span>
            ) : (
              <span className={styles.milestoneCheckEmpty} aria-hidden="true" />
            )}
            <span className={styles.milestoneText}>{milestone.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
