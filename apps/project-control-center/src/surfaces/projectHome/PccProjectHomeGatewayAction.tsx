import { useId, type FC } from 'react';
import type { PccModuleId } from '@hbc/models/pcc';
import type { PccProjectHomeGatewayConfig } from './shared';
import styles from './PccProjectHome.module.css';

interface PccProjectHomeGatewayActionProps {
  readonly gateway: PccProjectHomeGatewayConfig;
  readonly onSelectModule?: (moduleId: PccModuleId) => void;
}

/**
 * Phase 06 Prompt 02 — Project Home card-level gateway action.
 *
 * Native `<button>` only — no anchor, no URL routing, no source-system
 * writeback. Disabled when `disabledReason` is set or when callback /
 * `moduleId` is missing; the disabled reason is rendered as visible text
 * and announced via `aria-describedby` (NOT tooltip-only).
 */
export const PccProjectHomeGatewayAction: FC<PccProjectHomeGatewayActionProps> = ({
  gateway,
  onSelectModule,
}) => {
  const reasonId = useId();
  const enabled = Boolean(gateway.moduleId && onSelectModule && !gateway.disabledReason);
  const stateMarker = enabled ? 'enabled' : 'disabled';
  const moduleMarker = gateway.moduleId ?? 'preview';

  // End-user-facing reason copy. If the gateway declares its own disabled
  // reason, surface it verbatim; otherwise (a configured module without
  // a wired callback — happens in isolated card render contexts only)
  // fall back to a product-grade preview-context line.
  const reason =
    gateway.disabledReason ??
    (gateway.moduleId && !onSelectModule
      ? 'Gateway action is unavailable in this preview context.'
      : undefined);

  const handleClick = () => {
    if (!enabled || !gateway.moduleId || !onSelectModule) return;
    onSelectModule(gateway.moduleId);
  };

  return (
    <span className={styles.gatewayAction} data-pcc-project-home-gateway="">
      <button
        type="button"
        className={styles.gatewayActionButton}
        disabled={!enabled}
        onClick={handleClick}
        aria-describedby={!enabled && reason ? reasonId : undefined}
        data-pcc-project-home-gateway-action={moduleMarker}
        data-pcc-project-home-gateway-label={gateway.label}
        data-pcc-project-home-gateway-state={stateMarker}
      >
        {gateway.label}
      </button>
      {!enabled && reason ? (
        <span
          id={reasonId}
          className={styles.gatewayActionReason}
          data-pcc-project-home-gateway-reason=""
        >
          {reason}
        </span>
      ) : null}
    </span>
  );
};

export default PccProjectHomeGatewayAction;
