import { create } from 'zustand'

interface ThemeState {
  colors: {
    text: string
    textSecondary: string
    primary: string
    background: string
    card: string
    border: string
  }
}

export const useThemeStore = create<ThemeState>(() => ({
  colors: {
    text: 'text-black',
    textSecondary: 'text-gray-600',
    primary: '#FFA02E',
    background: 'bg-gray-50',
    card: 'bg-white',
    border: 'border-gray-300'
  }
}))
