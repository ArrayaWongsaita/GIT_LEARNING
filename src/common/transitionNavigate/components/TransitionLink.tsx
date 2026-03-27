"use client";

import { cn } from "@/shared/lib/utils";
import { forwardRef, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { navigationStore } from "../stores/navigation.store";
import { isExternalHref, normalizePath } from "../utils/link.utils";

type TransitionLinkProps = React.ComponentPropsWithoutRef<typeof Link>;

export const TransitionLink = forwardRef<
  HTMLAnchorElement,
  TransitionLinkProps
>(function TransitionLink(
  { to: href, className, onClick, target, ...props },
  ref,
) {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();
  const { TransitionNavigate } = navigationStore();

  const hrefValue = typeof href === "string" ? href : href.toString();
  const isExternal = isExternalHref(hrefValue);
  const normalizedPathname = normalizePath(pathname);
  const normalizedHref = normalizePath(hrefValue);
  const isActive = !isExternal && normalizedPathname === normalizedHref;

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (e.defaultPrevented) {
        return;
      }

      const hasModifierKey = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
      if (
        hasModifierKey ||
        e.button !== 0 ||
        target === "_blank" ||
        e.currentTarget.getAttribute("target") === "_blank" ||
        isExternal
      ) {
        return;
      }

      e.preventDefault();
      if (isActive) {
        return;
      }

      await TransitionNavigate(hrefValue, navigate, pathname);
    },
    [
      TransitionNavigate,
      hrefValue,
      isActive,
      isExternal,
      onClick,
      pathname,
      navigate,
      target,
    ],
  );

  return (
    <Link
      ref={ref}
      to={href}
      className={cn(className, isActive && "active")}
      onClick={handleClick}
      target={target}
      {...props}
    />
  );
});
