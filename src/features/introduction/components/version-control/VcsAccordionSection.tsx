import { VcsIllustration } from "@/features/introduction/components/version-control/VcsIllustrations";
import { VcsTimeline } from "@/features/introduction/components/version-control/VcsTimeline";
import type {
  VcsAccordionSection,
  VcsItemId,
} from "@/features/introduction/constants/version-control-content.constant";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { getAccordionItemElementId } from "@/features/introduction/constants/version-control-anchor.constant";

type VcsAccordionSectionProps = {
  section: VcsAccordionSection;
  openValues: string[];
  onValuesChange: (values: string[]) => void;
};

export function VcsAccordionSection({
  section,
  openValues,
  onValuesChange,
}: VcsAccordionSectionProps) {
  return (
    <section id={section.domId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <h2 className="text-2xl font-black tracking-tight text-slate-900">{section.title}</h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{section.description}</p>

      <Accordion
        type="multiple"
        className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 md:px-4"
        value={openValues}
        onValueChange={(values) => onValuesChange(values as string[])}
      >
        {section.items.map((item) => {
          const Icon = item.icon;
          const itemElementId = getAccordionItemElementId(item.id as VcsItemId);

          return (
            <AccordionItem key={item.id} id={itemElementId} value={item.id}>
              <AccordionTrigger className="group text-left hover:no-underline">
                <span className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <Icon className="size-4 text-cyan-700" />
                  {item.title}
                </span>
              </AccordionTrigger>

              <AccordionContent>
                <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
                  <div className="order-2 space-y-3 md:order-1">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        แนวคิดสั้น ๆ
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{item.keyIdea}</p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        ทำไมสำคัญ
                      </p>
                      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
                        {item.importance.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        ตัวอย่าง
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-700">{item.example}</p>
                    </div>
                  </div>

                  <div className="order-1 md:order-2">
                    <VcsIllustration illustration={item.imageKey} alt={item.imageAlt} />
                  </div>
                </div>

                {item.timelineEvents?.length ? (
                  <div className="mt-4">
                    <VcsTimeline events={item.timelineEvents} />
                  </div>
                ) : null}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </section>
  );
}
