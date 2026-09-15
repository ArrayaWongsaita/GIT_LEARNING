import { useState } from "react";
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  FolderGit2,
  GitBranch,
  GitCommitHorizontal,
  GitMerge,
  History,
  ShieldCheck,
  TerminalSquare,
  type LucideIcon,
} from "lucide-react";
import { matchPath, useLocation } from "react-router";

import { TransitionLink } from "@/features/transitionNavigate/components/TransitionLink";
import {
  LESSON_TOPICS,
  toLessonPath,
} from "@/shared/constants/lessons.constant";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "../ui/sidebar";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  introduction: BookOpen,
  "setup-git": TerminalSquare,
  "repository-basics": FolderGit2,
  "commit-workflow": GitCommitHorizontal,
  branching: GitBranch,
  "merge-rebase": GitMerge,
  "undo-history": History,
  "remote-collaboration": ShieldCheck,
};

export default function MainSidebar() {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  const lessonMatch = matchPath("/lessons/:topicSlug/:lessonSlug", pathname);
  const activeTopicSlug = lessonMatch?.params.topicSlug;
  const activeLessonSlug = lessonMatch?.params.lessonSlug;

  const [openTopics, setOpenTopics] = useState<Record<string, boolean | undefined>>(
    {},
  );

  const defaultOpenSlug = activeTopicSlug ?? LESSON_TOPICS[0].slug;
  const isTopicOpen = (slug: string) => openTopics[slug] ?? slug === defaultOpenSlug;

  const toggleTopic = (slug: string) => {
    setOpenTopics((prev) => ({
      ...prev,
      [slug]: !(prev[slug] ?? slug === defaultOpenSlug),
    }));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="text-xs text-sidebar-foreground/70">Git Learning Track</p>
          <h2 className="text-sm font-semibold">Study Commands</h2>
        </div>
        <SidebarInput placeholder="Search lesson..." />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lessons</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {LESSON_TOPICS.map((topic) => {
                const Icon = TOPIC_ICONS[topic.slug] ?? BookOpen;
                const isOpen = isTopicOpen(topic.slug);
                return (
                  <SidebarMenuItem key={topic.slug}>
                    <SidebarMenuButton
                      type="button"
                      isActive={isOpen}
                      tooltip={topic.title}
                      aria-expanded={isOpen}
                      onClick={() => toggleTopic(topic.slug)}
                    >
                      <Icon />
                      <span>{topic.title}</span>
                      {isOpen ? <ChevronDown className="ml-auto" /> : <ChevronRight className="ml-auto" />}
                    </SidebarMenuButton>

                    {isOpen ? (
                      <SidebarMenuSub>
                        {topic.subtopics.map((subtopic) => (
                          <SidebarMenuSubItem key={subtopic.slug}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                activeTopicSlug === topic.slug &&
                                activeLessonSlug === subtopic.slug
                              }
                            >
                              <TransitionLink
                                to={toLessonPath(topic.slug, subtopic.slug)}
                                className="w-full cursor-pointer text-left"
                                onClick={() => setOpenMobile(false)}
                              >
                                <span>{subtopic.title}</span>
                              </TransitionLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <p className="rounded-md bg-sidebar-accent px-2 py-2 text-xs text-sidebar-accent-foreground">
          Start here: Introduction, Setup Git, Repository Basics.
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
