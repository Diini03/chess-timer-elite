import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { signedUrl } from "@/lib/books";
import { cn } from "@/lib/utils";

export function BookCover({
  coverPath,
  title,
  className,
}: {
  coverPath: string | null;
  title: string;
  className?: string;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!coverPath) {
      setUrl(null);
      return;
    }
    signedUrl("book-covers", coverPath).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [coverPath]);

  return (
    <div
      className={cn(
        "relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary",
        className,
      )}
    >
      {url ? (
        <img src={url} alt={`Cover of ${title}`} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          <BookOpen aria-hidden className="h-7 w-7 text-primary" />
          <span className="font-display text-xl leading-tight tracking-wide text-muted-foreground line-clamp-3">
            {title}
          </span>
        </div>
      )}
    </div>
  );
}
