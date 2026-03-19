import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/components/ui/accordion";
import type {
  GitHubRuleDetailItem,
  GitHubRuleItem,
} from "@/features/remote-collaboration/constants/github-rules-content.constant";

type GitHubRulesAccordionProps = {
  rules: GitHubRuleItem[];
};

type RuleDetailSectionProps = {
  title: string;
  content: string;
  tone?: "default" | "highlight";
};

type RelatedItemListProps = {
  title: string;
  items: GitHubRuleDetailItem[];
  bordered?: boolean;
};

function RuleDetailSection({
  title,
  content,
  tone = "default",
}: RuleDetailSectionProps) {
  const className =
    tone === "highlight"
      ? "rounded-xl border border-primary/30 bg-primary/10 p-4"
      : "rounded-xl border border-border bg-muted/30 p-4";

  return (
    <article className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">{title}</p>
      <p className="mt-2 text-sm leading-6 text-foreground">{content}</p>
    </article>
  );
}

function RelatedItemList({
  title,
  items,
  bordered = false,
}: RelatedItemListProps) {
  const className = bordered
    ? "rounded-xl border border-dashed border-border bg-background/80 p-4"
    : "rounded-xl border border-border bg-background/80 p-4";

  return (
    <section className={className}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-xl border border-border/70 bg-background px-4 py-3"
          >
            <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {item.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function GitHubRulesAccordion({ rules }: GitHubRulesAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className="mt-4 rounded-2xl border border-border bg-background px-4 md:px-5"
    >
      {rules.map((rule, index) => (
        <AccordionItem key={rule.id} value={rule.id}>
          <AccordionTrigger className="py-5 text-left hover:no-underline">
            <span className="flex min-w-0 flex-1 items-start gap-3">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="text-base font-bold text-foreground md:text-lg">
                  {rule.title}
                </span>
                <span className="text-sm font-normal leading-6 text-muted-foreground">
                  {rule.summary}
                </span>
              </span>
            </span>
          </AccordionTrigger>

          <AccordionContent>
            <div className="flex flex-col gap-4 pb-2">
              <div className="grid gap-3 lg:grid-cols-3">
                <RuleDetailSection title="Why it matters" content={rule.whyItMatters} />
                <RuleDetailSection title="When to use" content={rule.whenToUse} />
                <RuleDetailSection
                  title="Watch out"
                  content={rule.watchOut}
                  tone="highlight"
                />
              </div>

              {rule.settings?.length ? (
                <RelatedItemList title="Additional settings" items={rule.settings} />
              ) : null}

              {rule.relatedRules?.length ? (
                <RelatedItemList
                  title="Pairs well with"
                  items={rule.relatedRules}
                  bordered
                />
              ) : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
