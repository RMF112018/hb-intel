/**
 * LauncherUtilityRail — Premium support/utility surface for Tool Launcher.
 *
 * Phase 11B: Composition re-architecture. Stronger section identity with
 * branded icons, better visual rhythm between sections, and more
 * intentional hierarchy for notices vs. support actions.
 *
 * Content categories (ordered by urgency):
 *   1. Platform Notices — priority-sorted (critical → warning → info → neutral)
 *   2. Need Help — help destination CTAs
 *   3. Request Access — access-request CTAs
 *   4. Support Contacts — support-owner metadata
 *
 * Degraded states:
 *   - Single-section rail: renders that section alone
 *   - Each section independently suppressible; rail suppresses when all empty
 */
import * as React from 'react';
import { AlertCircle, AlertTriangle, Info, Link2, Users, ExternalLink } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import type {
  LauncherPresentationModel,
  LauncherSupportSummary,
} from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherUtilityRailProps {
  presentation: LauncherPresentationModel;
}

/* ── Notice priority ordering ────────────────────────────────────── */

const TONE_PRIORITY: Record<string, number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
  neutral: 4,
};

function byNoticePriority(
  a: LauncherPresentationModel['noticesSummary']['activeNotices'][number],
  b: LauncherPresentationModel['noticesSummary']['activeNotices'][number],
): number {
  const aPri = TONE_PRIORITY[a.notice.tone] ?? 4;
  const bPri = TONE_PRIORITY[b.notice.tone] ?? 4;
  if (aPri !== bPri) return aPri - bPri;
  return a.name.localeCompare(b.name);
}

/* ── Styles ───────────────────────────────────────────────────────── */

const railContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.xl,
};

const railHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.sm,
  margin: 0,
  fontSize: '0.72rem',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: 'rgba(34,83,145,0.55)',
};

const sectionStyle: React.CSSProperties = {
  padding: HP_SPACE.xl,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(255,255,255,0.5)',
};

/** Stronger container for sections with critical/warning notices */
const urgentSectionStyle: React.CSSProperties = {
  ...sectionStyle,
  borderLeft: '3px solid rgba(200,40,40,0.35)',
  background: 'rgba(200,40,40,0.02)',
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.73rem',
  fontWeight: 650,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.sm,
};

const sectionIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 22,
  height: 22,
  borderRadius: 4,
  background: 'rgba(34,83,145,0.06)',
  flexShrink: 0,
};

const urgentIconContainerStyle: React.CSSProperties = {
  ...sectionIconContainerStyle,
  background: 'rgba(200,40,40,0.08)',
};

const countBadgeStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  fontWeight: 500,
  padding: `1px ${HP_SPACE.sm}px`,
  borderRadius: 4,
  background: 'rgba(34,83,145,0.07)',
  color: 'rgba(34,83,145,0.55)',
};

const urgentCountBadgeStyle: React.CSSProperties = {
  ...countBadgeStyle,
  background: 'rgba(200,40,40,0.1)',
  color: '#a02020',
};

const noticeItemStyle: React.CSSProperties = {
  marginTop: HP_SPACE.lg,
  fontSize: '0.78rem',
  lineHeight: 1.45,
  color: 'rgba(0,0,0,0.7)',
};

const noticeNameStyle: React.CSSProperties = {
  fontWeight: 620,
};

const noticeLabelStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 500,
  padding: `1px ${HP_SPACE.xs}px`,
  borderRadius: 4,
  marginLeft: HP_SPACE.sm,
};

const NOTICE_TONE_COLORS: Record<string, { bg: string; color: string }> = {
  info: { bg: 'rgba(34,83,145,0.1)', color: '#225391' },
  warning: { bg: 'rgba(229,126,70,0.12)', color: '#b5652a' },
  critical: { bg: 'rgba(200,40,40,0.1)', color: '#a02020' },
  success: { bg: 'rgba(40,160,60,0.1)', color: '#1a7a2e' },
  neutral: { bg: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)' },
};

const ctaLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 5,
  marginTop: HP_SPACE.md,
  fontSize: '0.78rem',
  fontWeight: 550,
  color: '#225391',
  textDecoration: 'none',
};

const metadataLinkStyle: React.CSSProperties = {
  display: 'block',
  marginTop: HP_SPACE.md,
  fontSize: '0.75rem',
  color: 'rgba(0,0,0,0.6)',
  textDecoration: 'none',
};

const supportOwnerLabelStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  color: 'rgba(0,0,0,0.4)',
  marginLeft: HP_SPACE.xs,
};

/* ── Section renderers ───────────────────────────────────────────── */

function NoticesSection({ notices }: { notices: LauncherPresentationModel['noticesSummary']['activeNotices'] }): React.JSX.Element | null {
  if (notices.length === 0) return null;

  const sorted = [...notices].sort(byNoticePriority);
  const hasUrgent = sorted.some((n) => n.notice.tone === 'critical' || n.notice.tone === 'warning');
  const NoticeIcon = hasUrgent ? AlertTriangle : AlertCircle;

  return (
    <div style={hasUrgent ? urgentSectionStyle : sectionStyle} data-rail-section="notices">
      <h4 style={sectionHeadingStyle}>
        <div style={hasUrgent ? urgentIconContainerStyle : sectionIconContainerStyle}>
          <NoticeIcon size={12} strokeWidth={2} color={hasUrgent ? '#a02020' : 'rgba(34,83,145,0.5)'} />
        </div>
        Platform Notices
        <span style={hasUrgent ? urgentCountBadgeStyle : countBadgeStyle}>{sorted.length}</span>
      </h4>
      {sorted.map((n) => {
        const tone = NOTICE_TONE_COLORS[n.notice.tone] ?? NOTICE_TONE_COLORS.info;
        return (
          <div key={n.platformKey} style={noticeItemStyle}>
            <span style={noticeNameStyle}>{n.name}</span>
            <span style={{ ...noticeLabelStyle, background: tone.bg, color: tone.color }}>
              {n.notice.label}
            </span>
            {n.notice.details && (
              <div style={{ marginTop: 3, fontSize: '0.72rem', color: 'rgba(0,0,0,0.48)' }}>
                {n.notice.details}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NeedHelpSection({ actions }: { actions: LauncherSupportSummary['helpActions'] }): React.JSX.Element | null {
  if (actions.length === 0) return null;

  return (
    <div style={sectionStyle} data-rail-section="help">
      <h4 style={sectionHeadingStyle}>
        <div style={sectionIconContainerStyle}>
          <Info size={12} strokeWidth={2} color="rgba(34,83,145,0.5)" />
        </div>
        Need Help
      </h4>
      {actions.slice(0, 5).map((a) => (
        <a
          key={a.platformKey}
          href={a.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={ctaLinkStyle}
        >
          {a.name} Help
          <ExternalLink size={11} strokeWidth={2} />
        </a>
      ))}
    </div>
  );
}

function RequestAccessSection({ actions }: { actions: LauncherSupportSummary['accessActions'] }): React.JSX.Element | null {
  if (actions.length === 0) return null;

  return (
    <div style={sectionStyle} data-rail-section="access">
      <h4 style={sectionHeadingStyle}>
        <div style={sectionIconContainerStyle}>
          <Link2 size={12} strokeWidth={2} color="rgba(34,83,145,0.5)" />
        </div>
        Request Access
      </h4>
      {actions.slice(0, 5).map((a) => (
        <a
          key={a.platformKey}
          href={a.accessRequestUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={ctaLinkStyle}
        >
          {a.name}
          <ExternalLink size={11} strokeWidth={2} />
        </a>
      ))}
    </div>
  );
}

function SupportContactsSection({ contacts }: { contacts: LauncherSupportSummary['supportContacts'] }): React.JSX.Element | null {
  if (contacts.length === 0) return null;

  return (
    <div style={sectionStyle} data-rail-section="contacts">
      <h4 style={sectionHeadingStyle}>
        <div style={sectionIconContainerStyle}>
          <Users size={12} strokeWidth={2} color="rgba(34,83,145,0.5)" />
        </div>
        Support Contacts
      </h4>
      {contacts.slice(0, 5).map((c) => (
        <div key={c.platformKey}>
          {c.supportOwnerUrl ? (
            <a href={c.supportOwnerUrl} target="_blank" rel="noopener noreferrer" style={metadataLinkStyle}>
              {c.name}
              <span style={supportOwnerLabelStyle}>· {c.supportOwnerName}</span>
            </a>
          ) : (
            <div style={metadataLinkStyle}>
              {c.name}
              <span style={supportOwnerLabelStyle}>· {c.supportOwnerName}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherUtilityRail({ presentation }: LauncherUtilityRailProps): React.JSX.Element | null {
  const { activeNotices } = presentation.noticesSummary;
  const { helpActions, accessActions, supportContacts } = presentation.supportSummary;

  // Suppress the entire rail when no content is available
  if (
    activeNotices.length === 0 &&
    helpActions.length === 0 &&
    accessActions.length === 0 &&
    supportContacts.length === 0
  ) {
    return null;
  }

  return (
    <div style={railContainerStyle}>
      <p style={railHeaderStyle}>
        <Info size={12} strokeWidth={2} />
        Support &amp; Status
      </p>
      <NoticesSection notices={activeNotices} />
      <NeedHelpSection actions={helpActions} />
      <RequestAccessSection actions={accessActions} />
      <SupportContactsSection contacts={supportContacts} />
    </div>
  );
}
