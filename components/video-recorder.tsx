"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, Square, Upload, Video } from "lucide-react";

export function VideoRecorder({
  interviewId,
  existingUrl,
}: {
  interviewId: string;
  existingUrl: string | null;
}) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl);
  const [error, setError] = useState("");
  const [canRecord, setCanRecord] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCanRecord(
      typeof window !== "undefined" &&
        typeof MediaRecorder !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    );
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function stopTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function finishRecording() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state !== "inactive") recorder.stop();
    setRecording(false);
    stopTimer();
  }

  async function startRecording() {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm",
      });
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const recorded = new Blob(chunksRef.current, { type: "video/webm" });
        setBlob(recorded);
        setPreviewUrl(URL.createObjectURL(recorded));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setRecording(true);
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((value) => {
          if (value + 1 >= 60) {
            finishRecording();
            return 60;
          }
          return value + 1;
        });
      }, 1000);
    } catch {
      setError("Could not access your camera. You can upload a video file instead.");
    }
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/") && !file.type.startsWith("audio/")) {
      setError("Please choose a video or audio file.");
      return;
    }
    setBlob(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  async function upload() {
    if (!blob) {
      setError("Record or choose a video first.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      const extension = blob.type.includes("mp4") ? "mp4" : blob.type.includes("quicktime") ? "mov" : "webm";
      formData.append("file", blob, `intro.${extension}`);
      const response = await fetch(`/api/interviews/${interviewId}/recording`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not upload your video");
        return;
      }
      setUploadedUrl(data.url);
      setBlob(null);
    } catch {
      setError("Something went wrong while uploading. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600">
          <Video className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">60-second video intro</h2>
          <p className="text-[11px] text-slate-500">Optional, but it helps the interviewer remember you.</p>
        </div>
      </div>

      {previewUrl ? (
        <video src={previewUrl} controls className="mt-4 aspect-video w-full rounded-xl bg-slate-900" />
      ) : (
        <div className="mt-4 grid aspect-video w-full place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
          <div>
            <Camera className="mx-auto h-6 w-6 text-slate-400" />
            <p className="mt-2 text-xs font-medium text-slate-500">No intro recorded yet</p>
            <p className="text-[10px] text-slate-400">Record or upload a short introduction.</p>
          </div>
        </div>
      )}

      {recording && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          <span className="flex items-center gap-2 font-semibold">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" /> Recording… {seconds}s / 60s
          </span>
          <button type="button" onClick={finishRecording} className="inline-flex items-center gap-1 font-bold">
            <Square className="h-3 w-3" /> Stop
          </button>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {canRecord && !recording && (
          <button type="button" onClick={startRecording} className="btn-secondary btn-sm">
            <Camera className="h-3.5 w-3.5" /> {previewUrl ? "Record again" : "Record intro"}
          </button>
        )}
        <label className="btn-secondary btn-sm cursor-pointer">
          <Upload className="h-3.5 w-3.5" /> Upload video
          <input type="file" accept="video/*,audio/*" onChange={onFileChange} className="hidden" />
        </label>
        {blob && (
          <button type="button" onClick={upload} disabled={uploading} className="btn-primary btn-sm">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : "Save intro"}
          </button>
        )}
      </div>

      {uploadedUrl && !blob && (
        <p className="mt-3 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Your intro is saved for this interview.
        </p>
      )}
      {error && <p className="mt-3 text-[11px] text-rose-600">{error}</p>}
      <p className="mt-3 text-[10px] leading-relaxed text-slate-400">
        Keep it simple: your name, your relevant experience, and why you want this role. Maximum 30 MB.
      </p>
    </div>
  );
}
