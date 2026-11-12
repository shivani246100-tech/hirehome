"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  FileText,
  Loader2,
  LockKeyhole,
  Send,
  Sparkles,
  Upload,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { RESUME_PRICE, formatFileSize } from "@/lib/resumes";
import { formatINR } from "@/lib/utils";

type SavedResume = {
  id: string;
  title: string;
  status: string;
  unlocked: boolean;
};

type UploadedFile = {
  id: string;
  originalName: string;
  size: number;
};

type Selection = { type: "file" | "resume"; id: string } | null;

export function ApplyForm({
  jobId,
  jobSlug,
  jobTitle,
  companyName,
  isLoggedIn,
  role,
  existingStatus,
  resumes,
  files,
}: {
  jobId: string;
  jobSlug: string;
  jobTitle: string;
  companyName: string;
  isLoggedIn: boolean;
  role: string | null;
  existingStatus: string | null;
  resumes: SavedResume[];
  files: UploadedFile[];
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(files);
  const [selection, setSelection] = useState<Selection>(() => {
    if (files[0]) return { type: "file", id: files[0].id };
    const unlocked = resumes.find((resume) => resume.unlocked);
    return unlocked ? { type: "resume", id: unlocked.id } : null;
  });
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<string | null>(existingStatus);

  if (appliedStatus) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-bold text-emerald-900">Application submitted</p>
            <p className="mt-1 text-xs text-emerald-700">
              You applied for this role. Track updates and interviews from your dashboard.
            </p>
            <div className="mt-2">
              <StatusBadge status={appliedStatus} />
            </div>
            <Link href="/dashboard/seeker/applications" className="btn-secondary btn-sm mt-3 bg-white">
              View my applications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div>
        <Link href={`/login?next=/jobs/${jobSlug}`} className="btn-primary w-full">
          <LockKeyhole className="h-4 w-4" /> Log in to apply — free
        </Link>
        <p className="mt-2 text-center text-[11px] text-slate-500">
          New here?{" "}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            Create a free account
          </Link>
        </p>
      </div>
    );
  }

  if (role !== "SEEKER") {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
        You are logged in as an employer. Switch to a job-seeker account to apply for this role.
      </div>
    );
  }

  async function uploadFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    setUploadMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/resumes/files", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not upload your resume");
        return;
      }
      const uploaded: UploadedFile = {
        id: data.file.id,
        originalName: data.file.originalName,
        size: data.file.size,
      };
      setUploadedFiles((current) => [uploaded, ...current]);
      setSelection({ type: "file", id: uploaded.id });
      setUploadMessage(`${uploaded.originalName} uploaded — it will be attached to this application.`);
    } catch {
      setError("Something went wrong while uploading your resume.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId,
          coverLetter,
          resumeUrl,
          resumeId: selection?.type === "resume" ? selection.id : "",
          resumeFileId: selection?.type === "file" ? selection.id : "",
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Could not submit your application");
        return;
      }

      setAppliedStatus("APPLIED");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="rounded-xl border-2 border-brand-200 bg-brand-50/50 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-slate-900">Upload your resume</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Recommended · PDF, DOC or DOCX · max 5 MB · <span className="font-bold text-emerald-600">free</span>
            </p>
          </div>
          <Upload className="h-4 w-4 shrink-0 text-brand-500" />
        </div>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={uploadFile}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-secondary btn-sm mt-2.5 w-full bg-white"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "Uploading…" : "Choose resume file"}
        </button>

        {uploadMessage && (
          <p className="mt-2 flex items-start gap-1.5 text-[10px] font-semibold text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" /> {uploadMessage}
          </p>
        )}
      </div>

      {uploadedFiles.length > 0 && (
        <div>
          <p className="label">Or use a resume you already uploaded</p>
          <div className="space-y-1.5">
            {uploadedFiles.map((file) => {
              const active = selection?.type === "file" && selection.id === file.id;
              return (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => setSelection({ type: "file", id: file.id })}
                  className={`flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                    active
                      ? "border-brand-300 bg-brand-50 ring-1 ring-brand-100"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[11px] font-semibold text-slate-800">
                      {file.originalName}
                    </span>
                    <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                  </span>
                  {active && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {resumes.length > 0 && (
        <div>
          <p className="label">Or use a resume built on HiroHome</p>
          <div className="space-y-1.5">
            {resumes.map((resume) => {
              const active = selection?.type === "resume" && selection.id === resume.id;
              return (
                <div key={resume.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (resume.unlocked) {
                        setSelection({ type: "resume", id: resume.id });
                      }
                    }}
                    disabled={!resume.unlocked}
                    className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border p-2.5 text-left transition ${
                      active
                        ? "border-brand-300 bg-brand-50 ring-1 ring-brand-100"
                        : resume.unlocked
                          ? "border-slate-200 bg-white hover:border-slate-300"
                          : "border-slate-200 bg-slate-50 opacity-80"
                    }`}
                  >
                    <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-semibold text-slate-800">
                        {resume.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {resume.unlocked
                          ? "Clean PDF · ready to attach"
                          : `Clean PDF · available for ${formatINR(RESUME_PRICE)}`}
                      </span>
                    </span>
                    {active && <Check className="h-4 w-4 shrink-0 text-brand-600" />}
                  </button>
                  {!resume.unlocked && (
                    <Link
                      href={`/dashboard/seeker/resumes/${resume.id}`}
                      className="shrink-0 text-[10px] font-bold text-brand-600 hover:underline"
                    >
                      Unlock
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <details>
        <summary className="cursor-pointer text-[11px] font-semibold text-slate-500">
          Or paste a resume link
        </summary>
        <input
          value={resumeUrl}
          onChange={(event) => setResumeUrl(event.target.value)}
          placeholder="https://drive.google.com/…"
          className="input mt-1.5"
          type="url"
        />
      </details>

      <div>
        <label htmlFor="coverLetter" className="label">
          Why are you a good fit? <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
          placeholder={`Tell ${companyName} about your experience with ${jobTitle.toLowerCase()}…`}
          className="textarea min-h-24"
          maxLength={2000}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold text-slate-800">No resume file handy?</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Build one in 5 minutes. Preview free; download only if you want the clean PDF.
            </p>
          </div>
        </div>
        <Link href="/dashboard/seeker/resumes/new" className="btn-secondary btn-sm mt-2 w-full bg-white">
          <FileText className="h-3.5 w-3.5" /> Build my resume
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-2.5 text-[11px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Submitting…" : "Apply now — free"}
      </button>
      <p className="text-center text-[10px] text-slate-400">
        Applying is always free. Your selected resume and profile will be shared with this employer.
      </p>
    </form>
  );
}
