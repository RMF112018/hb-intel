import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { PccModuleId, PccMvpSurfaceId, PccPrimaryTabId, PccProjectId } from '@hbc/models/pcc';
import { usePccShellState } from '../state/usePccShellState';

const FIXTURE_PROJECT_ID = 'p-001' as unknown as PccProjectId;

describe('usePccShellState contract — Phase 05 grouped tab + module model', () => {
  it('defaults to project-home surface and project-home primary tab with no active module', () => {
    const { result } = renderHook(() => usePccShellState());
    expect(result.current.activeSurfaceId).toBe('project-home');
    expect(result.current.activePrimaryTabId).toBe('project-home');
    expect(result.current.activeModuleId).toBeUndefined();
    expect(result.current.previewMode).toBe(true);
  });

  it('legacy setActiveSurface still updates activeSurfaceId for legacy surface ids', () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.setActiveSurface('approvals'));
    expect(result.current.activeSurfaceId).toBe('approvals');
    act(() => result.current.setActiveSurface('project-readiness'));
    expect(result.current.activeSurfaceId).toBe('project-readiness');
  });

  it('legacy setActiveSurface(invalidId) normalizes to project-home', () => {
    const { result } = renderHook(() => usePccShellState({ activeSurfaceId: 'documents' }));
    expect(result.current.activeSurfaceId).toBe('documents');
    act(() => result.current.setActiveSurface('legacy-systems' as unknown as PccMvpSurfaceId));
    expect(result.current.activeSurfaceId).toBe('project-home');
  });

  it('setActiveSurface clears activeModuleId', () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectModule('team-access'));
    expect(result.current.activeModuleId).toBe('team-access');
    act(() => result.current.setActiveSurface('approvals'));
    expect(result.current.activeModuleId).toBeUndefined();
  });

  it("setActiveSurface('documents') aligns activePrimaryTabId to 'documents'", () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.setActiveSurface('documents'));
    expect(result.current.activeSurfaceId).toBe('documents');
    expect(result.current.activePrimaryTabId).toBe('documents');
  });

  it("setActiveSurface('site-health') does not set activePrimaryTabId to site-health (now a Phase 05 module under systems-administration)", () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectPrimarySurface('core-tools'));
    act(() => result.current.selectModule('team-access'));
    expect(result.current.activePrimaryTabId).toBe('core-tools');
    expect(result.current.activeModuleId).toBe('team-access');

    act(() => result.current.setActiveSurface('site-health'));
    expect(result.current.activeSurfaceId).toBe('site-health');
    expect(result.current.activePrimaryTabId).not.toBe('site-health');
    expect(result.current.activePrimaryTabId).toBe('core-tools');
    expect(result.current.activeModuleId).toBeUndefined();
  });

  it("selectPrimarySurface('core-tools') sets activePrimaryTabId to 'core-tools'", () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectPrimarySurface('core-tools'));
    expect(result.current.activePrimaryTabId).toBe('core-tools');
  });

  it("selectPrimarySurface('core-tools') clears activeModuleId", () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectModule('team-access'));
    expect(result.current.activeModuleId).toBe('team-access');
    act(() => result.current.selectPrimarySurface('core-tools'));
    expect(result.current.activeModuleId).toBeUndefined();
  });

  it('selectPrimarySurface does not mutate activeSurfaceId', () => {
    const { result } = renderHook(() => usePccShellState());
    expect(result.current.activeSurfaceId).toBe('project-home');
    act(() => result.current.selectPrimarySurface('core-tools'));
    expect(result.current.activeSurfaceId).toBe('project-home');
    act(() => result.current.selectPrimarySurface('cost-time'));
    expect(result.current.activeSurfaceId).toBe('project-home');
  });

  it('invalid primary tab input normalizes to project-home', () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectPrimarySurface('core-tools'));
    expect(result.current.activePrimaryTabId).toBe('core-tools');
    act(() => result.current.selectPrimarySurface('not-a-tab' as unknown as PccPrimaryTabId));
    expect(result.current.activePrimaryTabId).toBe('project-home');
  });

  it("selectModule('team-access') sets primary='core-tools' and module='team-access' without changing activeSurfaceId", () => {
    const { result } = renderHook(() => usePccShellState());
    expect(result.current.activeSurfaceId).toBe('project-home');
    act(() => result.current.selectModule('team-access'));
    expect(result.current.activePrimaryTabId).toBe('core-tools');
    expect(result.current.activeModuleId).toBe('team-access');
    expect(result.current.activeSurfaceId).toBe('project-home');
  });

  it("selectModule('document-control-center') sets primary='documents' and module='document-control-center'", () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectModule('document-control-center'));
    expect(result.current.activePrimaryTabId).toBe('documents');
    expect(result.current.activeModuleId).toBe('document-control-center');
  });

  it("non-selectable selectModule('future-estimating-modules') leaves state unchanged", () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectPrimarySurface('core-tools'));
    act(() => result.current.selectModule('team-access'));
    const before = {
      activeSurfaceId: result.current.activeSurfaceId,
      activePrimaryTabId: result.current.activePrimaryTabId,
      activeModuleId: result.current.activeModuleId,
    };
    act(() => result.current.selectModule('future-estimating-modules'));
    expect(result.current.activeSurfaceId).toBe(before.activeSurfaceId);
    expect(result.current.activePrimaryTabId).toBe(before.activePrimaryTabId);
    expect(result.current.activeModuleId).toBe(before.activeModuleId);
  });

  it('invalid module input leaves state unchanged', () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectPrimarySurface('cost-time'));
    const before = {
      activeSurfaceId: result.current.activeSurfaceId,
      activePrimaryTabId: result.current.activePrimaryTabId,
      activeModuleId: result.current.activeModuleId,
    };
    act(() => result.current.selectModule('not-a-module' as unknown as PccModuleId));
    expect(result.current.activeSurfaceId).toBe(before.activeSurfaceId);
    expect(result.current.activePrimaryTabId).toBe(before.activePrimaryTabId);
    expect(result.current.activeModuleId).toBe(before.activeModuleId);
  });

  it('clearActiveModule() clears only activeModuleId', () => {
    const { result } = renderHook(() => usePccShellState({ activeSurfaceId: 'documents' }));
    act(() => result.current.selectModule('document-control-center'));
    expect(result.current.activeModuleId).toBe('document-control-center');
    expect(result.current.activePrimaryTabId).toBe('documents');
    expect(result.current.activeSurfaceId).toBe('documents');

    act(() => result.current.clearActiveModule());
    expect(result.current.activeModuleId).toBeUndefined();
    expect(result.current.activePrimaryTabId).toBe('documents');
    expect(result.current.activeSurfaceId).toBe('documents');
  });

  it('setSelectedProject(id) clears activeModuleId', () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectModule('team-access'));
    expect(result.current.activeModuleId).toBe('team-access');
    act(() => result.current.setSelectedProject(FIXTURE_PROJECT_ID));
    expect(result.current.activeModuleId).toBeUndefined();
    expect(result.current.selectedProjectId).toBe(FIXTURE_PROJECT_ID);
  });

  it('setSelectedProject(id) preserves activePrimaryTabId', () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.selectPrimarySurface('cost-time'));
    expect(result.current.activePrimaryTabId).toBe('cost-time');
    act(() => result.current.setSelectedProject(FIXTURE_PROJECT_ID));
    expect(result.current.activePrimaryTabId).toBe('cost-time');
  });

  it('setSelectedProject(id) preserves activeSurfaceId', () => {
    const { result } = renderHook(() => usePccShellState({ activeSurfaceId: 'approvals' }));
    expect(result.current.activeSurfaceId).toBe('approvals');
    act(() => result.current.setSelectedProject(FIXTURE_PROJECT_ID));
    expect(result.current.activeSurfaceId).toBe('approvals');
  });

  it('previewMode === true across all actions', () => {
    const { result } = renderHook(() => usePccShellState());
    expect(result.current.previewMode).toBe(true);
    act(() => result.current.setActiveSurface('documents'));
    expect(result.current.previewMode).toBe(true);
    act(() => result.current.selectPrimarySurface('core-tools'));
    expect(result.current.previewMode).toBe(true);
    act(() => result.current.selectModule('team-access'));
    expect(result.current.previewMode).toBe(true);
    act(() => result.current.clearActiveModule());
    expect(result.current.previewMode).toBe(true);
    act(() => result.current.setSelectedProject(FIXTURE_PROJECT_ID));
    expect(result.current.previewMode).toBe(true);
  });

  it('exposes stable setter references across renders', () => {
    const { result, rerender } = renderHook(() => usePccShellState());
    const captured = {
      setActiveSurface: result.current.setActiveSurface,
      selectPrimarySurface: result.current.selectPrimarySurface,
      selectModule: result.current.selectModule,
      clearActiveModule: result.current.clearActiveModule,
      setSelectedProject: result.current.setSelectedProject,
    };
    rerender();
    expect(result.current.setActiveSurface).toBe(captured.setActiveSurface);
    expect(result.current.selectPrimarySurface).toBe(captured.selectPrimarySurface);
    expect(result.current.selectModule).toBe(captured.selectModule);
    expect(result.current.clearActiveModule).toBe(captured.clearActiveModule);
    expect(result.current.setSelectedProject).toBe(captured.setSelectedProject);
  });

  it('initial values normalize invalid activeSurfaceId, activePrimaryTabId, and activeModuleId', () => {
    const { result } = renderHook(() =>
      usePccShellState({
        activeSurfaceId: 'apps' as unknown as PccMvpSurfaceId,
        activePrimaryTabId: 'not-a-tab' as unknown as PccPrimaryTabId,
        activeModuleId: 'not-a-module' as unknown as PccModuleId,
      }),
    );
    expect(result.current.activeSurfaceId).toBe('project-home');
    expect(result.current.activePrimaryTabId).toBe('project-home');
    expect(result.current.activeModuleId).toBeUndefined();
  });

  it("initial selectable activeModuleId='team-access' resolves activePrimaryTabId='core-tools' without changing activeSurfaceId", () => {
    const { result } = renderHook(() =>
      usePccShellState({
        activeSurfaceId: 'documents',
        activeModuleId: 'team-access',
      }),
    );
    expect(result.current.activeModuleId).toBe('team-access');
    expect(result.current.activePrimaryTabId).toBe('core-tools');
    expect(result.current.activeSurfaceId).toBe('documents');
  });
});
