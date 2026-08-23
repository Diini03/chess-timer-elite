import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, Loader2, Save, Trash2 } from "lucide-react";
import { fetchBook, updateBook, deleteBook, formatBytes } from "@/lib/books";
import { BookCover } from "@/components/library/BookCover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/library/$bookId/")({
  component: BookDetail,
  head: () => ({
    meta: [
      { title: "Book details — Tempo Library" },
      { name: "description", content: "View, edit, and open a book from your private library." },
      { property: "og:title", content: "Book details — Tempo Library" },
      { property: "og:description", content: "View, edit, and open a book from your library." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function BookDetail() {
  const { bookId } = Route.useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [edit, setEdit] = useState<{ title: string; author: string; description: string; tags: string } | null>(null);

  const { data: book, isLoading, refetch } = useQuery({
    queryKey: ["books", bookId],
    queryFn: () => fetchBook(bookId),
  });

  if (isLoading) {
    return <Shell><p className="text-sm text-muted-foreground">Loading…</p></Shell>;
  }
  if (!book) {
    return (
      <Shell>
        <p className="text-sm text-muted-foreground">This book could not be found.</p>
      </Shell>
    );
  }

  const form = edit ?? {
    title: book.title,
    author: book.author ?? "",
    description: book.description ?? "",
    tags: book.tags.join(", "),
  };

  async function save() {
    if (!book) return;
    setSaving(true);
    try {
      await updateBook(book.id, {
        title: form.title.trim(),
        author: form.author.trim() || null,
        description: form.description.trim() || null,
        tags: form.tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean),
      });
      toast.success("Saved");
      setEdit(null);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!book) return;
    if (!window.confirm(`Delete "${book.title}" and its files?`)) return;
    try {
      await deleteBook(book);
      toast.success("Book deleted");
      navigate({ to: "/library" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete");
    }
  }

  return (
    <Shell>
      <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,280px)_1fr]">
        <div>
          <BookCover coverPath={book.cover_path} title={book.title} />
          {book.pdf_path ? (
            <Link
              to="/library/$bookId/read"
              params={{ bookId: book.id }}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground"
            >
              <BookOpen className="h-4 w-4" /> Read
            </Link>
          ) : (
            <p className="mt-4 rounded-sm border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              No PDF uploaded for this book.
            </p>
          )}
          <dl className="mt-6 space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <dt>File size</dt>
              <dd className="text-foreground">{formatBytes(book.file_size)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Added</dt>
              <dd className="text-foreground">{new Date(book.created_at).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div>
          <h1 className="font-display text-5xl tracking-tight md:text-6xl">{book.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{book.author || "Unknown author"}</p>

          <div className="mt-8 space-y-4 rounded-none border border-border bg-card p-6">
            <div className="space-y-2">
              <Label htmlFor="d-title">Title</Label>
              <Input id="d-title" value={form.title} onChange={(e) => setEdit({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-author">Author</Label>
              <Input id="d-author" value={form.author} onChange={(e) => setEdit({ ...form, author: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-tags">Tags</Label>
              <Input id="d-tags" value={form.tags} onChange={(e) => setEdit({ ...form, tags: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="d-desc">Description</Label>
              <Textarea
                id="d-desc"
                rows={4}
                value={form.description}
                onChange={(e) => setEdit({ ...form, description: e.target.value })}
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={save} disabled={saving || !edit} className="gap-2 rounded-sm">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </Button>
              <Button variant="ghost" onClick={remove} className="gap-2 rounded-sm text-destructive">
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background px-6 py-8 text-foreground md:px-12">
      <Link
        to="/library"
        className="mb-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Library
      </Link>
      {children}
    </div>
  );
}
