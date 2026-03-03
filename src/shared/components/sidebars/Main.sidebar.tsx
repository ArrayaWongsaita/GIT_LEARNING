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
} from "lucide-react";
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
} from "../ui/sidebar";

const gitStudyTopics = [
  {
    title: "Introduction",
    icon: BookOpen,
    subtopics: ["What is Git?", "Why Version Control", "Local vs Remote", "Basic Git Terms"],
  },
  {
    title: "Setup Git",
    icon: TerminalSquare,
    subtopics: ["Install Git", "git config user", "SSH Key Setup", "Check Version"],
  },
  {
    title: "Repository Basics",
    icon: FolderGit2,
    subtopics: ["git init", "git clone", ".gitignore", "Repository Structure"],
  },
  {
    title: "Commit Workflow",
    icon: GitCommitHorizontal,
    subtopics: ["git status", "git add", "git commit", "Commit Message Rules"],
  },
  {
    title: "Branching",
    icon: GitBranch,
    subtopics: ["git branch", "git switch", "Feature Branch", "Branch Naming"],
  },
  {
    title: "Merge & Rebase",
    icon: GitMerge,
    subtopics: ["git merge", "git rebase", "Resolve Conflicts", "Fast-forward Merge"],
  },
  {
    title: "Undo & History",
    icon: History,
    subtopics: ["git log", "git restore", "git reset", "git reflog"],
  },
  {
    title: "Remote Collaboration",
    icon: ShieldCheck,
    subtopics: ["git remote", "git pull", "git push", "Pull Request Flow"],
  },
] as const;

export default function MainSidebar() {
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>(() =>
    gitStudyTopics.reduce<Record<string, boolean>>((acc, topic, index) => {
      acc[topic.title] = index === 0;
      return acc;
    }, {}),
  );

  const toggleTopic = (title: string) => {
    setOpenTopics((prev) => ({
      ...prev,
      [title]: !prev[title],
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
              {gitStudyTopics.map((topic) => {
                const Icon = topic.icon;
                const isOpen = openTopics[topic.title];
                return (
                  <SidebarMenuItem key={topic.title}>
                    <SidebarMenuButton
                      type="button"
                      isActive={isOpen}
                      tooltip={topic.title}
                      aria-expanded={isOpen}
                      onClick={() => toggleTopic(topic.title)}
                    >
                      <Icon />
                      <span>{topic.title}</span>
                      {isOpen ? <ChevronDown className="ml-auto" /> : <ChevronRight className="ml-auto" />}
                    </SidebarMenuButton>

                    {isOpen ? (
                      <SidebarMenuSub>
                        {topic.subtopics.map((subtopic) => (
                          <SidebarMenuSubItem key={subtopic}>
                            <SidebarMenuSubButton asChild>
                              <button type="button" className="w-full cursor-pointer text-left">
                                <span>{subtopic}</span>
                              </button>
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
