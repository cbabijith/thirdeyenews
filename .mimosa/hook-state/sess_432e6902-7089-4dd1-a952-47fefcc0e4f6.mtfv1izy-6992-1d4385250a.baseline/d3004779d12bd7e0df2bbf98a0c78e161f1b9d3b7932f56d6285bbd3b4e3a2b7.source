import { create } from 'zustand'

interface NavigationState {
  currentPath: string
  sidebarOpen: boolean
  setCurrentPath: (path: string) => void
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

export const useNavigationStore = create<NavigationState>((set) => ({
  currentPath: '/',
  sidebarOpen: true,
  setCurrentPath: (path) => set({ currentPath: path }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
}))
