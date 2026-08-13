import { useState } from "react";
import { FileUp, ImageUp, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBook, formatBytes } from "@/lib/books";
import { toast } from "sonner";

export function AddBookDialog({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  function reset() {
    setTitle("");
    setAuthor("");
    setDescription("");
    setTags("");
    setPdf(null);
    setCover(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    try {
      await createBook({
        userId,
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean),
        pdf,
        cover,
      });
      toast.success("Book added to your library");
      reset();
      setOpen(false);
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 rounded-full">
        <Plus className="h-4 w-4" /> Add book
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-border bg-card p-6 sm:rounded-3xl"
            role="dialog"
            aria-modal="true"
            aria-label="Add a book"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-display text-4xl tracking-wide">Add a book</h2>
                <p className="mt-1 text-sm text-muted-foreground">Only you can see this.</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="openings, endgame"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FilePick
                  id="pdf"
                  icon={<FileUp className="h-4 w-4" />}
                  label={pdf ? `${pdf.name} · ${formatBytes(pdf.size)}` : "Choose PDF"}
                  accept="application/pdf"
                  onPick={setPdf}
                />
                <FilePick
                  id="cover"
                  icon={<ImageUp className="h-4 w-4" />}
                  label={cover ? cover.name : "Choose cover image"}
                  accept="image/*"
                  onPick={setCover}
                />
              </div>

              <Button type="submit" className="w-full rounded-full py-6" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {busy ? "Uploading…" : "Save to library"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function FilePick({
  id,
  icon,
  label,
  accept,
  onPick,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  accept: string;
  onPick: (f: File | null) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-4 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
    >
      {icon}
      <span className="truncate">{label}</span>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
