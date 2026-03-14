/**
 * W0-G2-T08: Pure validation functions for department library/folder configuration.
 */

import type { ICoreLibraryDefinition } from '../config/core-libraries.js';
import type { IValidationResult } from './types.js';

/**
 * Validates department configuration consistency:
 * - Keys match between libraries and trees
 * - libraryName in tree matches library name
 * - All folder paths are non-empty with no leading/trailing slashes
 * - Parent-first ordering (parent folder appears before child in array)
 */
export function validateDepartmentConfig(
  libraries: Record<string, ICoreLibraryDefinition[]>,
  trees: Record<string, { libraryName: string; folders: string[] }>
): IValidationResult[] {
  const results: IValidationResult[] = [];

  // Check key alignment
  const libKeys = new Set(Object.keys(libraries));
  const treeKeys = new Set(Object.keys(trees));

  const missingInTrees = [...libKeys].filter((k) => !treeKeys.has(k));
  const missingInLibs = [...treeKeys].filter((k) => !libKeys.has(k));

  results.push({
    rule: 'department-key-alignment',
    passed: missingInTrees.length === 0 && missingInLibs.length === 0,
    message:
      missingInTrees.length === 0 && missingInLibs.length === 0
        ? `Department keys match: ${[...libKeys].join(', ')}`
        : `Key mismatch — missing in trees: [${missingInTrees.join(', ')}], missing in libraries: [${missingInLibs.join(', ')}]`,
    details: { libraryKeys: [...libKeys], treeKeys: [...treeKeys] },
  });

  // Per-department checks
  for (const dept of [...new Set([...libKeys, ...treeKeys])]) {
    const deptLibs = libraries[dept];
    const deptTree = trees[dept];
    const errors: string[] = [];

    if (deptLibs && deptTree) {
      // Library name match
      const libNames = deptLibs.map((l) => l.name);
      if (!libNames.includes(deptTree.libraryName)) {
        errors.push(
          `Tree libraryName "${deptTree.libraryName}" not found in department libraries [${libNames.join(', ')}]`
        );
      }

      // Folder path validation
      for (const folder of deptTree.folders) {
        if (!folder || folder.trim() === '') {
          errors.push('Empty folder path found');
        }
        if (folder.startsWith('/')) {
          errors.push(`Folder "${folder}" has leading slash`);
        }
        if (folder.endsWith('/')) {
          errors.push(`Folder "${folder}" has trailing slash`);
        }
      }

      // Parent-first ordering: for each folder with a '/', its parent must appear earlier
      for (let i = 0; i < deptTree.folders.length; i++) {
        const folder = deptTree.folders[i];
        const lastSlash = folder.lastIndexOf('/');
        if (lastSlash === -1) continue;
        const parent = folder.substring(0, lastSlash);
        const parentIndex = deptTree.folders.indexOf(parent);
        if (parentIndex === -1) {
          errors.push(`Folder "${folder}" parent "${parent}" not found in tree`);
        } else if (parentIndex >= i) {
          errors.push(
            `Folder "${folder}" appears before its parent "${parent}" (index ${i} vs ${parentIndex})`
          );
        }
      }
    }

    results.push({
      rule: 'department-config',
      passed: errors.length === 0,
      message:
        errors.length === 0
          ? `Department "${dept}" configuration is valid (${deptTree?.folders.length ?? 0} folders).`
          : `Department "${dept}" violations: ${errors.join('; ')}`,
      details: { department: dept, folderCount: deptTree?.folders.length ?? 0, errors },
    });
  }

  return results;
}
