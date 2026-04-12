/**
 * Configuration for the typed recipient buckets. Co-located with the
 * internal consumers (TypedRecipients, RecipientBucket, SharedPickerBridge)
 * since it is not part of the public API.
 */
import { Building2, FolderKanban, User, Users, type LucideIcon } from 'lucide-react';
import type { KudosComposerRecipientBucketKind } from '../types.js';

export const BUCKET_CONFIG: Record<
  KudosComposerRecipientBucketKind,
  { label: string; placeholder: string; icon: LucideIcon }
> = {
  individualEmails: {
    label: 'People',
    placeholder: 'Search by name or email',
    icon: User,
  },
  teamLabels: {
    label: 'Teams',
    placeholder: 'e.g. Field Safety',
    icon: Users,
  },
  departmentLabels: {
    label: 'Departments',
    placeholder: 'e.g. Construction Operations',
    icon: Building2,
  },
  projectGroupLabels: {
    label: 'Projects',
    placeholder: 'e.g. Downtown Mixed-Use Tower',
    icon: FolderKanban,
  },
};
