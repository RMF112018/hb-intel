/**
 * Shared constants and pure helpers for the Spotlight surface family.
 * Kept intentionally small — anything that grows a substantial surface
 * of its own should graduate to a dedicated module.
 */
import type { HbcAvatarStackPerson } from '../HbcAvatarStack/index.js';
import type { ProjectSpotlightTeamMember } from './types.js';

export const MAX_VISIBLE_AVATARS = 5;

export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as [
  number,
  number,
  number,
  number,
];

export function toAvatarStackPerson(
  member: ProjectSpotlightTeamMember,
): HbcAvatarStackPerson {
  return { id: member.id, name: member.displayName, src: member.photoUrl };
}

export function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]![0]!.toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function formatEditorialIndex(index: number): string {
  return index < 10 ? `0${index}` : String(index);
}
