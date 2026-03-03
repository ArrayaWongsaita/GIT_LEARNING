"use client";

/**
 * MorphTransition
 * ─────────────────────────────────────────────────────────────────
 * วงกลมขยายออกจากจุดกึ่งกลางหน้าจอจนเต็ม แล้วหดกลับเมื่อโหลดเสร็จ
 * ให้ความรู้สึก "portal" / "warp" ที่สนุก
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
  MORPH_MAX_SCALE,
  MORPH_BG,
  SITE_NAME,
  SITE_LOADING,
} from "@/features/transitionNavigate/constants/transition/morph";
import { navigationStore } from "../../stores/navigation.store";

export function MorphTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const circleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  /* ── initial state ── */
  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.transform = "translate(-50%, -50%) scale(0)";
    el.style.opacity = "0";
    if (labelRef.current) labelRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const el = circleRef.current;
    const label = labelRef.current;
    const logo = logoRef.current;
    if (!el || !label) return;

    if (!isAnimating) {
      /* ── EXIT: circle shrinks back ── */
      animate(label, { opacity: [1, 0], duration: 200, ease: "inCubic" });
      if (logo) {
        animate(logo, {
          opacity: [1, 0],
          scale: [1, 0.5],
          duration: 200,
          ease: "inCubic",
        });
      }
      animate(el, {
        scale: [MORPH_MAX_SCALE, 0],
        opacity: [1, 0],
        duration: DURATION_START,
        ease: "inExpo",
        onComplete: () => {
          el.style.transform = "translate(-50%, -50%) scale(0)";
        },
      });
    } else {
      /* ── ENTER: circle expands from center ── */
      el.style.opacity = "1";
      animate(el, {
        scale: [0, MORPH_MAX_SCALE],
        duration: DURATION_END,
        ease: "outExpo",
      });

      /* ── logo + text pop in ── */
      if (logo) {
        animate(logo, {
          scale: [0, 1.15, 1],
          opacity: [0, 1],
          rotate: ["-20deg", "0deg"],
          duration: DURATION_END - 80,
          ease: "outBack",
          delay: 120,
        });
      }
      animate(label, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: DURATION_END - 80,
        ease: "outExpo",
        delay: 160,
      });
    }
  }, [isAnimating]);

  return (
    <div className="relative overflow-hidden">
      {/* Morphing circle — 1px origin at center, scales up */}
      <div
        ref={circleRef}
        className="fixed z-9998 pointer-events-none rounded-full"
        style={{
          width: 1,
          height: 1,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0)",
          background: MORPH_BG,
          opacity: 0,
        }}
      />

      {/* Centered content sits above the circle */}
      <div className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-5">
        <div ref={logoRef} style={{ opacity: 0 }}>
          <img
            src={LOGO_URL}
            alt={SITE_NAME}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
          />
        </div>
        <div ref={labelRef} style={{ opacity: 0 }}>
          <p className="text-5xl font-extrabold text-white tracking-wide drop-shadow-xl">
            {SITE_NAME}
          </p>
          <p className="text-center text-white/70 text-sm mt-1 tracking-widest uppercase">
            {SITE_LOADING}
          </p>
        </div>
      </div>

      {children}
    </div>
  );
}
