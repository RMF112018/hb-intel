import React from 'react';
import type { IConflict } from '../../types/index.js';

interface ConflictRowProps {
  conflict: IConflict;
  onResolve: (resolution: 'keep-staging' | 'keep-project' | 'keep-both') => void;
}

export const ConflictRow: React.FC<ConflictRowProps> = ({ conflict, onResolve }) => {
  const stagingMB = (conflict.stagingSizeBytes / 1024 / 1024).toFixed(1);
  const projectMB = (conflict.projectSizeBytes / 1024 / 1024).toFixed(1);

  return (
    <li className="hbc-conflict-row" aria-label={`Conflict: ${conflict.fileName}`}>
      <div className="hbc-conflict-row__filename">{conflict.fileName}</div>
      <div className="hbc-conflict-row__versions">
        <div className="hbc-conflict-row__version">
          <span className="hbc-conflict-row__version-label">Staging version</span>
          <a href={conflict.stagingUrl} target="_blank" rel="noopener noreferrer">
            View ({stagingMB} MB, modified {new Date(conflict.stagingModifiedAt).toLocaleDateString()})
          </a>
        </div>
        <div className="hbc-conflict-row__version">
          <span className="hbc-conflict-row__version-label">Project site version</span>
          <a href={conflict.projectUrl} target="_blank" rel="noopener noreferrer">
            View ({projectMB} MB, modified {new Date(conflict.projectModifiedAt).toLocaleDateString()})
          </a>
        </div>
      </div>
      <div className="hbc-conflict-row__actions" role="group" aria-label={`Resolution options for ${conflict.fileName}`}>
        <button
          type="button"
          className="hbc-btn hbc-btn--secondary"
          onClick={() => onResolve('keep-staging')}
          aria-describedby={`staging-desc-${conflict.conflictId}`}
        >
          Use staging version
        </button>
        <span id={`staging-desc-${conflict.conflictId}`} className="hbc-sr-only">
          Replace project site version with the Estimating/BD staging version
        </span>

        <button
          type="button"
          className="hbc-btn hbc-btn--secondary"
          onClick={() => onResolve('keep-project')}
          aria-describedby={`project-desc-${conflict.conflictId}`}
        >
          Keep project site version
        </button>
        <span id={`project-desc-${conflict.conflictId}`} className="hbc-sr-only">
          Discard the staging version; keep what is already in the project site
        </span>

        <button
          type="button"
          className="hbc-btn hbc-btn--secondary"
          onClick={() => onResolve('keep-both')}
          aria-describedby={`both-desc-${conflict.conflictId}`}
        >
          Keep both
        </button>
        <span id={`both-desc-${conflict.conflictId}`} className="hbc-sr-only">
          Move the staging version with a timestamp suffix so both files coexist
        </span>
      </div>
    </li>
  );
};
