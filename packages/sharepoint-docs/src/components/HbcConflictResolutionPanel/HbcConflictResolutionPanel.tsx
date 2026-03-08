import React, { useState } from 'react';
import type { IConflict } from '../../types/index.js';
import { ConflictRow } from './ConflictRow.js';
import { useSharePointDocsServices } from '../../hooks/internal/useSharePointDocsServices.js';
import { useQueryClient } from '@tanstack/react-query';

interface HbcConflictResolutionPanelProps {
  jobId: string;
  conflicts: IConflict[];
  resolverUpn: string;
}

export const HbcConflictResolutionPanel: React.FC<HbcConflictResolutionPanelProps> = ({
  jobId, conflicts, resolverUpn,
}) => {
  const { conflictResolver } = useSharePointDocsServices();
  const queryClient = useQueryClient();
  const [resolved, setResolved] = useState<Set<string>>(new Set());

  const handleResolve = async (
    conflict: IConflict,
    resolution: 'keep-staging' | 'keep-project' | 'keep-both'
  ) => {
    await conflictResolver.resolve(
      conflict.conflictId,
      conflict.stagingDocumentId,
      resolution,
      resolverUpn,
      '', // destination site URL — passed from context in real usage
      '', // destination folder path
      conflict.fileName
    );
    setResolved(prev => new Set(prev).add(conflict.conflictId));
    queryClient.invalidateQueries({ queryKey: ['sharepoint-docs', 'documents'] });
  };

  const unresolvedConflicts = conflicts.filter(c => !resolved.has(c.conflictId) && c.status === 'pending');
  const expiresIn48h = unresolvedConflicts[0]
    ? new Date(unresolvedConflicts[0].expiresAt)
    : null;

  if (!unresolvedConflicts.length) {
    return (
      <div className="hbc-conflict-panel hbc-conflict-panel--empty" role="status">
        All conflicts resolved.
      </div>
    );
  }

  return (
    <section className="hbc-conflict-panel" aria-labelledby="conflict-panel-heading">
      <h2 id="conflict-panel-heading" className="hbc-conflict-panel__heading">
        Document Conflicts — Action Required
      </h2>
      <p className="hbc-conflict-panel__explainer">
        These files already exist in the project site. Choose how to handle each one.
        {expiresIn48h && (
          <> Unresolved conflicts will automatically keep the project site version after{' '}
          <strong>{expiresIn48h.toLocaleString()}</strong>.</>
        )}
      </p>
      <ul className="hbc-conflict-list" aria-label="Document conflicts requiring resolution">
        {unresolvedConflicts.map(conflict => (
          <ConflictRow
            key={conflict.conflictId}
            conflict={conflict}
            onResolve={(resolution) => handleResolve(conflict, resolution)}
          />
        ))}
      </ul>
    </section>
  );
};
