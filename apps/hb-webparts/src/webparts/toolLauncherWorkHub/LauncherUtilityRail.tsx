/**
 * LauncherUtilityRail — Secondary support/utility surface for Tool Launcher.
 *
 * Phase 04-01: Utility rail contract locked with 4 content categories:
 *   1. Platform Notices — outages, maintenance, info (urgent-first)
 *   2. Need Help — help destination CTAs with ExternalLink affordance
 *   3. Request Access — access-request CTAs with ExternalLink affordance
 *   4. Support Contacts — support-owner navigation links
 *
 * Each section is independently suppressible. The entire rail returns
 * null when all sections are empty, causing the composition shell body
 * grid to collapse from 2fr/1fr to 1fr.
 *
 * Contract rules:
 *   - Notices render as metadata (status labels, not CTAs)
 *   - Help and access links render as CTAs (blue, with ExternalLink icon)
 *   - Support contacts render as quiet metadata links
 *   - All data comes from normalized LauncherPlatformRecord, not raw SP fields
 *   - The rail must remain visually secondary to the flagship stage
 */
import * as React from 'react';
import { AlertCircle, Info, Link2, Users, ExternalLink } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import type {
  LauncherPlatformRecord,
  LauncherPresentationModel,
} from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherUtilityRailProps {
  presentation: LauncherPresentationModel;
  /** All active platforms for deriving help/access/support links. */
  platforms: LauncherPlatformRecord[];
}

/* ── Styles ───────────────────────────────────────────────────────── */

const railContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.lg,
};

const railLabelStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.68rem',
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.06em',
  color: 'rgba(0,0,0,0.35)',
};

const sectionStyle: React.CSSProperties = {
  padding: HP_SPACE.lg,
  border: HP_BORDER.subtle,
  borderRadius: HP_RADIUS.card,
  background: 'rgba(0,0,0,0.015)',
};

const sectionHeadingStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.72rem',
  fontWeight: 650,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  color: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  gap: HP_SPACE.sm,
};

const countBadgeStyle: React.CSSProperties = {
  fontSize: '0.62rem',
  fontWeight: 500,
  padding: `0 ${HP_SPACE.xs}px`,
  borderRadius: 3,
  background: 'rgba(0,0,0,0.06)',
  color: 'rgba(0,0,0,0.5)',
};

const noticeItemStyle: React.CSSProperties = {
  marginTop: HP_SPACE.md,
  fontSize: '0.78rem',
  lineHeight: 1.4,
  color: 'rgba(0,0,0,0.7)',
};

const noticeNameStyle: React.CSSProperties = {
  fontWeight: 600,
};

const noticeLabelStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  fontWeight: 500,
  padding: `1px ${HP_SPACE.xs}px`,
  borderRadius: 3,
  marginLeft: HP_SPACE.xs,
};

const NOTICE_TONE_COLORS: Record<string, { bg: string; color: string }> = {
  info: { bg: 'rgba(34,83,145,0.1)', color: '#225391' },
  warning: { bg: 'rgba(229,126,70,0.12)', color: '#b5652a' },
  critical: { bg: 'rgba(200,40,40,0.1)', color: '#a02020' },
  success: { bg: 'rgba(40,160,60,0.1)', color: '#1a7a2e' },
  neutral: { bg: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.55)' },
};

/** CTA link — blue, with inline ExternalLink icon affordance */
const ctaLinkStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  marginTop: HP_SPACE.sm,
  fontSize: '0.78rem',
  fontWeight: 500,
  color: '#225391',
  textDecoration: 'none',
};

/** Quiet metadata link — muted, no icon affordance */
const metadataLinkStyle: React.CSSProperties = {
  display: 'block',
  marginTop: HP_SPACE.sm,
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

  return (
    <div style={sectionStyle} data-rail-section="notices">
      <h4 style={sectionHeadingStyle}>
        <AlertCircle size={13} strokeWidth={2} />
        Platform Notices
        <span style={countBadgeStyle}>{notices.length}</span>
      </h4>
      {notices.map((n) => {
        const tone = NOTICE_TONE_COLORS[n.notice.tone] ?? NOTICE_TONE_COLORS.info;
        return (
          <div key={n.platformKey} style={noticeItemStyle}>
            <span style={noticeNameStyle}>{n.name}</span>
            <span style={{ ...noticeLabelStyle, background: tone.bg, color: tone.color }}>
              {n.notice.label}
            </span>
            {n.notice.details && (
              <div style={{ marginTop: 2, fontSize: '0.72rem', color: 'rgba(0,0,0,0.5)' }}>
                {n.notice.details}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function NeedHelpSection({ platforms }: { platforms: LauncherPlatformRecord[] }): React.JSX.Element | null {
  const withHelp = platforms.filter((p) => p.support.helpUrl);
  if (withHelp.length === 0) return null;

  return (
    <div style={sectionStyle} data-rail-section="help">
      <h4 style={sectionHeadingStyle}>
        <Info size={13} strokeWidth={2} />
        Need Help
      </h4>
      {withHelp.slice(0, 5).map((p) => (
        <a
          key={p.platformKey}
          href={p.support.helpUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={ctaLinkStyle}
        >
          {p.name}
          <ExternalLink size={11} strokeWidth={2} />
        </a>
      ))}
    </div>
  );
}

function RequestAccessSection({ platforms }: { platforms: LauncherPlatformRecord[] }): React.JSX.Element | null {
  const withAccess = platforms.filter((p) => p.support.accessRequestUrl);
  if (withAccess.length === 0) return null;

  return (
    <div style={sectionStyle} data-rail-section="access">
      <h4 style={sectionHeadingStyle}>
        <Link2 size={13} strokeWidth={2} />
        Request Access
      </h4>
      {withAccess.slice(0, 5).map((p) => (
        <a
          key={p.platformKey}
          href={p.support.accessRequestUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={ctaLinkStyle}
        >
          {p.name}
          <ExternalLink size={11} strokeWidth={2} />
        </a>
      ))}
    </div>
  );
}

function SupportContactsSection({ platforms }: { platforms: LauncherPlatformRecord[] }): React.JSX.Element | null {
  const withOwner = platforms.filter((p) => p.support.supportOwnerName);
  if (withOwner.length === 0) return null;

  return (
    <div style={sectionStyle} data-rail-section="contacts">
      <h4 style={sectionHeadingStyle}>
        <Users size={13} strokeWidth={2} />
        Support Contacts
      </h4>
      {withOwner.slice(0, 5).map((p) => {
        const ownerUrl = p.support.supportOwnerUrl;
        return (
          <div key={p.platformKey}>
            {ownerUrl ? (
              <a href={ownerUrl} target="_blank" rel="noopener noreferrer" style={metadataLinkStyle}>
                {p.name}
                <span style={supportOwnerLabelStyle}>· {p.support.supportOwnerName}</span>
              </a>
            ) : (
              <div style={metadataLinkStyle}>
                {p.name}
                <span style={supportOwnerLabelStyle}>· {p.support.supportOwnerName}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherUtilityRail({ presentation, platforms }: LauncherUtilityRailProps): React.JSX.Element | null {
  const { activeNotices } = presentation.noticesSummary;
  const hasHelp = platforms.some((p) => p.support.helpUrl);
  const hasAccess = platforms.some((p) => p.support.accessRequestUrl);
  const hasContacts = platforms.some((p) => p.support.supportOwnerName);

  // Suppress the entire rail when no content is available
  if (activeNotices.length === 0 && !hasHelp && !hasAccess && !hasContacts) {
    return null;
  }

  return (
    <div style={railContainerStyle}>
      <p style={railLabelStyle}>Support &amp; Status</p>
      <NoticesSection notices={activeNotices} />
      <NeedHelpSection platforms={platforms} />
      <RequestAccessSection platforms={platforms} />
      <SupportContactsSection platforms={platforms} />
    </div>
  );
}
