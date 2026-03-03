"use client";

/**
 * ShatterTransition
 * ─────────────────────────────────────────────────────────────────
 * หน้าจอแตกออกเป็น shard สี่เหลี่ยมเอียง → กระเด็นออก
 * เมื่อ ENTER: shards บินเข้ามารวมตัว → EXIT: กระเด็นออก
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
  SHARD_COUNT,
  SHARD_BG,
} from "@/features/transitionNavigate/constants/transition/shatter";
import { navigationStore } from "../../stores/navigation.store";

// Pre-compute shard layout (deterministic, no random at render)
const SHARDS = Array.from({ length: SHARD_COUNT }, (_, i) => {
  const cols = 4;
  const rows = SHARD_COUNT / cols;
  const col = i % cols;
  const row = Math.floor(i / cols);
  const skew = ((i % 3) - 1) * 8; // -8, 0, 8
  const flyX = (col - cols / 2 + 0.5) * 140;
  const flyY = (row - rows / 2 + 0.5) * 140;
  const spin = (i % 2 === 0 ? 1 : -1) * (45 + ((i * 17) % 90));
  return { col, row, cols, rows, skew, flyX, flyY, spin };
});

export function ShatterTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const shardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const logoRef = useRef<HTMLDivElement>(null);

  /* ── initial state ── */
  useEffect(() => {
    shardRefs.current.forEach((el, i) => {
      if (!el) return;
      const { flyX, flyY, spin } = SHARDS[i];
      el.style.transform = `translate(${flyX}%, ${flyY}%) rotate(${spin}deg)`;
      el.style.opacity = "0";
    });
    if (logoRef.current) logoRef.current.style.opacity = "0";
  }, []);

  useEffect(() => {
    const shards = shardRefs.current.filter(Boolean) as HTMLDivElement[];
    const logo = logoRef.current;

    if (!isAnimating) {
      /* ── EXIT: shards fly apart ── */
      if (logo)
        animate(logo, {
          opacity: [1, 0],
          scale: [1, 0.5],
          duration: 180,
          ease: "inCubic",
        });
      shards.forEach((el, i) => {
        const { flyX, flyY, spin } = SHARDS[i];
        animate(el, {
          translateX: [`0%`, `${flyX * 1.5}%`],
          translateY: [`0%`, `${flyY * 1.5}%`],
          rotate: [0, spin],
          opacity: [1, 0],
          duration: DURATION_START,
          ease: "inExpo",
          delay: i * 12,
        });
      });
    } else {
      /* ── ENTER: shards fly in and assemble ── */
      shards.forEach((el, i) => {
        const { flyX, flyY, spin } = SHARDS[i];
        el.style.opacity = "1";
        animate(el, {
          translateX: [`${flyX * 2}%`, "0%"],
          translateY: [`${flyY * 2}%`, "0%"],
          rotate: [spin, 0],
          opacity: [0, 1],
          duration: DURATION_END,
          ease: "outExpo",
          delay: i * 18,
        });
      });

      /* ── logo ── */
      if (logo) {
        animate(logo, {
          opacity: [0, 1],
          scale: [0.4, 1.1, 1],
          duration: DURATION_END - 60,
          ease: "outBack",
          delay: 220,
        });
      }
    }
  }, [isAnimating]);

  return (
    <div className="relative overflow-hidden">
      {/* Shards */}
      <div className="fixed inset-0 z-9998 pointer-events-none">
        {SHARDS.map(({ col, row, cols, rows, skew }, i) => (
          <div
            key={i}
            ref={(el) => {
              shardRefs.current[i] = el;
            }}
            className="absolute"
            style={{
              left: `${(col / cols) * 100}%`,
              top: `${(row / rows) * 100}%`,
              width: `${100 / cols + 1}%`,
              height: `${100 / rows + 1}%`,
              backgroundColor:
                (col + row) % 2 === 0 ? SHARD_BG : "rgba(39,39,42,0.97)",
              transform: `translate(0%, 0%) rotate(0deg) skewX(${skew}deg)`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <div
        ref={logoRef}
        className="fixed inset-0 z-9999 pointer-events-none flex flex-col items-center justify-center gap-4"
        style={{ opacity: 0 }}
      >
        <div style={{ filter: "drop-shadow(0 0 16px rgba(139,92,246,0.8))" }}>
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
        <span className="h-0.5 w-32 rounded-full bg-linear-to-r from-violet-500 via-pink-500 to-orange-400" />
      </div>

      {children}
    </div>
  );
}
