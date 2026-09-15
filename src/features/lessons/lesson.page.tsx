import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  House,
  NotebookPen,
} from "lucide-react";
import { useParams } from "react-router";

import { TransitionLink } from "@/features/transitionNavigate/components/TransitionLink";
import { Button } from "@/shared/components/ui/button";
import {
  LESSONS,
  findLesson,
  toLessonPath,
} from "@/shared/constants/lessons.constant";
import { PUBLIC_ROUTE } from "@/shared/constants/routes/public.constant";
import NotFound from "@/shared/pages/notfound.page";

export default function LessonPage() {
  const { topicSlug = "", lessonSlug = "" } = useParams();
  const lesson = findLesson(topicSlug, lessonSlug);

  if (!lesson) {
    return <NotFound />;
  }

  const currentIndex = LESSONS.findIndex(
    (item) => item.topicSlug === lesson.topicSlug && item.slug === lesson.slug,
  );
  const previous = LESSONS[(currentIndex - 1 + LESSONS.length) % LESSONS.length];
  const next = LESSONS[(currentIndex + 1) % LESSONS.length];

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <BookOpen className="size-4" />
        <span>{lesson.topicTitle}</span>
        <span>/</span>
        <span className="font-medium text-foreground">{lesson.title}</span>
      </div>

      <section className="rounded-3xl border border-orange-100 bg-gradient-to-br from-orange-50 via-amber-50 to-cyan-50 p-6 shadow-sm md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-orange-700">
          {lesson.topicTitle}
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
          {lesson.title}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-700 md:text-base">
          บทเรียนหมวด {lesson.topicTitle} — กดปุ่มด้านล่างเพื่อไปบทก่อนหน้าหรือบทถัดไป
          พร้อมดู transition ระหว่างการเปลี่ยนหน้า
        </p>

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4">
          <NotebookPen className="mt-0.5 size-5 shrink-0 text-orange-600" />
          <p className="text-sm leading-6 text-slate-600">
            เนื้อหาของบทนี้กำลังจัดทำอยู่ ระหว่างนี้สามารถกดเปลี่ยนบทเรียนเพื่อทดลองการนำทางได้เลย
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button asChild variant="outline" className="sm:flex-1">
          <TransitionLink to={toLessonPath(previous.topicSlug, previous.slug)}>
            <ArrowLeft />
            ก่อนหน้า: {previous.title}
          </TransitionLink>
        </Button>
        <Button asChild className="sm:flex-1">
          <TransitionLink to={toLessonPath(next.topicSlug, next.slug)}>
            ถัดไป: {next.title}
            <ArrowRight />
          </TransitionLink>
        </Button>
      </div>

      <Button asChild variant="ghost" className="self-start">
        <TransitionLink to={PUBLIC_ROUTE.HOME}>
          <House />
          กลับหน้าหลัก
        </TransitionLink>
      </Button>
    </div>
  );
}
