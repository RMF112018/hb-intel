/**
 * HbcOperationalSurface Stories — Visual proof for presentation-lane operational intelligence.
 * Wave-01r Prompt-01: Capture Visual Proof
 * W01r-P10: Expanded Safety & Field Excellence consumer-level proof
 *           (Sparse, SignalsOnly, Mobile) as part of the Safety &
 *           Field Excellence migration-confirmation pass.
 */
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { HbcOperationalSurface, type OperationalSignal } from './index.js';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HardHat,
  Info,
  Shield,
} from 'lucide-react';

const meta: Meta<typeof HbcOperationalSurface> = {
  title: 'Homepage Surfaces/HbcOperationalSurface',
  component: HbcOperationalSurface,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof HbcOperationalSurface>;

/**
 * Reusable signal fixtures that mirror the Safety & Field Excellence
 * consumer event-type → icon/severity mapping so these stories provide
 * consumer-level visual proof for that named webpart.
 */
const safetySignalFixtures: OperationalSignal[] = [
  {
    id: 'safety-recognition',
    title: 'Zero-Incident Week: South Region',
    meta: 'Audit complete · updated 2026-04-04',
    icon: CheckCircle2,
    severity: 'success',
  },
  {
    id: 'safety-reminder',
    title: 'Heat Exposure Reminder',
    meta: 'Hydration checkpoints required before 11:00 AM',
    icon: AlertTriangle,
    severity: 'warning',
  },
  {
    id: 'safety-notice',
    title: 'Equipment Certification Expiring',
    meta: '2 items expiring this week',
    icon: AlertCircle,
    severity: 'danger',
  },
  {
    id: 'safety-highlight',
    title: 'Toolbox Talk Rotation',
    meta: 'Q2 module — fall protection focus',
    icon: Info,
    severity: 'default',
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <HbcOperationalSurface
        title="Safety & Field Excellence"
        icon={Shield}
        featured={{
          title: '14 Days Without Incident',
          description:
            'Northeast Region — all sites reporting green status for safety metrics this period.',
          meta: (
            <span style={{ fontSize: 13, color: '#64748b' }}>
              Last updated: April 8, 2026 08:00 AM
            </span>
          ),
        }}
        signals={[
          { id: '1', title: 'PPE Compliance', meta: '98% across all sites', icon: CheckCircle2, severity: 'success' },
          { id: '2', title: 'Open Safety Observations', meta: '3 pending review', icon: AlertTriangle, severity: 'warning' },
          { id: '3', title: 'Equipment Certification', meta: '2 expiring this week', icon: AlertCircle, severity: 'danger' },
          { id: '4', title: 'Training Completion', meta: 'Q2 module — 87% complete', icon: HardHat, severity: 'default' },
        ]}
      />
    </div>
  ),
};

/**
 * Consumer-level proof for the SafetyFieldExcellence webpart — matches
 * the shape produced by `SafetyFieldExcellence.tsx` when it adapts
 * `normalizeSafetyFieldExcellenceConfig` output into `HbcOperationalSurface`
 * props. Exercises each event-type → severity path.
 */
export const SafetyFieldExcellenceConsumer: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <HbcOperationalSurface
        title="Safety and Field Excellence"
        icon={Shield}
        featured={{
          title: 'Zero-Incident Week: South Region',
          description:
            'South region crews completed the week with full pre-task planning compliance.',
          meta: (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 12 }}>
              Updated 2026-04-04 · Audit Complete
            </span>
          ),
        }}
        signals={safetySignalFixtures}
      />
    </div>
  ),
};

/**
 * Sparse layout — featured highlight only, no secondary signals. Used
 * when only the headline Safety event is authored (e.g. a prominent
 * zero-incident milestone with no active reminders or notices).
 */
export const Sparse: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <HbcOperationalSurface
        title="Safety and Field Excellence"
        icon={Shield}
        featured={{
          title: 'Zero-Incident Month: Enterprise-Wide',
          description:
            'All active projects closed the month with zero recordables, zero near-miss escalations, and full PPE compliance.',
          meta: (
            <span style={{ fontSize: 12, color: '#64748b' }}>
              Updated 2026-04-01 · Source: Safety Intelligence
            </span>
          ),
        }}
      />
    </div>
  ),
};

/**
 * Signals-only layout — no featured highlight, just the secondary signal
 * stack. Exercises the severity iconography and badge rendering for each
 * `SafetyFieldEventType` variant the consumer knows how to map.
 */
export const SignalsOnly: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <HbcOperationalSurface
        title="Safety and Field Excellence"
        icon={Shield}
        signals={safetySignalFixtures}
      />
    </div>
  ),
};

/**
 * Mobile layout — constrained width confirms the operational surface
 * composes correctly inside narrow webpart containers in SharePoint.
 */
export const Mobile: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <HbcOperationalSurface
        title="Safety and Field Excellence"
        icon={Shield}
        featured={{
          title: '14 Days Without Incident',
          description: 'Northeast Region sites reporting green status this period.',
        }}
        signals={safetySignalFixtures.slice(0, 2)}
      />
    </div>
  ),
};
