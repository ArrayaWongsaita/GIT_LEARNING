export interface LessonSubtopic {
  title: string;
  slug: string;
}

export interface LessonTopic {
  title: string;
  slug: string;
  subtopics: LessonSubtopic[];
}

export interface Lesson {
  title: string;
  slug: string;
  topicTitle: string;
  topicSlug: string;
}

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const LESSON_TOPIC_TITLES = [
  {
    title: "Introduction",
    subtopics: [
      "What is Git?",
      "Why Version Control",
      "Local vs Remote",
      "Basic Git Terms",
    ],
  },
  {
    title: "Setup Git",
    subtopics: ["Install Git", "git config user", "SSH Key Setup", "Check Version"],
  },
  {
    title: "Repository Basics",
    subtopics: ["git init", "git clone", ".gitignore", "Repository Structure"],
  },
  {
    title: "Commit Workflow",
    subtopics: ["git status", "git add", "git commit", "Commit Message Rules"],
  },
  {
    title: "Branching",
    subtopics: ["git branch", "git switch", "Feature Branch", "Branch Naming"],
  },
  {
    title: "Merge & Rebase",
    subtopics: ["git merge", "git rebase", "Resolve Conflicts", "Fast-forward Merge"],
  },
  {
    title: "Undo & History",
    subtopics: ["git log", "git restore", "git reset", "git reflog"],
  },
  {
    title: "Remote Collaboration",
    subtopics: ["git remote", "git pull", "git push", "Pull Request Flow"],
  },
] as const;

export const LESSON_TOPICS: LessonTopic[] = LESSON_TOPIC_TITLES.map((topic) => ({
  title: topic.title,
  slug: toSlug(topic.title),
  subtopics: topic.subtopics.map((title) => ({ title, slug: toSlug(title) })),
}));

export const LESSONS: Lesson[] = LESSON_TOPICS.flatMap((topic) =>
  topic.subtopics.map((subtopic) => ({
    title: subtopic.title,
    slug: subtopic.slug,
    topicTitle: topic.title,
    topicSlug: topic.slug,
  })),
);

export function toLessonPath(topicSlug: string, lessonSlug: string): string {
  return `/lessons/${topicSlug}/${lessonSlug}`;
}

export function findLesson(
  topicSlug: string,
  lessonSlug: string,
): Lesson | undefined {
  return LESSONS.find(
    (lesson) => lesson.topicSlug === topicSlug && lesson.slug === lessonSlug,
  );
}
