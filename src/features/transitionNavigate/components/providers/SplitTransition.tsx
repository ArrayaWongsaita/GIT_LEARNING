"use client";

/**
 * SplitTransition
 * ─────────────────────────────────────────────────────────────────
 * หน้าจอแยกออกเป็น 2 ส่วน บน/ล่าง เลื่อนปิดมาชนกันตรงกลาง
 * แล้วแยกออกเมื่อโหลดเสร็จ ให้ความรู้สึก theatrical & playful
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
  SPLIT_TOP_BG,
  SPLIT_BOTTOM_BG,
  SITE_NAME,
  SITE_WELCOME,
  SITE_TAGLINE,
} from "@/features/transitionNavigate/constants/transition/split";
import { navigationStore } from "../../stores/navigation.store";

export function SplitTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLParagraphElement>(null);
  const bottomTextRef = useRef<HTMLParagraphElement>(null);

  /* ── initial state ── */
  useEffect(() => {
    if (topRef.current) topRef.current.style.transform = "translateY(-100%)";
    if (bottomRef.current)
      bottomRef.current.style.transform = "translateY(100%)";
    if (logoRef.current) {
      logoRef.current.style.opacity = "0";
      logoRef.current.style.transform = "scale(0.6)";
    }
  }, []);

  useEffect(() => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    const logo = logoRef.current;
    const topText = topTextRef.current;
    const bottomText = bottomTextRef.current;
    if (!top || !bottom) return;

    if (!isAnimating) {
      /* ── EXIT: panels slide away ── */
      if (logo) {
        animate(logo, {
          opacity: [1, 0],
          scale: [1, 0.5],
          duration: 200,
          ease: "inCubic",
        });
      }
      animate(top, {
        translateY: [0, "-100%"],
        duration: DURATION_START,
        ease: "inExpo",
      });
      animate(bottom, {
        translateY: [0, "100%"],
        duration: DURATION_START,
        ease: "inExpo",
      });
    } else {
      /* ── ENTER: panels slide in from top/bottom ── */
      animate(top, {
        translateY: ["-100%", 0],
        duration: DURATION_END,
        ease: "outExpo",
      });
      animate(bottom, {
        translateY: ["100%", 0],
        duration: DURATION_END,
        ease: "outExpo",
      });

      /* ── logo pops in from center ── */
      if (logo) {
        animate(logo, {
          opacity: [0, 1],
          scale: [0.5, 1.1, 1],
          duration: DURATION_END,
          ease: "outBack",
          delay: 150,
        });
      }

      /* ── text slides from opposite directions ── */
      if (topText) {
        animate(topText, {
          translateX: [-60, 0],
          opacity: [0, 1],
          duration: DURATION_END - 60,
          ease: "outExpo",
          delay: 200,
        });
      }
      if (bottomText) {
        animate(bottomText, {
          translateX: [60, 0],
          opacity: [0, 1],
          duration: DURATION_END - 60,
          ease: "outExpo",
          delay: 240,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative">
      {/* Top half */}
      <div
        ref={topRef}
        className="fixed top-0 left-0 w-full h-1/2 z-9998 pointer-events-none flex items-end justify-center pb-4 "
        style={{
          background: SPLIT_TOP_BG,
          transform: "translateY(-100%)",
        }}
      >
        <p
          ref={topTextRef}
          className="text-white/40 text-sm tracking-[0.35em] uppercase font-medium"
          style={{ opacity: 0 }}
        >
          {SITE_WELCOME}
        </p>
      </div>

      {/* Bottom half */}
      <div
        ref={bottomRef}
        className="fixed bottom-0 left-0 w-full h-1/2 z-9998 pointer-events-none flex items-start justify-center pt-4"
        style={{
          background: SPLIT_BOTTOM_BG,
          transform: "translateY(100%)",
        }}
      >
        <p
          ref={bottomTextRef}
          className="text-white/40 text-sm tracking-[0.35em] uppercase font-medium"
          style={{ opacity: 0 }}
        >
          {SITE_TAGLINE}
        </p>
      </div>

      {/* Center logo — sits between the two halves */}
      <div
        ref={logoRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-3"
        style={{ opacity: 0 }}
      >
        <img
          src={LOGO_URL}
          alt={SITE_NAME}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
        />
        <p className="text-5xl font-extrabold text-white drop-shadow-2xl tracking-wide">
          {SITE_NAME}
        </p>
        <span className="mt-1 h-0.5 w-24 rounded-full bg-white/40" />
      </div>

      {children}
    </div>
  );
}
