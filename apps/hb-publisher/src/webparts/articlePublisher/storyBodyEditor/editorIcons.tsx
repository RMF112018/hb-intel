/**
 * Inline SVG glyph set for the story-body editor toolbar.
 *
 * Kept local (not in `@hbc/ui-kit`) because these are editor-specific
 * formatting glyphs that do not belong to the governed cross-surface
 * icon library. Each icon renders currentColor strokes/fills at 16px
 * square, tuned to match the governed `HbcIcon` visual weight used
 * elsewhere in the Publisher so the toolbar reads as part of the same
 * family.
 *
 * No new package dependency is introduced; glyphs are pure JSX.
 */

import * as React from 'react';

interface GlyphProps {
  readonly className?: string;
}

function svg(children: React.ReactNode): React.FC<GlyphProps> {
  const C: React.FC<GlyphProps> = ({ className }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {children}
    </svg>
  );
  return C;
}

export const BoldGlyph = svg(
  <>
    <path d="M4 3h4.2a2.2 2.2 0 0 1 0 4.4H4z" fill="currentColor" stroke="none" />
    <path d="M4 7.4h4.7a2.3 2.3 0 0 1 0 4.6H4z" fill="currentColor" stroke="none" />
  </>,
);

export const ItalicGlyph = svg(
  <>
    <line x1="9.5" y1="3" x2="13" y2="3" />
    <line x1="3" y1="13" x2="6.5" y2="13" />
    <line x1="10" y1="3" x2="6" y2="13" />
  </>,
);

export const LinkGlyph = svg(
  <>
    <path d="M6.5 9.5a2.5 2.5 0 0 0 3.5 0l2-2a2.5 2.5 0 1 0-3.5-3.5l-.8.8" />
    <path d="M9.5 6.5a2.5 2.5 0 0 0-3.5 0l-2 2a2.5 2.5 0 1 0 3.5 3.5l.8-.8" />
  </>,
);

export const HeadingTwoGlyph = svg(
  <>
    <text
      x="2"
      y="12"
      fontFamily="'Segoe UI', system-ui, sans-serif"
      fontSize="11"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      H2
    </text>
  </>,
);

export const HeadingThreeGlyph = svg(
  <>
    <text
      x="2"
      y="12"
      fontFamily="'Segoe UI', system-ui, sans-serif"
      fontSize="11"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      H3
    </text>
  </>,
);

export const ParagraphGlyph = svg(
  <>
    <path d="M10 3v10" />
    <path d="M13 3v10" />
    <path d="M10 3H6.5a2.5 2.5 0 0 0 0 5H10" />
  </>,
);

export const BulletListGlyph = svg(
  <>
    <circle cx="3" cy="4" r="1" fill="currentColor" stroke="none" />
    <circle cx="3" cy="8" r="1" fill="currentColor" stroke="none" />
    <circle cx="3" cy="12" r="1" fill="currentColor" stroke="none" />
    <line x1="6" y1="4" x2="13.5" y2="4" />
    <line x1="6" y1="8" x2="13.5" y2="8" />
    <line x1="6" y1="12" x2="13.5" y2="12" />
  </>,
);

export const OrderedListGlyph = svg(
  <>
    <text
      x="1"
      y="5.5"
      fontFamily="'Segoe UI', system-ui, sans-serif"
      fontSize="5"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      1.
    </text>
    <text
      x="1"
      y="9.5"
      fontFamily="'Segoe UI', system-ui, sans-serif"
      fontSize="5"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      2.
    </text>
    <text
      x="1"
      y="13.5"
      fontFamily="'Segoe UI', system-ui, sans-serif"
      fontSize="5"
      fontWeight="700"
      fill="currentColor"
      stroke="none"
    >
      3.
    </text>
    <line x1="6" y1="4" x2="13.5" y2="4" />
    <line x1="6" y1="8" x2="13.5" y2="8" />
    <line x1="6" y1="12" x2="13.5" y2="12" />
  </>,
);

export const QuoteGlyph = svg(
  <>
    <path
      d="M4 11V8.5a3 3 0 0 1 3-3"
      />
    <path
      d="M9.5 11V8.5a3 3 0 0 1 3-3"
      />
    <path d="M3 11h3v-3H3z" fill="currentColor" stroke="none" />
    <path d="M8.5 11h3v-3h-3z" fill="currentColor" stroke="none" />
  </>,
);

export const UndoGlyph = svg(
  <>
    <path d="M4 6h5.5a3.5 3.5 0 0 1 0 7H6" />
    <polyline points="6.5,3 3.5,6 6.5,9" />
  </>,
);

export const RedoGlyph = svg(
  <>
    <path d="M12 6H6.5a3.5 3.5 0 0 0 0 7H10" />
    <polyline points="9.5,3 12.5,6 9.5,9" />
  </>,
);
