/**
 * PeopleCultureCompanion — HR operating companion webpart runtime.
 *
 * Phase-14 pc/ Prompt-03 (HR Operating Companion Webpart).
 *
 * This is the dedicated content-operations console for the
 * non-recognition People & Culture product surface. It does not own
 * HB Kudos moderation, it is not a general employee-directory admin
 * tool, and it must not import from `hbKudos/` or
 * `hbKudosCompanion/`.
 *
 * Top-level surfaces (tabs):
 *   - Overview
 *   - Announcements            — content-family tab
 *   - Celebrations / Milestones — content-family tab
 *   - Culture Programs / Events — content-family tab
 *   - Approvals                — global cross-family inbox
 *   - Homepage                 — lightweight governance surface
 *
 * Inside each content-family tab the agent surfaces the eight
 * lifecycle views required by the Decision-Lock Appendix (Draft,
 * Needs Approval, Scheduled, Live, Expiring Soon, Expired, Archived,
 * Suppressed) and an optional Calendar mode for scheduled / live
 * planning. A shared quick-edit drawer provides fast operational
 * edits; a richer full-editor modal opens for deeper authoring.
 *
 * Data flow: the companion receives `PeopleCultureCompanionConfig`
 * (Prompt-01 split contract) via its `splitConfig` prop. An internal
 * reducer mirrors the config into mutable state so HR actions (quick
 * edit, approval, claim, reassign, homepage override, milestone
 * candidate review, intake triage) apply immediately. Real SharePoint
 * persistence is intentionally deferred to a later prompt once the
 * operating-list schemas are extracted; the reducer actions give the
 * companion a fully interactive front-end that downstream persistence
 * can hook into without reshaping the component tree.
 *
 * Related files:
 *   - `./sections/OverviewSection.tsx`
 *   - `./sections/ContentFamilySection.tsx`
 *   - `./sections/ApprovalsSection.tsx`
 *   - `./sections/HomepageSection.tsx`
 *   - `./editing/QuickEditDrawer.tsx`
 *   - `./editing/FullEditor.tsx`
 *   - `../../homepage/webparts/peopleCultureSplitContracts.ts`
 *   - `../../homepage/helpers/peopleCultureSplitModel.ts`
 */

import * as React from 'react';
import type {
  PeopleCultureCompanionConfig,
  PeopleCultureCompanionOverview,
  PeopleCultureContentFamily,
  PeopleCultureIntakeSubmission,
  PeopleCultureItem,
  PeopleCultureMilestoneCandidate,
  PeopleCultureRole,
} from '../../homepage/webparts/peopleCultureSplitContracts.js';
import { PEOPLE_CULTURE_CONTENT_FAMILIES } from '../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  buildCompanionOverview,
  detectHomepageConflicts,
} from '../../homepage/helpers/peopleCultureSplitModel.js';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import {
  COMPANION_EYEBROW_STYLE,
  COMPANION_HEADER_STYLE,
  COMPANION_HEADING_STYLE,
  COMPANION_ROOT_STYLE,
  TAB_BUTTON_ACTIVE_STYLE,
  TAB_BUTTON_STYLE,
  TAB_ROW_STYLE,
} from './companionStyles.js';
import { OverviewSection } from './sections/OverviewSection.js';
import { ContentFamilySection } from './sections/ContentFamilySection.js';
import { ApprovalsSection } from './sections/ApprovalsSection.js';
import { HomepageSection } from './sections/HomepageSection.js';
import { QuickEditDrawer } from './editing/QuickEditDrawer.js';
import { FullEditor } from './editing/FullEditor.js';

export type CompanionTabKey =
  | 'overview'
  | 'announcement'
  | 'celebrationMilestone'
  | 'cultureProgramEvent'
  | 'approvals'
  | 'homepage';

const COMPANION_TABS: ReadonlyArray<{ key: CompanionTabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'celebrationMilestone', label: 'Celebrations / Milestones' },
  { key: 'cultureProgramEvent', label: 'Culture Programs / Events' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'homepage', label: 'Homepage' },
];

export interface PeopleCultureCompanionProps {
  config?: Record<string, unknown>;
  splitConfig?: Partial<PeopleCultureCompanionConfig>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
}

interface CompanionState {
  items: PeopleCultureItem[];
  milestoneCandidates: PeopleCultureMilestoneCandidate[];
  intakeSubmissions: PeopleCultureIntakeSubmission[];
}

type CompanionAction =
  | { type: 'updateItem'; payload: { id: string; patch: Partial<PeopleCultureItem> } }
  | { type: 'approveItem'; payload: { id: string; approverId: string; approverName: string; now: string } }
  | { type: 'rejectItem'; payload: { id: string; now: string } }
  | { type: 'claimApproval'; payload: { id: string; ownerId: string; ownerName: string } }
  | { type: 'reassignApproval'; payload: { id: string; ownerId: string; ownerName: string } }
  | { type: 'suppressItem'; payload: { id: string; now: string } }
  | { type: 'archiveItem'; payload: { id: string; now: string } }
  | { type: 'pinItem'; payload: { id: string; pinned: boolean } }
  | { type: 'setHomepageTier'; payload: { id: string; tier: PeopleCultureItem['homepage']['tier']; hrOverride: boolean } }
  | { type: 'acceptMilestoneCandidate'; payload: { id: string; reviewerId: string; reviewerName: string; now: string } }
  | { type: 'suppressMilestoneCandidate'; payload: { id: string; reviewerId: string; reviewerName: string; now: string } }
  | { type: 'promoteIntake'; payload: { id: string; reviewerId: string; reviewerName: string; now: string } }
  | { type: 'declineIntake'; payload: { id: string; reviewerId: string; reviewerName: string; now: string; notes?: string } }
  | { type: 'replaceState'; payload: CompanionState };

function companionReducer(state: CompanionState, action: CompanionAction): CompanionState {
  switch (action.type) {
    case 'updateItem': {
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id ? { ...item, ...action.payload.patch } : item,
        ),
      };
    }
    case 'approveItem': {
      const { id, approverId, approverName, now } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                approvedBy: { id: approverId, displayName: approverName },
                approvedAt: now,
                lifecycleState: item.scheduledStart ? 'scheduled' : 'live',
                publishedAt: item.scheduledStart ? item.publishedAt : now,
              }
            : item,
        ),
      };
    }
    case 'rejectItem': {
      const { id, now } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? { ...item, lifecycleState: 'draft', approvedAt: undefined, approvedBy: undefined, submittedAt: now }
            : item,
        ),
      };
    }
    case 'claimApproval':
    case 'reassignApproval': {
      // Claim/reassign metadata is modeled as tags in v1; a real schema
      // will get a dedicated `approvalOwner` field in a later prompt.
      const { id, ownerName } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                tags: Array.from(
                  new Set([
                    ...(item.tags ?? []).filter((t) => !t.startsWith('approval-owner:')),
                    `approval-owner:${ownerName}`,
                  ]),
                ),
              }
            : item,
        ),
      };
    }
    case 'suppressItem': {
      const { id, now } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, suppressedAt: now, lifecycleState: 'suppressed' } : item,
        ),
      };
    }
    case 'archiveItem': {
      const { id, now } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id ? { ...item, archivedAt: now, lifecycleState: 'archived' } : item,
        ),
      };
    }
    case 'pinItem': {
      const { id, pinned } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                homepage: {
                  ...item.homepage,
                  isPinned: pinned,
                  overrideSource: 'hrOverride',
                },
                approvalTrigger: pinned ? 'homepagePinned' : item.approvalTrigger,
              }
            : item,
        ),
      };
    }
    case 'setHomepageTier': {
      const { id, tier, hrOverride } = action.payload;
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === id
            ? {
                ...item,
                homepage: {
                  ...item.homepage,
                  tier,
                  overrideSource: hrOverride ? 'hrOverride' : 'systemDefault',
                },
              }
            : item,
        ),
      };
    }
    case 'acceptMilestoneCandidate': {
      const { id, reviewerId, reviewerName, now } = action.payload;
      return {
        ...state,
        milestoneCandidates: state.milestoneCandidates.map((c) =>
          c.id === id
            ? {
                ...c,
                reviewState: 'accepted',
                reviewedBy: { id: reviewerId, displayName: reviewerName },
                reviewedAt: now,
              }
            : c,
        ),
      };
    }
    case 'suppressMilestoneCandidate': {
      const { id, reviewerId, reviewerName, now } = action.payload;
      return {
        ...state,
        milestoneCandidates: state.milestoneCandidates.map((c) =>
          c.id === id
            ? {
                ...c,
                reviewState: 'suppressed',
                reviewedBy: { id: reviewerId, displayName: reviewerName },
                reviewedAt: now,
              }
            : c,
        ),
      };
    }
    case 'promoteIntake': {
      const { id, reviewerId, reviewerName, now } = action.payload;
      return {
        ...state,
        intakeSubmissions: state.intakeSubmissions.map((s) =>
          s.id === id
            ? {
                ...s,
                reviewState: 'acceptedIntoDraft',
                reviewedBy: { id: reviewerId, displayName: reviewerName },
                reviewedAt: now,
              }
            : s,
        ),
      };
    }
    case 'declineIntake': {
      const { id, reviewerId, reviewerName, now, notes } = action.payload;
      return {
        ...state,
        intakeSubmissions: state.intakeSubmissions.map((s) =>
          s.id === id
            ? {
                ...s,
                reviewState: 'declined',
                reviewedBy: { id: reviewerId, displayName: reviewerName },
                reviewedAt: now,
                reviewNotes: notes ?? s.reviewNotes,
              }
            : s,
        ),
      };
    }
    case 'replaceState':
      return action.payload;
    default:
      return state;
  }
}

function isCompanionConfig(value: unknown): value is Partial<PeopleCultureCompanionConfig> {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<PeopleCultureCompanionConfig>;
  return (
    Array.isArray(maybe.items) ||
    Array.isArray(maybe.milestoneCandidates) ||
    Array.isArray(maybe.intakeSubmissions) ||
    typeof maybe.heading === 'string' ||
    typeof maybe.currentUserRole === 'string'
  );
}

function resolveCompanionConfig(
  splitConfig: Partial<PeopleCultureCompanionConfig> | undefined,
  rawConfig: Record<string, unknown> | undefined,
): PeopleCultureCompanionConfig {
  if (splitConfig && Array.isArray(splitConfig.items)) {
    return {
      heading: splitConfig.heading,
      items: splitConfig.items,
      milestoneCandidates: splitConfig.milestoneCandidates ?? [],
      intakeSubmissions: splitConfig.intakeSubmissions ?? [],
      currentUserRole: splitConfig.currentUserRole,
    };
  }
  if (isCompanionConfig(rawConfig)) {
    return {
      heading: rawConfig.heading,
      items: rawConfig.items ?? [],
      milestoneCandidates: rawConfig.milestoneCandidates ?? [],
      intakeSubmissions: rawConfig.intakeSubmissions ?? [],
      currentUserRole: rawConfig.currentUserRole,
    };
  }
  return {
    heading: undefined,
    items: [],
    milestoneCandidates: [],
    intakeSubmissions: [],
    currentUserRole: undefined,
  };
}

function initialState(config: PeopleCultureCompanionConfig): CompanionState {
  return {
    items: config.items ?? [],
    milestoneCandidates: config.milestoneCandidates ?? [],
    intakeSubmissions: config.intakeSubmissions ?? [],
  };
}

export function PeopleCultureCompanion({
  config,
  splitConfig,
  identity,
}: PeopleCultureCompanionProps): React.JSX.Element {
  const resolvedConfig = React.useMemo(
    () => resolveCompanionConfig(splitConfig, config),
    [config, splitConfig],
  );

  const [state, dispatch] = React.useReducer(
    companionReducer,
    resolvedConfig,
    initialState,
  );

  // Keep reducer state in sync when the incoming config changes.
  const configRef = React.useRef(resolvedConfig);
  React.useEffect(() => {
    if (configRef.current !== resolvedConfig) {
      configRef.current = resolvedConfig;
      dispatch({
        type: 'replaceState',
        payload: initialState(resolvedConfig),
      });
    }
  }, [resolvedConfig]);

  const [activeTab, setActiveTab] = React.useState<CompanionTabKey>('overview');
  const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>();
  const [fullEditorItemId, setFullEditorItemId] = React.useState<string | undefined>();

  const currentUserRole: PeopleCultureRole = resolvedConfig.currentUserRole ?? 'approver';
  const reviewerId = identity?.email ?? 'hr-operator';
  const reviewerName = identity?.displayName ?? 'HR Operator';
  const nowIso = React.useMemo(() => new Date().toISOString(), []);

  const overview: PeopleCultureCompanionOverview = React.useMemo(
    () =>
      buildCompanionOverview({
        items: state.items,
        milestoneCandidates: state.milestoneCandidates,
        intakeSubmissions: state.intakeSubmissions,
      }),
    [state.items, state.milestoneCandidates, state.intakeSubmissions],
  );

  const homepageConflicts = React.useMemo(
    () => detectHomepageConflicts(state.items),
    [state.items],
  );

  const selectedItem = React.useMemo(
    () => (selectedItemId ? state.items.find((item) => item.id === selectedItemId) : undefined),
    [selectedItemId, state.items],
  );

  const fullEditorItem = React.useMemo(
    () => (fullEditorItemId ? state.items.find((item) => item.id === fullEditorItemId) : undefined),
    [fullEditorItemId, state.items],
  );

  const heading = resolvedConfig.heading ?? 'People & Culture Operating Console';

  const contentFamilyKeys = new Set<PeopleCultureContentFamily>(
    PEOPLE_CULTURE_CONTENT_FAMILIES,
  );

  return (
    <section
      aria-label={heading}
      data-hbc-webpart="people-culture-companion"
      data-hbc-webpart-role={currentUserRole}
      data-hbc-companion-tab={activeTab}
      style={COMPANION_ROOT_STYLE}
    >
      <header style={COMPANION_HEADER_STYLE}>
        <div>
          <div style={COMPANION_EYEBROW_STYLE}>HR Operating Companion</div>
          <h2 style={COMPANION_HEADING_STYLE}>{heading}</h2>
        </div>
        <div style={COMPANION_EYEBROW_STYLE} aria-label="role">
          Role: {currentUserRole}
        </div>
      </header>

      <nav role="tablist" aria-label="Companion sections" style={TAB_ROW_STYLE}>
        {COMPANION_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            data-hbc-companion-tab-button={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={activeTab === tab.key ? TAB_BUTTON_ACTIVE_STYLE : TAB_BUTTON_STYLE}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === 'overview' ? (
        <OverviewSection
          overview={overview}
          onNavigateToApprovals={() => setActiveTab('approvals')}
          onNavigateToHomepage={() => setActiveTab('homepage')}
          onNavigateToFamily={(family) => setActiveTab(family)}
          onAcceptMilestone={(id) =>
            dispatch({
              type: 'acceptMilestoneCandidate',
              payload: { id, reviewerId, reviewerName, now: nowIso },
            })
          }
          onSuppressMilestone={(id) =>
            dispatch({
              type: 'suppressMilestoneCandidate',
              payload: { id, reviewerId, reviewerName, now: nowIso },
            })
          }
          onPromoteIntake={(id) =>
            dispatch({
              type: 'promoteIntake',
              payload: { id, reviewerId, reviewerName, now: nowIso },
            })
          }
          onDeclineIntake={(id) =>
            dispatch({
              type: 'declineIntake',
              payload: { id, reviewerId, reviewerName, now: nowIso },
            })
          }
        />
      ) : null}

      {contentFamilyKeys.has(activeTab as PeopleCultureContentFamily) ? (
        <ContentFamilySection
          family={activeTab as PeopleCultureContentFamily}
          items={state.items.filter((item) => item.family === activeTab)}
          onSelect={(id) => setSelectedItemId(id)}
          onOpenFullEditor={(id) => setFullEditorItemId(id)}
        />
      ) : null}

      {activeTab === 'approvals' ? (
        <ApprovalsSection
          items={state.items.filter((item) => item.lifecycleState === 'needsApproval')}
          currentUserRole={currentUserRole}
          currentUser={{ id: reviewerId, displayName: reviewerName }}
          onApprove={(id) =>
            dispatch({
              type: 'approveItem',
              payload: { id, approverId: reviewerId, approverName: reviewerName, now: nowIso },
            })
          }
          onReject={(id) => dispatch({ type: 'rejectItem', payload: { id, now: nowIso } })}
          onClaim={(id) =>
            dispatch({
              type: 'claimApproval',
              payload: { id, ownerId: reviewerId, ownerName: reviewerName },
            })
          }
          onReassign={(id, ownerName) =>
            dispatch({
              type: 'reassignApproval',
              payload: { id, ownerId: ownerName, ownerName },
            })
          }
        />
      ) : null}

      {activeTab === 'homepage' ? (
        <HomepageSection
          items={state.items}
          conflicts={homepageConflicts}
          currentUserRole={currentUserRole}
          onSetTier={(id, tier, hrOverride) =>
            dispatch({ type: 'setHomepageTier', payload: { id, tier, hrOverride } })
          }
          onTogglePinned={(id, pinned) =>
            dispatch({ type: 'pinItem', payload: { id, pinned } })
          }
        />
      ) : null}

      {selectedItem ? (
        <QuickEditDrawer
          item={selectedItem}
          onClose={() => setSelectedItemId(undefined)}
          onOpenFullEditor={() => {
            setFullEditorItemId(selectedItem.id);
            setSelectedItemId(undefined);
          }}
          onSubmit={(patch) => {
            dispatch({ type: 'updateItem', payload: { id: selectedItem.id, patch } });
            setSelectedItemId(undefined);
          }}
          onSuppress={() => {
            dispatch({ type: 'suppressItem', payload: { id: selectedItem.id, now: nowIso } });
            setSelectedItemId(undefined);
          }}
          onArchive={() => {
            dispatch({ type: 'archiveItem', payload: { id: selectedItem.id, now: nowIso } });
            setSelectedItemId(undefined);
          }}
        />
      ) : null}

      {fullEditorItem ? (
        <FullEditor
          item={fullEditorItem}
          onClose={() => setFullEditorItemId(undefined)}
          onSubmit={(patch) => {
            dispatch({ type: 'updateItem', payload: { id: fullEditorItem.id, patch } });
            setFullEditorItemId(undefined);
          }}
        />
      ) : null}
    </section>
  );
}

export type { PeopleCultureCompanionConfig };

// Exported for test use.
export { companionReducer as __companionReducer };
export type { CompanionAction as __CompanionAction, CompanionState as __CompanionState };
