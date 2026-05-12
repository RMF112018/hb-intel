/**
 * Phase 08 wave-b13 Prompt 10C — Document Control Explorer Shell.
 *
 * Replaces the legacy lane / permissions / reviews ready-path
 * composition with a single full-width Explorer shell. Scope is
 * **shell + root-level source selection only**. Folder/category
 * drill-down, breadcrumb traversal, mounted path retention,
 * `activeModuleId` router pass-through, and Procore linked-record
 * rows are correctly deferred (10D / 10E).
 *
 * Data source: Prompt 10B model foundation
 * (`documentExplorerModel`, `documentExplorerSourceRoots`,
 * `documentExplorerProjectRecordTree`, `documentExplorerProcoreCategories`).
 *
 * Marker contract (stable for tests):
 *   data-pcc-doc-explorer="true"
 *   data-pcc-doc-explorer-source-rail="true"
 *   data-pcc-doc-explorer-source-id="<source-id>"
 *   data-pcc-doc-explorer-source-selected="<true|false>"
 *   data-pcc-doc-explorer-header="<source-id>"
 *   data-pcc-doc-explorer-source-posture="<posture>"
 *   data-pcc-doc-explorer-breadcrumbs="true"
 *   data-pcc-doc-explorer-breadcrumb="<segment-id>"
 *   data-pcc-doc-explorer-breadcrumb-current="<true|false>"
 *   data-pcc-doc-explorer-pane="<source-id>"
 *   data-pcc-doc-explorer-destination="<source-id>"
 *   data-pcc-doc-explorer-row="<node-id>"
 *   data-pcc-doc-explorer-row-kind="folder|category"
 *   data-pcc-doc-explorer-mpf-safety="true"
 */

import { useState, type FC } from 'react';
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
import styles from './PccDocumentControlExplorerShell.module.css';

const DESTINATION_ORDER: readonly DocumentExplorerSourceId[] = [
  'project-record',
  'my-project-files',
  'procore',
];

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
}

const BreadcrumbBand: FC<BreadcrumbBandProps> = ({ activeSourceId }) => {
  const isHome = activeSourceId === 'home';
  const homeMeta = DOCUMENT_EXPLORER_SOURCE_ROOTS.home;
  const activeMeta = DOCUMENT_EXPLORER_SOURCE_ROOTS[activeSourceId];
  return (
    <nav
      className={styles.breadcrumbBand}
      aria-label="Explorer location"
      data-pcc-doc-explorer-breadcrumbs="true"
    >
      <ol className={styles.breadcrumbList}>
        <li className={styles.breadcrumbItem}>
          <span
            className={styles.breadcrumbSegment}
            data-pcc-doc-explorer-breadcrumb="home"
            data-pcc-doc-explorer-breadcrumb-current={isHome ? 'true' : 'false'}
          >
            {homeMeta.label}
          </span>
        </li>
        {!isHome ? (
          <li className={styles.breadcrumbItem}>
            <span aria-hidden="true" className={styles.breadcrumbSeparator}>
              /
            </span>
            <span
              className={styles.breadcrumbSegment}
              data-pcc-doc-explorer-breadcrumb={activeSourceId}
              data-pcc-doc-explorer-breadcrumb-current="true"
            >
              {activeMeta.label}
            </span>
          </li>
        ) : null}
      </ol>
    </nav>
  );
};

interface HomePaneProps {
  readonly onSelect: (id: DocumentExplorerSourceId) => void;
}

const HomePane: FC<HomePaneProps> = ({ onSelect }) => (
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
  </section>
);

interface FolderListPaneProps {
  readonly sourceId: DocumentExplorerSourceId;
  readonly rowKind: 'folder' | 'category';
  readonly nodes: readonly IDocumentExplorerNode[];
  readonly affordanceHint: string;
}

const FolderListPane: FC<FolderListPaneProps> = ({ sourceId, rowKind, nodes, affordanceHint }) => (
  <section className={styles.pane} data-pcc-doc-explorer-pane={sourceId}>
    <ul className={styles.rowList}>
      {nodes.map((node) => (
        <li
          key={node.nodeId}
          className={styles.row}
          data-pcc-doc-explorer-row={node.nodeId}
          data-pcc-doc-explorer-row-kind={rowKind}
        >
          <span className={styles.rowLabel}>{node.displayLabel}</span>
          <span className={styles.rowAffordance}>{affordanceHint}</span>
        </li>
      ))}
    </ul>
  </section>
);

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

export const PccDocumentControlExplorerShell: FC = () => {
  const [activeSourceId, setActiveSourceId] = useState<DocumentExplorerSourceId>('home');

  const renderPane = (): JSX.Element => {
    switch (activeSourceId) {
      case 'home':
        return <HomePane onSelect={setActiveSourceId} />;
      case 'project-record':
        return (
          <FolderListPane
            sourceId="project-record"
            rowKind="folder"
            nodes={PROJECT_RECORD_TREE_ROOT.children ?? []}
            affordanceHint="Folder"
          />
        );
      case 'my-project-files':
        return <MyProjectFilesPane />;
      case 'procore':
        return (
          <FolderListPane
            sourceId="procore"
            rowKind="category"
            nodes={PROCORE_SOURCE_ROOT_NODE.children ?? []}
            affordanceHint="Procore category"
          />
        );
      default: {
        // exhaustive
        const exhaustive: never = activeSourceId;
        void exhaustive;
        return <HomePane onSelect={setActiveSourceId} />;
      }
    }
  };

  // Helper used only to ensure the source-root registry stays consumed
  // by this shell; supports future 10D consumers reading the full map.
  void DOCUMENT_EXPLORER_SOURCE_ROOT_NODE_MAP;

  return (
    <div className={styles.shell} data-pcc-doc-explorer="true">
      <SourceRail activeSourceId={activeSourceId} onSelect={setActiveSourceId} />
      <div className={styles.main}>
        <ContextHeader activeSourceId={activeSourceId} />
        <BreadcrumbBand activeSourceId={activeSourceId} />
        {renderPane()}
      </div>
    </div>
  );
};

export default PccDocumentControlExplorerShell;
