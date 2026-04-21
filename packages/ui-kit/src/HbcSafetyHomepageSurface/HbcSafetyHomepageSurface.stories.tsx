import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  Shield,
} from 'lucide-react';
import { HbcPremiumBadge } from '../HbcPremiumBadge/index.js';
import { HbcSafetyHomepageSurface, type SafetySecondarySignal } from './index.js';

const meta: Meta<typeof HbcSafetyHomepageSurface> = {
  title: 'Homepage Surfaces/HbcSafetyHomepageSurface',
  component: HbcSafetyHomepageSurface,
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof HbcSafetyHomepageSurface>;

const signals: SafetySecondarySignal[] = [
  {
    id: 'toolbox',
    title: 'Toolbox talk completion below target',
    meta: '5 crews pending signoff before shift close',
    icon: AlertTriangle,
    severity: 'warning',
    href: '#toolbox',
    badge: <HbcPremiumBadge label="Due today" status="warning" size="sm" />,
  },
  {
    id: 'audit',
    title: 'North region audit closed with zero critical findings',
    meta: 'Updated 2h ago',
    icon: CheckCircle2,
    severity: 'success',
    href: '#audit',
    badge: <HbcPremiumBadge label="On track" status="success" size="sm" />,
  },
  {
    id: 'permit',
    title: 'Permit verification gap at Site 47',
    meta: 'Escalated for superintendent follow-up',
    icon: AlertCircle,
    severity: 'danger',
    href: '#permit',
    badge: <HbcPremiumBadge label="Escalated" status="critical" size="sm" />,
  },
  {
    id: 'orientation',
    title: 'Orientation backlog reduced to 4 workers',
    meta: 'Monitoring this week',
    icon: Info,
    severity: 'default',
    href: '#orientation',
  },
];

export const Standard: Story = {
  render: () => (
    <div style={{ maxWidth: 780 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        posture={{
          label: 'Safety posture: Attention',
          tone: 'warning',
          summary: 'Two active corrective actions remain open across field operations this week.',
          updatedLabel: 'Updated 2h ago',
        }}
        primary={{
          title: 'Site 47 scaffold corrective plan in flight',
          summary:
            'Superintendent and safety lead completed root-cause review and launched a three-step scaffold correction sequence.',
          compactSummary: 'Scaffold corrective sequence underway at Site 47.',
          severity: 'danger',
          urgencyLabel: 'Urgent priority',
          icon: AlertCircle,
          badges: (
            <>
              <HbcPremiumBadge label="Urgent priority" status="critical" />
              <HbcPremiumBadge label="Action required today" status="critical" />
            </>
          ),
          metaItems: [
            { label: 'South Region' },
            { label: 'Riverside Tower' },
            { label: 'Owner: Field Safety Lead' },
            { label: 'Updated 2h ago', icon: Clock },
          ],
          cta: { label: 'Open corrective action log', href: '#corrective' },
        }}
        secondarySignals={signals}
        action={{ label: 'View safety operations hub', href: '#hub' }}
      />
    </div>
  ),
};

export const Compact: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        mode="compact"
        posture={{
          label: 'Safety posture: Attention',
          tone: 'warning',
          summary: 'Two active corrective actions remain open.',
          updatedLabel: 'Updated 2h ago',
        }}
        primary={{
          title: 'Site 47 scaffold corrective plan in flight',
          summary:
            'Superintendent and safety lead completed root-cause review and launched a three-step scaffold correction sequence.',
          compactSummary: 'Scaffold corrective sequence underway at Site 47.',
          severity: 'danger',
          urgencyLabel: 'Urgent priority',
          icon: AlertCircle,
          badges: <HbcPremiumBadge label="Action required today" status="critical" />,
          metaItems: [
            { label: 'South Region' },
            { label: 'Owner: Field Safety Lead' },
            { label: 'Updated 2h ago', icon: Clock },
          ],
          cta: { label: 'Open corrective action log', href: '#corrective' },
        }}
        secondarySignals={signals}
        action={{ label: 'View safety operations hub', href: '#hub' }}
      />
    </div>
  ),
};

export const Minimal: Story = {
  render: () => (
    <div style={{ maxWidth: 560 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        mode="minimal"
        posture={{
          label: 'Safety posture: Attention',
          tone: 'warning',
          updatedLabel: 'Updated 2h ago',
        }}
        primary={{
          title: 'Site 47 scaffold corrective plan in flight',
          compactSummary: 'Scaffold corrective sequence underway at Site 47.',
          severity: 'danger',
          urgencyLabel: 'Urgent priority',
          icon: AlertCircle,
        }}
        secondarySignals={signals}
      />
    </div>
  ),
};

export const OneSignal: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        posture={{
          label: 'Safety posture: Stable',
          tone: 'success',
          summary: 'No critical findings open this week.',
          updatedLabel: 'Updated 30m ago',
        }}
        primary={{
          title: 'Weekly safety audit sweep complete',
          summary: 'North region closed with zero critical findings and two coaching items.',
          compactSummary: 'North region audit sweep closed without critical findings.',
          severity: 'success',
          urgencyLabel: 'Recognition',
          icon: CheckCircle2,
          cta: { label: 'Review audit details', href: '#audit' },
        }}
        secondarySignals={[signals[0]!]}
        action={{ label: 'Open safety operations hub', href: '#hub' }}
      />
    </div>
  ),
};

export const OnePrimarySignal: Story = {
  render: () => (
    <div style={{ maxWidth: 620 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        posture={{
          label: 'Safety posture: Stable',
          tone: 'success',
          summary: 'Primary field signal is healthy and no secondary escalations are active.',
          updatedLabel: 'Updated 20m ago',
        }}
        primary={{
          title: 'Weekly safety audit sweep complete',
          summary: 'North region closed with zero critical findings and two coaching items.',
          compactSummary: 'North region audit sweep closed without critical findings.',
          severity: 'success',
          urgencyLabel: 'Recognition',
          icon: CheckCircle2,
          cta: { label: 'Review audit details', href: '#audit' },
        }}
        secondarySignals={[]}
        action={{ label: 'Open safety operations hub', href: '#hub' }}
      />
    </div>
  ),
};

export const MultipleActiveSignals: Story = {
  render: () => (
    <div style={{ maxWidth: 780 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        posture={{
          label: 'Safety posture: Attention',
          tone: 'warning',
          summary: 'Two active corrective actions remain open across field operations this week.',
          updatedLabel: 'Updated 2h ago',
        }}
        primary={{
          title: 'Site 47 scaffold corrective plan in flight',
          summary:
            'Superintendent and safety lead completed root-cause review and launched a three-step scaffold correction sequence.',
          compactSummary: 'Scaffold corrective sequence underway at Site 47.',
          severity: 'danger',
          urgencyLabel: 'Urgent priority',
          icon: AlertCircle,
          badges: (
            <>
              <HbcPremiumBadge label="Urgent priority" status="critical" />
              <HbcPremiumBadge label="Action required today" status="critical" />
            </>
          ),
          metaItems: [
            { label: 'South Region' },
            { label: 'Riverside Tower' },
            { label: 'Owner: Field Safety Lead' },
            { label: 'Updated 2h ago', icon: Clock },
          ],
          cta: { label: 'Open corrective action log', href: '#corrective' },
        }}
        secondarySignals={signals}
        action={{ label: 'View safety operations hub', href: '#hub' }}
      />
    </div>
  ),
};

export const StaleContent: Story = {
  render: () => (
    <div style={{ maxWidth: 720 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        posture={{
          label: 'Safety posture: Degraded data',
          tone: 'critical',
          summary: 'Live feed freshness degraded; curated fallback remains available.',
          updatedLabel: 'Source delayed 4h',
        }}
        degradedNotice="Data freshness is degraded; verify stale signals before field action."
        primary={{
          title: 'Corrective action feed delayed',
          summary: 'Live ingestion is delayed, but previously curated urgent items are still shown.',
          compactSummary: 'Live ingestion delayed. Curated urgent items still visible.',
          severity: 'warning',
          urgencyLabel: 'Attention',
          icon: AlertTriangle,
          badges: (
            <>
              <HbcPremiumBadge label="Stale" status="warning" />
              <HbcPremiumBadge label="Fallback mode" status="info" />
            </>
          ),
          metaItems: [
            { label: 'Source: Curated fallback' },
            { label: 'Last healthy sync 4h ago', icon: Clock },
          ],
        }}
        secondarySignals={signals.slice(0, 2)}
        action={{ label: 'Open reliability runbook', href: '#runbook' }}
      />
    </div>
  ),
};

export const DegradedErrorAdjacent = StaleContent;

export const EmptyStateApplicable: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        posture={{
          label: 'Safety posture: No active signals',
          tone: 'neutral',
          summary: 'No primary or secondary items are currently configured for this section.',
          updatedLabel: 'Awaiting author input',
        }}
        secondarySignals={[]}
      />
    </div>
  ),
};

export const InvalidStateApplicable: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        posture={{
          label: 'Safety posture: Configuration issue',
          tone: 'warning',
          summary: 'Safety authoring inputs are incomplete. Primary content cannot be rendered.',
          updatedLabel: 'Validation failed',
        }}
        degradedNotice="Configuration is incomplete. Review required spotlight fields to restore this surface."
        secondarySignals={[]}
        action={{ label: 'Open authoring guidance', href: '#authoring' }}
      />
    </div>
  ),
};

export const RuntimeErrorStateApplicable: Story = {
  render: () => (
    <div style={{ maxWidth: 640 }}>
      <HbcSafetyHomepageSurface
        title="Safety and Field Excellence"
        icon={Shield}
        posture={{
          label: 'Safety posture: Runtime disruption',
          tone: 'critical',
          summary: 'Live ingestion is unavailable. Surface is operating in a guarded fallback state.',
          updatedLabel: 'Source unavailable',
        }}
        degradedNotice="Runtime ingestion failed; verify critical field conditions through the safety runbook."
        secondarySignals={[]}
        action={{ label: 'Open reliability runbook', href: '#runbook' }}
      />
    </div>
  ),
};
