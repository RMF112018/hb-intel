/**
 * ProjectOperatingSurface — Project Hub operating family orchestrator.
 *
 * Thin wrapper that wires Project Hub domain hooks to generic @hbc/ui-kit
 * layout primitives (MultiColumnLayout, HbcNavRail, HbcContextRail,
 * HbcActivityStrip). No layout CSS of its own — delegates to ui-kit.
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  MultiColumnLayout,
  HbcNavRail,
  HbcContextRail,
  HbcActivityStrip,
} from '@hbc/ui-kit';
import type {
  NavRailItem,
  ContextRailSection,
  ActivityStripEntry,
} from '@hbc/ui-kit';

import {
  useModulePostureSummaries,
  useWorkQueueSummary,
  useNextMoveSummary,
  useActivitySummary,
  useSelectedModule,
} from '../hooks/index.js';
import type { ProjectHubModulePostureSummary } from '../types.js';
import { CanvasCenter } from './CanvasCenter.js';

// ── Adapters: PH domain → ui-kit generic contracts ─────────────────

function adaptModulesToNavRailItems(modules: readonly ProjectHubModulePostureSummary[]): NavRailItem[] {
  return modules.map((m) => ({
    id: m.moduleSlug,
    label: m.label,
    status: m.posture === 'read-only' ? 'read-only' as const : m.posture,
    issueCount: m.issueCount,
    actionCount: m.actionCount,
  }));
}

function adaptToContextRailSections(
  nextMoves: ReturnType<typeof useNextMoveSummary>,
  workQueue: ReturnType<typeof useWorkQueueSummary>,
  selectedSlug: string | null,
): ContextRailSection[] {
  const filteredMoves = selectedSlug
    ? nextMoves.items.filter((i) => i.sourceModule === selectedSlug)
    : nextMoves.items;
  const filteredQueue = selectedSlug
    ? workQueue.items.filter((i) => i.sourceModule === selectedSlug)
    : workQueue.items;
  const blockers = filteredQueue.filter((i) => i.urgency === 'urgent');

  return [
    {
      id: 'next-moves',
      title: 'My Next Moves',
      items: filteredMoves.map((i) => ({ id: i.id, title: i.title, subtitle: `${i.action} · ${i.owner}` })),
      emptyMessage: 'No next moves',
    },
    ...(blockers.length > 0
      ? [{
          id: 'blockers',
          title: 'Blockers',
          items: blockers.map((i) => ({
            id: i.id,
            title: i.title,
            subtitle: `${i.owner}${i.aging != null ? ` · ${i.aging}d overdue` : ''}`,
          })),
        }]
      : []),
    {
      id: 'team-queue',
      title: 'Team Queue',
      items: filteredQueue.slice(0, 5).map((i) => ({
        id: i.id,
        title: i.title,
        subtitle: `${i.owner} · ${i.sourceModule}`,
      })),
      emptyMessage: 'No items in queue',
      maxItems: 5,
    },
  ];
}

function adaptToActivityEntries(
  activity: ReturnType<typeof useActivitySummary>,
): ActivityStripEntry[] {
  return activity.entries.map((e) => ({
    id: e.id,
    timestamp: e.timestamp,
    type: e.type,
    title: e.title,
    source: e.sourceModule,
    actor: e.actor,
  }));
}

// ── Component ───────────────────────────────────────────────────────

export interface ProjectOperatingSurfaceProps {
  readonly canvasSlot: ReactNode;
  readonly onModuleOpen: (slug: string) => void;
}

export function ProjectOperatingSurface({
  canvasSlot,
  onModuleOpen,
}: ProjectOperatingSurfaceProps): ReactNode {
  const modules = useModulePostureSummaries();
  const workQueue = useWorkQueueSummary();
  const nextMoves = useNextMoveSummary();
  const activity = useActivitySummary();
  const { selectedSlug, setSelectedSlug } = useSelectedModule();

  const [leftCollapsed, setLeftCollapsed] = useState(false);

  const selectedModule = selectedSlug
    ? modules.find((m) => m.moduleSlug === selectedSlug) ?? null
    : null;

  const navItems = adaptModulesToNavRailItems(modules);
  const contextSections = adaptToContextRailSections(nextMoves, workQueue, selectedSlug);
  const activityEntries = adaptToActivityEntries(activity);

  return (
    <MultiColumnLayout
      testId="project-operating-surface"
      config={{
        left: { width: 260, collapsible: true, collapsedWidth: 48, defaultCollapsed: leftCollapsed },
        right: { width: 300, hideOnTablet: true, hideOnMobile: true },
      }}
      leftSlot={
        <HbcNavRail
          items={navItems}
          selectedItemId={selectedSlug}
          onSelectItem={setSelectedSlug}
          collapsed={leftCollapsed}
          onToggleCollapse={() => setLeftCollapsed(!leftCollapsed)}
          title="Modules"
          testId="command-rail"
        />
      }
      centerSlot={
        <CanvasCenter
          canvasSlot={canvasSlot}
          selectedModule={selectedModule}
          onModuleOpen={onModuleOpen}
        />
      }
      rightSlot={
        <HbcContextRail
          sections={contextSections}
          testId="context-rail"
        />
      }
      bottomSlot={
        <HbcActivityStrip
          entries={activityEntries}
          testId="activity-strip"
        />
      }
    />
  );
}
