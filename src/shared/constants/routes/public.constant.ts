import { introductionPath } from "@/features/introduction/constants/introduction.path";

export const PUBLIC_ROUTE = {
  HOME: "/",
  LESSON: {
    INTRODUCTION: introductionPath,
    SETUP_GIT: "/lesson/setup-git",
    REPOSITORY_BASICS: "/lesson/repository-basics",
    COMMIT_WORKFLOW: "/lesson/commit-workflow",
    BRANCHING: "/lesson/branching",
    MERGE_REBASE: "/lesson/merge-rebase",
    UNDO_HISTORY: "/lesson/undo-history",
    REMOTE_COLLABORATION: "/lesson/remote-collaboration",
    BY_SLUG: (lessonSlug: string) => `/lesson/${lessonSlug}`,
    SUBTOPIC: (path: string, anchor: string) => `${path}#${anchor}`,
  },
};
