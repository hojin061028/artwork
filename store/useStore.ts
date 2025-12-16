import { create } from 'zustand'

type NavigationState = 'intro' | 'starfield' | 'detail'

interface AppState {
    navigation: NavigationState
    projectFocus: string | null
    isWarping: boolean
    setNavigation: (nav: NavigationState) => void
    setProjectFocus: (id: string | null) => void
    setIsWarping: (warping: boolean) => void
}

export const useStore = create<AppState>((set) => ({
    navigation: 'intro',
    projectFocus: null,
    isWarping: false,
    setNavigation: (nav) => set({ navigation: nav }),
    setProjectFocus: (id) => set({ projectFocus: id }),
    setIsWarping: (warping) => set({ isWarping: warping })
}))
