import type {
  VcsItemId,
  VcsSectionId,
} from "./version-control-content.constant";

export type IntroductionSlug =
  | "what-is-git"
  | "what-is-version-control"
  | "local-vs-remote"
  | "basic-git-terms";

export type SlugTarget = {
  sectionId: VcsSectionId;
  itemId?: VcsItemId;
};

export const SLUG_TARGET_MAP: Record<IntroductionSlug, SlugTarget> = {
  "what-is-git": { sectionId: "vcs-definition", itemId: "concept-map" },
  "what-is-version-control": { sectionId: "vcs-definition", itemId: "definition" },
  "local-vs-remote": { sectionId: "vcs-types" },
  "basic-git-terms": { sectionId: "vcs-definition", itemId: "concept-map" },
};

export const SECTION_SCROLL_ID: Record<VcsSectionId, string> = {
  "before-vcs": "section-before-vcs",
  "vcs-definition": "section-vcs-definition",
  "vcs-types": "section-vcs-types",
  "timeline-git": "section-timeline-git",
};

export const getAccordionItemElementId = (itemId: VcsItemId) =>
  `vcs-item-${itemId}`;

export const isIntroductionSlug = (
  value?: string,
): value is IntroductionSlug => {
  if (!value) return false;
  return value in SLUG_TARGET_MAP;
};
