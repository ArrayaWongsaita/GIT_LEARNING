import { GIT_LESSONS } from "@/features/lesson/constants/gitLesson.constant";
import { useMemo } from "react";
import { Outlet, useLocation } from "react-router";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import MainSidebar from "../sidebars/Main.sidebar";

const normalizePath = (path?: string) => {
  if (!path) return "";
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
};

const isLessonPathActive = (
  lesson: (typeof GIT_LESSONS)[number],
  pathname: string,
) => {
  if (normalizePath(lesson.path) === pathname) {
    return true;
  }

  return lesson.subtopics.some(
    (subtopic) => normalizePath(subtopic.path) === pathname,
  );
};

export default function MainLayout() {
  const pathname = useLocation().pathname;
  const activeLesson = useMemo(() => {
    const normalizedPathname = normalizePath(pathname);
    return GIT_LESSONS.find(
      (lesson) => isLessonPathActive(lesson, normalizedPathname),
    );
  }, [pathname]);

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b px-3 py-2">
          <SidebarTrigger />
          <div>
            <p className="text-xs text-muted-foreground">Git Command Learning</p>
            <h1 className="text-sm font-semibold">
              {activeLesson ? activeLesson.title : "Git Lessons"}
            </h1>
          </div>
        </header>
        <section className="flex-1 p-4 md:p-6">
          <Outlet />
        </section>
      </SidebarInset>
    </SidebarProvider>
  );
}
