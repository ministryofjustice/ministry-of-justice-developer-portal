export interface GuidelineSection {
  key: string;
  title: string;
  description: string;
  modifier: string;
}

export interface Guideline {
  slug: string;
  title: string;
  section: string;
  description: string;
  owner: string;
  lastReviewedOn: string;
  reviewIn: string;
  externalUrl?: string;
}

export interface GuidelinesContent {
  title: string;
  summary: string;
  sections: GuidelineSection[];
  items: Guideline[];
}
