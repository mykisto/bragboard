export type CardLayout = 'stack' | 'split';

export type FontSize = 's' | 'm' | 'l' | 'xl';

export interface AchievementCard {
  id: string;
  /** The achievement text - the reason the card exists. */
  text: string;
  /** Optional image as a compressed data URL. */
  image?: string;
  /** Only meaningful when an image is attached. Text-only cards have no layout choice. */
  layout: CardLayout;
  fontSize: FontSize;
  lifeChanging: boolean;
  createdAt: string;
}

export interface BoardExport {
  app: 'bragboard';
  version: 1;
  exportedAt: string;
  cards: AchievementCard[];
}

export interface Draft {
  text: string;
  image?: string;
  layout: CardLayout;
  fontSize: FontSize;
  lifeChanging: boolean;
  /** When set, the composer is editing an existing card. */
  editingId?: string;
}

export const EMPTY_DRAFT: Draft = {
  text: '',
  layout: 'stack',
  fontSize: 'm',
  lifeChanging: false,
};
