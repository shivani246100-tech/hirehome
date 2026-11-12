"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { ResumePreview } from "@/components/resume-preview";
import {
  RESUME_PRICE,
  RESUME_TEMPLATES,
  isResumeTemplate,
  splitTags,
  type EducationItem,
  type ExperienceItem,
  type ResumeContent,
  type ResumeTemplate,
} from "@/lib/resumes";
import { cn, formatINR } from "@/lib/utils";

const steps = [
  { title: "Personal details", blurb: "Name, contact and headline" },
  { title: "Summary", blurb: "A short professional intro" },
  { title: "Education", blurb: "Degrees and qualifications" },
  { title: "Experience", blurb: "Work history and impact" },
  { title: "Skills", blurb: "Skills and languages" },
  { title: "Extras", blurb: "Projects and certificates" },
  { title: "Template", blurb: "Design and download" },
];

function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-slate-400">{hint}</span>}
    </label>
  );
}

export function ResumeBuilder({
  initial,
  isPro,
  defaultContent,
}: {
  initial: {
    id: string;
    title: string;
    template: string;
    status: string;
    content: ResumeContent;
  } | null;
  isPro: boolean;
  defaultContent?: ResumeContent;
}) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState<string | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "My resume");
  const [template, setTemplate] = useState<ResumeTemplate>(
    isResumeTemplate(initial?.template) ? initial.template : "CLASSIC",
  );
  const [content, setContent] = useState<ResumeContent>(
    initial?.content ??
      defaultContent ?? {
        fullName: "",
        email: "",
        phone: "",
        location: "",
        headline: "",
        links: "",
        summary: "",
        skills: [],
        languages: [],
        experience: [],
        education: [],
        projects: [],
        certificates: [],
      },
  );
  const [status, setStatus] = useState(initial?.status ?? "DRAFT");
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [skillsText, setSkillsText] = useState(
    (initial?.content.skills ?? defaultContent?.skills ?? []).join(", "),
  );
  const [languagesText, setLanguagesText] = useState(
    (initial?.content.languages ?? defaultContent?.languages ?? []).join(", "),
  );

  const paid = status === "PAID";

  function update<K extends keyof ResumeContent>(key: K, value: ResumeContent[K]) {
    setContent((current) => ({ ...current, [key]: value }));
  }

  function addEducation() {
    update("education", [
      ...content.education,
      { degree: "", institution: "", location: "", start: "", end: "", details: "" },
    ]);
  }
  function updateEducation(index: number, key: keyof EducationItem, value: string) {
    update(
      "education",
      content.education.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }
  function removeEducation(index: number) {
    update("education", content.education.filter((_, itemIndex) => itemIndex !== index));
  }

  function addExperience() {
    update("experience", [
      ...content.experience,
      { role: "", company: "", location: "", start: "", end: "", details: "" },
    ]);
  }
  function updateExperience(index: number, key: keyof ExperienceItem, value: string) {
    update(
      "experience",
      content.experience.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }
  function removeExperience(index: number) {
    update("experience", content.experience.filter((_, itemIndex) => itemIndex !== index));
  }

  function addProject() {
    update("projects", [...content.projects, { name: "", link: "", description: "" }]);
  }
  function updateProject(index: number, key: "name" | "link" | "description", value: string) {
    update(
      "projects",
      content.projects.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }
  function removeProject(index: number) {
    update("projects", content.projects.filter((_, itemIndex) => itemIndex !== index));
  }

  function addCertificate() {
    update("certificates", [...content.certificates, { name: "", issuer: "", year: "" }]);
  }
  function updateCertificate(index: number, key: "name" | "issuer" | "year", value: string) {
    update(
      "certificates",
      content.certificates.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    );
  }
  function removeCertificate(index: number) {
    update("certificates", content.certificates.filter((_, itemIndex) => itemIndex !== index));
  }

  async function persist(): Promise<string | null> {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(resumeId ? `/api/resumes/${resumeId}` : "/api/resumes", {
        method: resumeId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, template, content }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not save your resume");
        return null;
      }

      const saved = data.resume;
      if (saved?.id) {
        if (!resumeId) {
          setResumeId(saved.id);
          window.history.replaceState(null, "", `/dashboard/seeker/resumes/${saved.id}`);
        }
        if (saved.status) setStatus(saved.status);
      }
      setNotice("Saved. You can download any time — your draft is safe.");
      return saved?.id ?? resumeId;
    } catch {
      setError("Something went wrong while saving. Please try again.");
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function download() {
    const id = await persist();
    if (!id) return;

    if (paid || isPro) {
      window.location.href = `/api/resumes/${id}/pdf`;
      return;
    }

    setPaying(true);
    setError("");
    try {
      const response = await fetch(`/api/resumes/${id}/checkout`, { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not start the checkout");
        return;
      }
      if (data.checkoutUrl) {
        router.push(data.checkoutUrl);
        return;
      }
      if (data.redirect) {
        setNotice(data.message ?? "Your download is ready.");
        window.location.href = data.redirect;
      }
    } catch {
      setError("Something went wrong while starting the download.");
    } finally {
      setPaying(false);
    }
  }

  const canGoNext = step < steps.length - 1;
  const canGoBack = step > 0;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/dashboard/seeker/resumes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> My resumes
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="min-w-0 max-w-full rounded-lg border border-transparent bg-transparent px-0 py-0.5 text-2xl font-extrabold tracking-tight text-slate-950 outline-none transition hover:border-slate-200 focus:border-brand-300 focus:px-2"
              aria-label="Resume title"
              maxLength={140}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Applying is always free. The builder is optional — download the clean PDF for{" "}
            {formatINR(RESUME_PRICE)} once, or free with Pro.
          </p>
        </div>
        <button type="button" onClick={() => persist()} disabled={saving} className="btn-secondary btn-sm">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save draft"}
        </button>
      </div>

      {notice && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}
        </div>
      )}
      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="min-w-0">
          <div className="flex gap-1.5 overflow-x-auto pb-2">
            {steps.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition",
                  index === step
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
                )}
              >
                <span className="mr-1 text-[9px] font-bold text-slate-400">{index + 1}</span>
                {item.title}
              </button>
            ))}
          </div>

          <div className="card mt-2 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">
                  Step {step + 1} of {steps.length}
                </p>
                <h2 className="mt-0.5 text-lg font-bold tracking-tight text-slate-950">
                  {steps[step].title}
                </h2>
                <p className="text-xs text-slate-500">{steps[step].blurb}</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {step === 0 && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name">
                      <input
                        value={content.fullName}
                        onChange={(event) => update("fullName", event.target.value)}
                        className="input"
                        placeholder="Aarav Sharma"
                        maxLength={120}
                        required
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        value={content.email}
                        onChange={(event) => update("email", event.target.value)}
                        className="input"
                        placeholder="you@example.com"
                        maxLength={160}
                        required
                      />
                    </Field>
                    <Field label="Phone">
                      <input
                        value={content.phone}
                        onChange={(event) => update("phone", event.target.value)}
                        className="input"
                        placeholder="+91 98765 43210"
                        maxLength={30}
                      />
                    </Field>
                    <Field label="Location">
                      <input
                        value={content.location}
                        onChange={(event) => update("location", event.target.value)}
                        className="input"
                        placeholder="Pune, Maharashtra"
                        maxLength={120}
                      />
                    </Field>
                  </div>
                  <Field label="Headline" hint="A one-line professional title, e.g. Customer support associate.">
                    <input
                      value={content.headline}
                      onChange={(event) => update("headline", event.target.value)}
                      className="input"
                      placeholder="Customer support associate · Hindi & English"
                      maxLength={160}
                    />
                  </Field>
                  <Field label="Links" hint="LinkedIn, portfolio or GitHub — separated by a pipe (|).">
                    <input
                      value={content.links}
                      onChange={(event) => update("links", event.target.value)}
                      className="input"
                      placeholder="linkedin.com/in/yourname | yourportfolio.com"
                      maxLength={400}
                    />
                  </Field>
                </>
              )}

              {step === 1 && (
                <Field
                  label="Professional summary"
                  hint="2–4 sentences about your experience, strengths and what you are looking for."
                >
                  <textarea
                    value={content.summary}
                    onChange={(event) => update("summary", event.target.value)}
                    className="textarea min-h-40"
                    placeholder="Customer support associate with 2 years of remote experience across chat and voice. I resolve billing and delivery issues quickly and keep CSAT above 95%…"
                    maxLength={2500}
                  />
                </Field>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  {content.education.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500">
                      No education added yet. This is optional but recommended.
                    </div>
                  )}
                  {content.education.map((item, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-700">Education {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeEducation(index)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        <Field label="Degree / course">
                          <input
                            value={item.degree}
                            onChange={(event) => updateEducation(index, "degree", event.target.value)}
                            className="input"
                            placeholder="B.Com"
                            maxLength={160}
                          />
                        </Field>
                        <Field label="Institution">
                          <input
                            value={item.institution}
                            onChange={(event) => updateEducation(index, "institution", event.target.value)}
                            className="input"
                            placeholder="Pune University"
                            maxLength={160}
                          />
                        </Field>
                        <Field label="Start year">
                          <input
                            value={item.start}
                            onChange={(event) => updateEducation(index, "start", event.target.value)}
                            className="input"
                            placeholder="2019"
                            maxLength={30}
                          />
                        </Field>
                        <Field label="End year">
                          <input
                            value={item.end}
                            onChange={(event) => updateEducation(index, "end", event.target.value)}
                            className="input"
                            placeholder="2022"
                            maxLength={30}
                          />
                        </Field>
                      </div>
                      <div className="mt-2.5 grid gap-2.5">
                        <Field label="Location">
                          <input
                            value={item.location}
                            onChange={(event) => updateEducation(index, "location", event.target.value)}
                            className="input"
                            placeholder="Pune"
                            maxLength={120}
                          />
                        </Field>
                        <Field label="Details (optional)">
                          <textarea
                            value={item.details}
                            onChange={(event) => updateEducation(index, "details", event.target.value)}
                            className="textarea min-h-20"
                            placeholder="Relevant coursework, percentage or achievements"
                            maxLength={600}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addEducation} className="btn-secondary btn-sm">
                    <Plus className="h-4 w-4" /> Add education
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  {content.experience.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-500">
                      No work experience added yet. Freshers can skip this or add internships.
                    </div>
                  )}
                  {content.experience.map((item, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-700">Role {index + 1}</p>
                        <button
                          type="button"
                          onClick={() => removeExperience(index)}
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 hover:underline"
                        >
                          <Trash2 className="h-3 w-3" /> Remove
                        </button>
                      </div>
                      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                        <Field label="Job title">
                          <input
                            value={item.role}
                            onChange={(event) => updateExperience(index, "role", event.target.value)}
                            className="input"
                            placeholder="Customer support associate"
                            maxLength={140}
                          />
                        </Field>
                        <Field label="Company">
                          <input
                            value={item.company}
                            onChange={(event) => updateExperience(index, "company", event.target.value)}
                            className="input"
                            placeholder="HelpDesk Pro"
                            maxLength={140}
                          />
                        </Field>
                        <Field label="Start">
                          <input
                            value={item.start}
                            onChange={(event) => updateExperience(index, "start", event.target.value)}
                            className="input"
                            placeholder="Jun 2022"
                            maxLength={30}
                          />
                        </Field>
                        <Field label="End">
                          <input
                            value={item.end}
                            onChange={(event) => updateExperience(index, "end", event.target.value)}
                            className="input"
                            placeholder="Present"
                            maxLength={30}
                          />
                        </Field>
                      </div>
                      <div className="mt-2.5 grid gap-2.5">
                        <Field label="Location">
                          <input
                            value={item.location}
                            onChange={(event) => updateExperience(index, "location", event.target.value)}
                            className="input"
                            placeholder="Remote"
                            maxLength={120}
                          />
                        </Field>
                        <Field label="Achievements" hint="One achievement per line. Numbers make a strong impression.">
                          <textarea
                            value={item.details}
                            onChange={(event) => updateExperience(index, "details", event.target.value)}
                            className="textarea min-h-24"
                            placeholder={"Handled 60+ chats per day with 96% CSAT\nResolved billing and delivery issues on first contact"}
                            maxLength={4000}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addExperience} className="btn-secondary btn-sm">
                    <Plus className="h-4 w-4" /> Add work experience
                  </button>
                </div>
              )}

              {step === 4 && (
                <>
                  <Field label="Skills" hint="Separate with commas. Keep the most relevant skills first.">
                    <textarea
                      value={skillsText}
                      onChange={(event) => {
                        setSkillsText(event.target.value);
                        update("skills", splitTags(event.target.value));
                      }}
                      className="textarea min-h-24"
                      placeholder="Customer Support, Chat Support, CRM, Zendesk, Hindi, English"
                      maxLength={1200}
                    />
                  </Field>
                  <Field label="Languages" hint="Separate with commas.">
                    <input
                      value={languagesText}
                      onChange={(event) => {
                        setLanguagesText(event.target.value);
                        update("languages", splitTags(event.target.value));
                      }}
                      className="input"
                      placeholder="Hindi, English, Marathi"
                      maxLength={400}
                    />
                  </Field>
                  {content.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {content.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === 5 && (
                <div className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700">Projects (optional)</p>
                      <button type="button" onClick={addProject} className="btn-secondary btn-sm">
                        <Plus className="h-3.5 w-3.5" /> Add project
                      </button>
                    </div>
                    <div className="mt-2 space-y-3">
                      {content.projects.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-[11px] text-slate-500">
                          Add a project, freelance gig or portfolio piece.
                        </p>
                      )}
                      {content.projects.map((item, index) => (
                        <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-700">Project {index + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeProject(index)}
                              className="text-[10px] font-semibold text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                            <Field label="Project name">
                              <input
                                value={item.name}
                                onChange={(event) => updateProject(index, "name", event.target.value)}
                                className="input"
                                placeholder="Support quality dashboard"
                                maxLength={160}
                              />
                            </Field>
                            <Field label="Link (optional)">
                              <input
                                value={item.link}
                                onChange={(event) => updateProject(index, "link", event.target.value)}
                                className="input"
                                placeholder="github.com/you/project"
                                maxLength={300}
                              />
                            </Field>
                          </div>
                          <div className="mt-2.5">
                            <Field label="Description">
                              <textarea
                                value={item.description}
                                onChange={(event) => updateProject(index, "description", event.target.value)}
                                className="textarea min-h-20"
                                placeholder="What you built, the tools used and the outcome."
                                maxLength={600}
                              />
                            </Field>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700">Certificates (optional)</p>
                      <button type="button" onClick={addCertificate} className="btn-secondary btn-sm">
                        <Plus className="h-3.5 w-3.5" /> Add certificate
                      </button>
                    </div>
                    <div className="mt-2 space-y-3">
                      {content.certificates.length === 0 && (
                        <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-[11px] text-slate-500">
                          Add courses, certifications or awards.
                        </p>
                      )}
                      {content.certificates.map((item, index) => (
                        <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-700">Certificate {index + 1}</p>
                            <button
                              type="button"
                              onClick={() => removeCertificate(index)}
                              className="text-[10px] font-semibold text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="mt-2 grid gap-2.5 sm:grid-cols-3">
                            <Field label="Certificate">
                              <input
                                value={item.name}
                                onChange={(event) => updateCertificate(index, "name", event.target.value)}
                                className="input"
                                placeholder="Google Data Analytics"
                                maxLength={160}
                              />
                            </Field>
                            <Field label="Issuer">
                              <input
                                value={item.issuer}
                                onChange={(event) => updateCertificate(index, "issuer", event.target.value)}
                                className="input"
                                placeholder="Coursera"
                                maxLength={160}
                              />
                            </Field>
                            <Field label="Year">
                              <input
                                value={item.year}
                                onChange={(event) => updateCertificate(index, "year", event.target.value)}
                                className="input"
                                placeholder="2024"
                                maxLength={20}
                              />
                            </Field>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  <div>
                    <p className="label">Choose a template</p>
                    <div className="mt-2 grid gap-2.5 sm:grid-cols-3">
                      {RESUME_TEMPLATES.map((item) => {
                        const selected = template === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setTemplate(item.id)}
                            className={cn(
                              "rounded-xl border p-3 text-left transition",
                              selected
                                ? "border-brand-400 bg-brand-50/70 ring-2 ring-brand-100"
                                : "border-slate-200 bg-white hover:border-slate-300",
                            )}
                          >
                            <span className="flex items-center justify-between">
                              <span className="text-sm font-bold text-slate-900">{item.name}</span>
                              {selected && <Check className="h-4 w-4 text-brand-600" />}
                            </span>
                            <span className="mt-1 block h-1.5 w-10 rounded-full" style={{ backgroundColor: item.accent }} />
                            <span className="mt-2 block text-[10px] leading-relaxed text-slate-500">
                              {item.blurb}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {paid
                            ? "Ready to re-download any time"
                            : isPro
                              ? "Free with your Pro membership"
                              : `Clean PDF · ${formatINR(RESUME_PRICE)} once`}
                        </p>
                        <p className="mt-0.5 text-[11px] text-slate-500">
                          {paid
                            ? "Editing is free and re-downloads stay free forever for this resume."
                            : isPro
                              ? "Unlimited free downloads while your Pro plan is active."
                              : "Watermark-free A4 PDF. Applying to jobs stays completely free."}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={download}
                        disabled={saving || paying}
                        className="btn-primary btn-sm"
                      >
                        {saving || paying ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : paid || isPro ? (
                          <Download className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {paid || isPro ? "Download PDF" : "Download clean PDF"}
                      </button>
                    </div>
                  </div>

                  {(paid || isPro) && (
                    <Link href="/jobs" className="btn-secondary w-full">
                      <FileText className="h-4 w-4" /> Apply to jobs with this resume
                    </Link>
                  )}

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
                    <strong>Applying is always free.</strong> You only pay if you choose to download a
                    clean built resume. Uploading your own resume and applying costs nothing.
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setStep((current) => Math.max(0, current - 1))}
                disabled={!canGoBack}
                className="btn-secondary btn-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              {canGoNext ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.min(steps.length - 1, current + 1))}
                  className="btn-primary btn-sm"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={download}
                  disabled={saving || paying}
                  className="btn-primary btn-sm"
                >
                  {saving || paying ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isPro && !paid ? "Download free with Pro" : "Download clean PDF"}
                </button>
              )}
            </div>
          </div>
        </div>

        <aside className="min-w-0 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-2xl border border-slate-200 bg-slate-100/70 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-[11px] font-bold text-slate-700">Live preview · free</p>
              <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500 ring-1 ring-slate-200">
                {paid ? "Clean" : "Preview watermark"}
              </span>
            </div>
            <ResumePreview content={content} template={template} watermark={!paid} />
            <p className="mt-2 px-1 text-[10px] text-slate-500">
              {paid
                ? "Edits and future downloads are free for this resume."
                : isPro
                  ? "Pro members can download this clean PDF for free right away."
                  : `Your preview always stays free. The watermark disappears after the one-time ${formatINR(RESUME_PRICE)} payment.`}
            </p>
          </div>

          <button
            type="button"
            onClick={download}
            disabled={saving || paying}
            className="btn-primary mt-3 w-full"
          >
            {saving || paying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isPro && !paid ? "Download free with Pro" : "Download clean PDF"}
          </button>
        </aside>
      </div>
    </div>
  );
}
