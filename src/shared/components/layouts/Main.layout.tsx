import { matchPath, Outlet, useLocation } from "react-router";
import { findLesson } from "@/shared/constants/lessons.constant";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import MainSidebar from "../sidebars/Main.sidebar";

export default function MainLayout() {
  const { pathname } = useLocation();
  const lessonMatch = matchPath("/lessons/:topicSlug/:lessonSlug", pathname);
  const lesson = lessonMatch
    ? findLesson(
        lessonMatch.params.topicSlug ?? "",
        lessonMatch.params.lessonSlug ?? "",
      )
    : undefined;

  return (
    <SidebarProvider>
      <MainSidebar />
      <SidebarInset>
        <header className="flex items-center gap-2 border-b px-3 py-2">
          <SidebarTrigger />
          <div>
            <p className="text-xs text-muted-foreground">Git Command Learning</p>
            <h1 className="text-sm font-semibold">
              {lesson
                ? `${lesson.topicTitle}: ${lesson.title}`
                : "Introduction and Core Workflow"}
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
