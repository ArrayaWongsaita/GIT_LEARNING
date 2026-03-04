type SetupGuideHeaderProps = {
  badge: string;
  title: string;
  description: string;
};

export function SetupGuideHeader({
  badge,
  title,
  description,
}: SetupGuideHeaderProps) {
  return (
    <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-accent/25 p-6">
      <p className="inline-flex rounded-full border border-primary/30 bg-card px-3 py-1 text-xs font-semibold text-primary">
        {badge}
      </p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-foreground">
        {title}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </header>
  );
}
