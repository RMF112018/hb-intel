import { useEffect, useMemo, useRef, useState } from 'react';
import { HbcButton } from '@hbc/ui-kit/homepage';
import type { FoleonContentRecord } from '../types/foleon-content.types.js';
import type { FoleonGateReason, FoleonGateResult } from '../types/foleon-runtime.types.js';
import type { IFoleonRuntimeContract } from '../runtime/foleonRuntimeContract.js';
import { fetchFoleonContent } from '../services/FoleonContentService.js';
import { evaluateFoleonReaderGate } from '../services/FoleonReaderGate.js';
import { FoleonIframeHost } from '../components/FoleonIframeHost.js';
import { FoleonError, FoleonLoadingState } from '../components/FoleonStates.js';

interface ReaderPageProps {
  readonly contract: IFoleonRuntimeContract;
  readonly docId: number;
  readonly onBack: () => void;
  readonly onReaderOpen: (record: FoleonContentRecord, gateResult: FoleonGateReason) => void;
  readonly onReaderClose: (record: FoleonContentRecord, gateResult: FoleonGateReason) => void;
  readonly onEmbedError: (record: FoleonContentRecord, gateResult: FoleonGateReason) => void;
  /** Fires once per gate-blocked resolution for telemetry. */
  readonly onGateBlocked: (gateResult: FoleonGateReason) => void;
  readonly onExternalOpen: (record: FoleonContentRecord) => void;
}

export function ReaderPage(props: ReaderPageProps): React.ReactNode {
  const {
    contract,
    docId,
    onBack,
    onReaderOpen,
    onReaderClose,
    onEmbedError,
    onGateBlocked,
    onExternalOpen,
  } = props;
  const [state, setState] = useState<ReaderState>({ kind: 'loading' });
  const gateBlockedReportedRef = useRef<FoleonGateReason | null>(null);

  useEffect(() => {
    if (!contract.siteUrl || !contract.listIds.contentRegistry) {
      setState({ kind: 'error', message: 'Foleon reader configuration is incomplete.' });
      return;
    }
    const controller = new AbortController();
    void (async (): Promise<void> => {
      try {
        const records = await fetchFoleonContent({
          siteUrl: contract.siteUrl!,
          contentRegistryListId: contract.listIds.contentRegistry!,
          foleonDocId: docId,
          top: 1,
          signal: controller.signal,
        });
        const record = records[0];
        const gate = evaluateFoleonReaderGate(record, contract.originPolicy);
        setState({ kind: 'resolved', gate });
      } catch (err) {
        if ((err as { name?: string }).name === 'AbortError') return;
        setState({ kind: 'error', message: (err as Error).message });
      }
    })();
    return (): void => controller.abort();
  }, [contract, docId]);

  useEffect(() => {
    if (state.kind !== 'resolved' || !state.gate.allowed || !state.gate.record) return;
    const record = state.gate.record;
    const reason = state.gate.reason;
    onReaderOpen(record, reason);
    return (): void => onReaderClose(record, reason);
  }, [state, onReaderOpen, onReaderClose]);

  useEffect(() => {
    if (state.kind !== 'resolved' || state.gate.allowed) return;
    const reason = state.gate.reason;
    if (gateBlockedReportedRef.current === reason) return;
    gateBlockedReportedRef.current = reason;
    onGateBlocked(reason);
  }, [state, onGateBlocked]);

  const body = useMemo(() => {
    if (state.kind === 'loading') return <FoleonLoadingState label="Loading publication…" />;
    if (state.kind === 'error') {
      return (
        <FoleonError title="Unable to load this publication" description={state.message} />
      );
    }
    const { gate } = state;
    if (!gate.allowed) {
      return renderBlockedState(gate, onExternalOpen);
    }
    if (!gate.record || !gate.embedUrl) return null;
    const record = gate.record;
    return (
      <>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: 16,
            borderBottom: '1px solid var(--hbc-border, #e4e4e4)',
          }}
        >
          <div>
            <h2 style={{ margin: '0 0 4px' }}>{record.title}</h2>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--hbc-text-secondary, #555)' }}>
              {record.contentTypeKey}
              {record.relatedProjectName ? ` · ${record.relatedProjectName}` : ''}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <HbcButton variant="secondary" onClick={onBack}>
              Back
            </HbcButton>
            {record.publishedUrl ? (
              <HbcButton
                variant="secondary"
                onClick={(): void => {
                  onExternalOpen(record);
                  window.open(record.publishedUrl, '_blank', 'noopener,noreferrer');
                }}
              >
                Open externally
              </HbcButton>
            ) : null}
          </div>
        </header>
        <FoleonIframeHost
          src={gate.embedUrl}
          title={record.title}
          policy={contract.originPolicy}
          onError={(): void => onEmbedError(record, gate.reason)}
        />
      </>
    );
  }, [state, contract.originPolicy, onBack, onEmbedError, onExternalOpen]);

  return <section aria-label="Foleon reader">{body}</section>;
}

type ReaderState =
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'resolved'; gate: FoleonGateResult };

function renderBlockedState(
  gate: FoleonGateResult,
  onExternalOpen: (record: FoleonContentRecord) => void,
): React.ReactNode {
  const copy = blockedCopy(gate);
  const externalUrl = gate.record?.publishedUrl && !gate.record.publishedUrl.includes('/preview/')
    ? gate.record.publishedUrl
    : undefined;
  return (
    <FoleonError
      title={copy.title}
      description={copy.description}
      externalUrl={externalUrl}
      onRetry={
        externalUrl
          ? (): void => {
              if (gate.record) onExternalOpen(gate.record);
            }
          : undefined
      }
    />
  );
}

function blockedCopy(gate: FoleonGateResult): { title: string; description: string } {
  switch (gate.reason) {
    case 'missing-record':
      return {
        title: 'Publication could not be found.',
        description: 'No Foleon registry record matched the requested document ID.',
      };
    case 'not-visible':
      return {
        title: 'This publication is not currently available.',
        description: 'The Foleon registry record is hidden from HB Central.',
      };
    case 'not-published':
      return {
        title: 'This publication is not currently published.',
        description: 'Only items with PublishStatus=Published can be read in SharePoint.',
      };
    case 'embed-disallowed':
      return {
        title: 'This publication cannot be embedded.',
        description: 'Use the external link to read it on Foleon.',
      };
    case 'requires-external-open':
      return {
        title: 'This publication opens externally.',
        description: 'Use the external link to continue.',
      };
    case 'no-url':
      return {
        title: 'This publication has no embed URL.',
        description: 'No PublishedUrl or EmbedUrl is configured on the Foleon registry record.',
      };
    case 'origin-not-allowlisted':
      return {
        title: 'This publication could not be loaded inside SharePoint.',
        description: 'The Foleon source origin is not on the tenant iframe allowlist.',
      };
    case 'preview-url-blocked':
      return {
        title: 'Preview URLs are not permitted.',
        description: 'Replace the preview URL with the published Foleon Doc URL.',
      };
    case 'display-window-future':
      return {
        title: 'This publication is scheduled for a later date.',
        description: 'Its display window has not yet started.',
      };
    case 'display-window-past':
      return {
        title: 'This publication has been archived.',
        description: 'Its display window has ended.',
      };
    default:
      return {
        title: 'This publication is not currently available.',
        description: 'Contact the HB Central team if you believe this is an error.',
      };
  }
}
