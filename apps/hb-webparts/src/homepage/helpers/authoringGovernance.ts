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
    rotationExpectation: 'Refresh featured and secondary pulse items each week.',
    zoneIntent: 'Curated company updates with editorial hierarchy.',
    allowedContentScope: 'Featured and secondary updates, categories, metadata, and CTA.',
    messages: {
      noData: {
        title: 'No company pulse items configured',
        description: 'Add featured or secondary pulse updates in the property pane to publish this section.',
      },
      invalid: {
        title: 'Company pulse configuration is invalid',
        description: 'Review pulse item IDs, summaries, categories, and CTA fields.',
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
    rotationExpectation: 'Rotate recognitions and milestones at least once per week.',
    zoneIntent: 'People milestones and recognition highlights.',
    allowedContentScope: 'New hires, anniversaries, promotions, recognition, optional media, and CTA.',
    messages: {
      noData: {
        title: 'No people and culture moments configured',
        description: 'Add people/culture entries in the property pane to show welcomes, milestones, and recognition.',
      },
      invalid: {
        title: 'People and culture configuration is invalid',
        description: 'Review event types, highlights, and optional media/CTA fields in the property pane.',
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
    },
  },
  safetyFieldExcellence: {
    webpartKey: 'safetyFieldExcellence',
    zone: 'operationalAwareness',
    ownerRole: 'Safety and Field Excellence',
    freshnessCadence: 'weekly',
    rotationExpectation: 'Rotate highlights and reminders with current field priorities.',
    zoneIntent: 'Safety and field signal awareness.',
    allowedContentScope: 'Highlights, recognitions, reminders, notices, indicators, and CTA.',
    messages: {
      noData: {
        title: 'No safety and field excellence items configured',
        description: 'Add safety highlights, recognitions, reminders, or notices in the property pane to publish this section.',
      },
      invalid: {
        title: 'Safety and field excellence configuration is invalid',
        description: 'Review event types, indicator metadata, freshness fields, and CTA links.',
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
  state: 'noData' | 'invalid' | 'noResults' | 'listEmpty',
): AuthoringMessage {
  const entry = HOMEPAGE_AUTHORING_GOVERNANCE_REGISTRY[webpartKey];

  if (state === 'noResults' && entry.messages.noResults) {
    return entry.messages.noResults;
  }

  if (state === 'listEmpty' && entry.messages.listEmpty) {
    return entry.messages.listEmpty;
  }

  if (state === 'invalid') {
    return entry.messages.invalid;
  }

  return entry.messages.noData;
}
