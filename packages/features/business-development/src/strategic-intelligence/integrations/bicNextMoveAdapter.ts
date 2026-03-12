import type { IBicOwner } from '@hbc/bic-next-move';
import type { IStrategicIntelligenceEntry } from '@hbc/strategic-intelligence';

export interface IStrategicIntelligenceBicOwnerAvatarProjection {
  commitmentId: string;
  owner: IBicOwner;
}

export interface IStrategicIntelligenceBicOwnershipAction {
  entryId: string;
  commitmentId: string | null;
  owner: IBicOwner | null;
  actionLabel: string;
  blockedByConflict: boolean;
}

export const projectStrategicIntelligenceToBicActions = (
  entries: readonly IStrategicIntelligenceEntry[],
  avatars: readonly IStrategicIntelligenceBicOwnerAvatarProjection[]
): IStrategicIntelligenceBicOwnershipAction[] => {
  const actions = entries.map((entry) => {
    const commitmentId = entry.commitmentIds[0] ?? null;
    const avatar = commitmentId
      ? avatars.find((item) => item.commitmentId === commitmentId)
      : undefined;

    return {
      entryId: entry.entryId,
      commitmentId,
      owner: avatar?.owner ?? null,
      actionLabel: avatar?.owner
        ? `Coordinate next move with ${avatar.owner.displayName}`
        : 'Assign strategic gap owner',
      blockedByConflict: entry.conflicts.some((conflict) => conflict.resolutionStatus === 'open'),
    };
  });

  return actions.sort((a, b) => Number(b.blockedByConflict) - Number(a.blockedByConflict));
};
