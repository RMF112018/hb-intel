import type { ReactNode } from 'react';
import { makeStyles, mergeClasses } from '@griffel/react';
import {
  HBC_BREAKPOINT_SIDEBAR,
  HBC_DENSITY_TOKENS,
  HBC_SPACE_MD,
  HBC_SPACE_SM,
  Card,
  CardHeader,
  HbcButton,
  HbcStatusBadge,
  Text,
  useDensity,
} from '@hbc/ui-kit';
import type {
  ProjectHubSpfxDensityTier,
  ProjectHubSpfxLaunchAction,
  ProjectHubSpfxLaneDepth,
  ProjectHubSpfxModuleDefinition,
} from './types.js';

const useStyles = makeStyles({
  /** Stage 11.6: card weight differentiation per P3-C1 §14.2 */
  cardWeightPrimary: {
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.14)',
  },
  cardWeightSupporting: {
    boxShadow: 'none',
    backgroundColor: '#fafafa',
  },
  root: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
  },
  rootComfortable: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  rootTouch: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  summaryStack: {
    display: 'grid',
    gap: `${HBC_SPACE_SM}px`,
  },
  summaryStackComfortable: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  summaryStackTouch: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  sectionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: `${HBC_SPACE_MD}px`,
    [`@media (min-width: ${HBC_BREAKPOINT_SIDEBAR}px)`]: {
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    },
  },
  sectionGridComfortable: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  sectionGridTouch: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  capabilityList: {
    marginTop: `${HBC_SPACE_SM}px`,
    marginBottom: 0,
    paddingLeft: `${HBC_SPACE_MD}px`,
    display: 'grid',
    gap: `${HBC_SPACE_SM}px`,
  },
  capabilityListComfortable: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  capabilityListTouch: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  actionGrid: {
    display: 'grid',
    gap: `${HBC_SPACE_MD}px`,
    marginTop: `${HBC_SPACE_SM}px`,
  },
  actionGridComfortable: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  actionGridTouch: {
    gap: `${Math.max(HBC_SPACE_MD, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  actionItem: {
    display: 'grid',
    gap: `${HBC_SPACE_SM}px`,
  },
  actionItemComfortable: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.comfortable.tapSpacingMin)}px`,
  },
  actionItemTouch: {
    gap: `${Math.max(HBC_SPACE_SM, HBC_DENSITY_TOKENS.touch.tapSpacingMin)}px`,
  },
  actionRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: `${HBC_SPACE_SM}px`,
    minHeight: `${HBC_DENSITY_TOKENS.compact.touchTargetMin}px`,
  },
  actionRowComfortable: {
    gap: `${HBC_DENSITY_TOKENS.comfortable.tapSpacingMin}px`,
    minHeight: `${HBC_DENSITY_TOKENS.comfortable.touchTargetMin}px`,
  },
  actionRowTouch: {
    gap: `${HBC_DENSITY_TOKENS.touch.tapSpacingMin}px`,
    minHeight: `${HBC_DENSITY_TOKENS.touch.touchTargetMin}px`,
  },
});

function resolveDepthBadge(depth: ProjectHubSpfxLaneDepth): {
  readonly label: string;
  readonly variant: 'success' | 'info' | 'neutral' | 'warning';
} {
  switch (depth) {
    case 'required':
      return { label: 'Required in SPFx', variant: 'success' };
    case 'broad':
      return { label: 'Broad in SPFx', variant: 'info' };
    case 'baseline-visible':
      return { label: 'Baseline visible', variant: 'neutral' };
    case 'read-only':
      return { label: 'Read-only in SPFx', variant: 'warning' };
  }
}

export interface ProjectHubSpfxLaneSurfaceProps {
  readonly definition: ProjectHubSpfxModuleDefinition;
  readonly projectName: string;
  readonly projectNumber: string;
  readonly densityTier?: ProjectHubSpfxDensityTier;
  readonly onLaunchAction?: (action: ProjectHubSpfxLaunchAction) => void;
}

export function ProjectHubSpfxLaneSurface({
  definition,
  projectName,
  projectNumber,
  densityTier,
  onLaunchAction,
}: ProjectHubSpfxLaneSurfaceProps): ReactNode {
  const styles = useStyles();
  const { tier: shellDensityTier } = useDensity();
  const activeDensityTier = densityTier ?? shellDensityTier;
  const depthBadge = resolveDepthBadge(definition.depth);

  return (
    <div
      data-testid={`spfx-module-surface-${definition.slug}`}
      data-density-tier={activeDensityTier}
      data-surface-type={definition.primaryDataSurfaceType}
      className={mergeClasses(
        styles.root,
        activeDensityTier === 'comfortable' && styles.rootComfortable,
        activeDensityTier === 'touch' && styles.rootTouch,
      )}
    >
      <Card size="small" className={styles.cardWeightPrimary} data-card-weight="primary">
        <CardHeader
          header={<Text weight="semibold">{definition.title}</Text>}
          description={
            <div
              className={mergeClasses(
                styles.summaryStack,
                activeDensityTier === 'comfortable' && styles.summaryStackComfortable,
                activeDensityTier === 'touch' && styles.summaryStackTouch,
              )}
            >
              <HbcStatusBadge variant={depthBadge.variant} label={depthBadge.label} />
              <Text>{definition.summary}</Text>
              <Text size={200}>
                Active project: {projectName} ({projectNumber})
              </Text>
            </div>
          }
        />
      </Card>

      <div
        className={mergeClasses(
          styles.sectionGrid,
          activeDensityTier === 'comfortable' && styles.sectionGridComfortable,
          activeDensityTier === 'touch' && styles.sectionGridTouch,
        )}
      >
        <Card size="small">
          <CardHeader
            header={<Text weight="semibold">Available in this SPFx lane</Text>}
            description={
              <ul
                className={mergeClasses(
                  styles.capabilityList,
                  activeDensityTier === 'comfortable' && styles.capabilityListComfortable,
                  activeDensityTier === 'touch' && styles.capabilityListTouch,
                )}
              >
                {definition.spfxCapabilities.map((capability) => (
                  <li key={capability}>
                    <Text>{capability}</Text>
                  </li>
                ))}
              </ul>
            }
          />
        </Card>

        <Card size="small">
          <CardHeader
            header={<Text weight="semibold">Launch-to-PWA handoffs</Text>}
            description={
              definition.pwaEscalations.length > 0 ? (
                <div
                  className={mergeClasses(
                    styles.actionGrid,
                    activeDensityTier === 'comfortable' && styles.actionGridComfortable,
                    activeDensityTier === 'touch' && styles.actionGridTouch,
                  )}
                >
                  {definition.pwaEscalations.map((action) => (
                    <div
                      key={`${definition.slug}-${action.label}`}
                      className={mergeClasses(
                        styles.actionItem,
                        activeDensityTier === 'comfortable' && styles.actionItemComfortable,
                        activeDensityTier === 'touch' && styles.actionItemTouch,
                      )}
                    >
                      <Text>{action.description}</Text>
                      <div
                        className={mergeClasses(
                          styles.actionRow,
                          activeDensityTier === 'comfortable' && styles.actionRowComfortable,
                          activeDensityTier === 'touch' && styles.actionRowTouch,
                        )}
                      >
                        <HbcButton
                          variant="secondary"
                          onClick={() => onLaunchAction?.(action)}
                        >
                          {action.label}
                        </HbcButton>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Text>
                  This module stays inside the governed SPFx lane for its Phase 3 scope and does not
                  require a dedicated PWA handoff from this surface.
                </Text>
              )
            }
          />
        </Card>
      </div>

      {definition.note ? (
        <Card size="small" className={styles.cardWeightSupporting} data-card-weight="supporting">
          <CardHeader
            header={<Text weight="semibold">Lane governance note</Text>}
            description={<Text>{definition.note}</Text>}
          />
        </Card>
      ) : null}
    </div>
  );
}
