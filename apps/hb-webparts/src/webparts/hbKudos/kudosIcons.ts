/**
 * kudosIcons — governed icon seam for HB Kudos webparts.
 *
 * Phase-18 Wave 1 compliance: all homepage-facing HB Kudos icon usage
 * must flow through a real icon system aligned with the SPFx Homepage
 * doctrine. This seam re-exports the curated lucide-react set already
 * owned by `@hbc/ui-kit/homepage` so icon usage stays consistent and
 * swappable, and so no Unicode / pseudo-icon substitutions creep back
 * into the Kudos surfaces.
 *
 * Do not import `lucide-react` directly in Kudos surface files — route
 * through this seam so the Kudos icon set remains governed.
 */
export {
  Trophy,
  Sparkles,
  ThumbsUp,
  ChevronDown,
  ArrowRight,
  type LucideIcon,
} from '@hbc/ui-kit/homepage';
