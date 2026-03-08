import React from 'react';
import type { IUploadedDocument } from '../../types/index.js';

interface TombstoneRowProps {
  document: IUploadedDocument;
  showBidirectionalLink: boolean;
}

export const TombstoneRow: React.FC<TombstoneRowProps> = ({ document, showBidirectionalLink }) => {
  return (
    <li className="hbc-doc-list__item hbc-doc-list__item--tombstone">
      <span className="hbc-doc-list__filename">{document.fileName}</span>
      <span className="hbc-doc-list__tombstone-label">Moved to project site</span>
      {showBidirectionalLink && document.migratedUrl && (
        <a
          href={document.migratedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hbc-doc-list__link"
          aria-label={`Open ${document.fileName} in project site`}
        >
          Open in project site
        </a>
      )}
    </li>
  );
};
