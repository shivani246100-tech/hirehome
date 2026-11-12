/**
 * Local disk storage — DEVELOPMENT ONLY.
 * Legal only outside Cloudflare Workers (there is no persistent filesystem).
 * The worker bundle includes this module via a dynamic import that never
 * executes when S3/R2 is configured (saveFile/readFileLocal dispatch first).
 */
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export async function saveLocal(key: string, bytes: Buffer) {
  const directory = path.join(process.cwd(), "uploads", path.dirname(key));
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(process.cwd(), "uploads", key), bytes);
}

export async function readLocal(key: string): Promise<Buffer | null> {
  const safeKey = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
  try {
    return await readFile(path.join(process.cwd(), "uploads", safeKey));
  } catch {
    return null;
  }
}
