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
  PeopleCultureNotificationEvent,
  PeopleCultureRole,
  PeopleCultureRoleCapabilities,
} from '../../homepage/webparts/peopleCultureSplitContracts.js';
import { PEOPLE_CULTURE_CONTENT_FAMILIES } from '../../homepage/webparts/peopleCultureSplitContracts.js';
import {
  buildCompanionOverview,
  detectHomepageConflicts,
  hasPeopleCultureCapability,
  type ProfilePhotoResolver,
} from '../../homepage/helpers/peopleCultureSplitModel.js';
import {
  generateMilestoneCandidates,
  type PeopleSourceRecord,
} from '../../homepage/helpers/peopleCultureMilestoneGenerator.js';
import { buildPeopleCultureNotifications } from '../../homepage/helpers/peopleCultureNotificationBuilder.js';
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
import { NotificationsSection } from './sections/NotificationsSection.js';
import { IntakeSection } from './sections/IntakeSection.js';
import { QuickEditDrawer } from './editing/QuickEditDrawer.js';
import { FullEditor } from './editing/FullEditor.js';
import { PreviewPanel } from './preview/PreviewPanel.js';
import { COMPANION_COLORS } from './companionStyles.js';

export type CompanionTabKey =
  | 'overview'
  | 'announcement'
  | 'celebrationMilestone'
  | 'cultureProgramEvent'
  | 'approvals'
  | 'homepage'
  | 'notifications'
  | 'intake'
  | 'preview';

const COMPANION_TABS: ReadonlyArray<{ key: CompanionTabKey; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'announcement', label: 'Announcements' },
  { key: 'celebrationMilestone', label: 'Celebrations / Milestones' },
  { key: 'cultureProgramEvent', label: 'Culture Programs / Events' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'homepage', label: 'Homepage' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'intake', label: 'Intake' },
  { key: 'preview', label: 'Preview' },
];

/**
 * Capability gate per reducer action type. An action whose required
 * capability is absent for the current role is no-opped by the
 * dispatch guard inside PeopleCultureCompanion. Actions without a
 * required capability (internal state bookkeeping) always pass.
 */
const ACTION_CAPABILITY_REQUIREMENTS: Partial<
  Record<CompanionAction['type'], keyof PeopleCultureRoleCapabilities>
> = {
  updateItem: 'canEdit',
  approveItem: 'canApprove',
  rejectItem: 'canResolveApprovals',
  claimApproval: 'canClaimApproval',
  reassignApproval: 'canReassignApproval',
  suppressItem: 'canSuppress',
  archiveItem: 'canUnpublish',
  pinItem: 'canPin',
  setHomepageTier: 'canManageHomepage',
  acceptMilestoneCandidate: 'canResolveApprovals',
  suppressMilestoneCandidate: 'canSuppress',
  promoteIntake: 'canResolveApprovals',
  declineIntake: 'canResolveApprovals',
  returnIntakeForChanges: 'canResolveApprovals',
};

export interface PeopleCultureCompanionProps {
  config?: Record<string, unknown>;
  splitConfig?: Partial<PeopleCultureCompanionConfig>;
  identity?: HomepageIdentityInput;
  assetBaseUrl?: string;
  /**
   * Profile-photo resolver used by the multi-context preview panel
   * and by the eventual content-family surfaces that render media.
   * When omitted, `profilePhoto` sources fall through to
   * placeholders — matching the same fail-closed behavior as the
   * public webpart runtime.
   */
  profilePhotoResolver?: ProfilePhotoResolver;
  /**
   * Optional trusted people-source snapshot. When supplied, the
   * companion seeds the milestone candidate queue at mount time via
   * `generateMilestoneCandidates`, deduping against any candidates
   * already present in the split config. Real persistence lands in
   * a later prompt; for now the generated candidates live in the
   * companion's internal reducer alongside HR-authored candidates.
   */
  peopleSource?: ReadonlyArray<PeopleSourceRecord>;
  /**
   * Forward window (in days) for the milestone generator. Defaults
   * to 14. Ignored unless `peopleSource` is supplied.
   */
  milestoneWindowDays?: number;
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
  | { type: 'promoteIntake'; payload: { id: string; reviewerId: string; reviewerName: string; now: string; notes?: string } }
  | { type: 'declineIntake'; payload: { id: string; reviewerId: string; reviewerName: string; now: string; notes?: string } }
  | { type: 'returnIntakeForChanges'; payload: { id: string; reviewerId: string; reviewerName: string; now: string; notes: string } }
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
      const { id, reviewerId, reviewerName, now, notes } = action.payload;
      return {
        ...state,
        intakeSubmissions: state.intakeSubmissions.map((s) =>
          s.id === id
            ? {
                ...s,
                reviewState: 'acceptedIntoDraft',
                reviewedBy: { id: reviewerId, displayName: reviewerName },
                reviewedAt: now,
                reviewNotes: notes ?? s.reviewNotes,
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
    case 'returnIntakeForChanges': {
      const { id, reviewerId, reviewerName, now, notes } = action.payload;
      return {
        ...state,
        intakeSubmissions: state.intakeSubmissions.map((s) =>
          s.id === id
            ? {
                ...s,
                reviewState: 'returnedForChanges',
                reviewedBy: { id: reviewerId, displayName: reviewerName },
                reviewedAt: now,
                reviewNotes: notes,
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

interface InitialStateOptions {
  peopleSource?: ReadonlyArray<PeopleSourceRecord>;
  milestoneWindowDays?: number;
  now?: Date;
}

function initialState(
  config: PeopleCultureCompanionConfig,
  options: InitialStateOptions = {},
): CompanionState {
  const seedCandidates = config.milestoneCandidates ?? [];
  const generated =
    options.peopleSource && options.peopleSource.length > 0
      ? generateMilestoneCandidates(options.peopleSource, {
          referenceDate: options.now,
          windowDays: options.milestoneWindowDays,
          dedupeAgainst: seedCandidates,
        })
      : [];
  return {
    items: config.items ?? [],
    milestoneCandidates: [...seedCandidates, ...generated],
    intakeSubmissions: config.intakeSubmissions ?? [],
  };
}

export function PeopleCultureCompanion({
  config,
  splitConfig,
  identity,
  profilePhotoResolver,
  peopleSource,
  milestoneWindowDays,
}: PeopleCultureCompanionProps): React.JSX.Element {
  const resolvedConfig = React.useMemo(
    () => resolveCompanionConfig(splitConfig, config),
    [config, splitConfig],
  );

  const initialStateOptions = React.useMemo<InitialStateOptions>(
    () => ({ peopleSource, milestoneWindowDays }),
    [peopleSource, milestoneWindowDays],
  );

  const [state, rawDispatch] = React.useReducer(
    companionReducer,
    undefined,
    () => initialState(resolvedConfig, initialStateOptions),
  );

  const [activeTab, setActiveTab] = React.useState<CompanionTabKey>('overview');
  const [selectedItemId, setSelectedItemId] = React.useState<string | undefined>();
  const [fullEditorItemId, setFullEditorItemId] = React.useState<string | undefined>();

  const currentUserRole: PeopleCultureRole = resolvedConfig.currentUserRole ?? 'approver';

  /**
   * Capability-gated dispatch. Actions that require a capability the
   * current role does not have are silently dropped so UI gating can
   * never be bypassed by direct dispatch from a test or future code.
   * Actions without a required capability (replaceState, internal
   * bookkeeping) always pass.
   */
  const dispatch = React.useCallback(
    (action: CompanionAction): void => {
      const required = ACTION_CAPABILITY_REQUIREMENTS[action.type];
      if (required && !hasPeopleCultureCapability(currentUserRole, required)) {
        return;
      }
      rawDispatch(action);
    },
    [currentUserRole],
  );

  // Keep reducer state in sync when the incoming config changes. The
  // replaceState action has no capability requirement so it always
  // runs through the guarded dispatch without being blocked.
  const configRef = React.useRef(resolvedConfig);
  React.useEffect(() => {
    if (configRef.current !== resolvedConfig) {
      configRef.current = resolvedConfig;
      dispatch({
        type: 'replaceState',
        payload: initialState(resolvedConfig, initialStateOptions),
      });
    }
  }, [resolvedConfig, initialStateOptions, dispatch]);
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

  const notificationEvents: PeopleCultureNotificationEvent[] = React.useMemo(
    () => buildPeopleCultureNotifications(state.items, { emittedAt: nowIso }),
    [state.items, nowIso],
  );

  // Propagate detected conflicts onto the items the companion renders,
  // so preview frames, approval rows, and homepage rows all agree about
  // which items are currently conflicted without the reducer persisting
  // transient conflict state.
  const itemsWithConflicts = React.useMemo(
    () =>
      state.items.map((item) => {
        const reason = homepageConflicts.get(item.id);
        const currentReason = item.homepage.conflictReason;
        if (reason === currentReason) return item;
        if (!reason && !currentReason) return item;
        return {
          ...item,
          homepage: {
            ...item.homepage,
            conflictReason: reason,
          },
        };
      }),
    [state.items, homepageConflicts],
  );

  const selectedItem = React.useMemo(
    () => (selectedItemId ? itemsWithConflicts.find((item) => item.id === selectedItemId) : undefined),
    [selectedItemId, itemsWithConflicts],
  );

  const fullEditorItem = React.useMemo(
    () => (fullEditorItemId ? itemsWithConflicts.find((item) => item.id === fullEditorItemId) : undefined),
    [fullEditorItemId, itemsWithConflicts],
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

      {currentUserRole === 'editor' ? (
        <div
          role="note"
          data-hbc-companion-banner="editor-read-only"
          style={{
            padding: '10px 24px',
            background: COMPANION_COLORS.surfaceMuted,
            borderBottom: `1px solid ${COMPANION_COLORS.surfaceLine}`,
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: COMPANION_COLORS.inkMuted,
          }}
        >
          You are signed in as an Editor. Approval, pin/tier, suppress/archive,
          and intake triage actions are read-only for your role.
        </div>
      ) : null}

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
          onNavigateToNotifications={() => setActiveTab('notifications')}
          onNavigateToIntake={() => setActiveTab('intake')}
          notificationsCount={notificationEvents.length}
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

      {activeTab === 'notifications' ? (
        <NotificationsSection
          events={notificationEvents}
          currentUserRole={currentUserRole}
          currentUserEmail={identity?.email}
          currentUserId={reviewerId}
        />
      ) : null}

      {activeTab === 'intake' ? (
        <IntakeSection
          submissions={state.intakeSubmissions}
          currentUserRole={currentUserRole}
          onPromote={(id, notes) =>
            dispatch({
              type: 'promoteIntake',
              payload: { id, reviewerId, reviewerName, now: nowIso, notes },
            })
          }
          onDecline={(id, notes) =>
            dispatch({
              type: 'declineIntake',
              payload: { id, reviewerId, reviewerName, now: nowIso, notes },
            })
          }
          onReturnForChanges={(id, notes) =>
            dispatch({
              type: 'returnIntakeForChanges',
              payload: { id, reviewerId, reviewerName, now: nowIso, notes },
            })
          }
        />
      ) : null}

      {contentFamilyKeys.has(activeTab as PeopleCultureContentFamily) ? (
        <ContentFamilySection
          family={activeTab as PeopleCultureContentFamily}
          items={itemsWithConflicts.filter((item) => item.family === activeTab)}
          profilePhotoResolver={profilePhotoResolver}
          onSelect={(id) => setSelectedItemId(id)}
          onOpenFullEditor={(id) => setFullEditorItemId(id)}
          onPreview={(id) => {
            setSelectedItemId(id);
            setActiveTab('preview');
          }}
        />
      ) : null}

      {activeTab === 'approvals' ? (
        <ApprovalsSection
          items={itemsWithConflicts.filter((item) => item.lifecycleState === 'needsApproval')}
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
          items={itemsWithConflicts}
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

      {activeTab === 'preview' ? (
        <PreviewPanel
          item={selectedItem}
          profilePhotoResolver={profilePhotoResolver}
        />
      ) : null}

      {selectedItem && activeTab !== 'preview' ? (
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
