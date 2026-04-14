/**
 * Pure author-assistance helpers for alt text + caption authoring.
 * Workstream-e step-03.
 *
 * The accessibility guidance here is intentionally conservative: it
 * catches the highest-signal failure modes (missing alt, redundant
 * "image of" phrasing, alt too short to carry meaning, alt too long
 * to be helpful, caption that duplicates alt) without trying to be
 * a general prose critic. No DOM, no SPFx dependencies — SPFx-safe.
 */

export type AltTextQuality = 'ok' | 'good' | 'warn' | 'problem';

export interface AltTextAssessment {
  readonly level: AltTextQuality;
  readonly message: string;
}

const LEADING_PHRASES = [
  'image of',
  'picture of',
  'photo of',
  'photograph of',
  'graphic of',
  'screenshot of',
  'screen shot of',
  'illustration of',
];

/**
 * Minimum length for alt text to carry meaningful information.
 * Below this we hint but do not block — extremely short alt may be
 * correct for genuinely minimal images (a brand mark).
 */
const TOO_SHORT = 10;
/** Soft ceiling aligned with the composer counter. */
const SOFT_CEILING = 125;
/** Hard ceiling where alt text is almost certainly caption-shaped. */
const HARD_CEILING = 250;

export function assessAltText(raw: string): AltTextAssessment {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return {
      level: 'problem',
      message: 'Alt text is required so screen-reader users get the same story.',
    };
  }
  const lower = trimmed.toLowerCase();
  const leading = LEADING_PHRASES.find((p) => lower.startsWith(p));
  if (leading) {
    return {
      level: 'warn',
      message: `Skip the phrase "${leading}…" — screen readers already announce that this is an image.`,
    };
  }
  if (trimmed.length < TOO_SHORT) {
    return {
      level: 'warn',
      message:
        'This is very short. Describe what is visible and why it matters so the image carries meaning.',
    };
  }
  if (trimmed.length > HARD_CEILING) {
    return {
      level: 'problem',
      message:
        'This is longer than a caption. Move editorial detail to the caption and keep alt text to a single descriptive line.',
    };
  }
  if (trimmed.length > SOFT_CEILING) {
    return {
      level: 'warn',
      message:
        'Getting long. Aim for a single sentence — caption captures anything extra.',
    };
  }
  return {
    level: 'good',
    message: 'Alt text looks good.',
  };
}

/**
 * Assessment for the caption field. Returns `ok` when caption is
 * empty (captions are optional), `warn` when it duplicates the alt
 * text (common mistake — same string serves two different audiences
 * and is signalling that the author has nothing to add beyond alt),
 * `good` otherwise.
 */
export function assessCaption(args: {
  readonly caption: string;
  readonly altText: string;
}): AltTextAssessment {
  const caption = args.caption.trim();
  if (caption.length === 0) {
    return { level: 'ok', message: 'Captions are optional.' };
  }
  const alt = args.altText.trim();
  if (alt.length > 0 && caption.toLowerCase() === alt.toLowerCase()) {
    return {
      level: 'warn',
      message:
        'Caption duplicates the alt text. Alt text is for screen readers; captions add editorial context.',
    };
  }
  return { level: 'good', message: 'Caption reads as editorial colour.' };
}

/**
 * Short role-help copy surfaced next to the role chooser.
 */
export function roleGuidance(role: 'gallery' | 'supporting'): string {
  return role === 'gallery'
    ? 'Gallery images appear together in the article gallery block.'
    : 'Supporting images render inline with the article body when the template exposes an inline slot.';
}
