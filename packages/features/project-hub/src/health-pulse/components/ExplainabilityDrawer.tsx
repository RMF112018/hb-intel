import { useEffect, useMemo, useState } from 'react';
import { HbcButton, HbcPanel, HbcTypography } from '@hbc/ui-kit';

import type { IHealthExplainability, PulseConfidenceTier } from '../types/index.js';
import type { ExplainabilitySection } from './displayModel.js';

export interface ExplainabilityDrawerProps {
  open: boolean;
  onClose: () => void;
  explainability: IHealthExplainability | null;
  initialSection?: ExplainabilitySection;
  confidenceTier?: PulseConfidenceTier | null;
  confidenceReasons?: string[];
}

const SECTION_ORDER: ExplainabilitySection[] = [
  'confidence',
  'why',
  'changed',
  'contributors',
  'matters-most',
];

const SECTION_LABELS: Record<ExplainabilitySection, string> = {
  confidence: 'Confidence',
  why: 'Why this status',
  changed: 'What changed',
  contributors: 'Top contributors',
  'matters-most': 'What matters most',
};

const emptyList = ['No explainability data is available yet.'];

const formatConfidenceTier = (tier: PulseConfidenceTier | null | undefined): string => {
  if (!tier) return 'Unknown';
  if (tier === 'high') return 'High';
  if (tier === 'moderate') return 'Moderate';
  if (tier === 'low') return 'Low';
  return 'Unreliable';
};

export const ExplainabilityDrawer = ({
  open,
  onClose,
  explainability,
  initialSection = 'why',
  confidenceTier = null,
  confidenceReasons = [],
}: ExplainabilityDrawerProps) => {
  const [activeSection, setActiveSection] = useState<ExplainabilitySection>(initialSection);

  useEffect(() => {
    if (open) {
      setActiveSection(initialSection);
    }
  }, [open, initialSection]);

  useEffect(() => {
    if (!open) return undefined;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, open]);

  const sectionContent = useMemo(() => {
    const whyThisStatus = explainability?.whyThisStatus.length ? explainability.whyThisStatus : emptyList;
    const whatChanged = explainability?.whatChanged.length ? explainability.whatChanged : emptyList;
    const contributors = explainability?.topContributors.length
      ? explainability.topContributors
      : emptyList;

    return {
      confidence: {
        title: 'Confidence',
        body: [
          `Current confidence tier: ${formatConfidenceTier(confidenceTier)}.`,
          ...(confidenceReasons.length > 0 ? confidenceReasons : ['No confidence degradation reasons were reported.']),
        ],
      },
      why: {
        title: 'Why this status',
        body: whyThisStatus,
      },
      changed: {
        title: 'What changed',
        body: whatChanged,
      },
      contributors: {
        title: 'Top contributors',
        body: contributors,
      },
      'matters-most': {
        title: 'What matters most',
        body: [explainability?.whatMattersMost ?? 'No key leverage guidance available.'],
      },
    };
  }, [confidenceReasons, confidenceTier, explainability]);

  return (
    <HbcPanel open={open} onClose={onClose} title="Health Explainability" size="md">
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {SECTION_ORDER.map((section) => (
            <HbcButton
              key={section}
              variant={activeSection === section ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveSection(section)}
            >
              {SECTION_LABELS[section]}
            </HbcButton>
          ))}
        </div>

        {SECTION_ORDER.map((section) => {
          const content = sectionContent[section];
          const isActive = activeSection === section;
          return (
            <section
              key={section}
              id={`pulse-explainability-${section}`}
              aria-label={content.title}
              aria-current={isActive ? 'true' : undefined}
              style={{ display: isActive ? 'block' : 'none', marginBottom: 16 }}
            >
              <HbcTypography intent="heading3">{content.title}</HbcTypography>
              <ul>
                {content.body.map((item) => (
                  <li key={`${section}-${item}`}>
                    <HbcTypography intent="body">{item}</HbcTypography>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </HbcPanel>
  );
};
