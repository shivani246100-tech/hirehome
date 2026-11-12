import { z } from "zod";

/** One-time price for a clean resume PDF. Change it here and the whole app follows. */
export const RESUME_PRICE = 49;

/** Uploaded resumes are capped at 5 MB. */
export const RESUME_MAX_BYTES = 5 * 1024 * 1024;

export const RESUME_ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"] as const;

export const RESUME_ALLOWED_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const RESUME_TEMPLATES = [
  {
    id: "CLASSIC",
    name: "Classic",
    blurb: "Timeless single-column layout. Safest choice for every industry.",
    accent: "#1d4ed8",
  },
  {
    id: "MODERN",
    name: "Modern",
    blurb: "Crisp headings with a subtle accent. Great for tech and product roles.",
    accent: "#0f766e",
  },
  {
    id: "MINIMAL",
    name: "Minimal",
    blurb: "Quiet, text-first design that lets your experience speak.",
    accent: "#334155",
  },
] as const;

export type ResumeTemplate = (typeof RESUME_TEMPLATES)[number]["id"];

export function isResumeTemplate(value: unknown): value is ResumeTemplate {
  return RESUME_TEMPLATES.some((template) => template.id === value);
}

export function templateName(value: string) {
  return RESUME_TEMPLATES.find((template) => template.id === value)?.name ?? "Classic";
}

const shortText = z.string().trim().max(160).default("");
const mediumText = z.string().trim().max(600).default("");
const longText = z.string().trim().max(4000).default("");

export const experienceItemSchema = z.object({
  role: z.string().trim().max(140).default(""),
  company: z.string().trim().max(140).default(""),
  location: z.string().trim().max(120).default(""),
  start: z.string().trim().max(30).default(""),
  end: z.string().trim().max(30).default(""),
  details: longText,
});

export const educationItemSchema = z.object({
  degree: z.string().trim().max(160).default(""),
  institution: z.string().trim().max(160).default(""),
  location: z.string().trim().max(120).default(""),
  start: z.string().trim().max(30).default(""),
  end: z.string().trim().max(30).default(""),
  details: mediumText,
});

export const projectItemSchema = z.object({
  name: z.string().trim().max(160).default(""),
  link: z.string().trim().max(300).default(""),
  description: mediumText,
});

export const certificateItemSchema = z.object({
  name: z.string().trim().max(160).default(""),
  issuer: z.string().trim().max(160).default(""),
  year: z.string().trim().max(20).default(""),
});

export const resumeContentSchema = z.object({
  fullName: z.string().trim().min(2, "Please add your full name").max(120),
  email: z.string().trim().email("Please add a valid email").max(160),
  phone: z.string().trim().max(30).default(""),
  location: z.string().trim().max(120).default(""),
  headline: shortText,
  links: z.string().trim().max(400).default(""),
  summary: z.string().trim().max(2500).default(""),
  skills: z.array(z.string().trim().min(1).max(60)).max(60).default([]),
  languages: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
  experience: z.array(experienceItemSchema).max(20).default([]),
  education: z.array(educationItemSchema).max(10).default([]),
  projects: z.array(projectItemSchema).max(12).default([]),
  certificates: z.array(certificateItemSchema).max(12).default([]),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;
export type ExperienceItem = z.infer<typeof experienceItemSchema>;
export type EducationItem = z.infer<typeof educationItemSchema>;
export type ProjectItem = z.infer<typeof projectItemSchema>;
export type CertificateItem = z.infer<typeof certificateItemSchema>;

export const resumeSaveSchema = z.object({
  title: z.string().trim().max(140).optional(),
  template: z.string().trim().max(20).optional(),
  content: resumeContentSchema,
});

export function emptyResumeContent(input: {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  headline?: string | null;
  skills?: string | null;
  bio?: string | null;
}): ResumeContent {
  return {
    fullName: input.name?.trim() ?? "",
    email: input.email?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    location: input.location?.trim() ?? "",
    headline: input.headline?.trim() ?? "",
    links: "",
    summary: input.bio?.trim() ?? "",
    skills: splitTags(input.skills),
    languages: [],
    experience: [],
    education: [],
    projects: [],
    certificates: [],
  };
}

export function splitTags(value?: string | null) {
  if (!value) return [];
  return value
    .split(/[,•|\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 60);
}

/** Parse a stored JSON string without ever throwing on older/corrupted drafts. */
export function parseResumeContent(json: string): ResumeContent {
  try {
    const parsed = resumeContentSchema.safeParse(JSON.parse(json));
    if (parsed.success) return parsed.data;
  } catch {
    // fall through to an empty resume
  }
  return emptyResumeContent({});
}

export function resumeTitle(content: ResumeContent, fallback = "My resume") {
  const name = content.fullName.trim();
  if (!name) return fallback;
  return `${name.split(" ")[0]}'s resume`;
}

export function resumeFileExtension(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
