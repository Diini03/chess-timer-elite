import { lazy, Suspense, useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ClientOnly } from "@tanstack/react-router";
import { fetchBook, signedUrl } from "@/lib/books";

const PdfViewer = lazy(() => import("@/components/library/PdfViewer"));

export const Route = createFileRoute("/_authenticated/library/$bookId/read")({
  component: ReadPage,
  head: () => ({
    meta: [
      { title: "Reading — Tempo Library" },
      { name: "description", content: "Read your uploaded PDF in the browser with page navigation and zoom." },
      { property: "og:title", content: "Reading — Tempo Library" },
      { property: "og:description", content: "Read your uploaded PDF in the browser." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ReadPage() {
  const { bookId } = Route.useParams();
  const [url, setUrl] = useState<string | null>(null);

  const { data: book } = useQuery({
    queryKey: ["books", bookId],
    queryFn: () => fetchBook(bookId),
  });

  useEffect(() => {
    if (!book?.pdf_path) return;
    let active = true;
    signedUrl("book-files", book.pdf_path, 3600).then((u) => {
      if (active) setUrl(u);
    });
    return () => {
      active = false;
    };
  }, [book?.pdf_path]);

  return (
    <div className="min-h-screen bg-background px-4 py-6 text-foreground md:px-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/library/$bookId"
          params={{ bookId }}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="font-display text-2xl tracking-wide">{book?.title ?? "Reading"}</h1>
      </div>

      {!book?.pdf_path ? (
        <p className="py-24 text-center text-sm text-muted-foreground">This book has no PDF attached.</p>
      ) : !url ? (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Preparing your file…
        </div>
      ) : (
        <ClientOnly fallback={<div className="py-24 text-center text-sm text-muted-foreground">Loading viewer…</div>}>
          <Suspense fallback={<div className="py-24 text-center text-sm text-muted-foreground">Loading viewer…</div>}>
            <PdfViewer url={url} title={book.title} />
          </Suspense>
        </ClientOnly>
      )}
    </div>
  );
}
