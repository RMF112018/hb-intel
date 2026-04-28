/**
 * Identity of the Standard Project Site Template Contract input that a
 * provisioning manifest was derived from. Captured in every manifest so
 * downstream proof / executor steps can verify provenance.
 */
export interface TemplateSource {
  readonly packageName: '@hbc/project-site-template';
  readonly templateName: string;
  readonly templateVersion: string;
  readonly contractRef: string;
  readonly sourceCommit?: string;
}
