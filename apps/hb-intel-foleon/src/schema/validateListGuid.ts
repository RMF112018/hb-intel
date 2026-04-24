/**
 * Runtime validation for SharePoint list GUIDs handed to Foleon
 * services through `IFoleonMountConfig`. Services call this before
 * building any REST endpoint URL so a missing or malformed GUID
 * short-circuits with a typed error instead of producing a
 * `.../lists(guid'')/items` request that SharePoint answers with an
 * opaque 400.
 */

import type { FoleonListInternalName } from './foleonListSchemas.js';

export class FoleonSchemaError extends Error {
  readonly code: 'invalid-list-guid' | 'missing-list-guid';
  readonly listRole: FoleonListInternalName;
  constructor(
    code: 'invalid-list-guid' | 'missing-list-guid',
    listRole: FoleonListInternalName,
    message: string,
  ) {
    super(message);
    this.name = 'FoleonSchemaError';
    this.code = code;
    this.listRole = listRole;
  }
}

const GUID_PATTERN =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

export function assertValidListGuid(
  candidate: string | undefined | null,
  listRole: FoleonListInternalName,
): asserts candidate is string {
  if (!candidate || candidate.trim().length === 0) {
    throw new FoleonSchemaError(
      'missing-list-guid',
      listRole,
      `${listRole}: list GUID was not supplied in IFoleonMountConfig.`,
    );
  }
  const trimmed = candidate.trim();
  if (!GUID_PATTERN.test(trimmed)) {
    throw new FoleonSchemaError(
      'invalid-list-guid',
      listRole,
      `${listRole}: value is not a valid SharePoint list GUID.`,
    );
  }
}

export function isValidListGuid(candidate: string | undefined | null): boolean {
  if (!candidate) return false;
  return GUID_PATTERN.test(candidate.trim());
}
