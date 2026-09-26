import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, FileText, Library, LogOut, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchBooks, BOOKS_KEY, type Book } from "@/lib/books";
import { useAuth } from "@/hooks/use-auth";
import { BookCover } from "@/components/library/BookCover";
import { AddBookDialog } from "@/components/library/AddBookDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export const Route = createFileRoute("/_authenticated/library/")({
  component: LibraryPage,
  head: () => ({
    meta: [
      { title: "My Library — Taktik" },
      { name: "description", content: "Your private collection of books and PDFs: search, filter, and read in the browser." },
      { property: "og:title", content: "My Library — Taktik" },
      { property: "og:description", content: "Your private collection of books and PDFs." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type Sort = "newest" | "oldest" | "title";

function LibraryPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [author, setAuthor] = useState<string>("all");
  const [tag, setTag] = useState<string>("all");
  const [sort, setSort] = useState<Sort>("newest");

  const { data: books = [], isLoading, refetch } = useQuery({
    queryKey: BOOKS_KEY,
    queryFn: fetchBooks,
  });

  const authors = useMemo(
    () => Array.from(new Set(books.map((b) => b.author).filter(Boolean) as string[])).sort(),
    [books],
  );
  const tags = useMemo(
    () => Array.from(new Set(books.flatMap((b) => b.tags))).sort(),
    [books],
  );

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const filtered = books.filter((b) => {
      const matchesText =
        !needle ||
        b.title.toLowerCase().includes(needle) ||
        (b.author ?? "").toLowerCase().includes(needle);
      const matchesAuthor = author === "all" || b.author === author;
      const matchesTag = tag === "all" || b.tags.includes(tag);
      return matchesText && matchesAuthor && matchesTag;
    });
    const sorted = [...filtered];
    if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "oldest")
      sorted.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
    else sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return sorted;
  }, [books, q, author, tag, sort]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-5 py-4 backdrop-blur md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-primary/50 bg-primary/10 font-display text-2xl text-primary">T</span>
          <span className="font-display text-2xl">Taktik</span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageToggle compact />
          <Link
            to="/clock"
            className="hidden items-center gap-2 rounded-sm border border-border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground sm:inline-flex"
          >
            <Clock3 className="h-3.5 w-3.5" /> {t("clock")}
          </Link>
          <Button variant="ghost" size="sm" className="gap-2 rounded-sm" onClick={signOut}>
            <LogOut className="h-4 w-4" /> {t("signOut")}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow mb-2 text-primary">
              {books.length} {t(books.length === 1 ? "book" : "books")}
            </div>
            <h1 className="font-display text-5xl md:text-7xl">{t("myLibrary")}</h1>
          </div>
          {user && <AddBookDialog userId={user.id} onCreated={() => refetch()} />}
        </div>

        {/* Filters */}
        <div className="mt-8 flex flex-col gap-3 border-y border-border py-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search aria-hidden className="absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("search")}
              aria-label={t("searchBooks")}
              className="h-12 rounded-md ps-11"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={author} onChange={setAuthor} label={t("author")} options={authors} allLabel={t("allAuthors")} />
            <Select value={tag} onChange={setTag} label={t("tag")} options={tags} allLabel={t("allTags")} />
            <div className="flex rounded-md border border-border bg-card p-1">
              {(["newest", "oldest", "title"] as const).map((s) => (
                <Button
                  key={s}
                  onClick={() => setSort(s)}
                  className={cn(
                    "h-10 rounded-sm border-transparent px-3 text-[11px] uppercase",
                    sort === s ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(s === "title" ? "titleSort" : s)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <p className="mt-16 text-sm text-muted-foreground">{t("loadingLibrary")}</p>
        ) : visible.length === 0 ? (
          <EmptyState hasBooks={books.length > 0} />
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visible.map((b) => (
              <BookTile key={b.id} book={b} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function BookTile({ book }: { book: Book }) {
  const { t } = useI18n();
  return (
    <Link
      to="/library/$bookId"
      params={{ bookId: book.id }}
      className="group flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <BookCover coverPath={book.cover_path} title={book.title} className="transition-transform group-hover:-translate-y-1" />
      <div className="mt-3">
        <div className="line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">{book.title}</div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{book.author || t("unknownAuthor")}</div>
        {book.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {book.tags.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-sm border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

function EmptyState({ hasBooks }: { hasBooks: boolean }) {
  const { t } = useI18n();
  return (
    <div className="mt-16 flex flex-col items-center border-y border-dashed border-border px-6 py-20 text-center">
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-sm bg-primary/15 text-primary">
        {hasBooks ? <Search className="h-5 w-5" /> : <Library className="h-5 w-5" />}
      </div>
      <h2 className="font-display text-3xl tracking-wide">
        {hasBooks ? t("noMatches") : t("emptyShelf")}
      </h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {hasBooks
          ? t("noMatchesBody")
          : t("emptyBody")}
      </p>
      {!hasBooks && (
        <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <FileText className="h-4 w-4" /> {t("privatePdfs")}
        </div>
      )}
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
  options,
  allLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: string[];
  allLabel: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-12 rounded-sm border border-border bg-card px-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <option value="all">{allLabel}</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
