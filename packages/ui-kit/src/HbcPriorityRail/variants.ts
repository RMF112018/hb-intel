/**
 * HbcPriorityRail — CVA variant systems
 */
import { cva } from 'class-variance-authority';
import styles from './priority-rail.module.css';

export const priorityRailSurface = cva(styles.root, {
  variants: {
    urgency: {
      default: styles.urgencyDefault,
      high: styles.urgencyHigh,
      critical: styles.urgencyCritical,
    },
    layout: {
      rail: styles.layoutRail,
      grid: styles.layoutGrid,
      compact: styles.layoutCompact,
    },
    context: {
      default: styles.contextDefault,
      'homepage-flagship': styles.contextHomepageFlagship,
    },
  },
  defaultVariants: {
    urgency: 'default',
    layout: 'rail',
    context: 'default',
  },
});
