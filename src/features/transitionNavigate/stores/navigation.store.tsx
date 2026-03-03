import {
  DURATION_END,
  DURATION_START,
} from "@/features/transitionNavigate/constants/duration";
import type { NavigateFunction } from "react-router";

import { create } from "zustand";

interface NavigationStore {
  isAnimating: boolean;
  startAnimation: () => void;
  stopAnimation: () => void;
  TransitionNavigate: (
    href: string,
    navigate: NavigateFunction,
    pathname: string,
  ) => Promise<void>;
}
export const navigationStore = create<NavigationStore>((set) => ({
  isAnimating: false,
  startAnimation: () => set({ isAnimating: true }),
  stopAnimation: () => set({ isAnimating: false }),
  TransitionNavigate: async (
    href: string,
    navigate: NavigateFunction,
    pathname: string,
  ) => {
    if (pathname === href) return;
    set({ isAnimating: true });
    await new Promise((resolve) => setTimeout(resolve, DURATION_START + 100));
    navigate(href);
    await new Promise((resolve) => setTimeout(resolve, DURATION_END));
    set({ isAnimating: false });
  },
}));
