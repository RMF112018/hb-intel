import type {
  AuthoringMessage,
  HomepageAuthoringGovernanceEntry,
} from '../webparts/authoringGovernanceContracts.js';

export const HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY: Record<string, HomepageAuthoringGovernanceEntry> = {
  /** @deprecated Phase 18-01 — Standalone only. Flagship greeting is integrated into HbSignatureHero. */
  personalizedWelcomeHeader: {
    webpartKey: 'personalizedWelcomeHeader',
    zone: 'topBand',
    ownerRole: 'Corporate Communications',
    freshnessCadence: 'daily',
    rotationExpectation: 'Update support/context lines as daily operational context changes.',
    zoneIntent: 'Standalone greeting surface only — not for flagship homepage use.',
    allowedContentScope: 'Greeting context, high-priority alert messaging, and concise support lines only.',
    deprecated: true,
    messages: {
      noData: {
        title: 'Welcome header content not configured',
        description: 'Add support/context lines in the property pane when operational context is required.',
      },
      invalid: {
        title: 'Welcome header configuration needs attention',
        description: 'Review alert severity and messaging fields in the property pane.',
      },
    },
  },
  /** @deprecated Phase 18-01 — Standalone only. Flagship hero is HbSignatureHero. */
  hbHeroBanner: {
    webpartKey: 'hbHeroBanner',
    zone: 'topBand',
    ownerRole: 'Corporate Communications',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Refresh headline and CTA to match current executive priorities.',
    zoneIntent: 'Standalone editorial hero only — not for flagship homepage use.',
    allowedContentScope: 'Headline, supporting message, metadata, optional media, and CTA.',
    deprecated: true,
    messages: {
      noData: {
        title: 'Hero content not configured',
        description: 'Add a headline in the webpart property pane to publish hero content.',
      },
      invalid: {
        title: 'Hero configuration is incomplete',
        description: 'Provide a valid headline and review CTA/media fields in the property pane.',
      },
    },
  },
  priorityActionsRail: {
    webpartKey: 'priorityActionsRail',
    zone: 'utility',
    ownerRole: 'Operations Program Managers',
    freshnessCadence: 'daily',
    rotationExpectation: 'Review action urgency and ordering each business day.',
    zoneIntent: 'Fast execution path for priority tasks.',
    allowedContentScope: 'Action links, urgency badges, ordering, and visibility filters.',
    messages: {
      noData: {
        title: 'No priority actions configured',
        description: 'Add valid action links and optional audience rules in the property pane.',
      },
      invalid: {
        title: 'Priority actions configuration is invalid',
        description: 'Review action IDs, links, groups, and visibility settings in the property pane.',
      },
    },
  },
  toolLauncherWorkHub: {
    webpartKey: 'toolLauncherWorkHub',
    zone: 'utility',
    ownerRole: 'Operations Program Managers',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Rebalance launcher groups and destinations based on usage.',
    zoneIntent: 'Grouped shortcuts to core systems.',
    allowedContentScope: 'Launcher groups, icon tokens, destination links, and optional badges.',
    messages: {
      noData: {
        title: 'No tool launchers configured',
        description: 'Add at least one launcher group with valid links in the property pane.',
      },
      invalid: {
        title: 'Tool launcher configuration is invalid',
        description: 'Review launcher group IDs, item links, and optional visibility constraints.',
      },
      listEmpty: {
        title: 'No platforms available',
        description: 'The Tool Launcher Contents list has no active platform entries. Add platforms with IsActive set to Yes.',
      },
    },
  },
  companyPulse: {
    webpartKey: 'companyPulse',
    zone: 'awareness',
    ownerRole: 'Corporate Communications',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Refresh lead story and secondary headlines each week. Rotate tertiary items as new updates publish.',
    zoneIntent: 'Premium internal newsroom with lead story, secondary headlines, and tertiary quick-read hierarchy.',
    allowedContentScope: 'Lead and secondary stories with byline, publish date, category, optional media, and CTA. Tertiary quick-read items. Archive destination link.',
    messages: {
      noData: {
        title: 'No newsroom content configured',
        description: 'Add a lead story and supporting headlines in the property pane to publish the Company Pulse newsroom.',
      },
      invalid: {
        title: 'Newsroom configuration needs attention',
        description: 'Review story IDs, titles, summaries, categories, and publish dates in the property pane.',
      },
    },
  },
  leadershipMessage: {
    webpartKey: 'leadershipMessage',
    zone: 'awareness',
    ownerRole: 'Executive Communications',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Keep one current featured message and maintain a short archive.',
    zoneIntent: 'Executive message and strategic communication.',
    allowedContentScope: 'Leader-authored entries, optional media, metadata, and CTA.',
    messages: {
      noData: {
        title: 'No leadership message configured',
        description: 'Add leadership entries in the property pane to publish executive communication.',
      },
      invalid: {
        title: 'Leadership message configuration is invalid',
        description: 'Ensure each entry has title, message, and leader name; review optional media and CTA.',
      },
    },
  },
  peopleCulture: {
    webpartKey: 'peopleCulture',
    zone: 'awareness',
    ownerRole: 'People Operations',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Rotate announcements weekly; review and approve Kudos submissions regularly.',
    zoneIntent: 'Announcements, Kudos recognition, and weekly celebrations.',
    allowedContentScope: 'Announcements (promotions, new hires, baby, wedding, special), Kudos recognition, birthdays, and anniversaries.',
    messages: {
      noData: {
        title: 'No people and culture content available',
        description: 'Configure announcement, Kudos, and celebration data sources to populate the People & Culture surface.',
      },
      invalid: {
        title: 'People and culture configuration is incomplete',
        description: 'Review announcement entries, Kudos approver settings, and celebration data sources.',
      },
    },
  },
  projectPortfolioSpotlight: {
    webpartKey: 'projectPortfolioSpotlight',
    zone: 'operationalAwareness',
    ownerRole: 'Project Controls',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Refresh featured project and secondary spotlight items with milestone/status updates.',
    zoneIntent: 'Project and portfolio signal awareness.',
    allowedContentScope: 'Featured project, bounded secondary items, status signals, milestones, and CTA.',
    messages: {
      noData: {
        title: 'No project spotlight items available',
        description: 'Publish items in the Homepage Project Spotlights list with HomepageEnabled set to Yes.',
      },
      invalid: {
        title: 'Project spotlight items could not be displayed',
        description: 'Verify that list items have a Title, Summary, and valid status fields.',
      },
      fetchError: {
        title: 'Project spotlight is temporarily unavailable',
        description:
          'We could not load the Homepage Project Spotlights list. The page will retry on the next refresh — if this persists, notify Project Controls.',
      },
    },
  },
  safetyFieldExcellence: {
    webpartKey: 'safetyFieldExcellence',
    zone: 'operationalAwareness',
    ownerRole: 'Safety and Field Excellence',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Refresh top-line safety posture, spotlight, and secondary signals with current field priorities.',
    zoneIntent: 'Safety and field signal awareness.',
    allowedContentScope:
      'Top-line status summary, one primary spotlight, bounded secondary signals, urgency/context metadata, and follow-on CTA.',
    messages: {
      noData: {
        title: 'No safety and field excellence items configured',
        description:
          'Add a top-line summary, primary spotlight, and secondary safety signals in the property pane to publish this section.',
      },
      invalid: {
        title: 'Safety and field excellence configuration is invalid',
        description:
          'Review top-line summary, spotlight urgency/context metadata, secondary signal fields, and CTA links.',
      },
      fetchError: {
        title: 'Safety and field excellence is temporarily unavailable',
        description:
          'We could not load the safety experience at this moment. Refresh the page to retry, and notify Safety and Field Excellence if the issue persists.',
      },
    },
  },
  smartSearchWayfinding: {
    webpartKey: 'smartSearchWayfinding',
    zone: 'discovery',
    ownerRole: 'Operations Enablement',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Review promoted destinations and quick paths each week for relevance.',
    zoneIntent: 'Guided discovery for tools, forms, policies, systems, and team spaces.',
    allowedContentScope: 'Curated categories/resources, quick paths, promoted destinations, and search metadata.',
    messages: {
      noData: {
        title: 'No discovery resources configured',
        description: 'Add categories, resources, or quick paths in the property pane to publish smart search and wayfinding.',
      },
      invalid: {
        title: 'Discovery configuration is invalid',
        description: 'Review category IDs, resource links, and quick-path definitions in the property pane.',
      },
      noResults: {
        title: 'No matching resources found',
        description: 'Try another keyword or clear search to see all curated resources.',
      },
    },
  },
};

export function resolveAuthoringMessage(
  webpartKey: keyof typeof HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY,
  state: 'noData' | 'invalid' | 'noResults' | 'listEmpty' | 'fetchError',
): AuthoringMessage {
  const entry = HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY[webpartKey];

  if (state === 'noResults' && entry.messages.noResults) {
    return entry.messages.noResults;
  }

  if (state === 'listEmpty' && entry.messages.listEmpty) {
    return entry.messages.listEmpty;
  }

  if (state === 'fetchError') {
    // Fall back to the `invalid` message when a webpart has not yet
    // authored a dedicated fetch-error message, so callers always get a
    // non-noData string for runtime failures.
    return entry.messages.fetchError ?? entry.messages.invalid;
  }

  if (state === 'invalid') {
    return entry.messages.invalid;
  }

  return entry.messages.noData;
}
