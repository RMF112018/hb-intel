import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePccShellState } from '../state/usePccShellState';

describe('usePccShellState contract', () => {
  it('defaults activeSurfaceId to project-home', () => {
    const { result } = renderHook(() => usePccShellState());
    expect(result.current.activeSurfaceId).toBe('project-home');
  });

  it('keeps previewMode === true across the entire lifecycle', () => {
    const { result } = renderHook(() => usePccShellState());
    expect(result.current.previewMode).toBe(true);
    act(() => result.current.setActiveSurface('documents'));
    expect(result.current.previewMode).toBe(true);
    act(() => result.current.setSelectedProject(undefined));
    expect(result.current.previewMode).toBe(true);
  });

  it('setActiveSurface updates activeSurfaceId', () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.setActiveSurface('site-health'));
    expect(result.current.activeSurfaceId).toBe('site-health');
    act(() => result.current.setActiveSurface('approvals'));
    expect(result.current.activeSurfaceId).toBe('approvals');
  });

  it('accepts setSelectedProject(undefined) without breaking state', () => {
    const { result } = renderHook(() => usePccShellState());
    act(() => result.current.setSelectedProject(undefined));
    expect(result.current.selectedProjectId).toBeUndefined();
    expect(result.current.previewMode).toBe(true);
    expect(result.current.activeSurfaceId).toBe('project-home');
  });

  it('honors initial.activeSurfaceId override', () => {
    const { result } = renderHook(() =>
      usePccShellState({ activeSurfaceId: 'approvals' }),
    );
    expect(result.current.activeSurfaceId).toBe('approvals');
    expect(result.current.previewMode).toBe(true);
  });

  it('exposes stable setter references across renders', () => {
    const { result, rerender } = renderHook(() => usePccShellState());
    const firstSetActive = result.current.setActiveSurface;
    const firstSetProject = result.current.setSelectedProject;
    rerender();
    expect(result.current.setActiveSurface).toBe(firstSetActive);
    expect(result.current.setSelectedProject).toBe(firstSetProject);
  });
});
