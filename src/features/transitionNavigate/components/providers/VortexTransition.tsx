"use client";

/**
 * VortexTransition
 * ─────────────────────────────────────────────────────────────────
 * Conic-gradient disc หมุนวนเร็วขึ้นจนเต็มจอ (spiral portal)
 * แล้วหมุนออกเมื่อโหลดเสร็จ
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
  VORTEX_BG,
  VORTEX_RING_COUNT,
} from "@/features/transitionNavigate/constants/transition/vortex";
import { navigationStore } from "../../stores/navigation.store";

export function VortexTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const discRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ringsRef = useRef<(HTMLDivElement | null)[]>([]);
  const spinnerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── initial state ── */
  useEffect(() => {
    const disc = discRef.current;
    if (!disc) return;
    disc.style.transform = "translate(-50%, -50%) scale(0) rotate(0deg)";
    disc.style.opacity = "0";
    if (logoRef.current) logoRef.current.style.opacity = "0";
    ringsRef.current.forEach((el) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translate(-50%,-50%) scale(0)";
      }
    });
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      if (spinnerRef.current) clearInterval(spinnerRef.current);
    };
  }, []);

  useEffect(() => {
    const disc = discRef.current;
    const logo = logoRef.current;
    const rings = ringsRef.current.filter(Boolean) as HTMLDivElement[];
    if (!disc) return;

    if (!isAnimating) {
      /* ── EXIT: disc spins faster then shrinks ── */
      if (spinnerRef.current) clearInterval(spinnerRef.current);
      if (logo)
        animate(logo, {
          opacity: [1, 0],
          scale: [1, 0.4],
          duration: 200,
          ease: "inCubic",
        });
      rings.forEach((r) =>
        animate(r, {
          opacity: [1, 0],
          scale: [1, 0],
          duration: DURATION_START * 0.6,
          ease: "inExpo",
        }),
      );
      animate(disc, {
        scale: [1, 0],
        rotate: [0, -720],
        opacity: [1, 0],
        duration: DURATION_START,
        ease: "inExpo",
      });
    } else {
      /* ── ENTER: disc spirals in from center ── */
      disc.style.opacity = "1";
      animate(disc, {
        scale: [0, 1],
        rotate: [720, 0],
        duration: DURATION_END,
        ease: "outExpo",
      });

      /* ── rings expand with stagger ── */
      rings.forEach((ring, i) => {
        animate(ring, {
          opacity: [0, 0.35, 0],
          scale: [0, 1 + i * 0.4],
          duration: DURATION_END + i * 100,
          ease: "outExpo",
          delay: i * 60,
        });
      });

      /* ── logo pop in ── */
      if (logo) {
        animate(logo, {
          opacity: [0, 1],
          scale: [0.3, 1.15, 1],
          rotate: [-30, 0],
          duration: DURATION_END - 80,
          ease: "outBack",
          delay: 140,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative overflow-hidden">
      {/* Expanding rings */}
      {Array.from({ length: VORTEX_RING_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            ringsRef.current[i] = el;
          }}
          className="fixed z-9997 pointer-events-none rounded-full border-2"
          style={{
            width: `${(i + 1) * 22}vmax`,
            height: `${(i + 1) * 22}vmax`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%) scale(0)",
            borderColor: `hsl(${i * 60}, 80%, 65%)`,
            opacity: 0,
          }}
        />
      ))}

      {/* Conic disc */}
      <div
        ref={discRef}
        className="fixed z-9998 pointer-events-none rounded-full"
        style={{
          width: "200vmax",
          height: "200vmax",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) scale(0) rotate(0deg)",
          background: VORTEX_BG,
          opacity: 0,
        }}
      />

      {/* Logo */}
      <div
        ref={logoRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-4"
        style={{ opacity: 0 }}
      >
        <div className="rounded-full bg-white/10 backdrop-blur-sm p-4 ring-2 ring-white/30">
          <img
            src={LOGO_URL}
            alt={SITE_NAME}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
          />
        </div>
        <p className="text-5xl font-extrabold text-white drop-shadow-2xl tracking-wide">
          {SITE_NAME}
        </p>
        <p className="text-white/60 text-sm tracking-[0.4em] uppercase">
          Loading…
        </p>
      </div>

      {children}
    </div>
  );
}
