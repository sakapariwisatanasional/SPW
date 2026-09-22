/**
 * SPWN Apps 2.0 - Krida & SKK Store
 * Location: src/stores/kridaStore.ts
 */

import { create } from 'zustand';
import { KridaItem, SkkItem, SkkLevelKey } from '../types/krida';
import { kridaApi } from '../services/api/krida.api';
import { KRIDA_LIST, SKK_MASTER_LIST } from '../features/krida/data/kridaData';

interface KridaState {
  kridaList: KridaItem[];
  skkList: SkkItem[];
  selectedKridaSlug: string;
  selectedSkkCode: string | null;
  selectedLevelTab: SkkLevelKey;
  searchFilter: string;
  kridaFilter: string; // 'all' | 'pemandu' | 'penyuluh' | 'mice-event' | 'kuliner-cinderamata'
  levelFilter: string; // 'all' | 'purwa' | 'madya' | 'utama'

  // Actions
  setSelectedKridaSlug: (slug: string) => void;
  setSelectedSkkCode: (kode: string | null) => void;
  setSelectedLevelTab: (level: SkkLevelKey) => void;
  setSearchFilter: (query: string) => void;
  setKridaFilter: (kridaId: string) => void;
  setLevelFilter: (level: string) => void;
  resetFilters: () => void;
}

export const useKridaStore = create<KridaState>((set) => ({
  kridaList: KRIDA_LIST,
  skkList: SKK_MASTER_LIST,
  selectedKridaSlug: 'pemandu',
  selectedSkkCode: null,
  selectedLevelTab: 'purwa',
  searchFilter: '',
  kridaFilter: 'all',
  levelFilter: 'all',

  setSelectedKridaSlug: (slug) => set({ selectedKridaSlug: slug }),
  setSelectedSkkCode: (kode) => set({ selectedSkkCode: kode }),
  setSelectedLevelTab: (level) => set({ selectedLevelTab: level }),
  setSearchFilter: (query) => set({ searchFilter: query }),
  setKridaFilter: (kridaId) => set({ kridaFilter: kridaId }),
  setLevelFilter: (level) => set({ levelFilter: level }),
  resetFilters: () => set({ searchFilter: '', kridaFilter: 'all', levelFilter: 'all' }),
}));
