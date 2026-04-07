/**
 * PeopleCultureMerged — Signature People & Culture homepage surface
 *
 * A bold, warm, celebratory culture module designed as a homepage signature
 * experience. Adopts the premium surface grammar from ProjectPortfolioSpotlight
 * but translates it into a warmer, more expressive, more human-centered
 * register appropriate for recognition, kudos, and celebrations.
 *
 * Design language: warm gradient hero banner, bold typography, orange-accent
 * celebration energy, avatar-rich composition, layered card depth, editorial
 * asymmetry between dominant spotlight and subordinate supporting zones.
 */
import * as React from 'react';
import {
  HbcPremiumBadge,
  HbcPremiumCta,
  HbcHomepageMetadataRow,
  motion,
  Users,
  CheckCircle2,
} from '@hbc/ui-kit/homepage';
import { resolveAuthoringMessage } from '../../homepage/helpers/authoringGovernance.js';
import { normalizePeopleCultureMergedConfig } from '../../homepage/helpers/communicationsConfig.js';
import { HomepageEmptyState } from '../../homepage/shared/HomepageEmptyState.js';
import { HomepageLoadingState } from '../../homepage/shared/HomepageLoadingState.js';
import { useResponsiveTier, type ResponsiveTier } from '../../homepage/shared/useResponsiveTier.js';
import { usePrefersReducedMotion } from '../../homepage/shared/usePrefersReducedMotion.js';
import type { PeopleCultureMergedConfig } from '../../homepage/webparts/communicationsContracts.js';
import type { BandAOutput, KudosModuleOutput, BandBOutput } from '../../homepage/webparts/communicationsContracts.js';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface PeopleCultureMergedProps {
  config?: Partial<PeopleCultureMergedConfig>;
  activeAudience?: string;
  isLoading?: boolean;
}

// ---------------------------------------------------------------------------
// Brand palette — warm, celebratory register
// ---------------------------------------------------------------------------

const HB = {
  blue: '#225391',
  blueRgb: '34, 83, 145',
  orange: '#E57E46',
  orangeRgb: '229, 126, 70',
  warmCream: '#FDF8F4',
  warmCreamRgb: '253, 248, 244',
} as const;

const P = {
  /** Hero banner gradient — warm brand statement */
  heroBg: `linear-gradient(135deg, ${HB.orange} 0%, #D4693A 45%, ${HB.blue} 100%)`,
  /** Spotlight zone — warm cream */
  spotlightBg: HB.warmCream,
  /** Support zone — cool mist */
  supportBg: `rgba(${HB.blueRgb}, 0.022)`,
  /** Featured card inner glow */
  cardGlow: `0 4px 24px rgba(${HB.orangeRgb}, 0.12), 0 1px 4px rgba(0,0,0,0.04)`,
  /** Root shadow — deep premium */
  rootShadow: `0 2px 6px rgba(${HB.orangeRgb}, 0.08), 0 8px 32px rgba(${HB.blueRgb}, 0.10)`,
  /** Separator gradient */
  sep: `linear-gradient(90deg, rgba(${HB.orangeRgb}, 0.18) 0%, rgba(${HB.blueRgb}, 0.08) 60%, transparent 100%)`,
  /** Tile divider */
  div: `rgba(${HB.orangeRgb}, 0.07)`,
  /** Text scale */
  text1: '#1a1a1a',
  text2: 'rgba(26,26,26,0.68)',
  text3: 'rgba(26,26,26,0.48)',
  text4: 'rgba(26,26,26,0.34)',
} as const;

// ---------------------------------------------------------------------------
// Root container
// ---------------------------------------------------------------------------

const rootStyle: React.CSSProperties = {
  fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  color: P.text1,
  background: '#ffffff',
  borderRadius: 16,
  border: '1px solid rgba(0,0,0,0.05)',
  boxShadow: P.rootShadow,
  overflow: 'hidden',
  position: 'relative',
};

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

const NO_MOTION = { initial: undefined, animate: undefined, transition: undefined };

function heroMotion(r: boolean) {
  return r ? NO_MOTION : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } };
}
function railMotion(r: boolean) {
  return r ? NO_MOTION : { initial: { opacity: 0, x: 10 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] as const } };
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function initials(name: string): string {
  const p = name.split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0][0].toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function fmtRecipients(r: { name: string }[]): string {
  if (r.length === 0) return '';
  if (r.length === 1) return r[0].name;
  if (r.length === 2) return `${r[0].name} and ${r[1].name}`;
  return `${r[0].name}, ${r[1].name}, and ${r.length - 2} more`;
}

function relDate(iso: string): string {
  const ms = Date.parse(iso);
  if (Number.isNaN(ms)) return '';
  const d = Math.round((ms - Date.now()) / 86_400_000);
  if (d === 0) return 'Today';
  if (d === 1) return 'Tomorrow';
  if (d > 1 && d <= 7) return `In ${d} days`;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const ANN_LABEL: Record<string, string> = { promotion: 'Promoted', newHire: 'New Hire', baby: 'Baby', wedding: 'Wedding', special: 'Special' };
const ANN_BADGE: Record<string, 'info' | 'success' | 'warning' | 'critical'> = { promotion: 'critical', newHire: 'info', baby: 'success', wedding: 'success', special: 'warning' };

// ---------------------------------------------------------------------------
// Avatar components
// ---------------------------------------------------------------------------

function Avatar({ src, name, size, ring }: { src?: string; name: string; size: number; ring?: boolean }): React.JSX.Element {
  const [err, setErr] = React.useState(false);
  const borderStyle = ring ? `3px solid #ffffff` : `2px solid #ffffff`;
  const shadowStyle = ring ? `0 0 0 2px ${HB.orange}` : '0 0 0 1px rgba(0,0,0,0.08)';

  if (src && !err) {
    return (
      <img src={src} alt={name} width={size} height={size} decoding="async"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: borderStyle, boxShadow: shadowStyle }}
        onError={() => setErr(true)}
      />
    );
  }

  return (
    <span aria-hidden="true" style={{
      width: size, height: size, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      background: `linear-gradient(135deg, rgba(${HB.orangeRgb},0.15), rgba(${HB.orangeRgb},0.08))`,
      color: HB.orange, fontSize: size < 28 ? '0.5rem' : size < 40 ? '0.625rem' : '0.8125rem', fontWeight: 700, letterSpacing: '0.02em',
      border: borderStyle, boxShadow: shadowStyle,
    }}>
      {initials(name)}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Hero banner — warm gradient header strip
// ---------------------------------------------------------------------------

function HeroBanner({ heading, tier }: { heading: string; tier: ResponsiveTier }): React.JSX.Element {
  const h = tier === 'mobile' ? 72 : 88;
  return (
    <div style={{ background: P.heroBg, padding: `0 ${tier === 'mobile' ? 16 : 28}px`, height: h, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, position: 'relative', overflow: 'hidden' }}>
      {/* Decorative circle — brand geo */}
      <div aria-hidden="true" style={{ position: 'absolute', right: -20, top: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
      <div aria-hidden="true" style={{ position: 'absolute', right: 60, bottom: -30, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />

      <h2 style={{ margin: 0, fontSize: tier === 'mobile' ? '1.125rem' : '1.375rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#ffffff', display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
        <Users size={tier === 'mobile' ? 16 : 20} aria-hidden="true" style={{ opacity: 0.9 }} />
        {heading}
      </h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" size="sm" />
        <HbcPremiumCta label="View All" href="#view-all-kudos" variant="ghost" size="sm" arrow />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kudos Spotlight — dominant hero zone
// ---------------------------------------------------------------------------

function KudosSpotlight({ output, tier, rm }: { output: KudosModuleOutput; tier: ResponsiveTier; rm: boolean }): React.JSX.Element | null {
  if (output.isEmpty || !output.featured) return null;

  const f = output.featured;
  const rLabel = fmtRecipients(f.recipients);
  const headlines = output.recentHeadlines.slice(0, tier === 'mobile' ? 2 : 3);

  return (
    <motion.div style={{ flex: tier === 'desktop' ? '1 1 62%' : '1 1 100%', minWidth: tier === 'desktop' ? 400 : 0, background: P.spotlightBg, padding: tier === 'mobile' ? '20px 16px 24px' : '28px 28px 32px' }} {...heroMotion(rm)}>

      {/* ── Featured praise card ── */}
      <div style={{
        background: '#ffffff', borderRadius: 14, padding: tier === 'mobile' ? 16 : 24,
        boxShadow: P.cardGlow, border: '1px solid rgba(0,0,0,0.04)',
        borderLeft: `5px solid ${HB.orange}`,
        display: 'flex', flexDirection: tier === 'mobile' ? 'column' : 'row', gap: tier === 'mobile' ? 16 : 24,
      }}>
        {/* Avatar hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0, paddingTop: 2 }}>
          <Avatar src={f.recipients[0]?.media?.src} name={f.recipients[0]?.name ?? 'Kudos'} size={68} ring />
          {f.recipients.length > 1 && (
            <div style={{ display: 'flex', marginTop: -10 }}>
              {f.recipients.slice(1, 4).map((r, i) => (
                <span key={r.id} style={{ marginLeft: i > 0 ? -8 : 0, position: 'relative', zIndex: 3 - i }}>
                  <Avatar src={r.media?.src} name={r.name} size={26} />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {/* Eyebrow */}
          <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: HB.orange, opacity: 0.85 }}>
            Kudos Spotlight
          </span>

          <h3 style={{ margin: 0, fontSize: tier === 'mobile' ? '1.25rem' : '1.625rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.12, color: P.text1 }}>
            {f.headline}
          </h3>

          {rLabel && (
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: HB.orange }}>
              {rLabel}
            </span>
          )}

          <p style={{ margin: 0, fontSize: '0.8125rem', lineHeight: 1.65, color: P.text2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as unknown as React.CSSProperties['WebkitBoxOrient'], overflow: 'hidden' }}>
            {f.excerpt}
          </p>

          <HbcHomepageMetadataRow separated>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={11} aria-hidden="true" style={{ opacity: 0.6, color: HB.orange }} />
              by {f.submittedBy.displayName}
            </span>
            {typeof f.celebrateCount === 'number' && f.celebrateCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: HB.orange, fontWeight: 600 }}>
                <CheckCircle2 size={11} aria-hidden="true" />
                {f.celebrateCount}
              </span>
            )}
          </HbcHomepageMetadataRow>

          <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <HbcPremiumCta label="Celebrate" href="#celebrate" variant="secondary" size="sm" />
            <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="ghost" size="sm" arrow />
          </div>
        </div>
      </div>

      {/* ── Recent kudos ribbon ── */}
      {headlines.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 0 }}>
          <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: P.text4, marginBottom: 8 }}>
            Recent Recognition
          </div>
          {headlines.map((item, idx) => {
            const rl = fmtRecipients(item.recipients);
            return (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 8px', borderRadius: 10, borderBottom: idx < headlines.length - 1 ? `1px solid ${P.div}` : undefined, transition: 'background 150ms ease', cursor: 'default' }}>
                <Avatar src={item.recipients[0]?.media?.src} name={item.recipients[0]?.name ?? '?'} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 600, lineHeight: 1.3, color: P.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{item.headline}</div>
                  <span style={{ fontSize: '0.6875rem', color: P.text3 }}>{rl ? `${rl} · ` : ''}by {item.submittedBy.displayName}</span>
                </div>
                {typeof item.celebrateCount === 'number' && item.celebrateCount > 0 && (
                  <span style={{ fontSize: '0.625rem', fontWeight: 700, color: HB.orange, flexShrink: 0 }}>{item.celebrateCount}</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Supporting zone — Announcements + Celebrations
// ---------------------------------------------------------------------------

function SupportRail({ bandA, bandB, tier, rm }: { bandA: BandAOutput; bandB: BandBOutput; tier: ResponsiveTier; rm: boolean }): React.JSX.Element | null {
  if (bandA.isEmpty && bandB.isEmpty) return null;

  const ann = bandA.items.slice(0, tier === 'mobile' ? 2 : 3);
  const cel = bandB.items.slice(0, tier === 'mobile' ? 4 : 6);
  const px = tier === 'mobile' ? 16 : 20;

  return (
    <motion.div style={{
      flex: tier === 'desktop' ? '1 1 34%' : '1 1 100%',
      minWidth: tier === 'desktop' ? 240 : 0,
      borderLeft: tier === 'desktop' ? `1px solid ${P.div}` : undefined,
      borderTop: tier !== 'desktop' ? `1px solid ${P.div}` : undefined,
      background: P.supportBg,
      display: 'flex', flexDirection: 'column',
    }} {...railMotion(rm)}>

      {/* ── Announcements ── */}
      {ann.length > 0 && (
        <div style={{ padding: `18px ${px}px 14px` }}>
          <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: P.text4, marginBottom: 10 }}>Highlights</div>
          {ann.map((item, idx) => {
            const label = ANN_LABEL[item.announcementType] ?? item.announcementType;
            const badge = ANN_BADGE[item.announcementType] ?? 'info';
            return (
              <div key={item.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderTop: idx > 0 ? `1px solid ${P.div}` : undefined, alignItems: 'center', minHeight: 44 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, lineHeight: 1.3, color: P.text1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{item.personName}</div>
                  <div style={{ fontSize: '0.6875rem', color: P.text3, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{item.headline}</div>
                </div>
                <HbcPremiumBadge label={label} status={badge} size="sm" />
              </div>
            );
          })}
        </div>
      )}

      {/* ── Celebrations ribbon ── */}
      {cel.length > 0 && (
        <div style={{ padding: `14px ${px}px 18px`, borderTop: ann.length > 0 ? `1px solid ${P.div}` : undefined, flex: 1 }}>
          <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: P.text4, marginBottom: 10 }}>This Week</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {cel.map((item) => {
              const tl = item.celebrationType === 'anniversary' && item.anniversaryYears ? `${item.anniversaryYears} yr` : item.celebrationType === 'birthday' ? 'Birthday' : 'Anniv.';
              const dl = relDate(item.celebrationDate);
              return (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px',
                  background: `rgba(${HB.orangeRgb}, 0.04)`, borderRadius: 20, border: `1px solid rgba(${HB.orangeRgb}, 0.08)`,
                  transition: 'background 150ms ease, border-color 150ms ease',
                }}>
                  <Avatar src={item.media?.src} name={item.personName} size={28} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.2, color: P.text1, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 100 }}>{item.personName.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.5625rem', color: P.text3, lineHeight: 1.2 }}>{tl}{dl ? ` · ${dl}` : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: `10px ${px}px 16px`, borderTop: `1px solid ${P.div}`, textAlign: 'right', marginTop: 'auto' }}>
        <HbcPremiumCta label="View all" href="#people-culture" variant="ghost" size="sm" arrow />
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Sparse layout — no featured kudos
// ---------------------------------------------------------------------------

function SparseLayout({ bandA, bandB, tier, rm }: { bandA: BandAOutput; bandB: BandBOutput; tier: ResponsiveTier; rm: boolean }): React.JSX.Element {
  const px = tier === 'mobile' ? 16 : 28;
  const ann = bandA.items.slice(0, 3);
  const cel = bandB.items.slice(0, 6);

  return (
    <motion.div style={{ padding: `24px ${px}px 32px`, display: 'flex', flexDirection: 'column', gap: 24 }} {...heroMotion(rm)}>
      {/* Invite hero */}
      <div style={{
        padding: '28px 24px', borderRadius: 14,
        background: `linear-gradient(135deg, rgba(${HB.orangeRgb},0.06) 0%, rgba(${HB.blueRgb},0.03) 100%)`,
        border: `1px solid rgba(${HB.orangeRgb},0.08)`,
        textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
      }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${HB.orange}, #D4693A)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={22} style={{ color: '#ffffff' }} />
        </div>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '-0.02em', color: P.text1 }}>Recognize a teammate</div>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: P.text3, maxWidth: '36ch', lineHeight: 1.6 }}>
          Be the first to spotlight great work, team wins, or everyday excellence.
        </p>
        <HbcPremiumCta label="Give Kudos" href="#give-kudos" variant="secondary" size="md" arrow />
      </div>

      {/* Announcements */}
      {ann.length > 0 && (
        <div>
          <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: P.text4, marginBottom: 10 }}>Highlights</div>
          {ann.map((item) => {
            const label = ANN_LABEL[item.announcementType] ?? item.announcementType;
            const badge = ANN_BADGE[item.announcementType] ?? 'info';
            return (
              <div key={item.id} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: `1px solid ${P.div}`, alignItems: 'center' }}>
                <HbcPremiumBadge label={label} status={badge} size="sm" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, lineHeight: 1.3, color: P.text1 }}>{item.personName}</div>
                  <div style={{ fontSize: '0.6875rem', color: P.text3 }}>{item.headline}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Celebrations chips */}
      {cel.length > 0 && (
        <div>
          <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: P.text4, marginBottom: 10 }}>This Week</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {cel.map((item) => {
              const tl = item.celebrationType === 'birthday' ? 'Birthday' : item.anniversaryYears ? `${item.anniversaryYears} yr` : 'Anniv.';
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', background: `rgba(${HB.orangeRgb},0.04)`, borderRadius: 20, border: `1px solid rgba(${HB.orangeRgb},0.08)` }}>
                  <Avatar name={item.personName} size={26} />
                  <div>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, lineHeight: 1.2, color: P.text1 }}>{item.personName.split(' ')[0]}</div>
                    <div style={{ fontSize: '0.5625rem', color: P.text3 }}>{tl}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function hasAnyInput(c: Partial<PeopleCultureMergedConfig> | undefined): boolean {
  return Boolean(c?.announcements?.length || c?.kudos?.length || c?.celebrations?.length);
}

export function PeopleCultureMerged({ config, activeAudience, isLoading = false }: PeopleCultureMergedProps): React.JSX.Element {
  const tier = useResponsiveTier();
  const rm = usePrefersReducedMotion();

  if (isLoading) return <HomepageLoadingState label="Loading People & Culture" />;

  let output: ReturnType<typeof normalizePeopleCultureMergedConfig>;
  try { output = normalizePeopleCultureMergedConfig(config, activeAudience); }
  catch { const m = resolveAuthoringMessage('peopleCulture', 'invalid'); return <HomepageEmptyState title={m.title} description={m.description} />; }

  const allEmpty = output.bandA.isEmpty && output.kudos.isEmpty && output.bandB.isEmpty;
  if (allEmpty && !hasAnyInput(config)) { const m = resolveAuthoringMessage('peopleCulture', 'noData'); return <HomepageEmptyState title={m.title} description={m.description} />; }
  if (allEmpty) { const m = resolveAuthoringMessage('peopleCulture', 'invalid'); return <HomepageEmptyState title={m.title} description={m.description} />; }

  return (
    <section data-hbc-homepage="people-culture" data-hbc-authoring-safe="true" aria-label={output.heading} style={rootStyle}>
      <HeroBanner heading={output.heading} tier={tier} />

      {!output.kudos.isEmpty ? (
        <div style={tier === 'desktop' ? { display: 'flex', flexWrap: 'wrap' } : { display: 'flex', flexDirection: 'column' }}>
          <KudosSpotlight output={output.kudos} tier={tier} rm={rm} />
          <SupportRail bandA={output.bandA} bandB={output.bandB} tier={tier} rm={rm} />
        </div>
      ) : (
        <SparseLayout bandA={output.bandA} bandB={output.bandB} tier={tier} rm={rm} />
      )}
    </section>
  );
}
