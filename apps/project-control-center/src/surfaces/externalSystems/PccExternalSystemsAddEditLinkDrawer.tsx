/**
 * PCC External Systems — Add/Edit Project Link drawer (Phase 3 / Wave 15 / Prompt 06).
 *
 * Inert preview-only drawer for the Wave 15 "Add/Edit Project Link"
 * future-command intent. The drawer:
 *
 *   - manages all field state locally via `useState`;
 *   - has no `<form onSubmit>`, no save handler, no fetch, no persistence;
 *   - renders a live URL-policy preview by calling the pure
 *     `evaluateExternalUrlPolicy` helper from `@hbc/models/pcc`;
 *   - exposes a single command button that is **always disabled**, with
 *     visible reason text and `aria-disabled="true"`;
 *   - is rendered via React portal to `document.body` so the bento
 *     direct-child invariant on the surface is unaffected.
 *
 * Modal lifecycle uses neutral "dismiss" naming (`onDismiss`,
 * `handleDismiss`, `requestDismiss`) — never `close()` / `onClose` —
 * so the surface module source-scan can forbid command terms without
 * false-positives on natural modal dismissal.
 *
 * Forward note for the next active-launch prompt: URL policy must be
 * re-evaluated at the open boundary (or formally documented as
 * backend-authoritative with tests) before any active launch is enabled.
 * The read-model `urlPolicyState` snapshot consumed by Project Launch
 * Links is necessary but not sufficient; the canonical check happens
 * against `evaluateExternalUrlPolicy` here in the drawer preview today,
 * and against the same helper at click time later.
 */

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FC,
  type KeyboardEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  EXTERNAL_LAUNCHER_TYPES,
  EXTERNAL_SYSTEM_KEYS,
  evaluateExternalUrlPolicy,
  type ExternalLauncherType,
  type ExternalSystemKey,
  type IEvaluateExternalUrlPolicyResult,
} from '@hbc/models/pcc';
import { PccStatusPill, type PccStatusPillTone } from '../../ui/PccStatusPill';
import type {
  IPccLaunchPadRoleActionVisibility,
  PccLaunchPadActionDecision,
} from './launchPadViewModel';
import styles from './PccExternalSystemsSurface.module.css';

const DEFAULT_SYSTEM_KEY: ExternalSystemKey = 'sharepoint';
const DEFAULT_LINK_TYPE: ExternalLauncherType = 'system';

const DRAWER_HEADING_ID = 'pcc-external-systems-add-edit-link-drawer-heading';

// Default to a non-approval-gated system so the URL-policy preview reaches
// scheme / host / credential-like / approved-domains branches naturally as
// the user types. Toggling `Requires approval` ON exercises the
// `custom-link-requires-approval` branch; toggling `linkType` to 'custom'
// is the conventional pairing.
const DEFAULT_DRAFT = {
  title: '',
  launchUrl: '',
  systemKey: DEFAULT_SYSTEM_KEY,
  linkType: DEFAULT_LINK_TYPE,
  providerName: '',
  requiresApproval: false,
  openInNewTab: true,
} as const;

type DrawerDraft = {
  title: string;
  launchUrl: string;
  systemKey: ExternalSystemKey;
  linkType: ExternalLauncherType;
  providerName: string;
  requiresApproval: boolean;
  openInNewTab: boolean;
};

export interface PccExternalSystemsAddEditLinkDrawerProps {
  readonly isOpen: boolean;
  readonly onDismiss: () => void;
  readonly returnFocusRef: React.RefObject<HTMLElement | null>;
  readonly roleActionVisibility: IPccLaunchPadRoleActionVisibility;
}

function policyTone(reason: string, isAllowed: boolean): PccStatusPillTone {
  if (isAllowed) return 'success';
  if (reason === 'invalid-url' || reason === 'policy-unavailable') return 'neutral';
  return 'warning';
}

function getCommandDisabledReason(
  visibility: IPccLaunchPadRoleActionVisibility,
  linkType: ExternalLauncherType,
): { reason: string; decision: PccLaunchPadActionDecision | undefined } {
  const actionId =
    linkType === 'custom'
      ? 'create-custom-link-draft'
      : linkType === 'progress-camera'
        ? 'create-progress-camera-link'
        : linkType === 'ahj-portal' || linkType === 'private-provider-portal'
          ? 'create-permitting-link'
          : 'create-custom-link-draft';
  const decision = visibility[actionId];
  if (decision === 'deny') {
    return {
      reason: `Viewer role does not have ${actionId} action.`,
      decision,
    };
  }
  return {
    reason: 'Save is not available in this view.',
    decision,
  };
}

function focusableSelectors(): string {
  return [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
}

export const PccExternalSystemsAddEditLinkDrawer: FC<PccExternalSystemsAddEditLinkDrawerProps> = ({
  isOpen,
  onDismiss,
  returnFocusRef,
  roleActionVisibility,
}) => {
  const [draft, setDraft] = useState<DrawerDraft>({ ...DEFAULT_DRAFT });
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);

  const handleDismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  // Move focus to drawer heading on open; restore focus to trigger on close.
  // useLayoutEffect runs synchronously after DOM mutations and portal commit,
  // so the heading ref is populated before any paint frame can intercept.
  useLayoutEffect(() => {
    if (!isOpen) return;
    headingRef.current?.focus();
    return () => {
      const el = returnFocusRef.current;
      if (el && typeof el.focus === 'function') {
        el.focus();
      }
    };
  }, [isOpen, returnFocusRef]);

  // Escape dismisses; window-scoped so any focus inside drawer triggers it.
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: globalThis.KeyboardEvent): void => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleDismiss]);

  const policy: IEvaluateExternalUrlPolicyResult = useMemo(
    () =>
      evaluateExternalUrlPolicy({
        candidateUrl: draft.launchUrl,
        systemKey: draft.systemKey,
        linkType: draft.linkType,
        requiresApproval: draft.requiresApproval,
        isIframeContext: false,
        isCurrentImageContext: false,
      }),
    [draft.launchUrl, draft.systemKey, draft.linkType, draft.requiresApproval],
  );

  const { reason: commandReason } = getCommandDisabledReason(roleActionVisibility, draft.linkType);

  const handleTabKey = (e: KeyboardEvent<HTMLDivElement>): void => {
    if (e.key !== 'Tab' || !drawerRef.current) return;
    const focusables = Array.from(
      drawerRef.current.querySelectorAll<HTMLElement>(focusableSelectors()),
    ).filter((el) => !el.hasAttribute('aria-hidden'));
    if (focusables.length === 0) return;
    const first = focusables[0]!;
    const last = focusables[focusables.length - 1]!;
    const active = document.activeElement as HTMLElement | null;
    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={styles.drawerOverlay}
      data-pcc-launch-pad-drawer-overlay=""
      onClick={handleDismiss}
    >
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={DRAWER_HEADING_ID}
        className={styles.drawer}
        data-pcc-launch-pad-drawer="add-edit-link"
        data-pcc-launch-pad-lane="add-edit-link-drawer"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleTabKey}
      >
        <header className={styles.drawerHeader}>
          <h3 id={DRAWER_HEADING_ID} ref={headingRef} tabIndex={-1} className={styles.drawerTitle}>
            Add or edit project launch link
          </h3>
          <button
            type="button"
            className={styles.drawerDismiss}
            onClick={handleDismiss}
            data-pcc-launch-pad-drawer-dismiss="header"
            aria-label="Dismiss drawer"
          >
            Dismiss
          </button>
        </header>
        <div className={styles.drawerBody}>
          <p className={styles.drawerLead}>
            Field values stay local. Saving is managed by your PCC administrator.
          </p>

          <div className={styles.drawerField}>
            <label htmlFor="pcc-launch-pad-drawer-title">Link title</label>
            <input
              id="pcc-launch-pad-drawer-title"
              type="text"
              value={draft.title}
              onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
              data-pcc-launch-pad-drawer-field="title"
              autoComplete="off"
            />
          </div>

          <div className={styles.drawerField}>
            <label htmlFor="pcc-launch-pad-drawer-url">Launch URL</label>
            <input
              id="pcc-launch-pad-drawer-url"
              type="url"
              value={draft.launchUrl}
              onChange={(e) => setDraft((d) => ({ ...d, launchUrl: e.target.value }))}
              data-pcc-launch-pad-drawer-field="launchUrl"
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className={styles.drawerField}>
            <label htmlFor="pcc-launch-pad-drawer-system">System</label>
            <select
              id="pcc-launch-pad-drawer-system"
              value={draft.systemKey}
              onChange={(e) =>
                setDraft((d) => ({ ...d, systemKey: e.target.value as ExternalSystemKey }))
              }
              data-pcc-launch-pad-drawer-field="systemKey"
            >
              {EXTERNAL_SYSTEM_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.drawerField}>
            <label htmlFor="pcc-launch-pad-drawer-link-type">Link type</label>
            <select
              id="pcc-launch-pad-drawer-link-type"
              value={draft.linkType}
              onChange={(e) =>
                setDraft((d) => ({
                  ...d,
                  linkType: e.target.value as ExternalLauncherType,
                }))
              }
              data-pcc-launch-pad-drawer-field="linkType"
            >
              {EXTERNAL_LAUNCHER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.drawerField}>
            <label htmlFor="pcc-launch-pad-drawer-provider">Provider name</label>
            <input
              id="pcc-launch-pad-drawer-provider"
              type="text"
              value={draft.providerName}
              onChange={(e) => setDraft((d) => ({ ...d, providerName: e.target.value }))}
              data-pcc-launch-pad-drawer-field="providerName"
              autoComplete="off"
            />
          </div>

          <div className={styles.drawerCheckRow}>
            <label>
              <input
                type="checkbox"
                checked={draft.requiresApproval}
                onChange={(e) => setDraft((d) => ({ ...d, requiresApproval: e.target.checked }))}
                data-pcc-launch-pad-drawer-field="requiresApproval"
              />
              Requires approval
            </label>
            <label>
              <input
                type="checkbox"
                checked={draft.openInNewTab}
                onChange={(e) => setDraft((d) => ({ ...d, openInNewTab: e.target.checked }))}
                data-pcc-launch-pad-drawer-field="openInNewTab"
              />
              Opens in new tab
            </label>
          </div>

          <section
            className={styles.policyPreview}
            data-pcc-launch-pad-drawer-policy-preview=""
            aria-live="polite"
          >
            <h4 className={styles.policyPreviewTitle}>URL policy check</h4>
            <div
              className={styles.policyPreviewRow}
              data-pcc-launch-pad-drawer-policy-reason={policy.reason}
              data-pcc-launch-pad-drawer-policy-allowed={policy.isAllowed ? 'true' : 'false'}
            >
              <PccStatusPill tone={policyTone(policy.reason, policy.isAllowed)}>
                {policy.isAllowed ? 'Allowed' : 'Blocked'}
              </PccStatusPill>
              <span className={styles.policyPreviewReason}>{policy.reason}</span>
            </div>
            {policy.hostname ? (
              <p
                className={styles.policyPreviewMeta}
                data-pcc-launch-pad-drawer-policy-hostname={policy.hostname}
              >
                Host: {policy.hostname}
              </p>
            ) : null}
            {policy.detectedCredentialLikeParams &&
            policy.detectedCredentialLikeParams.length > 0 ? (
              <p
                className={styles.policyPreviewMeta}
                data-pcc-launch-pad-drawer-policy-credential-params=""
              >
                Detected credential-like params: {policy.detectedCredentialLikeParams.join(', ')}
              </p>
            ) : null}
          </section>

          <section className={styles.validationSummary} data-pcc-launch-pad-drawer-validation="">
            <h4 className={styles.validationSummaryTitle}>Validation summary</h4>
            <ul>
              <li
                data-pcc-launch-pad-drawer-validation-rule="title-required"
                data-pcc-launch-pad-drawer-validation-state={
                  draft.title.trim().length > 0 ? 'ok' : 'missing'
                }
              >
                Title required
              </li>
              <li
                data-pcc-launch-pad-drawer-validation-rule="launch-url-required"
                data-pcc-launch-pad-drawer-validation-state={
                  draft.launchUrl.trim().length > 0 ? 'ok' : 'missing'
                }
              >
                Launch URL required
              </li>
              <li
                data-pcc-launch-pad-drawer-validation-rule="url-policy"
                data-pcc-launch-pad-drawer-validation-state={policy.isAllowed ? 'ok' : 'blocked'}
              >
                URL policy: {policy.reason}
              </li>
            </ul>
          </section>
        </div>

        <footer className={styles.drawerFooter}>
          <button
            type="button"
            disabled
            aria-disabled="true"
            className={styles.drawerCommand}
            data-pcc-launch-pad-drawer-command="future-only"
            data-pcc-launch-pad-drawer-command-state="preview-disabled"
          >
            Save not available
          </button>
          <span className={styles.drawerCommandReason} data-pcc-launch-pad-drawer-command-reason="">
            {commandReason}
          </span>
          <button
            type="button"
            className={styles.drawerDismissSecondary}
            onClick={handleDismiss}
            data-pcc-launch-pad-drawer-dismiss="footer"
          >
            Dismiss
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
};

export default PccExternalSystemsAddEditLinkDrawer;
