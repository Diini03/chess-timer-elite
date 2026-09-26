import { useState } from "react";
import { FileUp, ImageUp, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBook, formatBytes } from "@/lib/books";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export function AddBookDialog({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated: () => void;
}) {
  const { t } = useI18n();
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
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" /> {t("addBook")}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={() => !busy && setOpen(false)}
        >
          <div
            className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-none border border-border bg-card p-6 sm:rounded-md"
            role="dialog"
            aria-modal="true"
            aria-label={t("addBook")}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="font-display text-4xl tracking-wide">{t("addBook")}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{t("addBookBody")}</p>
              </div>
              <Button
                variant="ghost" size="icon" onClick={() => setOpen(false)}
                aria-label={t("close")}
                className="rounded-sm p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t("title")} </Label>
                <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author">{t("author")} </Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">{t("tagsComma")} </Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="openings, endgame"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("description")} </Label>
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
                  label={pdf ? `${pdf.name} · ${formatBytes(pdf.size)}` : t("choosePdf")}
                  accept="application/pdf"
                  onPick={setPdf}
                />
                <FilePick
                  id="cover"
                  icon={<ImageUp className="h-4 w-4" />}
                  label={cover ? cover.name : t("chooseCover")}
                  accept="image/*"
                  onPick={setCover}
                />
              </div>

              <Button type="submit" className="w-full py-6" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {busy ? t("uploading") : t("saveLibrary")}
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
      className="flex cursor-pointer items-center gap-2 rounded-sm border border-dashed border-border bg-secondary/40 px-4 py-4 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
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
