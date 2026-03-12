import { describe, expect, it } from 'vitest';
import { useStrategicIntelligenceState } from '@hbc/strategic-intelligence';
import { useStrategicIntelligence } from './useStrategicIntelligence.js';

describe('BD strategic intelligence hooks', () => {
  it('maps primitive state into BD view models without altering primitive semantics', () => {
    const input = {
      projectId: 'bd-strategic-hooks-1',
      visibilityContext: 'bd-panel',
      actorUserId: 'bd-user-1',
      roleContext: 'Business Development',
    };

    const primitive = useStrategicIntelligenceState({
      projectId: input.projectId,
      visibilityContext: input.visibilityContext,
    });

    const projected = useStrategicIntelligence(input);

    expect(projected.view?.snapshotId).toBe(primitive.state?.heritageSnapshot.snapshotId);
    expect(projected.view?.syncStatus).toBe(primitive.state?.syncStatus);
    expect(projected.primitive.state.state?.syncStatus).toBe(primitive.state?.syncStatus);
    expect(projected.primitive.state.sync.badgeLabel).toBe('Synced');
  });

  it('projects BIC owner avatar metadata and project-canvas assignment metadata', () => {
    const projected = useStrategicIntelligence({
      projectId: 'bd-strategic-hooks-2',
      visibilityContext: 'bd-feed',
      actorUserId: 'bd-user-2',
      roleContext: 'Pursuit Manager',
      assignmentTileKey: 'bd-strategic-intelligence-feed',
    });

    expect(projected.bicOwnerAvatars.length).toBeGreaterThan(0);
    expect(projected.bicOwnerAvatars[0]?.owner.userId).toContain('-owner');
    expect(projected.canvasAssignments.length).toBeGreaterThan(0);
    expect(projected.canvasAssignments[0]?.assignment.tileKey).toBe('bd-strategic-intelligence-feed');
    expect(projected.canvasAssignments[0]?.assignment.projectId).toBe('bd-strategic-hooks-2');
  });
});
