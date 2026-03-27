import { TransitionLink } from "@/common/transitionNavigate/components/TransitionLink";
import { PUBLIC_ROUTE } from "@/shared/constants/routes/public.constant";
import { ArrowLeft, ArrowRight, BookOpenCheck } from "lucide-react";
import { useMemo } from "react";
import { useParams } from "react-router";
import {
  GIT_LESSONS,
  getGitLessonBySlug,
} from "./constants/gitLesson.constant";

export default function LessonPage() {
  const { lessonSlug } = useParams();
  const lesson = getGitLessonBySlug(lessonSlug);

  const navigation = useMemo(() => {
    if (!lesson) return null;

    const currentIndex = GIT_LESSONS.findIndex(
      (item) => item.slug === lesson.slug,
    );
    if (currentIndex < 0) return null;

    return {
      previous: currentIndex > 0 ? GIT_LESSONS[currentIndex - 1] : undefined,
      next:
        currentIndex < GIT_LESSONS.length - 1
          ? GIT_LESSONS[currentIndex + 1]
          : undefined,
    };
  }, [lesson]);

  if (!lesson) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-col items-start gap-4 rounded-2xl border bg-white p-6">
        <p className="text-sm font-semibold text-rose-600">
          ไม่พบบทเรียนที่ต้องการ
        </p>
        <h2 className="text-2xl font-bold text-slate-900">Lesson Not Found</h2>
        <p className="text-sm leading-6 text-slate-600">
          บทเรียนที่คุณเรียกอาจไม่ถูกต้องหรือถูกย้ายตำแหน่งแล้ว
        </p>
        <TransitionLink
          to={PUBLIC_ROUTE.HOME}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          <ArrowLeft className="size-4" />
          กลับหน้า Introduction
        </TransitionLink>
      </section>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-6">
        <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-semibold text-cyan-700">
          <BookOpenCheck className="size-4" />
          Git Learning
        </p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          {lesson.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
          {lesson.summary}
        </p>
      </header>

      <section className="grid gap-4">
        {lesson.subtopics.map((subtopic) => (
          <article
            key={subtopic.anchor}
            id={subtopic.anchor}
            className="scroll-mt-24 rounded-xl border bg-white p-5 shadow-sm"
          >
            <h3 className="text-lg font-bold text-slate-900">
              {subtopic.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {subtopic.description}
            </p>

            {subtopic.commands?.length ? (
              <pre className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-slate-900 p-3 text-xs text-cyan-200 md:text-sm">
                <code>{subtopic.commands.join("\n")}</code>
              </pre>
            ) : null}
          </article>
        ))}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-4">
        {navigation?.previous ? (
          <TransitionLink
            to={navigation.previous.path}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="size-4" />
            {navigation.previous.title}
          </TransitionLink>
        ) : (
          <div />
        )}

        {navigation?.next ? (
          <TransitionLink
            to={navigation.next.path}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            {navigation.next.title}
            <ArrowRight className="size-4" />
          </TransitionLink>
        ) : (
          <TransitionLink
            to={PUBLIC_ROUTE.HOME}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            กลับหน้าแรก
          </TransitionLink>
        )}
      </footer>
    </div>
  );
}
