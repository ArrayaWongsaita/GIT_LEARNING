import { ArrowDown, Clock3 } from "lucide-react";

type VersionControlHeroProps = {
  onStartRead: () => void;
  onViewTimeline: () => void;
};

export function VersionControlHero({
  onStartRead,
  onViewTimeline,
}: VersionControlHeroProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-cyan-50 px-5 py-8 shadow-sm md:px-8 md:py-10">
      <div className="mx-auto max-w-4xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1 text-xs font-semibold text-amber-700">
          <Clock3 className="size-4" />
          Version Control 101
        </p>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
          Version Control คืออะไร?
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 md:text-base">
          จากยุคไฟล์ final_final → สู่ Git ที่ทีมทั่วโลกใช้
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onStartRead}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            เริ่มอ่าน
            <ArrowDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={onViewTimeline}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
          >
            ดู Timeline
          </button>
        </div>
      </div>
    </section>
  );
}
