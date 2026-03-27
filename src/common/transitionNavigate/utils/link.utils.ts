const EXTERNAL_SCHEMES = ["http://", "https://", "mailto:", "tel:", "//"];

export function isExternalHref(href: string): boolean {
  return EXTERNAL_SCHEMES.some((scheme) => href.startsWith(scheme));
}

export function normalizePath(path: string): string {
  return path.endsWith("/") && path !== "/" ? path.slice(0, -1) : path;
}
