"use client";

/**
 * GlitchTransition
 * ─────────────────────────────────────────────────────────────────
 * Effect สั่น/glitch สไตล์ cyberpunk:
 * - overlay ดำปกคลุม พร้อม RGB-shift layer สั้นๆ
 * - ชื่อ site แสดงพร้อม glitch character scramble
 * ─────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useCallback } from "react";
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
  GLITCH_BG,
  GLITCH_COLORS,
  GLITCH_CHARS,
} from "@/features/transitionNavigate/constants/transition/glitch";
import { navigationStore } from "../../stores/navigation.store";

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

export function GlitchTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const overlayRef = useRef<HTMLDivElement>(null);
  const redLayerRef = useRef<HTMLDivElement>(null);
  const cyanLayerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const scramblerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── stop scramble helper ── */
  const stopScramble = useCallback(() => {
    if (scramblerRef.current) {
      clearInterval(scramblerRef.current);
      scramblerRef.current = null;
    }
    if (textRef.current) textRef.current.textContent = SITE_NAME;
  }, []);

  /* ── start scramble helper ── */
  const startScramble = useCallback(
    (durationMs: number) => {
      if (!textRef.current) return;
      let elapsed = 0;
      const INTERVAL = 60;
      scramblerRef.current = setInterval(() => {
        elapsed += INTERVAL;
        if (!textRef.current) return;
        if (elapsed >= durationMs) {
          stopScramble();
          return;
        }
        // reveal chars from left as time passes
        const progress = Math.floor((elapsed / durationMs) * SITE_NAME.length);
        textRef.current.textContent =
          SITE_NAME.slice(0, progress) +
          SITE_NAME.slice(progress)
            .split("")
            .map((c) => (c === " " ? " " : randomChar()))
            .join("");
      }, INTERVAL);
    },
    [stopScramble],
  );

  /* ── initial state ── */
  useEffect(() => {
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (logoRef.current) logoRef.current.style.opacity = "0";
    if (redLayerRef.current) redLayerRef.current.style.opacity = "0";
    if (cyanLayerRef.current) cyanLayerRef.current.style.opacity = "0";
    return () => stopScramble();
  }, [stopScramble]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const red = redLayerRef.current;
    const cyan = cyanLayerRef.current;
    const logo = logoRef.current;
    if (!overlay) return;

    if (!isAnimating) {
      /* ── EXIT: glitch flash → fade ── */
      stopScramble();
      if (logo)
        animate(logo, { opacity: [1, 0], duration: 120, ease: "inCubic" });

      // quick RGB shake before fade
      if (red && cyan) {
        animate(red, {
          opacity: [0, 0.6, 0],
          translateX: [-6, 6, 0],
          duration: 200,
          ease: "linear",
        });
        animate(cyan, {
          opacity: [0, 0.5, 0],
          translateX: [6, -6, 0],
          duration: 200,
          ease: "linear",
        });
      }
      animate(overlay, {
        opacity: [1, 0],
        duration: DURATION_START,
        ease: "inExpo",
      });
    } else {
      /* ── ENTER: snap in + glitch burst ── */
      overlay.style.opacity = "1";
      animate(overlay, { opacity: [0, 1], duration: 80, ease: "linear" });

      // glitch RGB layers flicker
      if (red && cyan) {
        animate(red, {
          opacity: [0, 0.7, 0, 0.5, 0],
          translateX: [0, -10, 8, -5, 0],
          duration: DURATION_END - 100,
          ease: "linear",
          delay: 60,
        });
        animate(cyan, {
          opacity: [0, 0.6, 0, 0.4, 0],
          translateX: [0, 10, -8, 5, 0],
          duration: DURATION_END - 100,
          ease: "linear",
          delay: 60,
        });
      }

      // logo flash in
      if (logo) {
        animate(logo, {
          opacity: [0, 1, 0.6, 1],
          scale: [0.8, 1.05, 1],
          duration: DURATION_END - 80,
          ease: "outExpo",
          delay: 100,
        });
      }

      // scramble text
      startScramble(DURATION_END + 100);
    }
  }, [isAnimating, startScramble, stopScramble]);

  return (
    <div className="relative">
      {/* Dark overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-9997 pointer-events-none"
        style={{ backgroundColor: GLITCH_BG, opacity: 0 }}
      />

      {/* Red channel layer */}
      <div
        ref={redLayerRef}
        className="fixed inset-0 z-9998 pointer-events-none mix-blend-screen"
        style={{ backgroundColor: GLITCH_COLORS[0], opacity: 0 }}
      />

      {/* Cyan channel layer */}
      <div
        ref={cyanLayerRef}
        className="fixed inset-0 z-9998 pointer-events-none mix-blend-screen"
        style={{ backgroundColor: GLITCH_COLORS[1], opacity: 0 }}
      />

      {/* Content */}
      <div
        ref={logoRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-5"
        style={{ opacity: 0 }}
      >
        <div
          className="relative"
          style={{ filter: "drop-shadow(0 0 12px #00ffcc)" }}
        >
          <img
            src={LOGO_URL}
            alt={SITE_NAME}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
          />
        </div>

        <div className="relative flex flex-col items-center">
          <span
            ref={textRef}
            className="text-5xl font-extrabold tracking-widest"
            style={{
              color: GLITCH_COLORS[1],
              fontFamily: "monospace",
              textShadow: `3px 0 ${GLITCH_COLORS[0]}, -3px 0 ${GLITCH_COLORS[2]}`,
            }}
          >
            {SITE_NAME}
          </span>
          <span
            className="mt-1 text-xs tracking-[0.4em] uppercase"
            style={{ color: GLITCH_COLORS[0] }}
          >
            SYSTEM LOADING
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
