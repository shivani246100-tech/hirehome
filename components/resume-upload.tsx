"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Upload } from "lucide-react";

export function ResumeUpload({ label = "Upload a resume", compact = false }: { label?: string; compact?: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/resumes/files", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not upload the file");
        return;
      }
      setSuccess(`${data.file?.originalName ?? "Resume"} uploaded`);
      router.refresh();
    } catch {
      setError("Something went wrong while uploading. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={onChange}
        className="hidden"
        id="resume-upload"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={compact ? "btn-secondary btn-sm" : "btn-secondary"}
      >
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {uploading ? "Uploading…" : label}
      </button>
      <p className="mt-1 text-[10px] text-slate-400">PDF, DOC or DOCX · max 5 MB · free</p>
      {error && (
        <p className="mt-1.5 flex items-start gap-1 text-[10px] text-rose-600">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" /> {error}
        </p>
      )}
      {success && <p className="mt-1.5 text-[10px] font-semibold text-emerald-600">{success}</p>}
    </div>
  );
}
