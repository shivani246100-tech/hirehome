import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Production seed — creates the reference categories and the first admin account
 * from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD. No demo accounts or demo jobs.
 * The seeded admin must change the password on first login (mustChangePassword).
 */
const referenceCategories = [
  { name: "Customer Support", slug: "customer-support", icon: "headphones", blurb: "Chat, email and voice support roles" },
  { name: "Data Entry", slug: "data-entry", icon: "keyboard", blurb: "Back-office and data operations" },
  { name: "Telecalling", slug: "telecalling", icon: "phone", blurb: "Inside sales and customer calling" },
  { name: "Virtual Assistant", slug: "virtual-assistant", icon: "clipboard", blurb: "Remote admin and executive support" },
  { name: "Content Writing", slug: "content-writing", icon: "pen", blurb: "Blogs, copy and storytelling" },
  { name: "Digital Marketing", slug: "digital-marketing", icon: "megaphone", blurb: "SEO, ads and social media" },
  { name: "Web Development", slug: "web-development", icon: "code", blurb: "Frontend, backend and full stack" },
  { name: "Design", slug: "design", icon: "palette", blurb: "Graphic, UI and product design" },
  { name: "Accounts & Finance", slug: "accounts-finance", icon: "calculator", blurb: "Bookkeeping and finance support" },
  { name: "Online Teaching", slug: "online-teaching", icon: "book", blurb: "Tutors and course creators" },
];

async function main() {
  const adminName = process.env.ADMIN_NAME?.trim() || "HiroHome Admin";
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error("Set ADMIN_NAME (optional), ADMIN_EMAIL and ADMIN_PASSWORD in the environment to seed the first admin account.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin account already exists — creating/updating the reference categories and leaving data intact.");
    for (const category of referenceCategories) {
      await prisma.category.upsert({ where: { slug: category.slug }, create: category, update: category });
    }
    return;
  }

  console.log("Seeding production reference data and admin account…");

  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.order.deleteMany();
  await prisma.job.deleteMany(); // cascades to applications and reports
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.token.deleteMany();
  await prisma.user.deleteMany();

  for (const category of referenceCategories) {
    await prisma.category.create({ data: category });
  }

  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "ADMIN",
      isVerified: true,
      mustChangePassword: true,
    },
  });

  console.log(`Created admin account: ${admin.email}`);
  console.log("");
  console.log("IMPORTANT: log in now and change the seeded admin password immediately.");
  console.log("The dashboard will ask you to set a new password on first login.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
