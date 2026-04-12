/**
 * Recipient-shape fixtures covering matrix axis G (identity/media).
 *
 * Non-individual buckets (team/department/project-group) are RT* —
 * they currently flow through label/note paths, not term-store
 * resolution. Do not simulate completed taxonomy.
 */
import type { SeededKudosRecipient } from '../helpers/kudosSeed';
import { USERS } from './users';

export const RECIPIENTS = {
  individualWithPhoto: {
    id: USERS.recipient.id,
    kind: 'individual',
    displayName: USERS.recipient.displayName,
    hasPhoto: true,
  },
  individualNoPhoto: {
    id: USERS.recipientNoPhoto.id,
    kind: 'individual',
    displayName: USERS.recipientNoPhoto.displayName,
    hasPhoto: false,
  },
  teamLabel: {
    id: 'team-field-ops',
    kind: 'team',
    displayName: 'Field Operations',
  },
  departmentLabel: {
    id: 'dept-estimating',
    kind: 'department',
    displayName: 'Estimating',
  },
  projectGroupLabel: {
    id: 'project-group-alpha',
    kind: 'project-group',
    displayName: 'Project Alpha',
  },
} as const satisfies Record<string, SeededKudosRecipient>;

export const multipleIndividualsMixedPhoto: SeededKudosRecipient[] = [
  RECIPIENTS.individualWithPhoto,
  RECIPIENTS.individualNoPhoto,
];

export const mixedBucket: SeededKudosRecipient[] = [
  RECIPIENTS.individualWithPhoto,
  RECIPIENTS.teamLabel,
  RECIPIENTS.departmentLabel,
  RECIPIENTS.projectGroupLabel,
];
