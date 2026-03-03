"use client";

import { useEffect, useRef } from "react";
import { animate, stagger, text } from "animejs";

import {
  DURATION,
  DURATION_END,
  DURATION_START,
} from "@/features/transitionNavigate/constants/duration";
import {
  LOGO_URL,
  LOGO_WIDTH,
  LOGO_HEIGHT,
  SITE_NAME,
} from "@/features/transitionNavigate/constants/transition/slide";
import { navigationStore } from "../../stores/navigation.store";
export function SlideTransition({ children }: { children: React.ReactNode }) {
  const { isAnimating } = navigationStore();

  const overlayRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const { chars } = text.split("p", {
      chars: true,
    });

    animate(chars, {
      y: ["0px", "-35px", "35px", "0px"],
      x: ["0px", "25px", "25px", "0px"],
      delay: stagger(150),
      loop: true,
    });
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      imageRef.current.style.transformOrigin = "50% 100%"; // center bottom
      animate(imageRef.current, {
        rotate: [0, 20, 0, -20],
        duration: (DURATION_START + DURATION_END) * 2,
      });
    }
    if (!overlayRef.current || !slideRef.current) return;
    if (!isAnimating) {
      animate(overlayRef.current, {
        opacity: [1, 0],
        duration: DURATION_START,
        ease: "inOut",
      });
    } else {
      if (!slideRef.current) return;
      animate(overlayRef.current, {
        opacity: [0, 1],
        duration: DURATION_END,
        ease: "inOut",
      });

      slideRef.current.style.opacity = String(1);

      const textWidth = 350;
      animate(slideRef.current, {
        translateX: [`-${textWidth}px`, `100vw`],
        duration: DURATION * 2,
        ease: "inOut",
        onComplete: () => {
          // ซ่อน text หลัง animation เสร็จ
          if (!slideRef.current) return;
          slideRef.current.style.opacity = String(0);
        },
      });
    }
  }, [isAnimating]);

  return (
    <div className="relative ">
      <div
        ref={overlayRef}
        className="fixed inset-0 z-9998 pointer-events-none bg-primary opacity-0"
      ></div>
      <div
        ref={slideRef}
        className="fixed top-1/2 left-0 -translate-y-1/2 z-9999 pointer-events-none opacity-0"
      >
        <div className="flex  items-center justify-center gap-6 p-4 rounded-xl">
          <p className="text-4xl md:text-6xl text-white font-bold ">
            {SITE_NAME}
          </p>
          <img
            ref={imageRef}
            src={LOGO_URL}
            alt={SITE_NAME}
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
          />
        </div>
      </div>

      {children}
    </div>
  );
}
