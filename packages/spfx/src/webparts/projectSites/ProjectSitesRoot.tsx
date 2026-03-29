/**
 * Root React component for the Project Sites web part.
 *
 * Prompt 02 delivers the data layer — this is a compilation stub
 * that renders a minimal status indicator. Full UI composition
 * (HbcCard grid, empty states) is delivered in Prompt 04.
 */
import React, { type FC } from 'react';
import { useProjectSites } from './hooks/useProjectSites.js';
import type { IResolvedPageYear } from './types.js';

export interface ProjectSitesRootProps {
  resolvedYear: IResolvedPageYear | null;
}

export const ProjectSitesRoot: FC<ProjectSitesRootProps> = ({ resolvedYear }) => {
  const result = useProjectSites(resolvedYear);

  // Stub rendering — full UI delivered in Prompt 04
  switch (result.status) {
    case 'no-year':
      return (
        <div style={{ padding: '1rem', color: '#605e5c' }}>
          Year not configured. Set the page Year property or use the property pane override.
        </div>
      );
    case 'loading':
      return (
        <div style={{ padding: '1rem' }} aria-busy="true">
          Loading project sites&hellip;
        </div>
      );
    case 'error':
      return (
        <div style={{ padding: '1rem', color: '#a4262c' }}>
          Error: {result.errorMessage}
        </div>
      );
    case 'empty':
      return (
        <div style={{ padding: '1rem', color: '#605e5c' }}>
          No project sites found for {result.resolvedYear?.year}.
        </div>
      );
    case 'success':
      return (
        <div style={{ padding: '1rem' }}>
          <strong>{result.entries.length} project site(s)</strong> for{' '}
          {result.resolvedYear?.year} (source: {result.resolvedYear?.source})
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '0.5rem' }}>
            {result.entries.map((entry) => (
              <li key={entry.id} style={{ marginBottom: '0.25rem' }}>
                {entry.projectNumber ? `${entry.projectNumber} — ` : ''}
                {entry.projectName}
                {entry.hasSiteUrl ? (
                  <>
                    {' '}
                    <a href={entry.siteUrl} target="_blank" rel="noopener noreferrer">
                      Open Site
                    </a>
                  </>
                ) : (
                  <span style={{ color: '#797775', marginLeft: '0.5rem' }}>
                    (provisioning&hellip;)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      );
  }
};
