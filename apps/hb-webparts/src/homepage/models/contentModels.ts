export interface HomepageCtaLink {
  label: string;
  href: string;
  openInNewTab?: boolean;
}

export interface HomepageMediaSlot {
  src: string;
  alt: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
}

export interface HomepageSpotlightItem {
  id: string;
  title: string;
  summary: string;
  statusLabel?: string;
  cta?: HomepageCtaLink;
}

export interface HomepageMessageNotice {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'error';
  cta?: HomepageCtaLink;
}

export interface HomepageCuratedListItem {
  id: string;
  title: string;
  summary?: string;
  cta?: HomepageCtaLink;
  image?: HomepageMediaSlot;
  audiences?: string[];
}

export interface HomepagePersonRecognition {
  id: string;
  personName: string;
  recognitionText: string;
  audience?: string;
}
