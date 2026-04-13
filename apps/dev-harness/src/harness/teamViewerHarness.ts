/**
 * TeamViewer dev-harness adapter.
 *
 * Installs the `window.__teamViewerSeed` global that the TeamViewer
 * harness tab reads to switch between validation scenarios without
 * routing through SharePoint. Unlike the Kudos harness, this adapter
 * does not intercept `fetch` — the article lists are not yet
 * provisioned in the tenant, so the data path in `useTeamViewerData`
 * already degrades to empty without issuing network requests. The
 * harness tab uses the composed sub-components of TeamViewer directly
 * to exercise the real interaction, photo, and drawer seams against
 * seeded fixtures.
 */
import type { TeamViewerPerson } from '../../../hb-webparts/src/webparts/teamViewer/teamViewerContracts.js';

export type TeamViewerScenarioKey =
  | 'normal'
  | 'empty'
  | 'missing-photos'
  | 'missing-titles'
  | 'large-team'
  | 'partial-malformed'
  | 'host-context-resolved'
  | 'host-context-unresolved'
  | 'ordered-children'
  | 'drawer-enabled'
  | 'drawer-disabled';

export interface TeamViewerSeedPayload {
  scenario: TeamViewerScenarioKey;
  people: TeamViewerPerson[];
  /** When true, the tab toggles `profileDetailDrawer` on. */
  drawerEnabled: boolean;
  /** When set, the tab renders the article-unresolved empty variant. */
  bindingUnresolved?: boolean;
  /** When set, surface the loading state for visual proof. */
  forceLoading?: boolean;
  /** When set, surface the error state for visual proof. */
  forceError?: string;
}

const ARTICLE_ID = 'harness-article-001';

function person(overrides: Partial<TeamViewerPerson> & Pick<TeamViewerPerson, 'id' | 'displayName'>): TeamViewerPerson {
  return {
    articleId: ARTICLE_ID,
    ...overrides,
  } as TeamViewerPerson;
}

function buildScenario(scenario: TeamViewerScenarioKey): TeamViewerSeedPayload {
  switch (scenario) {
    case 'empty':
      return { scenario, people: [], drawerEnabled: false };
    case 'host-context-unresolved':
      return { scenario, people: [], drawerEnabled: false, bindingUnresolved: true };
    case 'missing-photos':
      return {
        scenario,
        drawerEnabled: false,
        people: [
          person({ id: 'p1', displayName: 'Alex Carter', jobTitle: 'Chief Operating Officer', sortOrder: 1 }),
          person({ id: 'p2', displayName: 'Maya Reeves', jobTitle: 'Chief Financial Officer', sortOrder: 2 }),
          person({ id: 'p3', displayName: 'Jordan Pierce', jobTitle: 'Chief Executive Officer', sortOrder: 3 }),
        ],
      };
    case 'missing-titles':
      return {
        scenario,
        drawerEnabled: false,
        people: [
          person({ id: 'p1', displayName: 'Alex Carter', sortOrder: 1 }),
          person({ id: 'p2', displayName: 'Maya Reeves', sortOrder: 2 }),
          person({ id: 'p3', displayName: 'Jordan Pierce', jobTitle: 'CEO', sortOrder: 3 }),
        ],
      };
    case 'large-team': {
      const roles = ['Project Executive', 'Senior PM', 'Superintendent', 'Project Engineer', 'Estimator', 'Coordinator'];
      const names = [
        'Alex Carter', 'Maya Reeves', 'Jordan Pierce', 'Priya Shah', 'Diego Alvarez', 'Kenji Ito',
        'Fatima Noor', 'Owen Wallace', 'Lena Kowalski', 'Noah Bennett', 'Ava Mitchell', 'Henry Zhao',
        'Sofia Rossi', 'Ethan Park', 'Isla Murphy', 'Liam O\u2019Brien', 'Mila Andersen', 'Caleb Foster',
        'Chen Wei', 'Rania Haddad', 'Tomas Nilsson', 'Grace Kim', 'Marco Bellini', 'Emma Nakamura',
      ];
      return {
        scenario,
        drawerEnabled: false,
        people: names.map((n, i) =>
          person({
            id: `lg-${i}`,
            displayName: n,
            jobTitle: roles[i % roles.length],
            sortOrder: i,
            groupKey: i < 12 ? 'Core Team' : 'Extended Team',
          }),
        ),
      };
    }
    case 'partial-malformed':
      return {
        scenario,
        drawerEnabled: false,
        people: [
          // Valid row.
          person({ id: 'pm1', displayName: 'Alex Carter', jobTitle: 'COO', sortOrder: 1 }),
          // Missing title, long name ellipsizes.
          person({
            id: 'pm2',
            displayName: 'A Very Long Display Name That Should Truncate Without Breaking Layout',
            sortOrder: 2,
          }),
          // Missing email/upn (no photo path possible).
          person({ id: 'pm3', displayName: 'Anon User', jobTitle: 'Role Unknown', sortOrder: 3 }),
        ],
      };
    case 'ordered-children':
      return {
        scenario,
        drawerEnabled: false,
        people: [
          person({ id: 'o3', displayName: 'Gamma Third', jobTitle: 'Role', sortOrder: 30 }),
          person({ id: 'o1', displayName: 'Alpha First', jobTitle: 'Role', sortOrder: 10 }),
          person({ id: 'o2', displayName: 'Beta Second', jobTitle: 'Role', sortOrder: 20 }),
        ],
      };
    case 'drawer-disabled':
      return {
        scenario,
        drawerEnabled: false,
        people: [
          person({ id: 'd1', displayName: 'Alex Carter', jobTitle: 'COO', sortOrder: 1, bio: 'Leadership and operations.' }),
        ],
      };
    case 'drawer-enabled':
      return {
        scenario,
        drawerEnabled: true,
        people: [
          person({
            id: 'd1',
            displayName: 'Alex Carter',
            jobTitle: 'Chief Operating Officer',
            email: 'alex.carter@harness.local',
            sortOrder: 1,
            bio: 'Alex leads field and project operations across HB Intel. Focus areas: schedule discipline, safety-first field decisions, and subcontractor partnerships.',
            resumeRichText:
              '<p><strong>Experience</strong></p><p>15 years leading commercial construction operations across three regions.</p><p><strong>Education</strong></p><p>B.S. Civil Engineering</p>',
            resumeDocumentUrl: 'https://harness.local/sites/hb/Documents/resume-alex.pdf',
            profileUrl: 'https://harness.local/profiles/alex',
          }),
          person({
            id: 'd2',
            displayName: 'Maya Reeves',
            jobTitle: 'Chief Financial Officer',
            email: 'maya.reeves@harness.local',
            sortOrder: 2,
            bio: 'Finance, capital planning, and investment strategy.',
          }),
        ],
      };
    case 'host-context-resolved':
      return {
        scenario,
        drawerEnabled: false,
        people: [
          person({ id: 'hc1', displayName: 'Alex Carter', jobTitle: 'COO', sortOrder: 1 }),
          person({ id: 'hc2', displayName: 'Maya Reeves', jobTitle: 'CFO', sortOrder: 2 }),
        ],
      };
    case 'normal':
    default:
      return {
        scenario: 'normal',
        drawerEnabled: false,
        people: [
          person({
            id: 'n1',
            displayName: 'Alex Carter',
            jobTitle: 'Chief Operating Officer',
            email: 'alex.carter@harness.local',
            sortOrder: 1,
          }),
          person({
            id: 'n2',
            displayName: 'Maya Reeves',
            jobTitle: 'Chief Financial Officer',
            email: 'maya.reeves@harness.local',
            sortOrder: 2,
          }),
          person({
            id: 'n3',
            displayName: 'Jordan Pierce',
            jobTitle: 'Chief Executive Officer',
            email: 'jordan.pierce@harness.local',
            sortOrder: 3,
          }),
          person({
            id: 'n4',
            displayName: 'Priya Shah',
            jobTitle: 'Senior Project Manager',
            email: 'priya.shah@harness.local',
            sortOrder: 4,
          }),
        ],
      };
  }
}

declare global {
  interface Window {
    __teamViewerSeed?: (scenario: TeamViewerScenarioKey) => TeamViewerSeedPayload;
    __teamViewerScenarios?: TeamViewerScenarioKey[];
  }
}

let installed = false;

export function installTeamViewerHarness(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.__teamViewerSeed = buildScenario;
  window.__teamViewerScenarios = [
    'normal',
    'empty',
    'missing-photos',
    'missing-titles',
    'large-team',
    'partial-malformed',
    'host-context-resolved',
    'host-context-unresolved',
    'ordered-children',
    'drawer-enabled',
    'drawer-disabled',
  ];
}

export { buildScenario as buildTeamViewerScenario };
