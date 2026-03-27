import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  Card,
  CardHeader,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  HBC_STATUS_COLORS,
  HBC_SURFACE_LIGHT,
  HbcButton,
  Text,
  useDensity,
  HBC_DENSITY_TOKENS,
} from '@hbc/ui-kit';

import type { ProjectHubModulePostureSummary } from '../types.js';

// ── Posture color mapping using HBC tokens ──────────────────────────

const POSTURE_COLORS: Record<ProjectHubModulePostureSummary['posture'], string> = {
  healthy: HBC_STATUS_COLORS.success,
  watch: HBC_STATUS_COLORS.warning,
  'at-risk': HBC_STATUS_COLORS.atRisk,
  critical: HBC_STATUS_COLORS.critical,
  'no-data': HBC_STATUS_COLORS.neutral,
  'read-only': HBC_STATUS_COLORS.info,
};

// ── Styles ──────────────────────────────────────────────────────────

const useStyles = makeStyles({
  root: {
    flex: 1,
    overflow: 'auto',
    padding: `${HBC_SPACE_MD}px`,
  },
  rootComfortable: {
    padding: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  rootTouch: {
    padding: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
  },
  previewCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${HBC_SPACE_SM}px`,
  },
  postureHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: `${HBC_SPACE_SM}px`,
  },
  postureDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  metricsRow: {
    display: 'flex',
    gap: `${HBC_SPACE_MD}px`,
    flexWrap: 'wrap',
  },
  metricCard: {
    display: 'flex',
    flexDirection: 'column',
    padding: `${HBC_SPACE_SM}px`,
    backgroundColor: HBC_SURFACE_LIGHT['surface-1'],
    borderRadius: '4px',
    minWidth: '120px',
  },
  actionsRow: {
    display: 'flex',
    gap: `${HBC_SPACE_SM}px`,
    flexWrap: 'wrap',
    minHeight: `${HBC_DENSITY_TOKENS.compact.touchTargetMin}px`,
  },
  actionsRowComfortable: {
    minHeight: `${HBC_DENSITY_TOKENS.comfortable.touchTargetMin}px`,
    gap: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px`,
  },
  actionsRowTouch: {
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
  },
});

// ── Component ───────────────────────────────────────────────────────

export interface CanvasCenterProps {
  /** Injected canvas content (HbcProjectCanvas or project metadata). */
  readonly canvasSlot: ReactNode;
  /** Currently selected module from the command rail. */
  readonly selectedModule: ProjectHubModulePostureSummary | null;
  /** Called when the user wants to open the full module surface. */
  readonly onModuleOpen: (slug: string) => void;
}

export function CanvasCenter({
  canvasSlot,
  selectedModule,
  onModuleOpen,
}: CanvasCenterProps): ReactNode {
  const styles = useStyles();
  const { tier: densityTier } = useDensity();

  // No module selected — show the canvas
  if (!selectedModule) {
    return (
      <div
        data-testid="canvas-center"
        data-mode="canvas"
        className={mergeClasses(
          styles.root,
          densityTier === 'comfortable' && styles.rootComfortable,
          densityTier === 'touch' && styles.rootTouch,
        )}
      >
        {canvasSlot}
      </div>
    );
  }

  // Module selected — show preview
  return (
    <div
      data-testid="canvas-center"
      data-mode="module-preview"
      data-module={selectedModule.moduleSlug}
      className={mergeClasses(
        styles.root,
        densityTier === 'comfortable' && styles.rootComfortable,
        densityTier === 'touch' && styles.rootTouch,
      )}
    >
      <Card size="small">
        <CardHeader
          header={
            <div className={styles.postureHeader}>
              <span
                className={styles.postureDot}
                style={{ backgroundColor: POSTURE_COLORS[selectedModule.posture] }}
              />
              <Text weight="semibold">{selectedModule.label}</Text>
              <Text size={200} style={{ color: HBC_SURFACE_LIGHT['text-muted'], textTransform: 'capitalize' }}>
                {selectedModule.posture.replace('-', ' ')}
              </Text>
            </div>
          }
        />
        <div className={styles.previewCard}>
          <div className={styles.metricsRow}>
            <div className={styles.metricCard}>
              <Text size={100} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>Issues</Text>
              <Text weight="semibold" size={500}>{selectedModule.issueCount}</Text>
            </div>
            <div className={styles.metricCard}>
              <Text size={100} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>Actions</Text>
              <Text weight="semibold" size={500}>{selectedModule.actionCount}</Text>
            </div>
            {selectedModule.owner && (
              <div className={styles.metricCard}>
                <Text size={100} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>Owner</Text>
                <Text size={200}>{selectedModule.owner}</Text>
              </div>
            )}
            {selectedModule.lastUpdated && (
              <div className={styles.metricCard}>
                <Text size={100} style={{ color: HBC_SURFACE_LIGHT['text-muted'] }}>Last Updated</Text>
                <Text size={200}>{new Date(selectedModule.lastUpdated).toLocaleDateString()}</Text>
              </div>
            )}
          </div>
          <div
            className={mergeClasses(
              styles.actionsRow,
              densityTier === 'comfortable' && styles.actionsRowComfortable,
              densityTier === 'touch' && styles.actionsRowTouch,
            )}
          >
            <HbcButton
              variant="primary"
              onClick={() => onModuleOpen(selectedModule.moduleSlug)}
            >
              Open {selectedModule.label}
            </HbcButton>
          </div>
        </div>
      </Card>
    </div>
  );
}
