import { motion } from 'motion/react';
import { cva } from 'class-variance-authority';
import * as Separator from '@radix-ui/react-separator';
import f from './manageFields.module.css';

const metricTone = cva(f.metricCard, {
  variants: {
    tone: {
      green: f.metricToneGreen,
      red: f.metricToneRed,
      blue: f.metricToneBlue,
      gold: f.metricToneGold,
    },
  },
  defaultVariants: { tone: 'blue' },
});

function Metric(props: {
  readonly label: string;
  readonly value: number | string;
  readonly tone: 'green' | 'red' | 'blue' | 'gold';
}): React.ReactNode {
  return (
    <motion.div
      className={metricTone({ tone: props.tone })}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className={f.metricKicker}>{props.label}</div>
      <div className={f.metricValue}>{props.value}</div>
    </motion.div>
  );
}

export function ManageMetricCards(props: {
  readonly published: number;
  readonly blocked: number;
  readonly activePlacements: number;
  readonly laneWarnings: number;
  readonly syncHealth: string;
}): React.ReactNode {
  return (
    <div>
      <div className={f.metricGrid}>
        <Metric label="Published" value={props.published} tone="green" />
        <Metric label="Blocked" value={props.blocked} tone="red" />
        <Metric label="Active placements" value={props.activePlacements} tone="blue" />
        <Metric label="Lane warnings" value={props.laneWarnings} tone="gold" />
        <Metric label="Sync health" value={props.syncHealth} tone="blue" />
      </div>
      <Separator.Root
        style={{ marginTop: 14, background: 'var(--foleon-manage-panel-border, hsl(205 18% 18% / 0.12))' }}
        decorative
        orientation="horizontal"
      />
    </div>
  );
}
