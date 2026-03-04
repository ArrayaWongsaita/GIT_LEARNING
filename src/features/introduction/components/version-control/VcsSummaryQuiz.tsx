import { CheckCircle2, HelpCircle } from "lucide-react";
import { useState } from "react";

type QuizItem = {
  id: string;
  question: string;
  answer: string;
};

type VcsSummaryQuizProps = {
  summaryBullets: readonly string[];
  quizItems: readonly QuizItem[];
};

export function VcsSummaryQuiz({ summaryBullets, quizItems }: VcsSummaryQuizProps) {
  const [openAnswerIds, setOpenAnswerIds] = useState<string[]>([]);

  const toggleAnswer = (id: string) => {
    setOpenAnswerIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id],
    );
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <h2 className="text-2xl font-black tracking-tight text-slate-900">
        สรุป + แบบทดสอบสั้น ๆ
      </h2>

      <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-800">Summary</p>
        <ul className="mt-2 space-y-2">
          {summaryBullets.map((bullet) => (
            <li key={bullet} className="flex items-start gap-2 text-sm text-slate-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-700" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 space-y-3">
        {quizItems.map((quiz) => {
          const isOpen = openAnswerIds.includes(quiz.id);
          return (
            <article key={quiz.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <HelpCircle className="size-4 text-slate-700" />
                {quiz.question}
              </p>
              <button
                type="button"
                className="mt-2 rounded-md border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                onClick={() => toggleAnswer(quiz.id)}
                aria-expanded={isOpen}
              >
                {isOpen ? "ซ่อนเฉลย" : "ดูเฉลย"}
              </button>
              {isOpen ? (
                <p className="mt-3 rounded-md bg-white p-3 text-sm leading-6 text-slate-700">
                  {quiz.answer}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <footer className="mt-6 border-t pt-4 text-xs text-slate-500">
        Made for learning — Version Control 101
      </footer>
    </section>
  );
}
