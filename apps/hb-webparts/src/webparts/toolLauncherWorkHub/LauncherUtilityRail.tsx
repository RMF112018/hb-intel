/**
 * LauncherUtilityRail — Secondary support/utility surface for Tool Launcher.
 *
 * Phase 02-03: Desktop skeleton with structured sections for:
 *   - Platform notices (outages, maintenance, info)
 *   - Need Help section (help links from platform support metadata)
 *   - Request Access section (access-request destinations)
 *   - Placeholder for favorites/recent (deferred to Phase 04)
 *
 * Visually quieter than the flagship stage. Each section is
 * independently suppressible when its data is unavailable.
 * The entire rail returns null when all sections are empty.
 */
import * as React from 'react';
import { AlertCircle, Info, Link2 } from '@hbc/ui-kit/homepage';
import { HP_SPACE, HP_BORDER, HP_RADIUS } from '../../homepage/tokens.js';
import type {
  LauncherPlatformRecord,
  LauncherPresentationModel,
} from '../../homepage/webparts/toolLauncherContracts.js';

/* ── Props ────────────────────────────────────────────────────────── */

export interface LauncherUtilityRailProps {
  presentation: LauncherPresentationModel;
  /** All active platforms for deriving help/access links. */
  platforms: LauncherPlatformRecord[];
}

/* ── Styles ───────────────────────────────────────────────────────── */

const railContainerStyle: React.CSSProperties = {
  display: 'grid',
  gap: HP_SPACE.lg,
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

const linkItemStyle: React.CSSProperties = {
  display: 'block',
  marginTop: HP_SPACE.sm,
  fontSize: '0.78rem',
  color: '#225391',
  textDecoration: 'none',
};

const supportOwnerStyle: React.CSSProperties = {
  fontSize: '0.68rem',
  color: 'rgba(0,0,0,0.4)',
  marginLeft: HP_SPACE.xs,
};

/* ── Section renderers ───────────────────────────────────────────── */

function NoticesSection({ notices }: { notices: LauncherPresentationModel['noticesSummary']['activeNotices'] }): React.JSX.Element | null {
  if (notices.length === 0) return null;

  return (
    <div style={sectionStyle}>
      <h4 style={sectionHeadingStyle}>
        <AlertCircle size={13} strokeWidth={2} />
        Platform Notices
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
    <div style={sectionStyle}>
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
          style={linkItemStyle}
        >
          {p.name}
          {p.support.supportOwnerName && (
            <span style={supportOwnerStyle}>· {p.support.supportOwnerName}</span>
          )}
        </a>
      ))}
    </div>
  );
}

function RequestAccessSection({ platforms }: { platforms: LauncherPlatformRecord[] }): React.JSX.Element | null {
  const withAccess = platforms.filter((p) => p.support.accessRequestUrl);
  if (withAccess.length === 0) return null;

  return (
    <div style={sectionStyle}>
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
          style={linkItemStyle}
        >
          {p.name}
        </a>
      ))}
    </div>
  );
}

/* ── Component ───────────────────────────────────────────────────── */

export function LauncherUtilityRail({ presentation, platforms }: LauncherUtilityRailProps): React.JSX.Element | null {
  const { activeNotices } = presentation.noticesSummary;
  const hasHelp = platforms.some((p) => p.support.helpUrl);
  const hasAccess = platforms.some((p) => p.support.accessRequestUrl);

  // Suppress the entire rail when no content is available
  if (activeNotices.length === 0 && !hasHelp && !hasAccess) {
    return null;
  }

  return (
    <div style={railContainerStyle}>
      <NoticesSection notices={activeNotices} />
      <NeedHelpSection platforms={platforms} />
      <RequestAccessSection platforms={platforms} />
    </div>
  );
}
