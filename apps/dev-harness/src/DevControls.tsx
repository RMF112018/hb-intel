/**
 * DevControls — Floating bottom-right panel.
 * Theme toggle, user/project info, mock refresh, feature flag toggles.
 * Foundation Plan Phase 3.
 */
import { useState } from 'react';
import { makeStyles } from '@griffel/react';
import { Button, HBC_SPACE_XS, HBC_SPACE_SM, tokens, Switch } from '@hbc/ui-kit';
import { useAuthStore, usePermissionStore } from '@hbc/auth';
import { useProjectStore, useNavStore } from '@hbc/shell';
import { bootstrapMockEnvironment, DEFAULT_FEATURE_FLAGS } from './bootstrap.js';

interface DevControlsProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

const useStyles = makeStyles({
  collapsedContainer: {
    padding: `${HBC_SPACE_SM}px`,
    minWidth: 'auto',
  },
  featureFlagsSection: {
    marginTop: `${HBC_SPACE_SM}px`,
    paddingTop: `${HBC_SPACE_SM}px`,
    borderTopColor: tokens.colorNeutralStroke2,
    borderTopStyle: 'solid',
    borderTopWidth: 'thin',
  },
  featureFlagsHeader: {
    marginBottom: `${HBC_SPACE_XS}px`,
  },
  refreshRow: {
    marginTop: `${HBC_SPACE_SM}px`,
    display: 'grid',
  },
  stretchButton: {
    width: '100%',
  },
});

export function DevControls({ isDark, onToggleTheme }: DevControlsProps) {
  const styles = useStyles();
  const [collapsed, setCollapsed] = useState(false);

  const currentUser = useAuthStore((s) => s.currentUser);
  const activeProject = useProjectStore((s) => s.activeProject);
  const activeWorkspace = useNavStore((s) => s.activeWorkspace);
  const featureFlags = usePermissionStore((s) => s.featureFlags);
  const setFeatureFlags = usePermissionStore((s) => s.setFeatureFlags);

  const toggleFlag = (key: string) => {
    setFeatureFlags({ ...featureFlags, [key]: !featureFlags[key] });
  };

  const handleRefreshMock = () => {
    bootstrapMockEnvironment();
  };

  if (collapsed) {
    return (
      <div className={`dev-controls ${styles.collapsedContainer}`}>
        <Button size="small" appearance="subtle" onClick={() => setCollapsed(false)}>
          Dev
        </Button>
      </div>
    );
  }

  return (
    <div className="dev-controls">
      <div className="dev-controls-header">
        <span>Dev Controls</span>
        <Button size="small" appearance="subtle" onClick={() => setCollapsed(true)}>
          —
        </Button>
      </div>

      <div className="dev-controls-row">
        <span className="dev-controls-label">Theme</span>
        <Switch
          checked={isDark}
          onChange={onToggleTheme}
          label={isDark ? 'Dark' : 'Light'}
        />
      </div>

      <div className="dev-controls-row">
        <span className="dev-controls-label">User</span>
        <span className="dev-controls-value">{currentUser?.displayName ?? '—'}</span>
      </div>

      <div className="dev-controls-row">
        <span className="dev-controls-label">Project</span>
        <span className="dev-controls-value">{activeProject?.number ?? '—'}</span>
      </div>

      <div className="dev-controls-row">
        <span className="dev-controls-label">Workspace</span>
        <span className="dev-controls-value">{activeWorkspace ?? '—'}</span>
      </div>

      <div className={styles.featureFlagsSection}>
        <div className={`dev-controls-header ${styles.featureFlagsHeader}`}>Feature Flags</div>
        {Object.keys(DEFAULT_FEATURE_FLAGS).map((key) => (
          <div key={key} className="dev-controls-row">
            <span className="dev-controls-label">{key}</span>
            <Switch
              checked={featureFlags[key] ?? false}
              onChange={() => toggleFlag(key)}
            />
          </div>
        ))}
      </div>

      <div className={styles.refreshRow}>
        <Button
          size="small"
          appearance="secondary"
          onClick={handleRefreshMock}
          className={styles.stretchButton}
        >
          Reset Mock Data
        </Button>
      </div>
    </div>
  );
}
