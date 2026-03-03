"use client";

/**
 * WaveTransition
 * ─────────────────────────────────────────────────────────────────
 * แถบแนวนอน 6 เส้น สลับสีไล่ไปทีละเส้น (stagger) จากซ้าย/ขวา
 * ให้ความรู้สึกสนุก เหมือนผ้าม่านปิด-เปิด
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
  WAVE_STRIP_COLORS,
  WAVE_STRIP_COUNT,
  SITE_NAME,
} from "@/features/transitionNavigate/constants/transition/wave";
import { navigationStore } from "../../stores/navigation.store";

export function WaveTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const stripsRef = useRef<(HTMLDivElement | null)[]>([]);
  const logoContainerRef = useRef<HTMLDivElement>(null);

  /* ── initial state ── */
  useEffect(() => {
    stripsRef.current.forEach((el) => {
      if (el) el.style.transform = "scaleX(0)";
    });
    if (logoContainerRef.current) logoContainerRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const strips = stripsRef.current.filter(Boolean) as HTMLDivElement[];
    const logoContainer = logoContainerRef.current;

    if (!isAnimating) {
      /* ── EXIT: strips retract alternately ── */
      if (logoContainer) {
        animate(logoContainer, {
          opacity: [1, 0],
          scale: [1, 0.85],
          duration: 200,
          ease: "inCubic",
        });
      }

      strips.forEach((el, i) => {
        el.style.transformOrigin = i % 2 === 0 ? "left center" : "right center";
      });

      animate(strips, {
        scaleX: [1, 0],
        duration: DURATION_START,
        ease: "inExpo",
        delay: stagger(45, { start: 0 }),
      });
    } else {
      /* ── ENTER: strips expand alternately ── */
      strips.forEach((el, i) => {
        el.style.transformOrigin = i % 2 === 0 ? "left center" : "right center";
      });

      animate(strips, {
        scaleX: [0, 1],
        duration: DURATION_END,
        ease: "outExpo",
        delay: stagger(55, { start: 0 }),
      });

      /* ── logo fades in after strips cover ── */
      if (logoContainer) {
        animate(logoContainer, {
          opacity: [0, 1],
          scale: [0.75, 1],
          translateY: [-10, 0],
          duration: DURATION_END - 100,
          ease: "outBack",
          delay: 220,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative">
      {/* Strips */}
      {WAVE_STRIP_COLORS.map((color, i) => (
        <div
          key={i}
          ref={(el) => {
            stripsRef.current[i] = el;
          }}
          className="fixed left-0 z-9998 pointer-events-none"
          style={{
            top: `${(i / WAVE_STRIP_COUNT) * 100}%`,
            height: `${100 / WAVE_STRIP_COUNT}%`,
            width: "100%",
            backgroundColor: color,
            transform: "scaleX(0)",
          }}
        />
      ))}

      {/* Center logo */}
      <div
        ref={logoContainerRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-3"
        style={{ opacity: 0 }}
      >
        <img
          src={LOGO_URL}
          alt={SITE_NAME}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
        />
        <p className="text-5xl font-extrabold text-white drop-shadow-xl tracking-wide">
          {SITE_NAME}
        </p>
      </div>

      {children}
    </div>
  );
}
