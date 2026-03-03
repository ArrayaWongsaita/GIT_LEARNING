"use client";

/**
 * BounceTransition
 * ─────────────────────────────────────────────────────────────────
 * เมื่อ navigate: overlay fade-in จากด้านล่าง + logo กระโดดขึ้นมา
 * เมื่อหน้าโหลด:  overlay fade-out ลงด้านล่าง + logo กระโดดออก
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
  BOUNCE_CHARS,
  BOUNCE_BG,
  SITE_NAME,
} from "@/features/transitionNavigate/constants/transition/bounce";
import { navigationStore } from "../../stores/navigation.store";

export function BounceTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);

  /* ── initial state ── */
  useEffect(() => {
    if (overlayRef.current) overlayRef.current.style.opacity = "0";
    if (containerRef.current) {
      containerRef.current.style.opacity = "0";
      containerRef.current.style.transform = "translateY(60px) scale(0.8)";
    }
  }, []);

  useEffect(() => {
    if (!overlayRef.current || !containerRef.current) return;

    if (!isAnimating) {
      /* ── EXIT: slide overlay down + container shrink ── */
      animate(containerRef.current, {
        translateY: [0, 80],
        scale: [1, 0.7],
        opacity: [1, 0],
        duration: DURATION_START,
        ease: "outCubic",
      });
      animate(overlayRef.current, {
        opacity: [1, 0],
        translateY: [0, "100%"],
        duration: DURATION_START,
        ease: "outCubic",
      });
    } else {
      /* ── ENTER: overlay slides up from bottom ── */
      animate(overlayRef.current, {
        opacity: [0, 1],
        translateY: ["100%", "0%"],
        duration: DURATION_END,
        ease: "outExpo",
      });

      /* ── logo bounces in ── */
      animate(containerRef.current, {
        translateY: [60, 0],
        scale: [0.6, 1],
        opacity: [0, 1],
        duration: DURATION_END + 100,
        ease: "outBounce",
        delay: 80,
      });

      /* ── letters stagger wiggle ── */
      const spans = dotRefs.current.filter(Boolean) as HTMLSpanElement[];
      animate(spans, {
        translateY: [0, -18, 0],
        rotate: [-6, 6, 0],
        delay: stagger(60, { start: 120 }),
        duration: 480,
        ease: "outBack",
        loop: true,
      });

      /* ── logo spin ── */
      if (logoRef.current) {
        animate(logoRef.current, {
          rotate: [0, 360],
          duration: DURATION_END + 200,
          ease: "outBack",
          delay: 100,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative">
      {/* Gradient overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-9998 pointer-events-none opacity-0"
        style={{ background: BOUNCE_BG }}
      />

      {/* Content */}
      <div
        ref={containerRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-4 opacity-0"
      >
        <div ref={logoRef}>
          <img
            src={LOGO_URL}
            alt={SITE_NAME}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
          />
        </div>

        <div className="flex items-center gap-0.5">
          {BOUNCE_CHARS.map((ch, i) => (
            <span
              key={i}
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="text-5xl font-extrabold text-white drop-shadow-lg inline-block"
              style={{
                display: "inline-block",
                minWidth: ch === " " ? "1rem" : undefined,
              }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Loading dots */}
        <div id="loading-dots" className="flex gap-2 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-3 h-3 rounded-full bg-white/80 inline-block"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>

      {children}
    </div>
  );
}
