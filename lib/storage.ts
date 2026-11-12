/**
 * File storage abstraction.
 *
 * Development (default): files are written to the local `uploads/` directory.
 *
 * Production: files MUST live in S3-compatible object storage (AWS S3 or
 * Cloudflare R2), configured via env vars:
 *   S3_BUCKET                — bucket name
 *   S3_ACCESS_KEY_ID         — access key
 *   S3_SECRET_ACCESS_KEY     — secret key
 *   S3_ENDPOINT              — optional custom endpoint (e.g. R2: https://<accountid>.r2.cloudflarestorage.com)
 *   S3_REGION                — optional region (default "auto")
 *   S3_FORCE_PATH_STYLE      — "true" for MinIO/LocalStack, not needed for S3/R2
 *
 * Private files are never public: reads are served through short-lived
 * presigned URLs generated server-side, after the app has checked access.
 * When NODE_ENV=production and S3 is not configured, saving files fails
 * with a clear error (mirrors the demo-checkout behaviour for payments).
 */

export type StorageKey = string; // e.g. "resumes/<uuid>.pdf"

const bucket = process.env.S3_BUCKET;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
const endpoint = process.env.S3_ENDPOINT || undefined;
const region = process.env.S3_REGION || "auto";
const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === "true";

export const s3Enabled = Boolean(bucket && accessKeyId && secretAccessKey);
export const storageRequired = process.env.NODE_ENV === "production";

type S3Module = typeof import("@aws-sdk/client-s3");
type PresignModule = typeof import("@aws-sdk/s3-request-presigner");

let s3ClientPromise: Promise<{
  client: InstanceType<S3Module["S3Client"]>;
  PutObjectCommand: S3Module["PutObjectCommand"];
  GetObjectCommand: S3Module["GetObjectCommand"];
  DeleteObjectCommand: S3Module["DeleteObjectCommand"];
  getSignedUrl: PresignModule["getSignedUrl"];
}> | null = null;

async function s3() {
  if (!s3Enabled) return null;
  if (!s3ClientPromise) {
    s3ClientPromise = (async () => {
      const [{ S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand }, { getSignedUrl }] =
        await Promise.all([import("@aws-sdk/client-s3"), import("@aws-sdk/s3-request-presigner")]);
      const client = new S3Client({
        region,
        endpoint,
        forcePathStyle,
        credentials: {
          accessKeyId: accessKeyId as string,
          secretAccessKey: secretAccessKey as string,
        },
      });
      return { client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, getSignedUrl };
    })();
  }
  return s3ClientPromise;
}

export function uploadsDisabledMessage() {
  return "File storage is not configured on the server yet. Please try again later.";
}

/** True when uploads may be persisted (local disk in dev, or S3 when configured). */
export function storageAvailable() {
  if (s3Enabled) return true;
  return !storageRequired; // dev: local disk allowed
}

export async function saveFile(key: StorageKey, bytes: Buffer, contentType: string) {
  if (s3Enabled) {
    const mod = await s3();
    if (!mod) throw new Error("S3 is not configured");
    await mod.client.send(
      new mod.PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType,
      }),
    );
    return;
  }
  if (storageRequired) {
    throw new Error(uploadsDisabledMessage());
  }
  // Local development fallback — dynamic import so the worker never loads fs.
  const { saveLocal } = await import("@/lib/storage-local");
  await saveLocal(key, bytes);
}

export async function readFileLocal(key: StorageKey): Promise<Buffer | null> {
  // Local development fallback — dynamic import so the worker never loads fs.
  const { readLocal } = await import("@/lib/storage-local");
  return readLocal(key);
}

/**
 * Returns a short-lived presigned GET URL for an S3 object (default 5 minutes),
 * or null when S3 is not in use (callers fall back to streaming the local file).
 * Optional response overrides make S3 answer with the right Content-Type and
 * Content-Disposition (e.g. inline display for PDFs).
 */
export async function presignedGetUrl(
  key: StorageKey,
  expiresSeconds = 300,
  response?: { contentDisposition?: string; contentType?: string },
): Promise<string | null> {
  const mod = await s3();
  if (!mod) return null;
  return mod.getSignedUrl(
    mod.client,
    new mod.GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: response?.contentDisposition,
      ResponseContentType: response?.contentType,
    }),
    { expiresIn: expiresSeconds },
  );
}

/** Read an object from S3 (streaming). Returns null when not in S3 mode. */
export async function readFileS3(key: StorageKey): Promise<Buffer | null> {
  const mod = await s3();
  if (!mod) return null;
  try {
    const response = await mod.client.send(
      new mod.GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    const bytes = await response.Body?.transformToByteArray();
    return bytes ? Buffer.from(bytes) : null;
  } catch {
    return null;
  }
}

export async function deleteFile(key: StorageKey) {
  const mod = await s3();
  if (!mod) return; // local disk: leave files alone (dev only)
  await mod.client.send(new mod.DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
