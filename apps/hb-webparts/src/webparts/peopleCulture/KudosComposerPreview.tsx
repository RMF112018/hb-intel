/**
 * KudosComposerPreview — Inline preview card for draft Kudos.
 *
 * Mirrors the featured kudos spotlight visual language from
 * PeopleCultureMerged so the user sees how their recognition
 * will appear on the homepage.
 */
import * as React from 'react';
import { CheckCircle2 } from '@hbc/ui-kit/homepage';
import type { KudosComposerDraft } from '../../homepage/data/useKudosComposer.js';

/* ── Brand palette ─────────────────────────────────────────────── */

const HB = {
  orange: '#E57E46',
  orangeRgb: '229, 126, 70',
} as const;

const P = {
  text1: '#1a1a1a',
  text2: 'rgba(26,26,26,0.68)',
  text3: 'rgba(26,26,26,0.48)',
  text4: 'rgba(26,26,26,0.34)',
} as const;

/* ── Props ─────────────────────────────────────────────────────── */

export interface KudosComposerPreviewProps {
  draft: KudosComposerDraft;
  submitterName: string;
}

/* ── Helpers ───────────────────────────────────────────────────── */

function initials(name: string): string {
  const p = name.split(/\s+/).filter(Boolean);
  if (p.length === 0) return '?';
  if (p.length === 1) return p[0][0].toUpperCase();
  return (p[0][0] + p[p.length - 1][0]).toUpperCase();
}

function parseRecipients(raw: string): string[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/* ── Component ─────────────────────────────────────────────────── */

export function KudosComposerPreview({ draft, submitterName }: KudosComposerPreviewProps): React.JSX.Element {
  const recipients = parseRecipients(draft.recipientNames);
  const headline = draft.headline.trim() || 'Your headline here';
  const excerpt = draft.excerpt.trim() || 'Your recognition message will appear here...';
  const isEmpty = !draft.headline.trim() && !draft.excerpt.trim() && recipients.length === 0;

  return (
    <div style={{ marginTop: 4 }}>
      {/* Section label */}
      <div style={{
        fontSize: '0.5625rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
        color: P.text4,
        marginBottom: 10,
      }}>
        Preview
      </div>

      {/* Card */}
      <div style={{
        background: '#FDF8F4',
        borderRadius: 14,
        padding: 20,
        boxShadow: `0 4px 24px rgba(${HB.orangeRgb}, 0.12), 0 1px 4px rgba(0,0,0,0.04)`,
        border: '1px solid rgba(0,0,0,0.04)',
        borderLeft: `5px solid ${HB.orange}`,
        opacity: isEmpty ? 0.5 : 1,
        transition: 'opacity 200ms ease',
      }}>
        {/* Recipients avatars */}
        {recipients.length > 0 && (
          <div style={{ display: 'flex', gap: -6, marginBottom: 12 }}>
            {recipients.slice(0, 4).map((name, i) => (
              <span
                key={`${name}-${i}`}
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, rgba(${HB.orangeRgb},0.15), rgba(${HB.orangeRgb},0.08))`,
                  color: HB.orange,
                  fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.02em',
                  border: '2px solid #ffffff',
                  boxShadow: `0 0 0 1px rgba(${HB.orangeRgb}, 0.15)`,
                  marginLeft: i > 0 ? -6 : 0,
                  position: 'relative',
                  zIndex: 4 - i,
                  flexShrink: 0,
                }}
              >
                {initials(name)}
              </span>
            ))}
            {recipients.length > 4 && (
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, color: P.text3,
                display: 'flex', alignItems: 'center', marginLeft: 6,
              }}>
                +{recipients.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Eyebrow */}
        <span style={{
          fontSize: '0.625rem', fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          color: HB.orange, opacity: 0.85,
        }}>
          Kudos Spotlight
        </span>

        {/* Headline */}
        <h3 style={{
          margin: '4px 0 0',
          fontSize: '1.25rem', fontWeight: 800,
          letterSpacing: '-0.03em', lineHeight: 1.15,
          color: P.text1,
        }}>
          {headline}
        </h3>

        {/* Recipients line */}
        {recipients.length > 0 && (
          <span style={{
            display: 'block', marginTop: 4,
            fontSize: '0.875rem', fontWeight: 700, color: HB.orange,
          }}>
            {recipients.length === 1 && recipients[0]}
            {recipients.length === 2 && `${recipients[0]} and ${recipients[1]}`}
            {recipients.length > 2 && `${recipients[0]}, ${recipients[1]}, and ${recipients.length - 2} more`}
          </span>
        )}

        {/* Excerpt */}
        <p style={{
          margin: '8px 0 0',
          fontSize: '0.8125rem', lineHeight: 1.65, color: P.text2,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical' as unknown as React.CSSProperties['WebkitBoxOrient'],
          overflow: 'hidden',
        }}>
          {excerpt}
        </p>

        {/* Submitter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          marginTop: 10,
          fontSize: '0.6875rem', color: P.text3,
        }}>
          <CheckCircle2 size={11} aria-hidden="true" style={{ color: HB.orange }} />
          by {submitterName || 'You'}
        </div>
      </div>
    </div>
  );
}
