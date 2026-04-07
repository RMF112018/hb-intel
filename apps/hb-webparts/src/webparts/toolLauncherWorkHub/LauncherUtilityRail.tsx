/**
 * LauncherUtilityRail — Premium operational support surface for Tool Launcher.
 *
 * Phase 11B: Composition re-architecture with zone-differentiated regions.
 * Phase 11D: Shared tokens, CSS module interactive states, Radix Separator.
 * Phase 11F: Support and status rebuild.
 *   - Tone-specific notice rendering with per-item severity icons and
 *     left accent borders for critical/warning items
 *   - Actionable help/access sections with platform context descriptions
 *     and clearer next-step affordances
 *   - Improved support contacts with owner role clarity and icon treatment
 *   - Better sparse-data handling: single-item sections feel intentional,
 *     not half-empty; section descriptions provide operational context
 *   - Governance health signal when data issues are present
 *
 * Content categories (ordered by urgency):
 *   1. Platform Notices — priority-sorted with tone-specific treatment
 *   2. Need Help — help destination CTAs with platform descriptors
 *   3. Request Access — access-request CTAs with clear next-step
 *   4. Support Contacts — support-owner directory with contact links
 *
 * Degraded states:
 *   - Single-section rail: renders that section alone with full treatment
 *   - Each section independently suppressible; rail suppresses when all empty
 *   - Individual items with partial data render gracefully
 */
import * as React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Link2,
  Users,
  ExternalLink,
  Mail,
  Shield,
  Separator,
  type LucideIcon,
} from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import { LAUNCHER_TONE_COLORS, LAUNCHER_TONE_PRIORITY } from './launcherTokens.js';
import interactiveStyles from './launcher-interactive.module.css';
import type {
  LauncherPresentationModel,
  LauncherSupportSummary,
  LauncherNoticeBadge,
} from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherUtilityRailProps {
  presentation: LauncherPresentationModel;
}

/* ── Notice priority ordering ────────────────────────────────────── */

function byNoticePriority(
  a: LauncherPresentationModel['noticesSummary']['activeNotices'][number],
  b: LauncherPresentationModel['noticesSummary']['activeNotices'][number],
): number {
  const aPri = LAUNCHER_TONE_PRIORITY[a.notice.tone] ?? 4;
  const bPri = LAUNCHER_TONE_PRIORITY[b.notice.tone] ?? 4;
  if (aPri !== bPri) return aPri - bPri;
  return a.name.localeCompare(b.name);
}

/* ── Tone-specific icon resolver ─────────────────────────────────── */

function resolveToneIcon(tone: LauncherNoticeBadge['tone']): LucideIcon {
  switch (tone) {
    case 'critical': return AlertTriangle;
    case 'warning': return AlertCircle;
    case 'success': return CheckCircle2;
    case 'info': return Info;
    default: return Info;
  }
}

function resolveToneColor(tone: LauncherNoticeBadge['tone']): string {
  switch (tone) {
    case 'critical': return '#a02020';
    case 'warning': return '#b5652a';
    case 'success': return '#1a7a2e';
    case 'info': return '#225391';
    default: return 'rgba(0,0,0,0.45)';
  }
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

const sectionDescriptionStyle: React.CSSProperties = {
  margin: `${HP_SPACE.sm}px 0 0`,
  fontSize: '0.68rem',
  lineHeight: 1.4,
  color: 'rgba(0,0,0,0.35)',
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

/* ── Notice item styles ──────────────────────────────────────────── */

const noticeItemBaseStyle: React.CSSProperties = {
  display: 'flex',
  gap: HP_SPACE.md,
  marginTop: HP_SPACE.lg,
  padding: `${HP_SPACE.md}px ${HP_SPACE.lg}px`,
  borderRadius: HP_RADIUS.command,
  fontSize: '0.78rem',
  lineHeight: 1.45,
  color: 'rgba(0,0,0,0.7)',
};

const noticeIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  paddingTop: 2,
  flexShrink: 0,
};

const noticeContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
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

const noticeDetailsStyle: React.CSSProperties = {
  marginTop: 3,
  fontSize: '0.72rem',
  color: 'rgba(0,0,0,0.48)',
};

/* ── Action item styles ──────────────────────────────────────────── */

const actionItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  marginTop: HP_SPACE.lg,
  padding: `${HP_SPACE.md}px ${HP_SPACE.lg}px`,
  borderRadius: HP_RADIUS.command,
  textDecoration: 'none',
  color: 'inherit',
};

const actionIconContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: HP_RADIUS.command,
  background: 'rgba(34,83,145,0.05)',
  flexShrink: 0,
};

const actionContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const actionNameStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: '#225391',
  display: 'flex',
  alignItems: 'center',
  gap: 4,
};

const actionDescriptorStyle: React.CSSProperties = {
  fontSize: '0.66rem',
  color: 'rgba(0,0,0,0.38)',
  marginTop: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

/* ── Support contact styles ──────────────────────────────────────── */

const contactItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.md,
  marginTop: HP_SPACE.lg,
  padding: `${HP_SPACE.md}px ${HP_SPACE.lg}px`,
  borderRadius: HP_RADIUS.command,
  textDecoration: 'none',
  color: 'inherit',
};

const contactAvatarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  borderRadius: 14,
  background: 'rgba(34,83,145,0.06)',
  flexShrink: 0,
  fontSize: '0.68rem',
  fontWeight: 700,
  color: 'rgba(34,83,145,0.5)',
  userSelect: 'none',
};

const contactContentStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const contactOwnerStyle: React.CSSProperties = {
  fontSize: '0.76rem',
  fontWeight: 600,
  color: 'rgba(0,0,0,0.7)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const contactPlatformStyle: React.CSSProperties = {
  fontSize: '0.66rem',
  color: 'rgba(0,0,0,0.38)',
  marginTop: 1,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const separatorStyle: React.CSSProperties = {
  height: 1,
  background: 'linear-gradient(90deg, rgba(34,83,145,0.10) 0%, transparent 80%)',
  border: 'none',
  margin: 0,
};

/* ── Section renderers ───────────────────────────────────────────── */

function NoticesSection({ notices }: { notices: LauncherPresentationModel['noticesSummary']['activeNotices'] }): React.JSX.Element | null {
  if (notices.length === 0) return null;

  const sorted = [...notices].sort(byNoticePriority);
  const criticalCount = sorted.filter((n) => n.notice.tone === 'critical').length;
  const warningCount = sorted.filter((n) => n.notice.tone === 'warning').length;
  const hasUrgent = criticalCount > 0 || warningCount > 0;

  // Section-level summary for urgency awareness
  const urgencySummary = hasUrgent
    ? [
        criticalCount > 0 ? `${criticalCount} critical` : '',
        warningCount > 0 ? `${warningCount} warning` : '',
      ].filter(Boolean).join(', ')
    : undefined;

  return (
    <div
      style={{
        ...sectionStyle,
        ...(hasUrgent ? { borderLeft: '3px solid rgba(200,40,40,0.35)', background: 'rgba(200,40,40,0.02)' } : {}),
      }}
      data-rail-section="notices"
    >
      <h4 style={sectionHeadingStyle}>
        <div style={{
          ...sectionIconContainerStyle,
          ...(hasUrgent ? { background: 'rgba(200,40,40,0.08)' } : {}),
        }}>
          <AlertTriangle size={12} strokeWidth={2} color={hasUrgent ? '#a02020' : 'rgba(34,83,145,0.5)'} />
        </div>
        Platform Notices
        <span style={hasUrgent ? urgentCountBadgeStyle : countBadgeStyle}>{sorted.length}</span>
      </h4>
      {urgencySummary && (
        <p style={{ ...sectionDescriptionStyle, color: 'rgba(200,40,40,0.6)' }}>
          {urgencySummary}
        </p>
      )}
      {sorted.map((n) => {
        const tone = LAUNCHER_TONE_COLORS[n.notice.tone] ?? LAUNCHER_TONE_COLORS.info;
        const ToneIcon = resolveToneIcon(n.notice.tone);
        const toneColor = resolveToneColor(n.notice.tone);
        const isUrgentItem = n.notice.tone === 'critical' || n.notice.tone === 'warning';

        return (
          <div
            key={n.platformKey}
            style={{
              ...noticeItemBaseStyle,
              ...(isUrgentItem ? { borderLeft: `2px solid ${toneColor}`, background: tone.bg.replace(/[\d.]+\)$/, '0.03)') } : {}),
            }}
          >
            <div style={noticeIconContainerStyle}>
              <ToneIcon size={13} strokeWidth={2} color={toneColor} />
            </div>
            <div style={noticeContentStyle}>
              <div>
                <span style={noticeNameStyle}>{n.name}</span>
                <span style={{ ...noticeLabelStyle, background: tone.bg, color: tone.color }}>
                  {n.notice.label}
                </span>
              </div>
              {n.notice.details && (
                <div style={noticeDetailsStyle}>
                  {n.notice.details}
                </div>
              )}
            </div>
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
        <span style={countBadgeStyle}>{actions.length}</span>
      </h4>
      <p style={sectionDescriptionStyle}>Help resources for your platforms</p>
      {actions.slice(0, 8).map((a) => (
        <a
          key={a.platformKey}
          href={a.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={interactiveStyles.utilityCtaLink}
          style={actionItemStyle}
        >
          <div style={actionIconContainerStyle}>
            <Info size={14} strokeWidth={1.8} color="rgba(34,83,145,0.5)" />
          </div>
          <div style={actionContentStyle}>
            <div style={actionNameStyle}>
              {a.name} Help
              <ExternalLink size={10} strokeWidth={2} />
            </div>
            {a.supportOwnerName && (
              <div style={actionDescriptorStyle}>
                Supported by {a.supportOwnerName}
              </div>
            )}
          </div>
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
          <Shield size={12} strokeWidth={2} color="rgba(34,83,145,0.5)" />
        </div>
        Request Access
        <span style={countBadgeStyle}>{actions.length}</span>
      </h4>
      <p style={sectionDescriptionStyle}>Request access to additional platforms</p>
      {actions.slice(0, 8).map((a) => (
        <a
          key={a.platformKey}
          href={a.accessRequestUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={interactiveStyles.utilityCtaLink}
          style={actionItemStyle}
        >
          <div style={actionIconContainerStyle}>
            <Link2 size={14} strokeWidth={1.8} color="rgba(34,83,145,0.5)" />
          </div>
          <div style={actionContentStyle}>
            <div style={actionNameStyle}>
              {a.name}
              <ExternalLink size={10} strokeWidth={2} />
            </div>
            <div style={actionDescriptorStyle}>
              Request access
            </div>
          </div>
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
        <span style={countBadgeStyle}>{contacts.length}</span>
      </h4>
      <p style={sectionDescriptionStyle}>Platform owners and support contacts</p>
      {contacts.slice(0, 8).map((c) => {
        const initial = c.supportOwnerName.charAt(0).toUpperCase();
        const content = (
          <>
            <div style={contactAvatarStyle} aria-hidden="true">
              {initial}
            </div>
            <div style={contactContentStyle}>
              <div style={contactOwnerStyle}>{c.supportOwnerName}</div>
              <div style={contactPlatformStyle}>{c.name}</div>
            </div>
            {c.supportOwnerUrl && (
              <Mail size={12} strokeWidth={1.8} color="rgba(34,83,145,0.35)" style={{ flexShrink: 0 }} />
            )}
          </>
        );

        return c.supportOwnerUrl ? (
          <a
            key={c.platformKey}
            href={c.supportOwnerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={interactiveStyles.utilityCtaLink}
            style={contactItemStyle}
          >
            {content}
          </a>
        ) : (
          <div key={c.platformKey} style={contactItemStyle}>
            {content}
          </div>
        );
      })}
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

  // Collect non-null sections and interleave separators
  const sections: React.ReactNode[] = [];
  if (activeNotices.length > 0) sections.push(<NoticesSection key="notices" notices={activeNotices} />);
  if (helpActions.length > 0) sections.push(<NeedHelpSection key="help" actions={helpActions} />);
  if (accessActions.length > 0) sections.push(<RequestAccessSection key="access" actions={accessActions} />);
  if (supportContacts.length > 0) sections.push(<SupportContactsSection key="contacts" contacts={supportContacts} />);

  return (
    <div style={railContainerStyle}>
      <p style={railHeaderStyle}>
        <Shield size={12} strokeWidth={2} />
        Support &amp; Status
      </p>
      {sections.map((section, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Separator decorative style={separatorStyle} />}
          {section}
        </React.Fragment>
      ))}
    </div>
  );
}
