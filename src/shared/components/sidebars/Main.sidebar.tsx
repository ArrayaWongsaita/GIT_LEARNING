import { TransitionLink } from "@/features/transitionNavigate/components/TransitionLink";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenuAction,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "../ui/sidebar";
import { useLocation } from "react-router";

import type { SidebarData } from "@/shared/types/sidebar.type";
import { INTRODUCTION_SIDE_BAR_DATA } from "@/features/introduction/constants/introduction-sidebar.constant";

const MAIN_SIDE_BAR_DATA: SidebarData[] = [INTRODUCTION_SIDE_BAR_DATA];

const normalizePath = (path: string) =>
  path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;

const createInitialOpenState = (): Record<string, boolean> =>
  Object.fromEntries(
    MAIN_SIDE_BAR_DATA.map((item) => [
      item.path,
      item.title === "Introduction",
    ]),
  );

const isItemActive = (item: SidebarData, normalizedPathname: string) => {
  const itemPath = normalizePath(item.path);
  if (itemPath === normalizedPathname) return true;
  return (
    item.children?.some(
      (child) => normalizePath(child.path) === normalizedPathname,
    ) ?? false
  );
};

export default function MainSidebar() {
  const pathname = useLocation().pathname;
  const normalizedPathname = useMemo(() => normalizePath(pathname), [pathname]);

  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>(() =>
    createInitialOpenState(),
  );

  const toggleTopic = (path: string) => {
    setOpenTopics((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="px-2 py-1">
          <p className="text-xs text-sidebar-foreground/70">
            Git Learning Track
          </p>
          <h2 className="text-sm font-semibold">Study Commands</h2>
        </div>
        <SidebarInput placeholder="Search lesson..." />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Lessons</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {MAIN_SIDE_BAR_DATA.map((item) => {
                const Icon = item.icon;
                const isOpen =
                  openTopics[item.path] ||
                  isItemActive(item, normalizedPathname);
                const hasChildren = Boolean(item.children?.length);
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isItemActive(item, normalizedPathname)}
                      tooltip={item.title}
                    >
                      <TransitionLink to={item.path}>
                        {Icon ? <Icon /> : null}
                        <span>{item.title}</span>
                      </TransitionLink>
                    </SidebarMenuButton>

                    {hasChildren ? (
                      <SidebarMenuAction
                        type="button"
                        aria-label={`Toggle ${item.title}`}
                        onClick={() => toggleTopic(item.path)}
                      >
                        {isOpen ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </SidebarMenuAction>
                    ) : null}

                    {isOpen && hasChildren ? (
                      <SidebarMenuSub>
                        {item.children?.map((child) => (
                          <SidebarMenuSubItem key={child.path}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                normalizePath(child.path) === normalizedPathname
                              }
                            >
                              <TransitionLink
                                to={child.path}
                                className="w-full"
                              >
                                <span>{child.title}</span>
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
          Start here: Introduction topics.
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
