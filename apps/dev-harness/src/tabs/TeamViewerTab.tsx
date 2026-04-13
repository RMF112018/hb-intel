/* eslint-disable @hb-intel/hbc/enforce-hbc-tokens, @hb-intel/hbc/no-inline-styles */
/**
 * Dev-harness TeamViewer tab.
 *
 * Mounts the real TeamViewer sub-components (surface, card, drawer,
 * states) driven by seeded scenarios so the interaction, photo, and
 * drawer seams can be exercised end-to-end without SharePoint. The
 * data hook is not used in this tab because the article lists are
 * not yet provisioned in the tenant — the harness calls the composed
 * components directly with locally hydrated people.
 */
import * as React from 'react';
import { TeamViewerSurface } from '../../../hb-webparts/src/webparts/teamViewer/components/TeamViewerSurface.js';
import { TeamViewerDetailDrawer } from '../../../hb-webparts/src/webparts/teamViewer/components/TeamViewerDetailDrawer.js';
import { TeamViewerEmptyState } from '../../../hb-webparts/src/webparts/teamViewer/components/TeamViewerEmptyState.js';
import { TeamViewerErrorState } from '../../../hb-webparts/src/webparts/teamViewer/components/TeamViewerErrorState.js';
import { TeamViewerLoadingState } from '../../../hb-webparts/src/webparts/teamViewer/components/TeamViewerLoadingState.js';
import { teamViewerCSSVars } from '../../../hb-webparts/src/webparts/teamViewer/teamViewerVariants.js';
import {
  groupPeople,
  selectDensityForSize,
  sortPeople,
} from '../../../hb-webparts/src/webparts/teamViewer/display/teamViewerSelectors.js';
import type { TeamViewerPerson } from '../../../hb-webparts/src/webparts/teamViewer/teamViewerContracts.js';
import {
  buildTeamViewerScenario,
  installTeamViewerHarness,
  type TeamViewerScenarioKey,
} from '../harness/teamViewerHarness.js';
import { usePreviewShellStyles } from './usePreviewShellStyles.js';

installTeamViewerHarness();

const SCENARIOS: { key: TeamViewerScenarioKey; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'empty', label: 'Empty (bound article, no children)' },
  { key: 'missing-photos', label: 'Missing photos' },
  { key: 'missing-titles', label: 'Missing titles' },
  { key: 'ordered-children', label: 'Ordered children (sort by SortOrder)' },
  { key: 'large-team', label: 'Large team' },
  { key: 'partial-malformed', label: 'Partial / malformed' },
  { key: 'host-context-resolved', label: 'Host-context binding resolved' },
  { key: 'host-context-unresolved', label: 'Host-context binding unresolved' },
  { key: 'drawer-disabled', label: 'Drawer feature flag OFF (default)' },
  { key: 'drawer-enabled', label: 'Drawer feature flag ON' },
];

export function TeamViewerTab(): React.ReactNode {
  const styles = usePreviewShellStyles();
  const [scenarioKey, setScenarioKey] = React.useState<TeamViewerScenarioKey>('normal');
  const payload = React.useMemo(() => buildTeamViewerScenario(scenarioKey), [scenarioKey]);

  const [detailPerson, setDetailPerson] = React.useState<TeamViewerPerson | undefined>();
  React.useEffect(() => setDetailPerson(undefined), [scenarioKey]);

  const sorted = React.useMemo(() => sortPeople(payload.people), [payload]);
  const groups = React.useMemo(() => groupPeople(sorted), [sorted]);
  const density = selectDensityForSize(sorted.length);

  const onOpenDetail = payload.drawerEnabled ? setDetailPerson : undefined;
  const onCloseDetail = React.useCallback(() => setDetailPerson(undefined), []);

  const rootStyle: React.CSSProperties = {
    ...teamViewerCSSVars(),
    padding: 24,
    maxWidth: 1200,
    margin: '0 auto',
  };

  let body: React.ReactNode;
  if (payload.forceLoading) {
    body = <TeamViewerLoadingState />;
  } else if (payload.forceError) {
    body = <TeamViewerErrorState error={new Error(payload.forceError)} onRetry={() => setScenarioKey('normal')} />;
  } else if (payload.bindingUnresolved) {
    body = (
      <TeamViewerEmptyState
        title="No article bound to this page"
        description="No article destination is linked to this page yet, so there are no team members to display."
      />
    );
  } else if (sorted.length === 0) {
    body = <TeamViewerEmptyState />;
  } else {
    body = (
      <TeamViewerSurface
        heading="Project Team"
        groups={groups}
        layout={scenarioKey === 'large-team' ? 'grouped' : 'grid'}
        density={density}
        onOpenDetail={onOpenDetail}
      />
    );
  }

  return (
    <div className={styles.scrollContainer}>
      <section
        data-hbc-webpart="team-viewer"
        data-hbc-testid="team-viewer-public-root"
        data-hbc-profile-drawer={payload.drawerEnabled ? 'enabled' : 'disabled'}
        data-hbc-scenario={scenarioKey}
        style={rootStyle}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            marginBottom: 24,
            padding: 12,
            borderRadius: 8,
            background: 'rgba(59, 130, 246, 0.06)',
          }}
        >
          <span style={{ fontWeight: 600, marginRight: 8 }}>Scenario:</span>
          {SCENARIOS.map((s) => {
            const active = s.key === scenarioKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setScenarioKey(s.key)}
                data-hbc-testid={`team-viewer-scenario-${s.key}`}
                data-hbc-active={active ? 'true' : 'false'}
                style={{
                  appearance: 'none',
                  border: '1px solid',
                  borderColor: active ? '#2563eb' : 'rgba(17,24,39,0.12)',
                  background: active ? '#2563eb' : '#ffffff',
                  color: active ? '#ffffff' : '#111827',
                  padding: '6px 10px',
                  borderRadius: 999,
                  fontSize: '0.8125rem',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {body}

        {payload.drawerEnabled ? (
          <TeamViewerDetailDrawer person={detailPerson} onClose={onCloseDetail} />
        ) : null}
      </section>
    </div>
  );
}
