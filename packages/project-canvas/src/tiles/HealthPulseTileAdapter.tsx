/**
 * Health Pulse tile adapter — bridges @hbc/features-project-hub health-pulse
 * into the canvas tile contract.
 *
 * Three complexity tiers per P3-C2 §3:
 * - Essential: overall status badge + score
 * - Standard: status + dimension summary + triage bucket
 * - Expert: full dimension breakdown with explainability link
 *
 * Governing: P3-C2 §3, P3-D2 (Health Spine Contract)
 */
import React from 'react';
import type { ICanvasTileProps } from '../types/index.js';

/** Inline styles — D-07 SPFx compatibility */
const containerStyle: React.CSSProperties = {
  border: '1px solid #e0e0e0',
  borderRadius: 4,
  padding: 12,
  fontFamily: 'inherit',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 8,
};

const statusBadge = (status: string): React.CSSProperties => ({
  fontSize: 11,
  padding: '2px 8px',
  borderRadius: 4,
  fontWeight: 600,
  backgroundColor:
    status === 'healthy' ? '#e6f9f0' :
    status === 'watch' ? '#fff8e6' :
    status === 'at-risk' ? '#fef0f0' :
    status === 'critical' ? '#f8d7da' : '#f0f0f0',
  color:
    status === 'healthy' ? '#00855a' :
    status === 'watch' ? '#856404' :
    status === 'at-risk' ? '#c23934' :
    status === 'critical' ? '#721c24' : '#666',
});

const scoreStyle: React.CSSProperties = { fontSize: 28, fontWeight: 700, color: '#0078d4' };
const dimStyle: React.CSSProperties = { padding: '4px 0', fontSize: 13, borderBottom: '1px solid #f0f0f0' };
const dimScore: React.CSSProperties = { fontWeight: 600, marginLeft: 'auto', fontSize: 13 };
const emptyStyle: React.CSSProperties = { fontSize: 13, color: '#888', fontStyle: 'italic' };
const triageStyle = (bucket: string): React.CSSProperties => ({
  fontSize: 11,
  padding: '2px 6px',
  borderRadius: 3,
  backgroundColor: bucket === 'attention-now' ? '#f8d7da' : bucket === 'trending-down' ? '#fff3cd' : '#e8e8e8',
  color: bucket === 'attention-now' ? '#721c24' : bucket === 'trending-down' ? '#856404' : '#666',
});

/**
 * Mock health pulse data scoped by project. Will be replaced by
 * real useProjectHealthPulse() when wired to the health computation engine.
 */
function useMockHealthPulse(projectId: string) {
  return React.useMemo(() => ({
    projectId,
    overallStatus: 'watch' as const,
    overallScore: 72,
    triageBucket: 'trending-down' as const,
    dimensions: [
      { key: 'schedule', label: 'Schedule', score: 65, status: 'at-risk' },
      { key: 'cost', label: 'Cost', score: 82, status: 'healthy' },
      { key: 'quality', label: 'Quality / Safety', score: 71, status: 'watch' },
      { key: 'scope', label: 'Scope', score: 68, status: 'watch' },
    ],
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  }), [projectId]);
}

function formatFreshness(iso: string): string {
  try {
    const diffMs = Date.now() - new Date(iso).getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) return 'Updated just now';
    if (hours < 24) return `Updated ${hours}h ago`;
    return `Updated ${Math.floor(hours / 24)}d ago`;
  } catch {
    return '';
  }
}

/** Essential: overall status + score */
export function HealthPulseTileEssential(props: ICanvasTileProps): React.ReactElement {
  const health = useMockHealthPulse(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="essential" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Health Pulse</strong>
        <span style={statusBadge(health.overallStatus)}>{health.overallStatus}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={scoreStyle}>{health.overallScore}</span>
        <span style={{ fontSize: 12, color: '#888' }}>/ 100</span>
      </div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 4 }}>{formatFreshness(health.lastUpdated)}</div>
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
HealthPulseTileEssential.displayName = 'HealthPulseTile[essential]';

/** Standard: status + dimensions + triage */
export function HealthPulseTileStandard(props: ICanvasTileProps): React.ReactElement {
  const health = useMockHealthPulse(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="standard" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Health Pulse</strong>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={statusBadge(health.overallStatus)}>{health.overallStatus}</span>
          <span style={triageStyle(health.triageBucket)}>{health.triageBucket.replace('-', ' ')}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={scoreStyle}>{health.overallScore}</span>
        <span style={{ fontSize: 12, color: '#888' }}>overall</span>
      </div>
      {health.dimensions.map((dim) => (
        <div key={dim.key} style={{ ...dimStyle, display: 'flex', alignItems: 'center' }}>
          <span>{dim.label}</span>
          <span style={{ ...statusBadge(dim.status), fontSize: 9, marginLeft: 6 }}>{dim.status}</span>
          <span style={dimScore}>{dim.score}</span>
        </div>
      ))}
      <div style={{ fontSize: 10, color: '#888', marginTop: 6 }}>{formatFreshness(health.lastUpdated)}</div>
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
HealthPulseTileStandard.displayName = 'HealthPulseTile[standard]';

/** Expert: full dimensions with detail link */
export function HealthPulseTileExpert(props: ICanvasTileProps): React.ReactElement {
  const health = useMockHealthPulse(props.projectId);

  return (
    <div data-testid={`tile-${props.tileKey}`} data-tier="expert" style={containerStyle}>
      <div style={headerStyle}>
        <strong>Health Pulse</strong>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={statusBadge(health.overallStatus)}>{health.overallStatus}</span>
          <span style={triageStyle(health.triageBucket)}>{health.triageBucket.replace('-', ' ')}</span>
          {props.dataSource && <span style={{ fontSize: 10, color: '#888' }}>{props.dataSource}</span>}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={scoreStyle}>{health.overallScore}</span>
        <span style={{ fontSize: 12, color: '#888' }}>overall score</span>
      </div>
      <div style={{ flex: 1 }}>
        {health.dimensions.map((dim) => (
          <div key={dim.key} style={{ ...dimStyle, display: 'flex', alignItems: 'center' }}>
            <span>{dim.label}</span>
            <span style={{ ...statusBadge(dim.status), fontSize: 9, marginLeft: 6 }}>{dim.status}</span>
            <span style={dimScore}>{dim.score}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 6 }}>
        {formatFreshness(health.lastUpdated)}
        <span style={{ marginLeft: 8, color: '#0078d4', cursor: 'pointer' }}>View detail →</span>
      </div>
      {props.isLocked && <div data-testid="locked-indicator" style={{ fontSize: 10, color: '#888' }}>Mandatory</div>}
    </div>
  );
}
HealthPulseTileExpert.displayName = 'HealthPulseTile[expert]';
