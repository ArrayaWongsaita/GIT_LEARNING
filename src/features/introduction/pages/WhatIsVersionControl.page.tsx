import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import { VersionControlHero } from "@/features/introduction/components/version-control/VersionControlHero";
import { VcsAccordionSection } from "@/features/introduction/components/version-control/VcsAccordionSection";
import { VcsSummaryQuiz } from "@/features/introduction/components/version-control/VcsSummaryQuiz";
import {
  SECTION_SCROLL_ID,
  SLUG_TARGET_MAP,
  getAccordionItemElementId,
  isIntroductionSlug,
} from "@/features/introduction/constants/version-control-anchor.constant";
import {
  VCS_ACCORDION_SECTIONS,
  VCS_MINI_QUIZ,
  VCS_SUMMARY_BULLETS,
  type VcsSectionId,
} from "@/features/introduction/constants/version-control-content.constant";

const STORAGE_PREFIX = "vcs101:accordion:";

const createDefaultAccordionState = (): Record<VcsSectionId, string[]> =>
  Object.fromEntries(
    VCS_ACCORDION_SECTIONS.map((section) => [
      section.id,
      section.id === "before-vcs" ? [section.defaultOpenItemId] : [],
    ]),
  ) as Record<VcsSectionId, string[]>;

const hydrateAccordionStateFromStorage = (): Record<VcsSectionId, string[]> => {
  const hydrated = createDefaultAccordionState();
  if (typeof window === "undefined") return hydrated;

  VCS_ACCORDION_SECTIONS.forEach((section) => {
    const rawValue = localStorage.getItem(`${STORAGE_PREFIX}${section.id}`);
    if (!rawValue) return;

    try {
      const parsed = JSON.parse(rawValue);
      if (!Array.isArray(parsed)) return;

      const validValues = parsed.filter((value): value is string =>
        section.items.some((item) => item.id === value),
      );
      if (validValues.length > 0) {
        hydrated[section.id] = validValues;
      }
    } catch {
      // Ignore malformed data and fallback to default values.
    }
  });

  return hydrated;
};

export default function WhatIsVersionControlPage() {
  const { introductionSlug } = useParams();
  const [accordionState, setAccordionState] = useState<
    Record<VcsSectionId, string[]>
  >(() => hydrateAccordionStateFromStorage());

  const slugTarget = useMemo(() => {
    if (!isIntroductionSlug(introductionSlug)) return undefined;
    return SLUG_TARGET_MAP[introductionSlug];
  }, [introductionSlug]);

  const scrollToElement = (elementId: string) => {
    const target = document.getElementById(elementId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSectionValueChange = (sectionId: VcsSectionId, values: string[]) => {
    setAccordionState((prev) => ({
      ...prev,
      [sectionId]: values,
    }));
  };

  useEffect(() => {
    VCS_ACCORDION_SECTIONS.forEach((section) => {
      const sectionValues = accordionState[section.id] ?? [];
      localStorage.setItem(
        `${STORAGE_PREFIX}${section.id}`,
        JSON.stringify(sectionValues),
      );
    });
  }, [accordionState]);

  useEffect(() => {
    if (!slugTarget) return;

    const targetId = slugTarget.itemId
      ? getAccordionItemElementId(slugTarget.itemId)
      : SECTION_SCROLL_ID[slugTarget.sectionId];

    const timeoutId = window.setTimeout(() => {
      scrollToElement(targetId);
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [slugTarget]);

  const getEffectiveOpenValues = (sectionId: VcsSectionId) => {
    const sectionValues = accordionState[sectionId] ?? [];
    if (slugTarget?.sectionId !== sectionId) return sectionValues;
    if (!slugTarget.itemId) return sectionValues;
    if (sectionValues.includes(slugTarget.itemId)) return sectionValues;
    return [...sectionValues, slugTarget.itemId];
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <VersionControlHero
        onStartRead={() => scrollToElement(SECTION_SCROLL_ID["before-vcs"])}
        onViewTimeline={() => scrollToElement(SECTION_SCROLL_ID["timeline-git"])}
      />

      {VCS_ACCORDION_SECTIONS.map((section) => (
        <VcsAccordionSection
          key={section.id}
          section={section}
          openValues={getEffectiveOpenValues(section.id)}
          onValuesChange={(values) => handleSectionValueChange(section.id, values)}
        />
      ))}

      <VcsSummaryQuiz summaryBullets={VCS_SUMMARY_BULLETS} quizItems={VCS_MINI_QUIZ} />
    </main>
  );
}
