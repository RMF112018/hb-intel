/**
 * SF26-T04 — Workspace state mapper composition hook.
 *
 * Governing: SF26-T04, L-02
 */

import { useMemo, useCallback } from 'react';
import type { ISavedViewDefinition, ISavedViewStateMapper, ISavedViewSchemaDescriptor } from '../types/index.js';

export interface UseWorkspaceStateMapperOptions<TState> {
  mapper: ISavedViewStateMapper<TState>;
  currentState: TState;
}

export interface UseWorkspaceStateMapperResult<TState> {
  serialized: Omit<ISavedViewDefinition, 'viewId' | 'createdAtIso' | 'updatedAtIso'>;
  deserialize: (view: ISavedViewDefinition) => TState;
  currentSchemaVersion: number;
  currentSchema: ISavedViewSchemaDescriptor;
}

export function useWorkspaceStateMapper<TState>(
  options: UseWorkspaceStateMapperOptions<TState>,
): UseWorkspaceStateMapperResult<TState> {
  const { mapper, currentState } = options;

  const serialized = useMemo(() => mapper.serialize(currentState), [mapper, currentState]);
  const deserialize = useCallback((view: ISavedViewDefinition) => mapper.deserialize(view), [mapper]);
  const currentSchemaVersion = useMemo(() => mapper.currentSchemaVersion(), [mapper]);
  const currentSchema = useMemo(() => mapper.currentSchema(), [mapper]);

  return { serialized, deserialize, currentSchemaVersion, currentSchema };
}
