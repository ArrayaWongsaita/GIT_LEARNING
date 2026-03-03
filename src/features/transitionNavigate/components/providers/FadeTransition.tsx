"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

import {
  DURATION_END,
  DURATION_START,
} from "@/features/transitionNavigate/constants/duration";
import {
  LOGO_URL,
  LOGO_WIDTH,
  LOGO_HEIGHT,
  SITE_NAME,
} from "@/features/transitionNavigate/constants/transition/fade";
import { navigationStore } from "../../stores/navigation.store";

export function FadeTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!overlayRef.current || !contentRef.current) return;

    if (!isAnimating) {
      // Fade out overlay
      animate(overlayRef.current, {
        opacity: [1, 0],
        duration: DURATION_START,
        ease: "inOut",
      });
      animate(contentRef.current, {
        opacity: [1, 0],
        scale: [1, 0.95],
        duration: DURATION_START,
        ease: "inOut",
      });
    } else {
      // Fade in overlay
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: DURATION_END,
        ease: "inOut",
      });
      animate(contentRef.current, {
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: DURATION_END,
        ease: "inOut",
      });
    }
  }, [isAnimating]);

  return (
    <div className="relative">
      {/* Full-screen overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-9998 pointer-events-none bg-primary opacity-0"
      />

      {/* Centered logo content */}
      <div
        ref={contentRef}
        className="fixed inset-0 z-9999 pointer-events-none flex items-center justify-center opacity-0"
      >
        <div className="flex items-center justify-center gap-6 p-4 rounded-xl">
          <p className="text-4xl md:text-6xl text-white font-bold">
            {SITE_NAME}
          </p>
          <img
            src={LOGO_URL}
            alt={SITE_NAME}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
