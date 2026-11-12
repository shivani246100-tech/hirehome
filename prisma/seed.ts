import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const daysFromNow = (days: number) => new Date(Date.now() + days * 24 * 60 * 60 * 1000);
const hoursFromNow = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000);
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

async function main() {
  console.log("Seeding HiroHome…");

  await prisma.interview.deleteMany();
  await prisma.application.deleteMany();
  await prisma.order.deleteMany();
  await prisma.job.deleteMany();
  await prisma.category.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  const password = bcrypt.hashSync("Demo@123", 10);
  const adminPassword = bcrypt.hashSync("Admin@123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "HiroHome Admin",
      email: "admin@hirohome.in",
      phone: "+91 90000 00001",
      passwordHash: adminPassword,
      role: "ADMIN",
      isVerified: true,
    },
  });

  const nimbus = await prisma.user.create({
    data: {
      name: "Riya Mehta",
      email: "employer@hirohome.in",
      phone: "+91 90000 00002",
      passwordHash: password,
      role: "EMPLOYER",
      companyName: "Nimbus Support",
      companyWebsite: "https://nimbussupport.example.com",
      companyAbout:
        "Nimbus Support is a remote-first customer experience company. Our 400+ associates help global brands deliver friendly, fast support from home.",
      isVerified: true,
    },
  });

  const pixelcraft = await prisma.user.create({
    data: {
      name: "Kabir Rao",
      email: "kabir@pixelcraft.in",
      phone: "+91 90000 00003",
      passwordHash: password,
      role: "EMPLOYER",
      companyName: "PixelCraft Studio",
      companyWebsite: "https://pixelcraft.example.com",
      companyAbout:
        "A distributed design studio building brands and digital products for startups. We hire designers who do their best work from anywhere.",
      isVerified: true,
    },
  });

  const databridge = await prisma.user.create({
    data: {
      name: "Neha Iyer",
      email: "neha@databridge.in",
      phone: "+91 90000 00004",
      passwordHash: password,
      role: "EMPLOYER",
      companyName: "DataBridge Solutions",
      companyWebsite: "https://databridge.example.com",
      companyAbout:
        "DataBridge helps companies turn messy information into clean, useful data. Our remote back-office team powers operations for 60+ clients.",
      isVerified: true,
    },
  });

  const codeharbor = await prisma.user.create({
    data: {
      name: "Arjun Nair",
      email: "arjun@codeharbor.in",
      phone: "+91 90000 00005",
      passwordHash: password,
      role: "EMPLOYER",
      companyName: "CodeHarbor Technologies",
      companyWebsite: "https://codeharbor.example.com",
      companyAbout:
        "CodeHarbor is a product engineering partner for fast-growing SaaS teams. We are fully remote across India.",
      isVerified: true,
    },
  });

  const growthleaf = await prisma.user.create({
    data: {
      name: "Sana Kapoor",
      email: "sana@growthleaf.in",
      phone: "+91 90000 00006",
      passwordHash: password,
      role: "EMPLOYER",
      companyName: "GrowthLeaf Media",
      companyWebsite: "https://growthleaf.example.com",
      companyAbout:
        "GrowthLeaf is a performance marketing and content studio. Our remote team helps D2C brands grow with honest, useful content.",
      isVerified: true,
    },
  });

  const seeker = await prisma.user.create({
    data: {
      name: "Aarav Sharma",
      email: "seeker@hirohome.in",
      phone: "+91 98765 43210",
      passwordHash: password,
      role: "SEEKER",
      isVerified: true,
      profile: {
        create: {
          headline: "Customer support associate · Hindi & English",
          location: "Pune, Maharashtra",
          experienceYears: 2,
          skills: "Customer Support, Chat Support, CRM, Hindi, English, Zendesk",
          bio: "I enjoy helping customers solve problems quickly and calmly. Two years of remote support experience across chat and voice. Looking for a work-from-home role with a team that values clear communication.",
          resumeUrl: "https://example.com/resumes/aarav-sharma.pdf",
          resumeText:
            "2 years at HelpDesk Pro as a customer support associate. Handled 60+ chats per day, maintained 96% CSAT and resolved billing and delivery issues.",
        },
      },
    },
  });

  const priya = await prisma.user.create({
    data: {
      name: "Priya Verma",
      email: "priya@example.com",
      phone: "+91 98111 22334",
      passwordHash: password,
      role: "SEEKER",
      isVerified: true,
      premiumUntil: daysAgo(-20),
      profile: {
        create: {
          headline: "Content writer · SEO & social media",
          location: "Jaipur, Rajasthan",
          experienceYears: 1,
          skills: "Content Writing, SEO, Blogging, Canva, Hindi",
          bio: "Freelance writer with a focus on clear, helpful content for Indian audiences.",
          resumeUrl: "https://example.com/resumes/priya-verma.pdf",
        },
      },
    },
  });

  const categories = [
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

  const categoryMap: Record<string, string> = {};
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    categoryMap[category.slug] = created.id;
  }

  const jobsData = [
    {
      slug: "customer-support-executive-voice-nimbus",
      title: "Customer Support Executive (Voice)",
      employerId: nimbus.id,
      categoryId: categoryMap["customer-support"],
      description:
        "Help customers over the phone with orders, refunds and account questions. You will be the friendly voice of a fast-growing D2C brand, working from your own home with a provided calling system.\n\nThis is a full-time, permanent work-from-home role. Paid training is provided for the first two weeks.",
      responsibilities:
        "Handle 40–60 inbound customer calls per day\nResolve order, delivery and refund queries\nLog every interaction accurately in the CRM\nEscalate complex issues to the shift lead\nMaintain a calm, helpful tone on every call",
      requirements:
        "Excellent spoken Hindi and conversational English\nA quiet workspace and stable internet connection\nComfortable with rotational shifts\n0–2 years of experience — freshers are welcome\nA laptop or desktop with a headset",
      skills: "Customer Support, Voice Process, Hindi, English, CRM",
      salaryMin: 18000,
      salaryMax: 28000,
      experienceMin: 0,
      experienceMax: 2,
      openings: 8,
      isFeatured: true,
      plan: "FEATURED",
      createdAt: daysAgo(2),
    },
    {
      slug: "chat-support-associate-nimbus",
      title: "Chat Support Associate",
      employerId: nimbus.id,
      categoryId: categoryMap["customer-support"],
      description:
        "Join our remote chat support team and help customers get answers in minutes. You will work with a modern helpdesk, a supportive team lead and a clear growth path.",
      responsibilities:
        "Respond to customer chats within our quality guidelines\nResolve product and billing questions\nTag and route conversations correctly\nShare feedback that improves our help centre",
      requirements:
        "Clear written English and Hindi\nTyping speed of 35+ WPM\nStable internet and a quiet space\nFreshers with good communication are welcome",
      skills: "Chat Support, Written English, Typing, Zendesk",
      salaryMin: 16000,
      salaryMax: 24000,
      experienceMin: 0,
      experienceMax: 2,
      openings: 5,
      isFeatured: false,
      plan: "STANDARD",
      createdAt: daysAgo(1),
    },
    {
      slug: "data-entry-specialist-databridge",
      title: "Data Entry Specialist",
      employerId: databridge.id,
      categoryId: categoryMap["data-entry"],
      description:
        "Turn source documents into clean, structured records for our clients. This is focused, independent work with clear daily targets and a friendly remote team.",
      responsibilities:
        "Enter and verify records in our internal tools\nCross-check data for accuracy and completeness\nMeet daily quality and volume targets\nFlag unclear documents to the team lead",
      requirements:
        "Good typing speed and attention to detail\nBasic Excel or Google Sheets skills\nA reliable computer and internet connection\nNo prior experience required",
      skills: "Data Entry, Excel, Accuracy, Typing",
      salaryMin: 14000,
      salaryMax: 20000,
      experienceMin: 0,
      experienceMax: 1,
      openings: 12,
      isFeatured: true,
      plan: "FEATURED",
      createdAt: daysAgo(3),
    },
    {
      slug: "virtual-assistant-databridge",
      title: "Virtual Assistant (Remote)",
      employerId: databridge.id,
      categoryId: categoryMap["virtual-assistant"],
      description:
        "Support two busy founders with calendars, email, research and light operations. You will get clear priorities, async communication and the freedom to work from home.",
      responsibilities:
        "Manage calendars, inboxes and meeting notes\nDo quick research and prepare simple reports\nCoordinate with vendors and internal teams\nKeep shared trackers up to date",
      requirements:
        "Strong written English\nComfortable with Google Workspace\nOrganised, proactive and responsive\n1+ year of admin or assistant experience preferred",
      skills: "Virtual Assistance, Google Workspace, Email Management, Research",
      salaryMin: 20000,
      salaryMax: 30000,
      experienceMin: 1,
      experienceMax: 4,
      openings: 2,
      isFeatured: false,
      plan: "STANDARD",
      createdAt: daysAgo(5),
    },
    {
      slug: "graphic-designer-pixelcraft",
      title: "Graphic Designer",
      employerId: pixelcraft.id,
      categoryId: categoryMap.design,
      description:
        "Create campaign creatives, social posts and brand assets for early-stage startups. You will work with a senior designer, get real feedback and build a portfolio that stands out.",
      responsibilities:
        "Design social media and performance ad creatives\nAdapt brand systems across formats\nCollaborate with copywriters and marketers\nPrepare clean, organised source files",
      requirements:
        "Strong Figma and Adobe Photoshop skills\nA portfolio with 3+ recent projects\nGood visual taste and attention to detail\n1–3 years of design experience",
      skills: "Graphic Design, Figma, Photoshop, Branding, Social Media",
      salaryMin: 25000,
      salaryMax: 40000,
      experienceMin: 1,
      experienceMax: 3,
      openings: 2,
      isFeatured: true,
      plan: "FEATURED",
      createdAt: daysAgo(4),
    },
    {
      slug: "social-media-manager-growthleaf",
      title: "Social Media Manager",
      employerId: growthleaf.id,
      categoryId: categoryMap["digital-marketing"],
      description:
        "Own the social presence for three D2C brands. You will plan content, write captions, work with designers and report on what is actually working.",
      responsibilities:
        "Build monthly content calendars\nWrite and publish posts for Instagram and LinkedIn\nCoordinate with designers and video editors\nTrack engagement and share weekly insights",
      requirements:
        "2+ years managing brand social accounts\nExcellent Hindi and English copywriting\nComfortable with Canva and scheduling tools\nA good eye for trends and visual consistency",
      skills: "Social Media, Instagram, Content Strategy, Copywriting, Canva",
      salaryMin: 30000,
      salaryMax: 50000,
      experienceMin: 2,
      experienceMax: 5,
      openings: 1,
      isFeatured: false,
      plan: "STANDARD",
      createdAt: daysAgo(6),
    },
    {
      slug: "content-writer-hindi-english-growthleaf",
      title: "Content Writer (Hindi & English)",
      employerId: growthleaf.id,
      categoryId: categoryMap["content-writing"],
      description:
        "Write helpful blogs, product pages and email campaigns for Indian D2C and fintech brands. We care about clear writing, not keyword stuffing.",
      responsibilities:
        "Write 4–6 long-form articles per month\nCreate product and landing page copy\nEdit and proofread team drafts\nResearch topics and interview internal experts",
      requirements:
        "Published writing samples in Hindi or English\nStrong grammar and research skills\nAbility to meet weekly deadlines\n0–2 years of experience",
      skills: "Content Writing, SEO, Editing, Hindi, English",
      salaryMin: 20000,
      salaryMax: 35000,
      experienceMin: 0,
      experienceMax: 2,
      openings: 3,
      isFeatured: false,
      plan: "STANDARD",
      createdAt: daysAgo(7),
    },
    {
      slug: "junior-frontend-developer-codeharbor",
      title: "Junior Frontend Developer",
      employerId: codeharbor.id,
      categoryId: categoryMap["web-development"],
      description:
        "Build clean, accessible interfaces for SaaS products used by thousands of people. You will pair with senior engineers and ship real features in your first month.",
      responsibilities:
        "Build responsive UI components in React and TypeScript\nWork with APIs and design files\nFix bugs and improve performance\nParticipate in code reviews and standups",
      requirements:
        "Solid HTML, CSS and JavaScript fundamentals\nBasic React knowledge and one project to show\nGit and GitHub workflow\n0–2 years of experience or a strong portfolio",
      skills: "React, TypeScript, HTML, CSS, Git, Tailwind CSS",
      salaryMin: 35000,
      salaryMax: 60000,
      experienceMin: 0,
      experienceMax: 2,
      openings: 2,
      isFeatured: true,
      plan: "PREMIUM",
      createdAt: daysAgo(2),
    },
    {
      slug: "telecaller-hindi-nimbus",
      title: "Telecaller (Hindi) — Work From Home",
      employerId: nimbus.id,
      categoryId: categoryMap.telecalling,
      description:
        "Call warm leads, answer product questions and book demo appointments for a growing education brand. Scripts, training and a supportive team are provided.",
      responsibilities:
        "Make 80–100 outbound calls per day\nExplain products clearly and answer questions\nBook qualified demo appointments\nUpdate lead status in the CRM",
      requirements:
        "Fluent Hindi and basic English\nConfident, friendly phone manner\nA quiet space and stable internet\nFreshers welcome — training provided",
      skills: "Telecalling, Hindi, Sales, Communication, CRM",
      salaryMin: 12000,
      salaryMax: 18000,
      experienceMin: 0,
      experienceMax: 2,
      openings: 15,
      isFeatured: false,
      plan: "STANDARD",
      createdAt: daysAgo(1),
    },
    {
      slug: "seo-executive-growthleaf",
      title: "SEO Executive",
      employerId: growthleaf.id,
      categoryId: categoryMap["digital-marketing"],
      description:
        "Help our clients earn organic traffic with technical fixes, useful content briefs and honest link building. Remote-first team with flexible hours.",
      responsibilities:
        "Run keyword research and build content briefs\nAudit pages for technical SEO issues\nTrack rankings and traffic in Search Console\nCoordinate with writers and developers",
      requirements:
        "1+ year of hands-on SEO experience\nComfortable with Search Console and Ahrefs or similar\nBasic understanding of on-page and technical SEO\nGood written communication",
      skills: "SEO, Keyword Research, Google Analytics, Content Briefs",
      salaryMin: 22000,
      salaryMax: 38000,
      experienceMin: 1,
      experienceMax: 4,
      openings: 1,
      isFeatured: false,
      plan: "STANDARD",
      createdAt: daysAgo(8),
    },
    {
      slug: "online-maths-tutor-learnsphere",
      title: "Online Maths Tutor (Class 6–10)",
      employerId: pixelcraft.id,
      categoryId: categoryMap["online-teaching"],
      description:
        "Teach Maths to small groups of school students from home. We provide the students, lesson plans and a simple teaching platform.",
      responsibilities:
        "Take 3–4 live online classes per day\nPrepare simple lesson plans and practice sheets\nTrack student progress and share feedback\nKeep parents updated on progress",
      requirements:
        "Strong Maths up to Class 10\nComfortable teaching online in Hindi or English\nA laptop, webcam and stable internet\nTeaching experience is a plus but not required",
      skills: "Mathematics, Teaching, Online Classes, Communication",
      salaryMin: 18000,
      salaryMax: 32000,
      experienceMin: 0,
      experienceMax: 3,
      openings: 4,
      isFeatured: false,
      plan: "STANDARD",
      createdAt: daysAgo(9),
    },
    {
      slug: "accounts-assistant-work-from-home",
      title: "Accounts Assistant",
      employerId: databridge.id,
      categoryId: categoryMap["accounts-finance"],
      description:
        "Support our finance team with invoices, reconciliations and vendor follow-ups. A calm, detail-focused role with predictable hours.",
      responsibilities:
        "Record invoices and payments in Tally\nReconcile vendor accounts\nFollow up on pending bills\nPrepare simple monthly reports",
      requirements:
        "Working knowledge of Tally and Excel\nAttention to detail with numbers\n1+ year of accounts experience\nA quiet workspace and reliable internet",
      skills: "Tally, Excel, Bookkeeping, Reconciliation",
      salaryMin: 18000,
      salaryMax: 26000,
      experienceMin: 1,
      experienceMax: 3,
      openings: 1,
      isFeatured: false,
      plan: "STANDARD",
      createdAt: daysAgo(10),
    },
  ];

  const jobs: Array<{ id: string; slug: string; employerId: string; plan: string; title: string }> = [];
  for (const job of jobsData) {
    const created = await prisma.job.create({
      data: {
        ...job,
        status: "ACTIVE",
        workMode: "REMOTE",
        location: "Work from home",
        salaryPeriod: "MONTH",
        expiresAt: daysFromNow(30),
      },
    });
    jobs.push({ id: created.id, slug: created.slug, employerId: created.employerId, plan: created.plan, title: created.title });
  }

  const jobBySlug = (slug: string) => {
    const found = jobs.find((job) => job.slug === slug);
    if (!found) throw new Error(`Seed job missing: ${slug}`);
    return found;
  };

  // The seeker's own draft resume (Classic template, DRAFT status) is kept for the
  // demo. Paid built resumes are no longer seeded; real users create and pay via
  // the builder through checkout.
  await prisma.resume.create({
    data: {
      userId: seeker.id,
      title: "My resume",
      template: "CLASSIC",
      status: "DRAFT",
      contentJson: JSON.stringify({
        fullName: "Aarav Sharma",
        email: "seeker@hirohome.in",
        phone: "+91 98765 43210",
        location: "Pune, Maharashtra",
        headline: "Customer support associate · Hindi & English",
        links: "",
        summary:
          "I enjoy helping customers solve problems quickly and calmly. Two years of remote support experience across chat and voice. Looking for a work-from-home role with a team that values clear communication.",
        skills: ["Customer Support", "Chat Support", "CRM", "Hindi", "English", "Zendesk"],
        languages: [],
        experience: [],
        education: [],
        projects: [],
        certificates: [],
      }),
    },
  });

  // Paid orders so the owner dashboard has real revenue data in the demo.
  await prisma.order.create({
    data: {
      userId: nimbus.id,
      jobId: jobBySlug("customer-support-executive-voice-nimbus").id,
      plan: "FEATURED",
      amount: 999,
      status: "PAID",
      provider: "DEMO",
      postsTotal: 10,
      postsUsed: 1,
      createdAt: daysAgo(2),
      paidAt: daysAgo(2),
    },
  });
  await prisma.order.create({
    data: {
      userId: databridge.id,
      jobId: jobBySlug("data-entry-specialist-databridge").id,
      plan: "FEATURED",
      amount: 999,
      status: "PAID",
      provider: "DEMO",
      postsTotal: 10,
      postsUsed: 1,
      createdAt: daysAgo(3),
      paidAt: daysAgo(3),
    },
  });
  await prisma.order.create({
    data: {
      userId: codeharbor.id,
      jobId: jobBySlug("junior-frontend-developer-codeharbor").id,
      plan: "PREMIUM",
      amount: 2099,
      status: "PAID",
      provider: "DEMO",
      postsTotal: 50,
      postsUsed: 1,
      createdAt: daysAgo(2),
      paidAt: daysAgo(2),
    },
  });

  // Candidate Pro membership keeps the owner revenue mix realistic.
  await prisma.order.create({
    data: {
      userId: priya.id,
      plan: "PRO_MONTHLY",
      kind: "CANDIDATE_PRO",
      amount: 199,
      status: "PAID",
      provider: "DEMO",
      createdAt: daysAgo(10),
      paidAt: daysAgo(10),
    },
  });

  const application1 = await prisma.application.create({
    data: {
      jobId: jobBySlug("customer-support-executive-voice-nimbus").id,
      seekerId: seeker.id,
      coverLetter:
        "I have two years of remote customer support experience and would love to bring my calm, customer-first approach to Nimbus Support. I am comfortable with rotational shifts and have a quiet home office.",
      status: "INTERVIEW",
      appliedAt: daysAgo(2),
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: application1.id,
      type: "ASSESSMENT",
      status: "SCHEDULED",
      scheduledAt: hoursFromNow(20),
      durationMins: 20,
      questionsJson: JSON.stringify([
        {
          id: "q1",
          prompt:
            "A customer messages: “I have been waiting for 3 days for my refund.” What is the best first response?",
          options: [
            "Tell them refunds usually take 7–10 days and close the chat.",
            "Apologise for the wait, confirm the order details and check the refund status.",
            "Ask them to email support instead.",
            "Say the delay is not your department’s fault.",
          ],
          answer: 1,
        },
        {
          id: "q4",
          prompt: "What does “work from home” require most from an employee?",
          options: [
            "A large social circle",
            "Self-discipline and clear communication",
            "Working longer hours every day",
            "Avoiding all meetings",
          ],
          answer: 1,
        },
        {
          id: "q5",
          prompt: "A customer uses abusive language in chat. What should you do?",
          options: [
            "Reply in the same tone.",
            "Stay calm, set a respectful boundary and offer a solution or escalate as per policy.",
            "Immediately block the customer without informing anyone.",
            "Ignore the chat forever.",
          ],
          answer: 1,
        },
        {
          id: "q13",
          prompt: "What is the correct way to handle confidential customer data at home?",
          options: [
            "Share it with friends to double-check.",
            "Keep it on a personal social media account.",
            "Access it only on approved devices and never share it.",
            "Print it and leave it on your desk.",
          ],
          answer: 2,
        },
        {
          id: "q14",
          prompt: "Pick the best reply to a customer who says “Thank you for solving this so fast!”",
          options: [
            "No problem, bye.",
            "You’re welcome! I’m glad I could help. Is there anything else I can do for you?",
            "It was my job.",
            "Okay.",
          ],
          answer: 1,
        },
      ]),
    },
  });

  await prisma.application.create({
    data: {
      jobId: jobBySlug("chat-support-associate-nimbus").id,
      seekerId: seeker.id,
      coverLetter:
        "I type 48 WPM and have handled chat support for a D2C brand. I would be excited to join the Nimbus chat team.",
      resumeUrl: "https://example.com/resumes/aarav-sharma.pdf",
      status: "UNDER_REVIEW",
      appliedAt: daysAgo(1),
    },
  });

  await prisma.application.create({
    data: {
      jobId: jobBySlug("content-writer-hindi-english-growthleaf").id,
      seekerId: seeker.id,
      coverLetter:
        "I write clear Hindi and English content and would love to contribute to GrowthLeaf’s blog.",
      status: "APPLIED",
      appliedAt: hoursFromNow(-6),
    },
  });

  const application4 = await prisma.application.create({
    data: {
      jobId: jobBySlug("junior-frontend-developer-codeharbor").id,
      seekerId: seeker.id,
      coverLetter:
        "I have been building React projects and would love to grow as a frontend developer with CodeHarbor.",
      status: "OFFERED",
      appliedAt: daysAgo(8),
    },
  });

  await prisma.interview.create({
    data: {
      applicationId: application4.id,
      type: "VIDEO",
      status: "COMPLETED",
      scheduledAt: daysAgo(5),
      durationMins: 30,
      meetingUrl: "https://meet.google.com/hiro-home-demo",
      notes: "Cleared the technical discussion. Offer shared on the same day.",
      score: 88,
    },
  });

  await prisma.application.create({
    data: {
      jobId: jobBySlug("data-entry-specialist-databridge").id,
      seekerId: seeker.id,
      coverLetter: "I am detail-oriented and comfortable with daily data targets.",
      status: "REJECTED",
      appliedAt: daysAgo(7),
    },
  });

  console.log(`Seeded ${jobs.length} jobs, ${categories.length} categories.`);
  console.log("Demo logins:");
  console.log("  Seeker:   seeker@hirohome.in / Demo@123");
  console.log("  Employer: employer@hirohome.in / Demo@123");
  console.log("  Admin:    admin@hirohome.in / Admin@123");
  console.log(`Admin user id: ${admin.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
