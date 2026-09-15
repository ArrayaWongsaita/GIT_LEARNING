import { useState } from "react";
import type { SidebarData } from "@/shared/types/sidebar.type";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem as SidebarMenuItemPrimitive,
} from "../ui/sidebar";
import { SidebarMenuSub } from "./SidebarMenuSub";

type SidebarMenuItemProps = {
  item: SidebarData;
  isActive: boolean;
  normalizedPathname: string;
  defaultOpen?: boolean;
};

export function SidebarMenuItem({
  item,
  isActive,
  normalizedPathname,
  defaultOpen = false,
}: SidebarMenuItemProps) {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const Icon = item.icon;
  const hasChildren = Boolean(item.children?.length);
  const isExpanded = isOpen || isActive;

  const toggleOpen = () => {
    if (!hasChildren) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <SidebarMenuItemPrimitive>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={item.title}
        onClick={toggleOpen}
        aria-expanded={hasChildren ? isExpanded : undefined}
      >
        <Icon />
        <span>{item.title}</span>
      </SidebarMenuButton>

      {hasChildren ? (
        <SidebarMenuAction
          type="button"
          aria-label={`Toggle ${item.title}`}
          onClick={toggleOpen}
        >
          {isExpanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </SidebarMenuAction>
      ) : null}

      {isExpanded && hasChildren && item.children ? (
        <SidebarMenuSub
          items={item.children}
          normalizedPathname={normalizedPathname}
        />
      ) : null}
    </SidebarMenuItemPrimitive>
  );
}
