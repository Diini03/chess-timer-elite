import { supabase } from "@/integrations/supabase/client";

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  description: string | null;
  tags: string[];
  cover_path: string | null;
  pdf_path: string | null;
  file_size: number | null;
  page_count: number | null;
  created_at: string;
  updated_at: string;
};

export const BOOKS_KEY = ["books"] as const;

export async function fetchBooks(): Promise<Book[]> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Book[];
}

export async function fetchBook(id: string): Promise<Book> {
  const { data, error } = await supabase.from("books").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Book not found");
  return data as Book;
}

export async function signedUrl(
  bucket: "book-files" | "book-covers",
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data?.signedUrl ?? null;
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

export async function uploadFile(
  bucket: "book-files" | "book-covers",
  userId: string,
  file: File,
): Promise<string> {
  const path = `${userId}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  return path;
}

export async function createBook(input: {
  userId: string;
  title: string;
  author: string;
  description: string;
  tags: string[];
  pdf?: File | null;
  cover?: File | null;
}): Promise<Book> {
  const pdf_path = input.pdf ? await uploadFile("book-files", input.userId, input.pdf) : null;
  const cover_path = input.cover ? await uploadFile("book-covers", input.userId, input.cover) : null;

  const { data, error } = await supabase
    .from("books")
    .insert({
      user_id: input.userId,
      title: input.title,
      author: input.author || null,
      description: input.description || null,
      tags: input.tags,
      pdf_path,
      cover_path,
      file_size: input.pdf?.size ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as Book;
}

export async function updateBook(
  id: string,
  patch: Partial<Pick<Book, "title" | "author" | "description" | "tags" | "page_count">>,
): Promise<void> {
  const { error } = await supabase.from("books").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteBook(book: Book): Promise<void> {
  if (book.pdf_path) await supabase.storage.from("book-files").remove([book.pdf_path]);
  if (book.cover_path) await supabase.storage.from("book-covers").remove([book.cover_path]);
  const { error } = await supabase.from("books").delete().eq("id", book.id);
  if (error) throw error;
}

export function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(value < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}
