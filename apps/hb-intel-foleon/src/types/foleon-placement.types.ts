export type FoleonPlacementKey =
  | 'Hero'
  | 'Primary Card'
  | 'Secondary Card'
  | 'Carousel'
  | 'Archive Rail';

export type FoleonLayoutVariant =
  | 'Large Feature'
  | 'Compact Card'
  | 'Square Tile'
  | 'Text Rail';

export interface FoleonPlacementRecord {
  readonly id: number;
  readonly title: string;
  readonly placementKey: FoleonPlacementKey;
  readonly contentIdCache?: number;
  readonly contentLookupId?: number;
  readonly isActive: boolean;
  readonly displayFrom?: string;
  readonly displayThrough?: string;
  readonly sortRank: number;
  readonly layoutVariant?: FoleonLayoutVariant;
}
