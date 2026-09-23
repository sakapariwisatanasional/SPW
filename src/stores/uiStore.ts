/**
 * SPWN Apps 2.0 - UI & Toast State Store
 * Location: src/stores/uiStore.ts
 */

import { create } from 'zustand';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface UIState {
  // Navigation & Shell
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isAdminSidebarCollapsed: boolean;
  activeView: string;
  isQuickActionModalOpen: boolean;
  searchQuery: string;

  // Modals & Panels
  activeModal: string | null;
  isLoginModalOpen: boolean;
  
  // Toast Notifications
  toasts: ToastNotification[];

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleSidebarCollapse: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleAdminSidebar: () => void;
  setActiveView: (view: string) => void;
  setQuickActionModalOpen: (open: boolean) => void;
  setLoginModalOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  
  // Toast Actions
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isSidebarCollapsed: false,
  isAdminSidebarCollapsed: false,
  activeView: 'home',
  isQuickActionModalOpen: false,
  isLoginModalOpen: false,
  searchQuery: '',
  activeModal: null,
  toasts: [],

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen: boolean) => set({ isSidebarOpen: isOpen }),
  toggleSidebarCollapse: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
  toggleAdminSidebar: () => set((state) => ({ isAdminSidebarCollapsed: !state.isAdminSidebarCollapsed })),
  setActiveView: (view: string) => set({ activeView: view, isSidebarOpen: false }),
  setQuickActionModalOpen: (open: boolean) => set({ isQuickActionModalOpen: open }),
  setLoginModalOpen: (open: boolean) => set({ isLoginModalOpen: open }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  
  openModal: (modalId: string) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));

    const duration = toast.duration || 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }));
  }
}));
