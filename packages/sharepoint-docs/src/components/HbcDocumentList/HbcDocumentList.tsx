import React from 'react';
import type { DocumentContextType } from '../../types/index.js';
import { useDocumentList } from '../../hooks/useDocumentList.js';
import { TombstoneRow } from './TombstoneRow.js';
import { MigrationStatusBadge } from './MigrationStatusBadge.js';

interface HbcDocumentListProps {
  contextId: string;
  contextType: DocumentContextType;
  showMigrationStatus?: boolean;
  showBidirectionalLink?: boolean;
}

export const HbcDocumentList: React.FC<HbcDocumentListProps> = ({
  contextId,
  contextType,
  showMigrationStatus = true,
  showBidirectionalLink = true,
}) => {
  const { data: documents, isLoading, error } = useDocumentList(contextId, contextType);

  if (isLoading) return <div className="hbc-doc-list-loading" aria-live="polite">Loading documents…</div>;
  if (error) return <div className="hbc-doc-list-error" role="alert">Could not load documents. Please refresh.</div>;
  if (!documents?.length) return <div className="hbc-doc-list-empty">No documents attached yet.</div>;

  return (
    <ul className="hbc-document-list" aria-label="Attached documents">
      {documents.map(doc => {
        // Tombstone entries render differently — they're just links to the migrated location
        if (doc.migrationStatus === 'migrated' && doc.tombstoneUrl) {
          return (
            <TombstoneRow
              key={doc.id}
              document={doc}
              showBidirectionalLink={showBidirectionalLink}
            />
          );
        }

        return (
          <li key={doc.id} className="hbc-doc-list__item">
            <a
              href={doc.sharepointUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hbc-doc-list__link"
              aria-label={`Open ${doc.fileName} in SharePoint`}
            >
              {doc.fileName}
            </a>
            <span className="hbc-doc-list__meta">
              {formatBytes(doc.fileSize)} · {formatDate(doc.uploadedAt)}
            </span>
            {showMigrationStatus && (
              <MigrationStatusBadge status={doc.migrationStatus} />
            )}
          </li>
        );
      })}
    </ul>
  );
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
