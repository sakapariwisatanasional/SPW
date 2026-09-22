export type ContentStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface ArticleOrNewsItem {
  id: string;
  type: 'BERITA' | 'ARTIKEL';
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  coverImageUrl: string;
  authorName: string;
  kridaTag?: string;
  status: ContentStatus;
  viewCount: number;
  publishedAt: string;
  createdAt: string;
}

export interface AgendaEventItem {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  province: string;
  organizer: string;
  quota: number;
  registeredCount: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  bannerUrl: string;
}
