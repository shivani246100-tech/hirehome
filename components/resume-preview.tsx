"use client";

import type { ResumeContent } from "@/lib/resumes";
import { cn } from "@/lib/utils";

function SectionTitle({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div className="mt-3.5 first:mt-0">
      <p
        className="text-[8px] font-bold uppercase tracking-[0.16em]"
        style={{ color: accent }}
      >
        {children}
      </p>
      <div className="mt-1 h-px w-full" style={{ backgroundColor: accent, opacity: 0.35 }} />
    </div>
  );
}

function dateRange(start: string, end: string) {
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

export function ResumePreview({
  content,
  template,
  watermark = true,
}: {
  content: ResumeContent;
  template: string;
  watermark?: boolean;
}) {
  const accent = template === "MODERN" ? "#0f766e" : template === "MINIMAL" ? "#475569" : "#1e3a8a";
  const isModern = template === "MODERN";
  const isMinimal = template === "MINIMAL";

  const contact = [content.email, content.phone, content.location, content.links]
    .map((item) => item.trim())
    .filter(Boolean)
    .join("  |  ");

  return (
    <div className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-sm bg-white shadow-xl ring-1 ring-slate-200">
      {watermark && (
        <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center overflow-hidden">
          <span className="-rotate-[32deg] select-none text-6xl font-black uppercase tracking-[0.28em] text-slate-900/[0.07]">
            Preview
          </span>
        </div>
      )}

      <div className="max-h-[74vh] min-h-[560px] overflow-y-auto">
        {isModern && <div className="h-2 w-full" style={{ backgroundColor: accent }} />}
        <div className={cn("px-6 py-6 text-slate-700 sm:px-8", isMinimal ? "sm:px-9" : "")}>
          <h1
            className={cn(
              "font-extrabold leading-tight tracking-tight text-slate-950",
              isMinimal ? "text-xl" : "text-2xl",
            )}
            style={isModern ? { color: accent } : undefined}
          >
            {content.fullName || "Your full name"}
          </h1>
          {content.headline && (
            <p className="mt-0.5 text-[10px] font-medium text-slate-500">{content.headline}</p>
          )}
          {contact && <p className="mt-1 text-[8.5px] leading-relaxed text-slate-500">{contact}</p>}
          <div
            className="mt-2.5 h-px w-full"
            style={
              isMinimal
                ? { backgroundColor: "#e2e8f0" }
                : { backgroundColor: accent, opacity: isModern ? 0.9 : 0.6 }
            }
          />

          {content.summary.trim() && (
            <section>
              <SectionTitle accent={accent}>Professional summary</SectionTitle>
              <p className="mt-1.5 whitespace-pre-line text-[9px] leading-relaxed text-slate-600">
                {content.summary}
              </p>
            </section>
          )}

          {content.experience.filter((item) => item.role || item.company || item.details).length > 0 && (
            <section>
              <SectionTitle accent={accent}>Work experience</SectionTitle>
              <div className="mt-1.5 space-y-2.5">
                {content.experience
                  .filter((item) => item.role || item.company || item.details)
                  .map((item, index) => (
                    <div key={index}>
                      <p className="text-[10px] font-bold text-slate-900">
                        {[item.role, item.company].filter(Boolean).join(" — ")}
                      </p>
                      {(dateRange(item.start, item.end) || item.location) && (
                        <p className="text-[8px] text-slate-400">
                          {[dateRange(item.start, item.end), item.location].filter(Boolean).join("  |  ")}
                        </p>
                      )}
                      {item.details
                        .split("\n")
                        .map((line) => line.replace(/^[-•*]\s*/, "").trim())
                        .filter(Boolean)
                        .map((line, lineIndex) => (
                          <p key={lineIndex} className="mt-0.5 flex gap-1.5 text-[9px] leading-relaxed text-slate-600">
                            <span className="text-slate-400">•</span>
                            <span>{line}</span>
                          </p>
                        ))}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {content.education.filter((item) => item.degree || item.institution || item.details).length > 0 && (
            <section>
              <SectionTitle accent={accent}>Education</SectionTitle>
              <div className="mt-1.5 space-y-2">
                {content.education
                  .filter((item) => item.degree || item.institution || item.details)
                  .map((item, index) => (
                    <div key={index}>
                      <p className="text-[10px] font-bold text-slate-900">
                        {[item.degree, item.institution].filter(Boolean).join(" — ")}
                      </p>
                      {(dateRange(item.start, item.end) || item.location) && (
                        <p className="text-[8px] text-slate-400">
                          {[dateRange(item.start, item.end), item.location].filter(Boolean).join("  |  ")}
                        </p>
                      )}
                      {item.details && (
                        <p className="mt-0.5 whitespace-pre-line text-[9px] leading-relaxed text-slate-600">
                          {item.details}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {content.skills.length > 0 && (
            <section>
              <SectionTitle accent={accent}>Skills</SectionTitle>
              <p className="mt-1.5 text-[9px] leading-relaxed text-slate-600">
                {content.skills.join("  ·  ")}
              </p>
            </section>
          )}

          {content.projects.filter((item) => item.name || item.description).length > 0 && (
            <section>
              <SectionTitle accent={accent}>Projects</SectionTitle>
              <div className="mt-1.5 space-y-2">
                {content.projects
                  .filter((item) => item.name || item.description)
                  .map((item, index) => (
                    <div key={index}>
                      <p className="text-[10px] font-bold text-slate-900">{item.name}</p>
                      {item.link && (
                        <p className="text-[8px]" style={{ color: accent }}>
                          {item.link}
                        </p>
                      )}
                      {item.description && (
                        <p className="mt-0.5 text-[9px] leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          )}

          {content.certificates.filter((item) => item.name || item.issuer).length > 0 && (
            <section>
              <SectionTitle accent={accent}>Certificates</SectionTitle>
              <div className="mt-1.5 space-y-1">
                {content.certificates
                  .filter((item) => item.name || item.issuer)
                  .map((item, index) => (
                    <p key={index} className="flex gap-1.5 text-[9px] text-slate-600">
                      <span className="text-slate-400">•</span>
                      <span>
                        {[item.name, item.issuer, item.year ? `(${item.year})` : ""]
                          .filter(Boolean)
                          .join(" — ")}
                      </span>
                    </p>
                  ))}
              </div>
            </section>
          )}

          {content.languages.length > 0 && (
            <section>
              <SectionTitle accent={accent}>Languages</SectionTitle>
              <p className="mt-1.5 text-[9px] text-slate-600">{content.languages.join("  ·  ")}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
