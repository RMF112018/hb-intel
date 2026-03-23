/**
 * Phase 3 Stage 4.3 — Smart project switching.
 *
 * Implements the P3-B1 §5 same-page switching model:
 * 1. Same page in target project (if module accessible)
 * 2. Return-memory page (if stored and accessible)
 * 3. Project home (fallback)
 *
 * Always saves return memory for the departing project before switching.
 *
 * Governing: P3-B1 §5
 */

import { saveReturnMemory, getReturnMemory } from './stores/projectReturnMemory.js';

// ─────────────────────────────────────────────────────────────────────────────
// Input / Output contracts
// ─────────────────────────────────────────────────────────────────────────────

export interface ProjectSwitchInput {
  /** Current project's canonical ID */
  currentProjectId: string;
  /** Current module path relative to project root (e.g., '/financial', '/schedule') */
  currentPath: string;
  /** Target project's canonical ID */
  targetProjectId: string;
  /** Checker: is the given module path accessible in the target project? */
  targetModuleAccessible: (modulePath: string) => boolean;
  /** Current query params (optional, saved to return memory) */
  currentQueryParams?: Record<string, string> | null;
}

export interface ProjectSwitchResult {
  /** Target project ID to navigate to */
  targetProjectId: string;
  /** Resolved target path within the project */
  targetPath: string;
  /** Which resolution strategy was used */
  resolution: 'same-page' | 'return-memory' | 'project-home';
  /** Whether return memory was saved for the departing project */
  returnMemorySaved: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Path extraction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract the module path segment from a project-scoped path.
 *
 * Input: '/financial' → '/financial'
 * Input: '/schedule/milestones' → '/schedule'
 * Input: '/' or '' → null (at project home, no module)
 */
function extractModulePath(path: string): string | null {
  const trimmed = path.replace(/^\/+/, '').split('/')[0];
  if (!trimmed) return null;
  return `/${trimmed}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Switching logic (P3-B1 §5.1–§5.3)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve the target page for a project switch.
 *
 * Precedence (P3-B1 §5.1):
 * 1. Same page if the module exists and user has access in target project
 * 2. Return-memory page if valid and accessible
 * 3. Project home (always valid for any project member)
 *
 * Saves return memory for the departing project before resolving target.
 */
export function resolveProjectSwitch(input: ProjectSwitchInput): ProjectSwitchResult {
  const {
    currentProjectId,
    currentPath,
    targetProjectId,
    targetModuleAccessible,
    currentQueryParams,
  } = input;

  // Save return memory for the departing project (P3-B1 §5.3 step 2)
  let returnMemorySaved = false;
  if (currentProjectId && currentPath) {
    saveReturnMemory(currentProjectId, currentPath, currentQueryParams);
    returnMemorySaved = true;
  }

  // Priority 1: Same page in target project (§5.1, §5.2)
  const modulePath = extractModulePath(currentPath);
  if (modulePath && targetModuleAccessible(modulePath)) {
    return {
      targetProjectId,
      targetPath: modulePath,
      resolution: 'same-page',
      returnMemorySaved,
    };
  }

  // Priority 2: Return-memory page (§5.1)
  const returnMemory = getReturnMemory(targetProjectId);
  if (returnMemory && targetModuleAccessible(returnMemory.lastPath)) {
    return {
      targetProjectId,
      targetPath: returnMemory.lastPath,
      resolution: 'return-memory',
      returnMemorySaved,
    };
  }

  // Priority 3: Project home (§5.1 fallback)
  return {
    targetProjectId,
    targetPath: '/',
    resolution: 'project-home',
    returnMemorySaved,
  };
}
