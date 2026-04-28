import type { SitePlan } from '../contracts/provisioning-manifest.js';

const URL_RULE =
  'first six characters of accounting project number, non-numerics stripped, prefixed with /sites/';
const TITLE_RULE = 'derived from input project number and project name when supplied';

export interface SitePlanDerivationInput {
  readonly projectNumber?: string;
  readonly projectName?: string;
}

export interface SitePlanDerivationResult {
  readonly sitePlan: SitePlan;
  readonly warnings: readonly string[];
}

/**
 * Derive the planned site URL and title from optional project inputs,
 * following the frozen PCC convention (Standard Project Site Template
 * Contract F1): take the first six characters of the accounting project
 * number, strip non-numeric characters, prefix with `/sites/`.
 *
 * No SharePoint availability check. Missing inputs produce explicit
 * placeholder fields and warnings rather than invented values.
 */
export function deriveSitePlan(input: SitePlanDerivationInput | undefined): SitePlanDerivationResult {
  const projectNumber = input?.projectNumber;
  const projectName = input?.projectName;
  const warnings: string[] = [];

  let urlStatus: SitePlan['urlDerivation']['status'] = 'placeholder';
  let projectBaseNumber: string | null = null;
  let projectBaseNumberNoHyphen: string | null = null;
  let resolvedUrl: string | null = null;

  if (typeof projectNumber === 'string' && projectNumber.length > 0) {
    projectBaseNumber = projectNumber.slice(0, 6);
    projectBaseNumberNoHyphen = projectBaseNumber.replace(/[^0-9]/g, '');
    if (projectBaseNumberNoHyphen.length > 0) {
      resolvedUrl = `/sites/${projectBaseNumberNoHyphen}`;
      urlStatus = 'derived';
    } else {
      warnings.push(
        `projectNumber "${projectNumber}" yielded no numeric characters in the first six positions; site URL left as a placeholder.`,
      );
    }
  } else {
    warnings.push('projectNumber not supplied; site URL left as a placeholder.');
  }

  let titleStatus: SitePlan['title']['status'] = 'placeholder';
  let resolvedTitle: string | null = null;

  if (typeof projectNumber === 'string' && projectNumber.length > 0 && typeof projectName === 'string' && projectName.length > 0) {
    resolvedTitle = `${projectNumber} ${projectName}`;
    titleStatus = 'derived';
  } else {
    if (typeof projectName !== 'string' || projectName.length === 0) {
      warnings.push('projectName not supplied; site title left as a placeholder.');
    }
  }

  const sitePlan: SitePlan = Object.freeze({
    status: urlStatus === 'derived' && titleStatus === 'derived' ? 'planned' : 'placeholder',
    urlDerivation: Object.freeze({
      rule: URL_RULE,
      inputProjectNumber: projectNumber ?? null,
      projectBaseNumber,
      projectBaseNumberNoHyphen,
      resolved: resolvedUrl,
      status: urlStatus,
    }),
    title: Object.freeze({
      rule: TITLE_RULE,
      inputProjectNumber: projectNumber ?? null,
      inputProjectName: projectName ?? null,
      resolved: resolvedTitle,
      status: titleStatus,
    }),
  });

  return { sitePlan, warnings };
}
