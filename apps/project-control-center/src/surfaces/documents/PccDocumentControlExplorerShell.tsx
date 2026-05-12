/**
 * Phase 08 wave-b13 Prompt 10E — Document Control Explorer Shell.
 *
 * Composes the post-10D navigation behavior (folder/category drill-
 * down, breadcrumb traversal with click-back, mounted per-source path
 * retention, `activeModuleId` module-focus mapping) with the 10E
 * Procore linked-record directory and External References section.
 *
 * Marker contract (stable for tests):
 *   data-pcc-doc-explorer="true"
 *   data-pcc-doc-explorer-source-rail="true"
 *   data-pcc-doc-explorer-source-id="<source-id>"
 *   data-pcc-doc-explorer-source-selected="<true|false>"
 *   data-pcc-doc-explorer-header="<source-id>"
 *   data-pcc-doc-explorer-source-posture="<posture>"
 *   data-pcc-doc-explorer-breadcrumbs="true"
 *   data-pcc-doc-explorer-breadcrumb="<node-id>"
 *   data-pcc-doc-explorer-breadcrumb-current="<true|false>"
 *   data-pcc-doc-explorer-pane="<source-id>"
 *   data-pcc-doc-explorer-destination="<source-id>"
 *   data-pcc-doc-explorer-row="<node-id>"
 *   data-pcc-doc-explorer-row-kind="folder|category|linked-record"
 *   data-pcc-doc-explorer-empty="true"
 *   data-pcc-doc-explorer-mpf-safety="true"
 *   data-pcc-doc-explorer-procore-posture="true"
 *   data-pcc-doc-explorer-external-references="true"
 *   data-pcc-doc-explorer-external-reference="<system-id>"
 *   data-pcc-doc-explorer-external-reference-posture="<posture>"
 */

import { useEffect, useState, type FC } from 'react';
import { type PccModuleId } from '@hbc/models/pcc';
import {
  DOCUMENT_EXPLORER_SOURCE_ID_ORDER,
  DOCUMENT_EXPLORER_SOURCE_ROOTS,
  type DocumentExplorerSourceId,
  type IDocumentExplorerNode,
} from './documentExplorerModel';
import {
  DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP,
  PROCORE_SOURCE_ROOT_NODE,
} from './documentExplorerSourceRoots';
import { PROJECT_RECORD_TREE_ROOT } from './documentExplorerProjectRecordTree';
import { buildExplorerBreadcrumb, findNodeByPathSegments } from './documentExplorerHelpers';
import { resolveExplorerFocusTarget } from './documentExplorerModuleFocus';
import {
  PROCORE_CATEGORY_PANE_POSTURE_COPY,
  PROCORE_LAUNCH_NEXT_STEP,
  PROCORE_LAUNCH_REASON,
} from './documentExplorerProcoreLinkedRecords';
import {
  EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE,
  type IDocumentExplorerExternalReference,
} from './documentExplorerExternalReferences';
import { PccDisabledAffordance } from '../../ui/PccDisabledAffordance';
import styles from './PccDocumentControlExplorerShell.module.css';

const DESTINATION_ORDER: readonly DocumentExplorerSourceId[] = [
  'project-record',
  'my-project-files',
  'procore',
];

const EMPTY_PATH: readonly string[] = [];

interface ExplorerNavState {
  readonly activeSourceId: DocumentExplorerSourceId;
  readonly currentPaths: Readonly<Record<DocumentExplorerSourceId, readonly string[]>>;
}

function defaultNavState(): ExplorerNavState {
  return {
    activeSourceId: 'home',
    currentPaths: {
      home: EMPTY_PATH,
      'project-record': EMPTY_PATH,
      'my-project-files': EMPTY_PATH,
      procore: EMPTY_PATH,
    },
  };
}

function initialNavStateForModule(activeModuleId: PccModuleId | undefined): ExplorerNavState {
  const base = defaultNavState();
  if (!activeModuleId) return base;
  const target = resolveExplorerFocusTarget(activeModuleId);
  if (target?.kind !== 'explorer-source') return base;
  return {
    activeSourceId: target.sourceId,
    currentPaths: {
      ...base.currentPaths,
      [target.sourceId]: target.initialRelativePath ? [...target.initialRelativePath] : EMPTY_PATH,
    },
  };
}

function parseNodeIdToNav(nodeId: string): {
  sourceId: DocumentExplorerSourceId;
  segments: readonly string[];
} {
  if (nodeId === 'home') {
    return { sourceId: 'home', segments: EMPTY_PATH };
  }
  const parts = nodeId.split('/');
  const sourceId = parts[0] as DocumentExplorerSourceId;
  const segments = parts.slice(1);
  return { sourceId, segments };
}

function affordanceHintForNodeKind(nodeKind: IDocumentExplorerNode['nodeKind']): string {
  switch (nodeKind) {
    case 'folder':
      return 'Folder';
    case 'category':
      return 'Procore category';
    case 'linked-record':
      return 'Procore record';
    default:
      return '';
  }
}

interface SourceRailProps {
  readonly activeSourceId: DocumentExplorerSourceId;
  readonly onSelect: (id: DocumentExplorerSourceId) => void;
}

const SourceRail: FC<SourceRailProps> = ({ activeSourceId, onSelect }) => (
  <nav
    className={styles.sourceRail}
    aria-label="Document Control sources"
    data-pcc-doc-explorer-source-rail="true"
  >
    <ul className={styles.sourceRailList}>
      {DOCUMENT_EXPLORER_SOURCE_ID_ORDER.map((id) => {
        const meta = DOCUMENT_EXPLORER_SOURCE_ROOTS[id];
        const isActive = id === activeSourceId;
        return (
          <li key={id} className={styles.sourceRailItem}>
            <button
              type="button"
              className={styles.sourceRailButton}
              data-pcc-doc-explorer-source-id={id}
              data-pcc-doc-explorer-source-selected={isActive ? 'true' : 'false'}
              aria-current={isActive ? 'true' : undefined}
              onClick={() => onSelect(id)}
            >
              {meta.label}
            </button>
          </li>
        );
      })}
    </ul>
  </nav>
);

interface ContextHeaderProps {
  readonly activeSourceId: DocumentExplorerSourceId;
}

const ContextHeader: FC<ContextHeaderProps> = ({ activeSourceId }) => {
  const meta = DOCUMENT_EXPLORER_SOURCE_ROOTS[activeSourceId];
  return (
    <header
      className={styles.contextHeader}
      data-pcc-doc-explorer-header={activeSourceId}
      data-pcc-doc-explorer-source-posture={meta.posture}
    >
      <div className={styles.contextHeaderRow}>
        <h3 className={styles.contextHeaderTitle}>{meta.label}</h3>
        <span className={styles.posturePill}>{meta.posture}</span>
      </div>
      <p className={styles.contextHeaderSummary}>{meta.summary}</p>
      <p className={styles.contextHeaderCue}>{meta.authorityCue}</p>
    </header>
  );
};

interface BreadcrumbBandProps {
  readonly activeSourceId: DocumentExplorerSourceId;
  readonly currentPath: readonly string[];
  readonly onNavigateToNodeId: (nodeId: string) => void;
}

const BreadcrumbBand: FC<BreadcrumbBandProps> = ({
  activeSourceId,
  currentPath,
  onNavigateToNodeId,
}) => {
  const segments = buildExplorerBreadcrumb(activeSourceId, currentPath);
  return (
    <nav
      className={styles.breadcrumbBand}
      aria-label="Explorer location"
      data-pcc-doc-explorer-breadcrumbs="true"
    >
      <ol className={styles.breadcrumbList}>
        {segments.map((segment, index) => (
          <li key={segment.nodeId} className={styles.breadcrumbItem}>
            {index > 0 ? (
              <span aria-hidden="true" className={styles.breadcrumbSeparator}>
                /
              </span>
            ) : null}
            {segment.isCurrent ? (
              <span
                className={styles.breadcrumbSegment}
                data-pcc-doc-explorer-breadcrumb={segment.nodeId}
                data-pcc-doc-explorer-breadcrumb-current="true"
              >
                {segment.label}
              </span>
            ) : (
              <button
                type="button"
                className={styles.breadcrumbButton}
                data-pcc-doc-explorer-breadcrumb={segment.nodeId}
                data-pcc-doc-explorer-breadcrumb-current="false"
                onClick={() => onNavigateToNodeId(segment.nodeId)}
              >
                {segment.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

interface ExternalReferencesSectionProps {
  readonly references: readonly IDocumentExplorerExternalReference[];
}

const ExternalReferencesSection: FC<ExternalReferencesSectionProps> = ({ references }) => {
  if (references.length === 0) return null;
  return (
    <section
      className={styles.externalReferencesSection}
      aria-label="External references"
      data-pcc-doc-explorer-external-references="true"
    >
      <h4 className={styles.externalReferencesHeading}>External references</h4>
      <ul className={styles.externalReferenceList}>
        {references.map((reference) => {
          const copy = EXTERNAL_REFERENCE_LAUNCH_COPY_BY_POSTURE[reference.launchPosture](
            reference.displayName,
          );
          return (
            <li
              key={reference.systemId}
              className={styles.externalReferenceRow}
              data-pcc-doc-explorer-external-reference={reference.systemId}
              data-pcc-doc-explorer-external-reference-posture={reference.launchPosture}
            >
              <span className={styles.externalReferenceName}>{reference.displayName}</span>
              <PccDisabledAffordance
                label={copy.label}
                reason={copy.reason}
                nextStep={copy.nextStep}
                variant="chip"
                data-pcc-disabled-affordance-id={`external-reference-${reference.systemId}`}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
};

interface HomePaneProps {
  readonly onSelect: (id: DocumentExplorerSourceId) => void;
  readonly externalReferences: readonly IDocumentExplorerExternalReference[];
}

const HomePane: FC<HomePaneProps> = ({ onSelect, externalReferences }) => (
  <section className={styles.pane} data-pcc-doc-explorer-pane="home">
    <p className={styles.paneIntro}>
      Choose a project file source to browse. Project Record holds the formal SharePoint project
      libraries, My Project Files holds project-scoped working files, and Procore opens governed
      category directories.
    </p>
    <ul className={styles.destinationList}>
      {DESTINATION_ORDER.map((id) => {
        const meta = DOCUMENT_EXPLORER_SOURCE_ROOTS[id];
        return (
          <li key={id} className={styles.destinationItem}>
            <button
              type="button"
              className={styles.destinationTile}
              data-pcc-doc-explorer-destination={id}
              onClick={() => onSelect(id)}
            >
              <span className={styles.destinationLabel}>{meta.label}</span>
              <span className={styles.destinationSummary}>{meta.summary}</span>
            </button>
          </li>
        );
      })}
    </ul>
    <ExternalReferencesSection references={externalReferences} />
  </section>
);

interface PathAwarePaneProps {
  readonly sourceId: DocumentExplorerSourceId;
  readonly sourceRoot: IDocumentExplorerNode;
  readonly currentPath: readonly string[];
  readonly onDrillInto: (segments: readonly string[]) => void;
}

const PathAwarePane: FC<PathAwarePaneProps> = ({
  sourceId,
  sourceRoot,
  currentPath,
  onDrillInto,
}) => {
  const currentNode = findNodeByPathSegments(sourceRoot, currentPath) ?? sourceRoot;
  const children = currentNode.children ?? [];
  const showProcorePostureCue = sourceId === 'procore' && currentPath.length > 0;
  return (
    <section className={styles.pane} data-pcc-doc-explorer-pane={sourceId}>
      {showProcorePostureCue ? (
        <p className={styles.procorePostureCue} data-pcc-doc-explorer-procore-posture="true">
          {PROCORE_CATEGORY_PANE_POSTURE_COPY}
        </p>
      ) : null}
      {children.length === 0 ? (
        <p className={styles.emptyState} data-pcc-doc-explorer-empty="true">
          No items at this location.
        </p>
      ) : (
        <ul className={styles.rowList}>
          {children.map((node) => {
            if (node.nodeKind === 'linked-record') {
              const recordKind = node.linkedRecordRef?.recordKind ?? '';
              return (
                <li
                  key={node.nodeId}
                  className={styles.linkedRecordRow}
                  data-pcc-doc-explorer-row={node.nodeId}
                  data-pcc-doc-explorer-row-kind="linked-record"
                >
                  <span className={styles.rowLabel}>{node.displayLabel}</span>
                  {recordKind ? (
                    <span className={styles.linkedRecordChip}>{recordKind}</span>
                  ) : null}
                  <PccDisabledAffordance
                    label="Open in Procore"
                    reason={PROCORE_LAUNCH_REASON}
                    nextStep={PROCORE_LAUNCH_NEXT_STEP}
                    variant="chip"
                    data-pcc-disabled-affordance-id={`procore-row-${node.nodeId}`}
                  />
                </li>
              );
            }
            return (
              <li key={node.nodeId} className={styles.rowItem}>
                <button
                  type="button"
                  className={styles.rowButton}
                  data-pcc-doc-explorer-row={node.nodeId}
                  data-pcc-doc-explorer-row-kind={node.nodeKind}
                  onClick={() => onDrillInto(node.relativePathSegments)}
                >
                  <span className={styles.rowLabel}>{node.displayLabel}</span>
                  <span className={styles.rowAffordance}>
                    {affordanceHintForNodeKind(node.nodeKind)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

const MyProjectFilesPane: FC = () => {
  const meta = DOCUMENT_EXPLORER_SOURCE_ROOTS['my-project-files'];
  return (
    <section className={styles.pane} data-pcc-doc-explorer-pane="my-project-files">
      <div className={styles.mpfSafety} data-pcc-doc-explorer-mpf-safety="true">
        <p className={styles.mpfSafetySummary}>{meta.summary}</p>
        {meta.guardrailCopy ? (
          <p className={styles.mpfSafetyGuardrail}>{meta.guardrailCopy}</p>
        ) : null}
      </div>
    </section>
  );
};

export interface PccDocumentControlExplorerShellProps {
  readonly activeModuleId?: PccModuleId;
  readonly externalReferences?: readonly IDocumentExplorerExternalReference[];
}

export const PccDocumentControlExplorerShell: FC<PccDocumentControlExplorerShellProps> = ({
  activeModuleId,
  externalReferences = [],
}) => {
  const [navState, setNavState] = useState<ExplorerNavState>(() =>
    initialNavStateForModule(activeModuleId),
  );

  useEffect(() => {
    if (!activeModuleId) return;
    const target = resolveExplorerFocusTarget(activeModuleId);
    if (target?.kind !== 'explorer-source') return;
    const targetSourceId = target.sourceId;
    const targetPath = target.initialRelativePath ? [...target.initialRelativePath] : EMPTY_PATH;
    setNavState((prev) => ({
      activeSourceId: targetSourceId,
      currentPaths: { ...prev.currentPaths, [targetSourceId]: targetPath },
    }));
  }, [activeModuleId]);

  const switchToSource = (id: DocumentExplorerSourceId): void => {
    setNavState((prev) => ({ ...prev, activeSourceId: id }));
  };

  const setCurrentPath = (
    sourceId: DocumentExplorerSourceId,
    segments: readonly string[],
  ): void => {
    setNavState((prev) => ({
      ...prev,
      currentPaths: { ...prev.currentPaths, [sourceId]: segments },
    }));
  };

  const navigateToNodeId = (nodeId: string): void => {
    const { sourceId, segments } = parseNodeIdToNav(nodeId);
    setNavState((prev) => ({
      activeSourceId: sourceId,
      currentPaths: { ...prev.currentPaths, [sourceId]: segments },
    }));
  };

  const drillIntoActiveSource = (segments: readonly string[]): void => {
    setCurrentPath(navState.activeSourceId, segments);
  };

  const renderPane = (): JSX.Element => {
    switch (navState.activeSourceId) {
      case 'home':
        return <HomePane onSelect={switchToSource} externalReferences={externalReferences} />;
      case 'project-record':
        return (
          <PathAwarePane
            sourceId="project-record"
            sourceRoot={PROJECT_RECORD_TREE_ROOT}
            currentPath={navState.currentPaths['project-record']}
            onDrillInto={drillIntoActiveSource}
          />
        );
      case 'my-project-files':
        return <MyProjectFilesPane />;
      case 'procore':
        return (
          <PathAwarePane
            sourceId="procore"
            sourceRoot={PROCORE_SOURCE_ROOT_NODE}
            currentPath={navState.currentPaths.procore}
            onDrillInto={drillIntoActiveSource}
          />
        );
      default: {
        const exhaustive: never = navState.activeSourceId;
        void exhaustive;
        return <HomePane onSelect={switchToSource} externalReferences={externalReferences} />;
      }
    }
  };

  void DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP;

  return (
    <div className={styles.shell} data-pcc-doc-explorer="true">
      <SourceRail activeSourceId={navState.activeSourceId} onSelect={switchToSource} />
      <div className={styles.main}>
        <ContextHeader activeSourceId={navState.activeSourceId} />
        <BreadcrumbBand
          activeSourceId={navState.activeSourceId}
          currentPath={navState.currentPaths[navState.activeSourceId]}
          onNavigateToNodeId={navigateToNodeId}
        />
        {renderPane()}
      </div>
    </div>
  );
};

export default PccDocumentControlExplorerShell;
