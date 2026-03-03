"use client";

/**
 * PixelTransition
 * ─────────────────────────────────────────────────────────────────
 * Grid ช่องสี่เหลี่ยมเปิด-ปิด stagger แบบ retro 8-bit game
 * ช่องขยาย scale 0→1 ทีละช่องตาม diagonal wave
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
  PIXEL_COLS,
  PIXEL_ROWS,
  PIXEL_COLOR,
  PIXEL_ACCENT,
} from "@/features/transitionNavigate/constants/transition/pixel";
import { navigationStore } from "../../stores/navigation.store";

const TOTAL = PIXEL_COLS * PIXEL_ROWS;

export function PixelTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const gridRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);

  /* ── initial state ── */
  useEffect(() => {
    cellRefs.current.forEach((el) => {
      if (el) {
        el.style.transform = "scale(0)";
        el.style.opacity = "0";
      }
    });
    if (logoRef.current) logoRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const cells = cellRefs.current.filter(Boolean) as HTMLDivElement[];
    const logo = logoRef.current;

    if (!isAnimating) {
      /* ── EXIT: cells shrink diagonally (reverse) ── */
      if (logo) {
        animate(logo, {
          opacity: [1, 0],
          scale: [1, 0.6],
          duration: 180,
          ease: "inCubic",
        });
      }
      animate([...cells].reverse(), {
        scale: [1, 0],
        opacity: [1, 0],
        duration: DURATION_START,
        ease: "inExpo",
        delay: stagger(18),
      });
    } else {
      /* ── ENTER: cells pop in diagonally ── */
      animate(cells, {
        scale: [0, 1.1, 1],
        opacity: [0, 1],
        duration: DURATION_END,
        ease: "outBack",
        delay: stagger(22, { grid: [PIXEL_COLS, PIXEL_ROWS], from: "first" }),
      });

      /* ── logo fades in after grid fills ── */
      if (logo) {
        animate(logo, {
          opacity: [0, 1],
          scale: [0.5, 1.1, 1],
          duration: DURATION_END - 100,
          ease: "outBack",
          delay: 280,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative">
      {/* Pixel grid */}
      <div
        ref={gridRef}
        className="fixed inset-0 z-9998 pointer-events-none"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${PIXEL_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${PIXEL_ROWS}, 1fr)`,
        }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => {
          // checkerboard accent
          const col = i % PIXEL_COLS;
          const row = Math.floor(i / PIXEL_COLS);
          const isAccent = (col + row) % 5 === 0;
          return (
            <div
              key={i}
              ref={(el) => {
                cellRefs.current[i] = el;
              }}
              style={{
                backgroundColor: isAccent ? PIXEL_ACCENT : PIXEL_COLOR,
                transform: "scale(0)",
                opacity: 0,
              }}
            />
          );
        })}
      </div>

      {/* Center logo */}
      <div
        ref={logoRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-4"
        style={{ opacity: 0 }}
      >
        <img
          src={LOGO_URL}
          alt={SITE_NAME}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          style={{ imageRendering: "pixelated" }}
        />
        <p
          className="text-5xl font-extrabold tracking-widest drop-shadow-xl"
          style={{ color: PIXEL_ACCENT, fontFamily: "monospace" }}
        >
          {SITE_NAME}
        </p>
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <span
              key={i}
              className="w-3 h-3 inline-block"
              style={{
                backgroundColor: i % 2 === 0 ? PIXEL_ACCENT : PIXEL_COLOR,
              }}
            />
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
