"use client";

/**
 * FlipTransition
 * ─────────────────────────────────────────────────────────────────
 * หน้าจอพลิก 3D เหมือนเปิดหนังสือ:
 *   ENTER → rotateY 90° → 0° (หน้าใหม่พลิกเข้า)
 *   EXIT  → rotateY 0° → -90° (หน้าเก่าพลิกออก)
 * ─────────────────────────────────────────────────────────────────
 */

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
  FLIP_BG,
} from "@/features/transitionNavigate/constants/transition/flip";
import { navigationStore } from "../../stores/navigation.store";

export function FlipTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const panelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  /* ── initial state ── */
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.transform = "perspective(1200px) rotateY(90deg)";
    panel.style.opacity = "0";
    if (logoRef.current) logoRef.current.style.opacity = "0";
    if (lineRef.current) lineRef.current.style.transform = "scaleX(0)";
  }, []);

  useEffect(() => {
    const panel = panelRef.current;
    const logo = logoRef.current;
    const line = lineRef.current;
    if (!panel) return;

    if (!isAnimating) {
      /* ── EXIT: panel flips away to left ── */
      if (logo)
        animate(logo, { opacity: [1, 0], duration: 150, ease: "inCubic" });
      if (line)
        animate(line, {
          scaleX: [1, 0],
          duration: 200,
          ease: "inExpo",
          transformOrigin: "right center",
        });
      animate(panel, {
        rotateY: [0, -90],
        opacity: [1, 0],
        duration: DURATION_START,
        ease: "inExpo",
        transformOrigin: "left center",
      });
    } else {
      /* ── ENTER: panel flips in from right ── */
      panel.style.opacity = "1";
      animate(panel, {
        rotateY: [90, 0],
        duration: DURATION_END,
        ease: "outExpo",
        transformOrigin: "right center",
      });

      /* ── logo + line pop in ── */
      if (logo) {
        animate(logo, {
          opacity: [0, 1],
          translateY: [-20, 0],
          scale: [0.7, 1],
          duration: DURATION_END - 100,
          ease: "outBack",
          delay: 160,
        });
      }
      if (line) {
        animate(line, {
          scaleX: [0, 1],
          duration: DURATION_END - 60,
          ease: "outExpo",
          transformOrigin: "left center",
          delay: 260,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative" style={{ perspective: "1200px" }}>
      {/* Flip panel */}
      <div
        ref={panelRef}
        className="fixed inset-0 z-9998 pointer-events-none flex flex-col items-center justify-center gap-5"
        style={{
          background: FLIP_BG,
          transform: "perspective(1200px) rotateY(90deg)",
          transformStyle: "preserve-3d",
          backfaceVisibility: "hidden",
          opacity: 0,
        }}
      >
        {/* Subtle grid lines for depth */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,transparent,transparent 60px,#ffffff1a 60px,#ffffff1a 61px), repeating-linear-gradient(90deg,transparent,transparent 60px,#ffffff1a 60px,#ffffff1a 61px)",
          }}
        />

        <div ref={logoRef} className="relative z-10" style={{ opacity: 0 }}>
          <div className="flex flex-col items-center gap-4">
            <img
              src={LOGO_URL}
              alt={SITE_NAME}
              width={LOGO_WIDTH + 20}
              height={LOGO_HEIGHT + 20}
            />
            <p className="text-5xl font-extrabold text-white tracking-wide drop-shadow-2xl">
              {SITE_NAME}
            </p>
            <div
              ref={lineRef}
              className="h-0.5 w-48 rounded-full bg-linear-to-r from-sky-400 via-violet-400 to-pink-400"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
