import { SetupGuideHeader } from "@/shared/components/setup-guide/SetupGuideHeader";
import { GitHubRulesAccordion } from "@/features/remote-collaboration/components/GitHubRulesAccordion";
import {
  GITHUB_RULES_ITEMS,
  GITHUB_RULES_SETUP_AREAS,
} from "@/features/remote-collaboration/constants/github-rules-content.constant";

export default function GitHubRulesPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <SetupGuideHeader
        badge="GitHub"
        title="Rules"
        description="เรียนรู้การใช้ GitHub rulesets เพื่อปกป้อง branch สำคัญ และกำหนดว่าใคร push, merge หรือ bypass กติกาบางอย่างได้บ้าง"
      />

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Bypass list + Target branches
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          ก่อนเลือก rules จริง ให้ตั้งสองส่วนนี้ให้ชัดก่อนว่าใครข้ามกติกาได้ และกติกาจะมีผลกับ
          branch กลุ่มไหนบ้าง
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {GITHUB_RULES_SETUP_AREAS.map((item) => (
            <article key={item.id} className="rounded-xl border border-border bg-muted/30 p-4">
              <h3 className="text-base font-bold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm md:p-6">
        <h2 className="text-xl font-black tracking-tight text-foreground">
          Which rules should be applied?
        </h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          เลือก rules ให้เหมาะกับ branch สำคัญของทีม แต่ละข้อด้านล่างกดเปิดดูเหตุผล วิธีใช้
          และข้อควรระวังเพิ่มเติมได้
        </p>
        <GitHubRulesAccordion rules={GITHUB_RULES_ITEMS} />
      </section>
    </main>
  );
}
