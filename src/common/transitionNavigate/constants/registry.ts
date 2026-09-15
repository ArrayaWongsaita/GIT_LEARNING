export const TRANSITION_IDS = [
  "slide",
  "fade",
  "bounce",
  "morph",
  "wave",
  "split",
  "pixel",
  "flip",
  "glitch",
  "vortex",
  "ink",
  "shatter",
  "zoom",
] as const;

export type TransitionId = (typeof TRANSITION_IDS)[number];

export interface TransitionItem {
  id: TransitionId;
  label: string;
  description: string;
}

export const TRANSITIONS: TransitionItem[] = [
  {
    id: "slide",
    label: "Slide",
    description: "Text slides across the screen for a classic opener.",
  },
  {
    id: "fade",
    label: "Fade",
    description: "Simple fade with subtle scale for smooth page change.",
  },
  {
    id: "bounce",
    label: "Bounce",
    description: "Playful bounce + gradient overlay and animated letters.",
  },
  {
    id: "morph",
    label: "Morph",
    description: "Portal-style expanding circle from the center.",
  },
  {
    id: "wave",
    label: "Wave",
    description: "Horizontal color strips reveal with staggered timing.",
  },
  {
    id: "split",
    label: "Split",
    description: "Top and bottom panels close and open like stage curtains.",
  },
  {
    id: "pixel",
    label: "Pixel",
    description: "Retro pixel grid reveal in diagonal waves.",
  },
  {
    id: "flip",
    label: "Flip",
    description: "3D page-flip motion with perspective depth.",
  },
  {
    id: "glitch",
    label: "Glitch",
    description: "Cyberpunk RGB glitch burst with text scramble.",
  },
  {
    id: "vortex",
    label: "Vortex",
    description: "Conic-gradient spiral portal with expanding rings.",
  },
  {
    id: "ink",
    label: "Ink",
    description: "Ink blobs spread from multiple origins.",
  },
  {
    id: "shatter",
    label: "Shatter",
    description: "Screen shards assemble and explode apart.",
  },
  {
    id: "zoom",
    label: "Zoom",
    description: "Hyperspeed tunnel zoom with depth rings.",
  },
];

export const DEFAULT_TRANSITION_ID: TransitionId = "pixel";

export const TRANSITION_MAP: Record<TransitionId, TransitionItem> =
  TRANSITIONS.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<TransitionId, TransitionItem>,
  );

export function isTransitionId(value: string): value is TransitionId {
  return TRANSITION_IDS.includes(value as TransitionId);
}

export function toTransitionPath(id: TransitionId) {
  return `/feature/transitions/${id}`;
}
