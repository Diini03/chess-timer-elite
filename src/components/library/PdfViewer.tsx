import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export default function PdfViewer({ url, title }: { url: string; title: string }) {
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, numPages || p));
      if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages]);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full overflow-auto rounded-3xl border border-border bg-card p-3">
        <Document
          file={url}
          onLoadSuccess={({ numPages: n }) => setNumPages(n)}
          loading={
            <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading {title}…
            </div>
          }
          error={<p className="py-24 text-center text-sm text-destructive">Could not open this PDF.</p>}
          className="flex justify-center"
        >
          <Page pageNumber={page} scale={scale} renderAnnotationLayer={false} />
        </Document>
      </div>

      <div
        role="toolbar"
        aria-label="PDF controls"
        className="sticky bottom-6 mt-6 flex items-center gap-2 rounded-full border border-border bg-card/95 p-1.5 shadow-[var(--shadow-elevated)] backdrop-blur"
      >
        <Ctl label="Previous page" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Ctl>
        <span className="min-w-24 px-2 text-center font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {page} / {numPages || "—"}
        </span>
        <Ctl
          label="Next page"
          onClick={() => setPage((p) => Math.min(numPages || p, p + 1))}
          disabled={!numPages || page >= numPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Ctl>
        <span className="mx-1 h-6 w-px bg-border" />
        <Ctl label="Zoom out" onClick={() => setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))}>
          <ZoomOut className="h-4 w-4" />
        </Ctl>
        <Ctl label="Zoom in" onClick={() => setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))}>
          <ZoomIn className="h-4 w-4" />
        </Ctl>
      </div>
    </div>
  );
}

function Ctl({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  );
}
