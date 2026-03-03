"use client";

/**
 * InkTransition
 * ─────────────────────────────────────────────────────────────────
 * Blob/SVG ellipse ขยายออกจาก 7 จุดรอบจอ เหมือนหยดหมึกลามบนกระดาษ
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";

import {
  DURATION_END,
  DURATION_START,
} from "@/features/transitionNavigate/constants/duration";
import {
  LOGO_URL,
  LOGO_WIDTH,
  LOGO_HEIGHT,
  SITE_NAME,
  INK_COLOR,
} from "@/features/transitionNavigate/constants/transition/ink";
import { navigationStore } from "../../stores/navigation.store";

// Origins for each blob (% positions)
const ORIGINS: { x: number; y: number; delay: number }[] = [
  { x: 50, y: 50, delay: 0 }, // center first
  { x: 10, y: 10, delay: 60 },
  { x: 90, y: 10, delay: 80 },
  { x: 10, y: 90, delay: 100 },
  { x: 90, y: 90, delay: 120 },
  { x: 50, y: 5, delay: 140 },
  { x: 50, y: 95, delay: 160 },
];

export function InkTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const blobRefs = useRef<(HTMLDivElement | null)[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);

  /* ── initial state ── */
  useEffect(() => {
    blobRefs.current.forEach((el) => {
      if (el) {
        el.style.transform = "translate(-50%, -50%) scale(0)";
        el.style.opacity = "1";
      }
    });
    if (logoRef.current) logoRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const blobs = blobRefs.current.filter(Boolean) as HTMLDivElement[];
    const logo = logoRef.current;

    if (!isAnimating) {
      /* ── EXIT: blobs drain back ── */
      if (logo)
        animate(logo, {
          opacity: [1, 0],
          scale: [1, 0.7],
          duration: 180,
          ease: "inCubic",
        });
      animate([...blobs].reverse(), {
        scale: [1, 0],
        duration: DURATION_START,
        ease: "inExpo",
        delay: stagger(30),
      });
    } else {
      /* ── ENTER: blobs spread ── */
      ORIGINS.forEach(({ delay }, i) => {
        const el = blobs[i];
        if (!el) return;
        el.style.transform = "translate(-50%, -50%) scale(0)";
        animate(el, {
          scale: [0, 8],
          duration: DURATION_END + 80,
          ease: "outExpo",
          delay,
        });
      });

      /* ── logo ── */
      if (logo) {
        animate(logo, {
          opacity: [0, 1],
          scale: [0.5, 1.1, 1],
          translateY: [15, 0],
          duration: DURATION_END - 60,
          ease: "outBack",
          delay: 200,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative overflow-hidden">
      {/* Ink blobs */}
      {ORIGINS.map(({ x, y }, i) => (
        <div
          key={i}
          ref={(el) => {
            blobRefs.current[i] = el;
          }}
          className="fixed z-9998  pointer-events-none rounded-full"
          style={{
            // Each blob slightly different hue for ink depth
            backgroundColor:
              i % 3 === 0 ? "#1a1a2e" : i % 3 === 1 ? "#16213e" : INK_COLOR,
            width: "35vmax",
            height: "35vmax",
            top: `${y}%`,
            left: `${x}%`,
            transform: "translate(-50%, -50%) scale(0)",
            // organic shape
            borderRadius: `${60 + ((i * 7) % 30)}% ${40 - ((i * 5) % 20)}% ${55 + ((i * 3) % 25)}% ${45 + ((i * 9) % 20)}%`,
          }}
        />
      ))}

      {/* Logo */}
      <div
        ref={logoRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-4"
        style={{ opacity: 0 }}
      >
        <img
          src={LOGO_URL}
          alt={SITE_NAME}
          width={LOGO_WIDTH + 10}
          height={LOGO_HEIGHT + 10}
        />
        <p className="text-5xl font-extrabold text-white drop-shadow-xl tracking-wide">
          {SITE_NAME}
        </p>
        <div className="flex gap-1 mt-1">
          {[...SITE_NAME]
            .filter((c) => c !== " ")
            .map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/50 inline-block"
              />
            ))}
        </div>
      </div>

      {children}
    </div>
  );
}
