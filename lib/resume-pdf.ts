import "regenerator-runtime/runtime";
import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  StandardFonts,
  degrees,
  rgb,
  type PDFFont,
  type PDFPage,
  type RGB,
} from "pdf-lib";
import type { ResumeContent, ResumeTemplate } from "@/lib/resumes";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const FONT_URLS = {
  regular: `${APP_URL}/fonts/NotoSansDevanagari-Regular.ttf`,
  bold: `${APP_URL}/fonts/NotoSansDevanagari-Bold.ttf`,
} as const;

let fontCache: { regular: Uint8Array; bold: Uint8Array } | null = null;

const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;
const MARGIN = 48;
const CONTENT_WIDTH = A4_WIDTH - MARGIN * 2;

type Fonts = {
  regular: PDFFont;
  bold: PDFFont;
  unicode: boolean;
};

const TEMPLATE_ACCENTS: Record<ResumeTemplate, RGB> = {
  CLASSIC: rgb(0.1, 0.16, 0.32),
  MODERN: rgb(0.06, 0.46, 0.43),
  MINIMAL: rgb(0.24, 0.28, 0.34),
};

function cleanText(text: string, unicode: boolean) {
  const normalized = text.replace(/\r\n?/g, "\n").replace(/₹/g, "Rs. ");
  if (unicode) return normalized;
  return normalized.replace(/[^\t\n\r\x20-\x7e\xa0-\xff]/g, "");
}

function wrapLines(font: PDFFont, text: string, size: number, maxWidth: number) {
  const lines: string[] = [];
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        current = candidate;
        continue;
      }
      if (current) {
        lines.push(current);
        current = "";
      }
      if (font.widthOfTextAtSize(word, size) <= maxWidth) {
        current = word;
        continue;
      }
      // Break a very long word character by character.
      let chunk = "";
      for (const character of word) {
        if (font.widthOfTextAtSize(chunk + character, size) <= maxWidth) {
          chunk += character;
        } else {
          if (chunk) lines.push(chunk);
          chunk = character;
        }
      }
      current = chunk;
    }
    if (current) lines.push(current);
  }

  return lines;
}

class ResumeWriter {
  doc: PDFDocument;
  page: PDFPage;
  y: number;
  fonts: Fonts;
  accent: RGB;
  template: ResumeTemplate;

  constructor(doc: PDFDocument, fonts: Fonts, template: ResumeTemplate) {
    this.doc = doc;
    this.fonts = fonts;
    this.template = template;
    this.accent = TEMPLATE_ACCENTS[template];
    this.page = doc.addPage([A4_WIDTH, A4_HEIGHT]);
    this.y = A4_HEIGHT - MARGIN;
  }

  private font(bold: boolean) {
    return bold ? this.fonts.bold : this.fonts.regular;
  }

  private text(value: string, size: number, bold: boolean) {
    return cleanText(value, this.fonts.unicode);
  }

  private newPage() {
    this.page = this.doc.addPage([A4_WIDTH, A4_HEIGHT]);
    this.y = A4_HEIGHT - MARGIN;
  }

  private ensure(height: number) {
    if (this.y - height < MARGIN) this.newPage();
  }

  paragraph(
    value: string,
    options: {
      size?: number;
      bold?: boolean;
      color?: RGB;
      lineHeight?: number;
      indent?: number;
      gapAfter?: number;
      maxWidth?: number;
    } = {},
  ) {
    const size = options.size ?? 10;
    const bold = options.bold ?? false;
    const lineHeight = options.lineHeight ?? size * 1.42;
    const indent = options.indent ?? 0;
    const maxWidth = options.maxWidth ?? CONTENT_WIDTH - indent;
    const text = this.text(value, size, bold);
    if (!text.trim()) return;

    const lines = wrapLines(this.font(bold), text, size, maxWidth);
    for (const line of lines) {
      this.ensure(lineHeight);
      if (line) {
        this.page.drawText(line, {
          x: MARGIN + indent,
          y: this.y - size,
          size,
          font: this.font(bold),
          color: options.color ?? rgb(0.13, 0.16, 0.2),
        });
      }
      this.y -= lineHeight;
    }
    this.y -= options.gapAfter ?? 0;
  }

  bullet(value: string, options: { size?: number; color?: RGB; indent?: number } = {}) {
    const marker = this.fonts.unicode ? "•" : "-";
    const indent = options.indent ?? 10;
    const size = options.size ?? 9.5;
    this.ensure(size * 1.45);
    this.page.drawText(marker, {
      x: MARGIN + indent,
      y: this.y - size,
      size,
      font: this.fonts.regular,
      color: options.color ?? rgb(0.35, 0.38, 0.44),
    });
    this.paragraph(value, {
      size,
      indent: indent + 10,
      color: options.color ?? rgb(0.25, 0.28, 0.33),
      lineHeight: size * 1.45,
      gapAfter: 1,
    });
  }

  gap(height: number) {
    this.y -= height;
  }

  rule(color = rgb(0.87, 0.89, 0.92), thickness = 0.7) {
    this.ensure(6);
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: A4_WIDTH - MARGIN, y: this.y },
      thickness,
      color,
    });
    this.y -= 8;
  }

  section(title: string) {
    this.ensure(46);
    this.y -= 6;
    this.paragraph(title.toUpperCase(), {
      size: 9.5,
      bold: true,
      color: this.template === "MINIMAL" ? rgb(0.25, 0.28, 0.33) : this.accent,
      lineHeight: 14,
      gapAfter: 2,
    });
    this.rule(
      this.template === "MINIMAL" ? rgb(0.85, 0.86, 0.88) : this.accent,
      this.template === "MODERN" ? 1.1 : 0.7,
    );
  }

  header(content: ResumeContent) {
    if (this.template === "MODERN") {
      this.page.drawRectangle({
        x: 0,
        y: A4_HEIGHT - 7,
        width: A4_WIDTH,
        height: 7,
        color: this.accent,
      });
    }

    this.paragraph(content.fullName, {
      size: this.template === "MINIMAL" ? 21 : 23,
      bold: true,
      color: this.template === "MODERN" ? this.accent : rgb(0.08, 0.11, 0.16),
      lineHeight: 28,
      gapAfter: 1,
    });

    if (content.headline) {
      this.paragraph(content.headline, {
        size: 10.5,
        color: rgb(0.32, 0.36, 0.42),
        lineHeight: 15,
        gapAfter: 2,
      });
    }

    const contact = [content.email, content.phone, content.location, content.links]
      .map((item) => item.trim())
      .filter(Boolean)
      .join("  |  ");
    if (contact) {
      this.paragraph(contact, {
        size: 8.8,
        color: rgb(0.36, 0.39, 0.45),
        lineHeight: 13,
      });
    }

    if (this.template !== "MINIMAL") {
      this.y -= 4;
      this.rule(
        this.template === "MODERN" ? this.accent : rgb(0.15, 0.22, 0.4),
        this.template === "MODERN" ? 1.4 : 0.9,
      );
    } else {
      this.y -= 4;
      this.rule(rgb(0.88, 0.89, 0.91), 0.6);
    }
  }

  render(content: ResumeContent) {
    this.header(content);

    if (content.summary.trim()) {
      this.section("Professional summary");
      this.paragraph(content.summary, { size: 9.8, gapAfter: 3 });
    }

    const experience = content.experience.filter((item) => item.role || item.company || item.details);
    if (experience.length > 0) {
      this.section("Work experience");
      experience.forEach((item, index) => {
        const title = [item.role, item.company].filter(Boolean).join(" — ");
        const meta = [item.start && item.end ? `${item.start} – ${item.end}` : item.start || item.end, item.location]
          .filter(Boolean)
          .join("  |  ");
        this.ensure(52);
        this.paragraph(title || "Role", { size: 10.4, bold: true, lineHeight: 14, gapAfter: 0 });
        if (meta) {
          this.paragraph(meta, { size: 8.7, color: rgb(0.4, 0.43, 0.49), lineHeight: 12, gapAfter: 1 });
        }
        const details = item.details
          .split("\n")
          .map((line) => line.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean);
        for (const line of details) this.bullet(line);
        if (index < experience.length - 1) this.gap(5);
      });
    }

    const education = content.education.filter((item) => item.degree || item.institution || item.details);
    if (education.length > 0) {
      this.section("Education");
      education.forEach((item, index) => {
        const title = [item.degree, item.institution].filter(Boolean).join(" — ");
        const meta = [item.start && item.end ? `${item.start} – ${item.end}` : item.start || item.end, item.location]
          .filter(Boolean)
          .join("  |  ");
        this.ensure(44);
        this.paragraph(title || "Education", { size: 10.2, bold: true, lineHeight: 14, gapAfter: 0 });
        if (meta) {
          this.paragraph(meta, { size: 8.7, color: rgb(0.4, 0.43, 0.49), lineHeight: 12, gapAfter: 1 });
        }
        if (item.details.trim()) this.paragraph(item.details, { size: 9.3, gapAfter: 2 });
        if (index < education.length - 1) this.gap(3);
      });
    }

    if (content.skills.length > 0) {
      this.section("Skills");
      this.paragraph(content.skills.join("  ·  "), { size: 9.6, gapAfter: 2 });
    }

    const projects = content.projects.filter((item) => item.name || item.description);
    if (projects.length > 0) {
      this.section("Projects");
      projects.forEach((item, index) => {
        this.ensure(40);
        this.paragraph(item.name || "Project", { size: 10, bold: true, lineHeight: 14, gapAfter: 0 });
        if (item.link) {
          this.paragraph(item.link, {
            size: 8.7,
            color: this.template === "MINIMAL" ? rgb(0.4, 0.43, 0.49) : this.accent,
            lineHeight: 12,
            gapAfter: 1,
          });
        }
        if (item.description.trim()) this.paragraph(item.description, { size: 9.3, gapAfter: 2 });
        if (index < projects.length - 1) this.gap(3);
      });
    }

    const certificates = content.certificates.filter((item) => item.name || item.issuer);
    if (certificates.length > 0) {
      this.section("Certificates");
      for (const item of certificates) {
        const line = [item.name, item.issuer, item.year ? `(${item.year})` : ""].filter(Boolean).join(" — ");
        this.bullet(line, { size: 9.3 });
      }
    }

    if (content.languages.length > 0) {
      this.section("Languages");
      this.paragraph(content.languages.join("  ·  "), { size: 9.6 });
    }
  }

  watermark() {
    for (const page of this.doc.getPages()) {
      page.drawText("PREVIEW", {
        x: 115,
        y: 310,
        size: 96,
        font: this.fonts.bold,
        color: rgb(0.45, 0.5, 0.58),
        opacity: 0.09,
        rotate: degrees(35),
      });
    }
  }
}

export async function generateResumePdf(
  content: ResumeContent,
  template: string,
  options: { watermark?: boolean } = {},
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  let fonts: Fonts;
  try {
    if (!fontCache) {
      // Fonts are served from /public/fonts so the worker bundle stays small.
      const [regularResponse, boldResponse] = await Promise.all([
        fetch(FONT_URLS.regular),
        fetch(FONT_URLS.bold),
      ]);
      if (!regularResponse.ok || !boldResponse.ok) {
        throw new Error(`Font fetch failed: ${regularResponse.status}/${boldResponse.status}`);
      }
      fontCache = {
        regular: new Uint8Array(await regularResponse.arrayBuffer()),
        bold: new Uint8Array(await boldResponse.arrayBuffer()),
      };
    }
    fonts = {
      regular: await doc.embedFont(fontCache.regular, { subset: true }),
      bold: await doc.embedFont(fontCache.bold, { subset: true }),
      unicode: true,
    };
  } catch {
    console.error("Devanagari font load failed — falling back to Helvetica");
    fonts = {
      regular: await doc.embedFont(StandardFonts.Helvetica),
      bold: await doc.embedFont(StandardFonts.HelveticaBold),
      unicode: false,
    };
  }

  const safeTemplate: ResumeTemplate =
    template === "MODERN" || template === "MINIMAL" ? template : "CLASSIC";

  doc.setTitle(`${content.fullName} — Resume`);
  doc.setAuthor(content.fullName);
  doc.setSubject("Resume generated with HiroHome");
  doc.setCreator("HiroHome Resume Builder");
  doc.setProducer("HiroHome");

  const writer = new ResumeWriter(doc, fonts, safeTemplate);
  writer.render(content);
  if (options.watermark) writer.watermark();

  return doc.save();
}

export function isPdfBuffer(buffer: Uint8Array) {
  return buffer.length > 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
}
