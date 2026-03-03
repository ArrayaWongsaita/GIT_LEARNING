"use client";

/**
 * ZoomTransition
 * ─────────────────────────────────────────────────────────────────
 * Zoom เข้าไปลึกมากจนมืด (tunnel effect) แล้วโผล่กลับมาพร้อมหน้าใหม่
 * ใช้ radial-gradient + scale ให้ความรู้สึก hyperspeed / warp jump
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
  ZOOM_BG,
} from "@/features/transitionNavigate/constants/transition/zoom";
import { navigationStore } from "../../stores/navigation.store";

// Number of tunnel rings
const RING_COUNT = 6;

export function ZoomTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const overlayRef = useRef<HTMLDivElement>(null);
  const tunnelRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);

  /* ── initial state ── */
  useEffect(() => {
    const overlay = overlayRef.current;
    if (overlay) {
      overlay.style.opacity = "0";
      overlay.style.transform = "scale(1)";
    }
    if (tunnelRef.current) tunnelRef.current.style.opacity = "0";
    if (logoRef.current) logoRef.current.style.opacity = "0";
    ringRefs.current.forEach((el) => {
      if (el) el.style.opacity = "0";
    });
  }, []);

  useEffect(() => {
    const overlay = overlayRef.current;
    const tunnel = tunnelRef.current;
    const logo = logoRef.current;
    const rings = ringRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!overlay || !tunnel) return;

    if (!isAnimating) {
      /* ── EXIT: zoom out to black ── */
      if (logo)
        animate(logo, { opacity: [1, 0], duration: 150, ease: "inCubic" });
      animate(rings, {
        opacity: [0.5, 0],
        scale: [1, 0.2],
        duration: DURATION_START,
        ease: "inExpo",
      });
      animate(overlay, {
        opacity: [1, 0],
        scale: [1.2, 1],
        duration: DURATION_START,
        ease: "inExpo",
      });
    } else {
      /* ── ENTER: zoom in from far away ── */
      overlay.style.opacity = "1";
      overlay.style.transform = "scale(8)";
      animate(overlay, {
        scale: [8, 1],
        opacity: [1, 1],
        duration: DURATION_END,
        ease: "outExpo",
      });

      // tunnel rings contract in
      rings.forEach((ring, i) => {
        animate(ring, {
          opacity: [0, 0.4, 0],
          scale: [4 - i * 0.5, 0.2],
          duration: DURATION_END - 40,
          ease: "outExpo",
          delay: i * 35,
        });
      });

      /* ── logo ── */
      if (logo) {
        animate(logo, {
          opacity: [0, 1],
          scale: [2, 1],
          duration: DURATION_END - 80,
          ease: "outExpo",
          delay: 160,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative overflow-hidden">
      {/* Tunnel rings */}
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <div
          key={i}
          ref={(el) => {
            ringRefs.current[i] = el;
          }}
          className="fixed z-9997 pointer-events-none rounded-full border"
          style={{
            width: `${(i + 1) * 18}vmax`,
            height: `${(i + 1) * 18}vmax`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) scale(0)",
            borderColor: `rgba(139, 92, 246, ${0.5 - i * 0.07})`,
            borderWidth: `${3 - i * 0.3}px`,
            opacity: 0,
          }}
        />
      ))}

      {/* Main overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-9998 pointer-events-none"
        style={{ background: ZOOM_BG, opacity: 0 }}
      />

      {/* Tunnel depth overlay */}
      <div
        ref={tunnelRef}
        className="fixed inset-0 z-9998  pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 40% at 50% 50%, transparent 0%, rgba(0,0,0,0.85) 100%)",
          opacity: 0,
        }}
      />

      {/* Logo */}
      <div
        ref={logoRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-5"
        style={{ opacity: 0 }}
      >
        <div
          style={{
            filter:
              "drop-shadow(0 0 32px rgba(139,92,246,0.9)) drop-shadow(0 0 8px #fff)",
          }}
        >
          <img
            src={LOGO_URL}
            alt={SITE_NAME}
            width={LOGO_WIDTH + 16}
            height={LOGO_HEIGHT + 16}
          />
        </div>
        <p className="text-5xl font-extrabold text-white drop-shadow-2xl tracking-widest">
          {SITE_NAME}
        </p>
        <p className="text-white/40 text-xs tracking-[0.5em] uppercase mt-0.5">
          Warp Jump…
        </p>
      </div>

      {children}
    </div>
  );
}
