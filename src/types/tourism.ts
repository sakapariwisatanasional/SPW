export type DestinationCategory = 'WISATA_ALAM' | 'BUDAYA' | 'KULINER' | 'EDUKASI' | 'BAHARI' | 'BUATAN';

export interface DestinationItem {
  id: string;
  name: string;
  slug: string;
  category: DestinationCategory;
  categoryLabel: string;
  province: string;
  city: string;
  description: string;
  facilities: string[];
  entryFee: number;
  ratingAvg: number;
  reviewCount: number;
  thumbnailUrl: string;
  galleryUrls: string[];
  mitraName?: string;
  latitude?: number;
  longitude?: number;
  highlightTag?: string;
}

export interface TourPackageItem {
  id: string;
  title: string;
  durationDays: number;
  price: number;
  destinationIds: string[];
  destinationsCovered: string[];
  itinerarySummary: string;
  partnerName: string;
  minQuota: number;
  maxQuota: number;
  isAvailable: boolean;
  thumbnailUrl: string;
  ratingAvg: number;
}
