/**
 * Kudos domain-adapter — binding validation.
 *
 * Verifies that the live Kudos and Kudos Audit Events lists expose
 * the critical custom fields the domain adapter relies on. Binds by
 * list GUID via `@hbc/sharepoint-platform` so title drift cannot
 * cause a false positive.
 */
import { buildListFieldsEndpoint } from '@hbc/sharepoint-platform';
import { PEOPLE_CULTURE_LIST_REGISTRY } from '../peopleCultureSpListRegistry.js';

export type KudosBindingValidationResult =
  | { ok: true }
  | { ok: false; missing: Record<'kudos' | 'kudosAuditEvents', ReadonlyArray<string>> };

async function fetchFieldInternalNames(
  siteUrl: string,
  descriptor: (typeof PEOPLE_CULTURE_LIST_REGISTRY)[keyof typeof PEOPLE_CULTURE_LIST_REGISTRY],
): Promise<ReadonlyArray<string>> {
  const url = buildListFieldsEndpoint(siteUrl, descriptor);
  const response = await fetch(url, {
    headers: { Accept: 'application/json;odata=nometadata' },
  });
  if (!response.ok) {
    throw new Error(
      `Field metadata fetch failed for list ${descriptor.title} (${descriptor.id}): ${response.status} ${response.statusText}`,
    );
  }
  const body = (await response.json()) as { value?: Array<{ InternalName?: string }> };
  return (body.value ?? [])
    .map((f) => f.InternalName)
    .filter((name): name is string => typeof name === 'string');
}

function diffMissing(
  required: ReadonlyArray<string>,
  present: ReadonlyArray<string>,
): ReadonlyArray<string> {
  const set = new Set(present);
  return required.filter((name) => !set.has(name));
}

/**
 * Validate that both the Kudos list and the Kudos Audit Events list
 * expose their critical field internal names. Returns `ok: true` when
 * all required fields are present on both lists; otherwise returns
 * the missing set keyed by descriptor.
 */
export async function validateKudosBindings(
  siteUrl: string,
): Promise<KudosBindingValidationResult> {
  const kudosDescriptor = PEOPLE_CULTURE_LIST_REGISTRY.kudos;
  const auditDescriptor = PEOPLE_CULTURE_LIST_REGISTRY.kudosAuditEvents;

  const [kudosFields, auditFields] = await Promise.all([
    fetchFieldInternalNames(siteUrl, kudosDescriptor),
    fetchFieldInternalNames(siteUrl, auditDescriptor),
  ]);

  const missingKudos = diffMissing(kudosDescriptor.criticalFieldInternalNames ?? [], kudosFields);
  const missingAudit = diffMissing(auditDescriptor.criticalFieldInternalNames ?? [], auditFields);

  if (missingKudos.length === 0 && missingAudit.length === 0) {
    return { ok: true };
  }
  return {
    ok: false,
    missing: {
      kudos: missingKudos,
      kudosAuditEvents: missingAudit,
    },
  };
}
