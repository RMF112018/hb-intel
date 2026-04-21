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

export interface MilestoneProgressRingProps {
  milestones: ProjectSpotlightMilestone[];
  /**
   * Outer diameter of the ring in CSS pixels. Caller tunes for mode —
   * wide/medium use 96, compact uses 72, minimal uses 56. The component
   * itself stays size-agnostic beyond the supplied diameter.
   */
  size?: number;
}

/**
 * MilestoneProgressRing — SVG donut that reads as the featured region's
 * flagship visual anchor. Replaces the thin MilestoneProgressPill as
 * the primary signal in the no-image band and in the wide/medium
 * always-open essentials — a module this important cannot ride on a
 * text-sized progress chip.
 */
export function MilestoneProgressRing({
  milestones,
  size = 96,
}: MilestoneProgressRingProps): React.JSX.Element | null {
  if (milestones.length === 0) return null;
  const { completed, total, percent } = computeCounts(milestones);
  const stroke = Math.max(5, Math.round(size * 0.08));
  const radius = (size - stroke) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  return (
    <div
      className={styles.progressRing}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Milestone progress: ${completed} of ${total} complete, ${percent}%`}
    >
      <svg
        className={styles.progressRingSvg}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          className={styles.progressRingTrack}
          fill="none"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          className={styles.progressRingFill}
          fill="none"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: `rotate(-90deg)`,
            transformOrigin: '50% 50%',
          }}
        />
      </svg>
      <div className={styles.progressRingCenter} aria-hidden="true">
        <span className={styles.progressRingPercent}>{percent}%</span>
        <span className={styles.progressRingCount}>
          {completed}/{total}
        </span>
      </div>
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
