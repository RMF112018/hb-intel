/**
 * Field Mode Actions Store — PH4B.4 §4b.4.3
 *
 * Module-level reactive store using useSyncExternalStore.
 * WorkspacePageShell writes secondary actions here in field mode;
 * HbcCommandPalette reads them for Cmd+K palette injection.
 *
 * Why module-level store (not React context):
 * HbcCommandPalette is rendered outside WorkspacePageShell's subtree
 * (sibling in HbcAppShell), so React context won't flow down.
 */
import { useSyncExternalStore } from 'react';
import type { CommandBarAction } from './types.js';

let actions: CommandBarAction[] = [];
const listeners = new Set<() => void>();

function emit() {
  for (const cb of listeners) cb();
}

/** Write secondary actions (called by WorkspacePageShell in field mode) */
export function setFieldModeActions(next: CommandBarAction[]): void {
  actions = next;
  emit();
}

/** Snapshot getter for useSyncExternalStore */
export function getFieldModeActionsSnapshot(): CommandBarAction[] {
  return actions;
}

/** Subscribe for useSyncExternalStore */
export function subscribeFieldModeActions(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

/** React hook — reads current field mode actions reactively */
export function useFieldModeActions(): CommandBarAction[] {
  return useSyncExternalStore(subscribeFieldModeActions, getFieldModeActionsSnapshot);
}
