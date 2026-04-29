import type { PccPersona } from '@hbc/models/pcc';

/**
 * Wave 2 / Prompt 05 — app-local PRESENTATION fixture for the Team Snapshot
 * card.
 *
 * Wave 1 does NOT expose a team-member fixture in `@hbc/models/pcc/fixtures`.
 * This file fills the gap with a small, clearly preview-only set rooted in
 * Wave 1 persona shapes (`PccPersona`). It is NOT re-exported from
 * `@hbc/models/pcc`. When a canonical team fixture lands in
 * `@hbc/models/pcc`, this module will be removed and the card switched to
 * the canonical source.
 *
 * Visible labels carry an explicit `(preview)` suffix and never reference
 * a real person; no PII appears in this fixture.
 */
export interface PccTeamSnapshotEntry {
  readonly displayName: string;
  readonly persona: PccPersona;
  readonly initials: string;
}

export const TEAM_SNAPSHOT_PLACEHOLDER: readonly PccTeamSnapshotEntry[] = [
  { displayName: 'Project Manager (preview)',    persona: 'project-manager',    initials: 'PM' },
  { displayName: 'Superintendent (preview)',     persona: 'superintendent',     initials: 'SU' },
  { displayName: 'Project Executive (preview)',  persona: 'project-executive',  initials: 'PE' },
  { displayName: 'Project Accounting (preview)', persona: 'project-accounting', initials: 'PA' },
  { displayName: 'Safety / QAQC (preview)',      persona: 'safety-qaqc',        initials: 'SQ' },
];
