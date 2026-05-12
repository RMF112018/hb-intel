/**
 * Phase 08 wave-b13 Prompt 10E — External References adapter for the
 * Document Control Explorer Home pane.
 *
 * Derives Document Crunch / Adobe Sign display rows from the existing
 * Document Control view-model's `external-systems` lane entries. Pure
 * function; deterministic output order (`document-crunch`, then
 * `adobe-sign`) independent of the source registry's enumeration
 * order, so the section reads consistently across envelopes.
 *
 * No live launch URLs are emitted; consumers render each row with the
 * inert `PccDisabledAffordance` component using the launch copy table
 * exported below.
 */

import type { IPccDocumentControlViewModel } from './documentControlViewModel';

export type DocumentExplorerExternalReferenceSystemId = 'document-crunch' | 'adobe-sign';

export type DocumentExplorerExternalReferenceLaunchPosture =
  | 'configured-not-launchable'
  | 'inactive-for-project';

export interface IDocumentExplorerExternalReference {
  readonly systemId: DocumentExplorerExternalReferenceSystemId;
  readonly displayName: string;
  readonly enabled: boolean;
  readonly launchPosture: DocumentExplorerExternalReferenceLaunchPosture;
}

interface ILaunchCueCopy {
  readonly label: string;
  readonly reason: string;
  readonly nextStep?: string;
}

export const EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE: Readonly<
  Record<DocumentExplorerExternalReferenceLaunchPosture, (displayName: string) => ILaunchCueCopy>
> = {
  'configured-not-launchable': (displayName) => ({
    label: `Open ${displayName}`,
    reason: `${displayName} is registered for this project. Direct launch from this Document Control view is not available.`,
    nextStep: 'Use the configured external source when launch access is enabled.',
  }),
  'inactive-for-project': (displayName) => ({
    label: 'Not active',
    reason: `${displayName} is not active for the current project context.`,
  }),
};

const SOURCE_KEY_BY_SYSTEM_ID: Readonly<Record<DocumentExplorerExternalReferenceSystemId, string>> =
  {
    'document-crunch': 'external-document-crunch',
    'adobe-sign': 'external-adobe-sign',
  };

const SYSTEM_RENDER_ORDER: readonly DocumentExplorerExternalReferenceSystemId[] = [
  'document-crunch',
  'adobe-sign',
];

/**
 * Pure adapter: walks the Document Control view-model's
 * `external-systems` lane and returns the External Reference rows for
 * Document Crunch and Adobe Sign. Returns an empty array when no
 * view-model is supplied (e.g., no-client fallback) or when neither
 * system is present in the lane.
 */
export function buildExternalReferencesFromViewModel(
  viewModel: IPccDocumentControlViewModel | undefined,
): readonly IDocumentExplorerExternalReference[] {
  if (!viewModel) return [];
  const entries = viewModel.lanes['external-systems'].entries;
  const result: IDocumentExplorerExternalReference[] = [];
  for (const systemId of SYSTEM_RENDER_ORDER) {
    const expectedSourceKey = SOURCE_KEY_BY_SYSTEM_ID[systemId];
    const match = entries.find((entry) => entry.sourceKey === expectedSourceKey);
    if (!match) continue;
    const enabled = match.enabled !== false;
    result.push({
      systemId,
      displayName: match.displayName,
      enabled,
      launchPosture: enabled ? 'configured-not-launchable' : 'inactive-for-project',
    });
  }
  return result;
}
