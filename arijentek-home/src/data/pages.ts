/**
 * Content for every page beyond Home.
 *
 * Wording is taken from docs/CONTENT.md wherever that document has approved
 * copy. Everything it marks [NEEDS] has been filled with invented material so
 * the pages can be judged full, and is flagged PLACEHOLDER here, the same way
 * site.ts flags its own. None of it may ship as fact.
 */
import { PROJECTS, QUOTES, SERVICES } from "./site";

export type PillarSlug = (typeof SERVICES)[number]["slug"];

/* =========================================================================
 * Work — case studies
 * ========================================================================= */

type CaseDetail = {
  slug: string;
  pillars: PillarSlug[];
  role: string;
  duration: string;
  outcome: string;
  problem: string[];
  approach: { title: string; body: string }[];
  change: string[];
  results: { v: string; k: string }[];
  team: string[];
  tools: string[];
  quoteName?: string;
};

/** PLACEHOLDER — every engagement, figure and decision here is invented. */
const CASE_DETAILS: Record<string, CaseDetail> = {
  "01": {
    slug: "northbank",
    pillars: ["software-platform", "digital-experiences"],
    role: "Led product design and engineering end to end",
    duration: "7 months",
    outcome: "Lending decisions in forty minutes instead of two days.",
    problem: [
      "Northbank's underwriters were working across eleven internal tools and four shared spreadsheets. Each one held part of an applicant's file, and none of them agreed about which version was current.",
      "The tools had been added one at a time, each for a good reason. Together they meant an experienced underwriter spent most of a decision reconciling data rather than judging risk, and a new one took months to become useful.",
      "Replacing everything at once was not an option. The lending book could not pause while a new system was built.",
    ],
    approach: [
      {
        title: "One record, agreed first",
        body: "Before designing a screen we modelled the applicant file with the credit and compliance teams, and agreed which system owned each field. That model became the contract every later decision was checked against.",
      },
      {
        title: "Built behind the old tools",
        body: "The new platform read from the existing systems before it wrote to any of them. Underwriters could compare the two side by side for six weeks, which is where most of the edge cases surfaced.",
      },
      {
        title: "Designed around the decision",
        body: "The underwriting screen shows what a decision needs and nothing else. Everything a reviewer might want later sits one step away, with a full history of who changed what.",
      },
      {
        title: "Retired tools one at a time",
        body: "Each legacy tool was switched off only when its last user had moved. The final spreadsheet went in month seven.",
      },
    ],
    change: [
      "Underwriters work from one screen. The time spent reconciling data before a decision has largely disappeared, and new team members are productive in weeks rather than months.",
      "The platform is run by Northbank's own engineers, who took it over with documentation, tests and a runbook.",
    ],
    results: [
      { v: "40 min", k: "Typical decision, down from two days" },
      { v: "11 → 1", k: "Internal tools replaced" },
      { v: "2 weeks", k: "For Northbank's team to take over" },
    ],
    team: ["Engagement lead", "Product designer", "Two full-stack engineers", "Data engineer"],
    tools: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Terraform"],
    quoteName: "Marcus Okonjo",
  },
  "02": {
    slug: "meridian-health",
    pillars: ["digital-experiences"],
    role: "Research, product design and front-end build",
    duration: "5 months",
    outcome: "Patient records a clinician can read in six seconds.",
    problem: [
      "Meridian's clinicians were using a record system designed for billing. Everything was there, and almost nothing was where they needed it at the point of care.",
      "Clinicians had built their own workarounds: printed summaries, sticky notes on monitors, colleagues who knew where things lived. Those workarounds were the real system, and they did not survive a shift change.",
    ],
    approach: [
      {
        title: "Three weeks in the clinics",
        body: "We shadowed nurses and doctors across day and night shifts before drawing anything, and recorded what they looked for first, second and never.",
      },
      {
        title: "A record read in layers",
        body: "The first layer answers the questions asked in the first seconds at a bedside. Everything else is one tap away, in the order it was asked for.",
      },
      {
        title: "Accessible by default",
        body: "Tested with screen readers, at high zoom and in poor lighting, because a ward at 3am is all three.",
      },
    ],
    change: [
      "In supervised testing, clinicians found the information they needed at the bedside in around six seconds. The printed summaries stopped being made.",
    ],
    results: [
      { v: "~6 s", k: "To find what matters at the bedside" },
      { v: "WCAG 2.2 AA", k: "Accessibility target met" },
    ],
    team: ["Engagement lead", "Researcher", "Product designer", "Front-end engineer"],
    tools: ["Figma", "React", "TypeScript", "Storybook"],
    quoteName: "Dr. Elena Vasquez",
  },
  "03": {
    slug: "kestrel-labs",
    pillars: ["software-platform", "digital-transformation"],
    role: "Platform architecture and build",
    duration: "6 months",
    outcome: "Model results versioned, explained and signed off in one place.",
    problem: [
      "Kestrel's research team produced strong models. Their results reached the rest of the company as CSV attachments, with no record of which model version or dataset produced them.",
      "The compliance team could not sign off what they could not trace, so good results sat unused.",
    ],
    approach: [
      {
        title: "Lineage before interface",
        body: "Every result is stored with the model version, data snapshot and parameters that produced it. We built that before any screen, because the screens depend on it.",
      },
      {
        title: "Explanations people can act on",
        body: "Each result carries a plain-language summary and the few factors that drove it, written for the team that has to decide, not the team that trained the model.",
      },
      {
        title: "An audit trail compliance designed",
        body: "Sign-off rules were written with the compliance team and enforced by the platform rather than by process documents.",
      },
    ],
    change: [
      "Results move from research to the teams that use them without being re-exported, and every one can be traced back to its source.",
    ],
    results: [
      { v: "100%", k: "Results traceable to model and data" },
      { v: "0", k: "CSV attachments in the sign-off process" },
    ],
    team: ["Engagement lead", "Backend engineer", "Data engineer", "Product designer"],
    tools: ["Python", "FastAPI", "PostgreSQL", "dbt", "React"],
    quoteName: "Priya Raman",
  },
  "04": {
    slug: "orbit-freight",
    pillars: ["digital-transformation", "software-platform"],
    role: "Process mapping, migration and internal tools",
    duration: "9 months",
    outcome: "Dispatch moved off spreadsheets without stopping operations.",
    problem: [
      "Orbit ran dispatch for several hundred loads a day from shared spreadsheets and phone calls. It worked because a few people held the whole picture in their heads.",
      "Growth had made that fragile. A sick day in the dispatch office showed up as late deliveries the same afternoon.",
    ],
    approach: [
      {
        title: "Mapped how a load really moves",
        body: "We followed loads from booking to proof of delivery and mapped every hand-off, including the ones nobody had written down.",
      },
      {
        title: "Fixed the two worst steps first",
        body: "Two steps caused most of the failures. We replaced those first, inside the existing way of working, so the team felt the benefit in weeks.",
      },
      {
        title: "Migrated in the background",
        body: "Everything else moved over nine months, one lane at a time, with the spreadsheets kept read-only until each lane was proven.",
      },
    ],
    change: [
      "Dispatch runs from one live system. The knowledge that lived in a few people's heads is now in the tool, and the office can absorb an absence without the afternoon going wrong.",
    ],
    results: [
      { v: "9 months", k: "Full migration, no operational stop" },
      { v: "2", k: "Failure-prone steps replaced first" },
    ],
    team: ["Engagement lead", "Service designer", "Two full-stack engineers"],
    tools: ["TypeScript", "Node.js", "PostgreSQL", "Retool", "Azure"],
    quoteName: "Tomas Lindqvist",
  },
  "05": {
    slug: "auralis",
    pillars: ["3d-creative", "digital-experiences"],
    role: "Real-time 3D, material pipeline and configurator",
    duration: "4 months",
    outcome: "Every finish shown accurately, without a photo shoot.",
    problem: [
      "Auralis sells its speakers in dozens of finishes, and photography could not keep up. New finishes launched with renders that did not match the product, and returns followed.",
    ],
    approach: [
      {
        title: "Materials from the factory",
        body: "We built the material library from the same specifications the factory works from, so a finish on screen is the finish in the box.",
      },
      {
        title: "Rendered in the browser",
        body: "The configurator runs in real time on a mid-range phone. Heavy detail loads only when someone zooms in.",
      },
      {
        title: "One source for every image",
        body: "Product pages, marketing stills and retailer assets are all rendered from the same scenes, so they cannot drift apart.",
      },
    ],
    change: [
      "New finishes launch with accurate imagery on day one, and the marketing team produces stills from the same scenes instead of commissioning shoots.",
    ],
    results: [
      { v: "Day one", k: "Accurate imagery for each new finish" },
      { v: "1", k: "Source for web, marketing and retail images" },
    ],
    team: ["Engagement lead", "3D artist", "Creative technologist", "Front-end engineer"],
    tools: ["Blender", "Three.js", "React Three Fiber", "Substance"],
  },
};

export const CASES = PROJECTS.map((p) => {
  const d = CASE_DETAILS[p.n];
  const quote = d.quoteName ? QUOTES.find((q) => q.name === d.quoteName) : undefined;
  return { ...p, ...d, quote };
});

export type Case = (typeof CASES)[number];

export const SECTORS = Array.from(new Set(CASES.map((c) => c.sector)));

/* =========================================================================
 * Services — deliverables and tools per practice
 * ========================================================================= */

/** PLACEHOLDER — tool lists should be confirmed against what the team uses. */
export const PRACTICE_EXTRAS: Record<
  PillarSlug,
  { deliverables: string[]; tools: string[] }
> = {
  "digital-experiences": {
    deliverables: [
      "Research findings and journey maps your team can reuse",
      "Interface designs and tested interactive prototypes",
      "A documented design system, in design files and in code",
      "An accessibility audit against WCAG 2.2 AA",
    ],
    tools: ["Figma", "Storybook", "React", "TypeScript", "Tailwind CSS"],
  },
  "software-platform": {
    deliverables: [
      "A deployed application with automated build and release",
      "Architecture decision records explaining the choices made",
      "API documentation and a test suite on the critical paths",
      "Monitoring dashboards and runbooks for your team",
    ],
    tools: ["TypeScript", "Node.js", "Python", "PostgreSQL", "AWS", "Terraform"],
  },
  "3d-creative": {
    deliverables: [
      "Real-time 3D scenes that run on the web",
      "Rendered stills and animation from the same source scenes",
      "A material and asset library the team can extend",
      "Interactive configurators and prototypes",
    ],
    tools: ["Blender", "Three.js", "React Three Fiber", "Substance", "After Effects"],
  },
  "digital-transformation": {
    deliverables: [
      "A map of how work actually moves through the organization",
      "A migration plan with a rollback at every stage",
      "Automated workflows and the internal tools around them",
      "Data pipelines and reporting people trust",
    ],
    tools: ["Python", "dbt", "PostgreSQL", "Retool", "Azure"],
  },
};

/* =========================================================================
 * Approach
 * ========================================================================= */

export const STAGES = [
  {
    n: "01",
    title: "Discovery",
    length: "1–3 weeks",
    body: [
      "Before we quote a full project, we run a short paid discovery phase.",
      "We interview the people who will use and maintain the system. We audit what already exists: the codebase, the design, the data, and the vendor contracts. We identify the real constraints, technical and organizational.",
      "We come back with a written plan: scope, sequence, team, timeline, and price, with the assumptions stated so you can challenge them. If you decide not to continue, you keep the plan and owe us nothing further.",
    ],
    get: "A written project plan, a technical assessment, and a fixed proposal for the build.",
    image: "media/step-discover.jpg",
  },
  {
    n: "02",
    title: "Design and build",
    length: "Two-week cycles",
    body: [
      "Design runs slightly ahead of engineering, never in a separate phase.",
      "At the end of each cycle you see working software, not a status deck. We keep a single visible backlog. Changes in priority are normal and we plan for them.",
      "You have direct access to the people doing the work, not only an account manager. We ship to a staging environment continuously and to production on an agreed cadence.",
    ],
    get: "Reviewable increments every two weeks, a running staging build, and a weekly written update.",
    image: "media/work-04.jpg",
  },
  {
    n: "03",
    title: "Launch",
    length: "A planned event",
    body: [
      "Launch is a planned event with a checklist, not a deadline we sprint at.",
      "We handle deployment, monitoring, rollback plans, and the first days of production support. We do a load and security pass before anything goes live. Your team is trained on the system before it is theirs, not after.",
    ],
    get: "A monitored production launch, runbooks, and a documented handover.",
    image: "media/step-launch.jpg",
  },
  {
    n: "04",
    title: "After launch",
    length: "As long as it is useful",
    body: [
      "After launch we move to a support arrangement that fits how much the system will keep changing.",
      "That can be a retained block of time each month, a maintenance agreement, or a clean handover to your own team with us available for questions. We will recommend the lightest option that actually works for your situation.",
    ],
    get: "A support model sized to the system, and no lock-in.",
    image: "media/step-evolve.jpg",
  },
];

/** PLACEHOLDER — confirm team shape and cadence against how engagements run. */
export const TEAM_SHAPE = {
  intro:
    "Every engagement gets one small team that stays together from discovery to launch. Nobody is handed a brief written by someone who has left the project.",
  roles: [
    {
      title: "Engagement lead",
      body: "A senior practitioner who owns the outcome, runs the reviews, and is the person you call. They also do hands-on work.",
    },
    {
      title: "Lead designer",
      body: "Owns research, interface and the design system, and sits in every engineering decision that affects the product.",
    },
    {
      title: "Lead engineer",
      body: "Owns architecture, quality and delivery, and sits in every design decision that affects what gets built.",
    },
    {
      title: "Specialists",
      body: "3D, data or security specialists join for the stretch of the project that needs them, inside the same team and backlog.",
    },
  ],
  rhythm: [
    "A shared channel with the whole team, not a ticket queue",
    "A written update every week",
    "A working review every two weeks",
    "Typical team size: three to six people",
  ],
};

export const CLIENT_ASKS = [
  {
    title: "One person who can decide",
    body: "Someone with the authority to make product decisions and the time to make them within a few days.",
  },
  {
    title: "Access in the first week",
    body: "To the people who use the current system, to the codebase and data, and to the vendors involved.",
  },
  {
    title: "Your time at reviews",
    body: "An hour every two weeks to see the work running and tell us what is wrong with it.",
  },
  {
    title: "Honest feedback, early",
    body: "A concern raised in week two costs an afternoon. The same concern in month four costs a lot more.",
  },
];

export const MODELS = [
  {
    title: "Project",
    body: "Fixed scope, fixed price, agreed after discovery.",
    bestFor: "A defined build with a clear end state.",
    length: "Typically 3–9 months",
  },
  {
    title: "Retainer",
    body: "A set amount of design and engineering capacity each month.",
    bestFor: "An ongoing product that needs continuous work.",
    length: "Rolling, reviewed quarterly",
  },
  {
    title: "Advisory",
    body: "Senior time for architecture review, design critique, or technical due diligence, without a build.",
    bestFor: "A team that needs outside judgement.",
    length: "Days to weeks",
  },
];

/** PLACEHOLDER — confirm each practice is real before publishing. */
export const QUALITY = [
  {
    title: "Code review on every change",
    body: "Nothing reaches the main branch without a second engineer reading it.",
  },
  {
    title: "Tests where failure is expensive",
    body: "Automated tests cover the critical paths: money, data, permissions, and anything a user cannot undo.",
  },
  {
    title: "Accessibility as a requirement",
    body: "We design and test to WCAG 2.2 AA, including with screen readers and keyboard only, not as a final audit.",
  },
  {
    title: "Security built in",
    body: "Least-privilege access, managed secrets, dependency scanning in the build, and an external test before launch for systems handling sensitive data.",
  },
  {
    title: "Your data stays yours",
    body: "We work inside your accounts where we can, sign an NDA before discovery, and remove our access when the engagement ends.",
  },
  {
    title: "Documentation as a deliverable",
    body: "Architecture decisions, runbooks and a handover guide are part of the work, so your team is never dependent on us.",
  },
];

/* =========================================================================
 * About
 * ========================================================================= */

/** PLACEHOLDER — founding year, founders, size and regions are invented. */
export const STORY = [
  "We started in 2014 as a designer and an engineer who had spent a decade on opposite sides of the same hand-off. We had watched good design get compromised in engineering, and good engineering get wasted on products that were never designed properly. Every hand-off lost something.",
  "So we built a studio with no hand-off. Designers and engineers on the same team, accountable for the same outcome. It is a harder way to run a company and a better way to build a product.",
  "Today we are twenty-four people across London and Bengaluru, working with clients in finance, health, logistics and consumer products.",
];

export const VALUES = [
  {
    title: "Senior people do the work.",
    body: "We do not sell an engagement with a principal and staff it with juniors. The people in the first meeting are the people building the thing.",
    practice: "Every engagement lead is a working designer or engineer.",
  },
  {
    title: "We stay after launch.",
    body: "A launch is the middle of the project, not the end. Most of our client relationships are measured in years.",
    practice: "Support is planned during discovery, not sold at handover.",
  },
  {
    title: "We are honest about fit.",
    body: "If a project needs something we are not the right studio for, we will say so, and often point you somewhere better.",
    practice: "Discovery can end with a recommendation to work with someone else.",
  },
  {
    title: "We build to be handed over.",
    body: "Documentation, tests, and clear architecture are part of the deliverable, not an upsell. You should never be locked in to us.",
    practice: "Every project closes with a handover your own team can run.",
  },
];

/** PLACEHOLDER — invented people. Real names, roles and photos are needed. */
export const LEADERS = [
  {
    name: "Clara Whitfield",
    role: "Co-founder, Design Director",
    bio: "Led product design at two fintech companies before starting the studio. Still designs on most engagements.",
  },
  {
    name: "Aarav Nair",
    role: "Co-founder, Engineering Director",
    bio: "Spent ten years building payment and data platforms. Owns architecture across the studio's work.",
  },
  {
    name: "Samuel Adeyemi",
    role: "Head of 3D and Creative",
    bio: "Came from product visualization for industrial design, and brought real-time 3D to the web side of the studio.",
  },
  {
    name: "Ishita Rao",
    role: "Head of Delivery",
    bio: "Runs how engagements are planned and staffed, and leads discovery on transformation projects.",
  },
];

/** PLACEHOLDER — invented locations. */
export const LOCATIONS = [
  {
    city: "London",
    detail: "Design and engagement leadership",
    hours: "09:00–18:00 UK time",
  },
  {
    city: "Bengaluru",
    detail: "Engineering, 3D and data",
    hours: "09:00–18:00 India time",
  },
];

/* =========================================================================
 * Insights
 * ========================================================================= */

export const CATEGORIES = [
  "Design",
  "Engineering",
  "AI",
  "3D",
  "Product",
  "Systems",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Post = {
  slug: string;
  title: string;
  deck: string;
  category: Category;
  author: string;
  date: string;
  image: string;
  body: { heading?: string; paragraphs: string[] }[];
};

/**
 * PLACEHOLDER — the authors are invented people and the dates are invented.
 * The arguments are written to be defensible without any invented evidence.
 */
export const POSTS: Post[] = [
  {
    slug: "the-hand-off-is-where-products-break",
    title: "The hand-off is where products break.",
    deck: "Most digital products do not fail inside design or inside engineering. They fail in the space between them, and that space is an organizational choice.",
    category: "Systems",
    author: "Clara Whitfield",
    date: "2026-07-14",
    image: "media/work-04.jpg",
    body: [
      {
        paragraphs: [
          "Watch a finished design become a shipped product and count the decisions made by someone who was not in the room when the design was agreed. On most projects the number is large, and each decision is small and reasonable on its own.",
          "A spacing value changes because a component library does not support it. An interaction is simplified because the data arrives later than the design assumed. An error state is invented at the last minute because nobody drew one. None of these is a mistake. Together they are a different product.",
        ],
      },
      {
        heading: "The problem is the sequence",
        paragraphs: [
          "When design finishes before engineering starts, every constraint engineering discovers has to be resolved by someone working from a document instead of a conversation. The designer has moved on, so the engineer makes the call.",
          "Better documentation does not fix this. The information that matters most, which parts of the design are essential and which were a guess, is rarely written down, because the designer did not know which was which until something pushed against it.",
        ],
      },
      {
        heading: "What we changed",
        paragraphs: [
          "We run design slightly ahead of engineering in the same two-week cycle, with the same people in both conversations. A designer sees the first constraint while the design is still soft. An engineer hears why a detail matters before deciding it is optional.",
          "It is slower in the first fortnight and faster by the end of the second month, because far less work is done twice.",
        ],
      },
      {
        heading: "What it means for you",
        paragraphs: [
          "If you are hiring a studio, ask who will be in the room when the first technical constraint collides with the design, and whether that person drew it. The answer tells you more about the finished product than the portfolio does.",
        ],
      },
    ],
  },
  {
    slug: "discovery-is-the-cheapest-part",
    title: "Discovery is the cheapest part of a project.",
    deck: "A few paid weeks at the start are the least expensive place to find out that the project you are planning is not the project you need.",
    category: "Product",
    author: "Ishita Rao",
    date: "2026-05-02",
    image: "media/step-discover.jpg",
    body: [
      {
        paragraphs: [
          "Clients sometimes ask whether they can skip discovery. They already know what they want built, the reasoning goes, so why pay to be told it.",
          "It is a fair question. The answer is that discovery is not mainly about what you want built. It is about what is already there, and what will get in the way.",
        ],
      },
      {
        heading: "What discovery actually finds",
        paragraphs: [
          "The most expensive surprises in a build are rarely about the new system. They are a vendor contract that cannot be exited for another year, a data source nobody trusts, a team that quietly depends on the old tool doing something undocumented.",
          "Each of these costs days to find in the first weeks and months to absorb once the build is underway and the plan is built on top of it.",
        ],
      },
      {
        heading: "Why it is paid",
        paragraphs: [
          "A free discovery is a sales process, and a sales process is optimized to end in a yes. We charge for discovery so that it can honestly end in a smaller project, a different project, or a recommendation to work with someone else.",
          "Whatever the outcome, you keep the written plan. Some clients take it to their own team. That is a good result too.",
        ],
      },
      {
        heading: "The practical consequence",
        paragraphs: [
          "If a studio quotes a full build from a single call, the risk you are not paying for up front has not disappeared. It is priced into the contingency, or it arrives later as a change request.",
        ],
      },
    ],
  },
  {
    slug: "boring-technology-is-a-feature",
    title: "Boring technology is a feature.",
    deck: "The system you hand over has to be run by people who were not in the room when it was designed. That should decide most technical choices.",
    category: "Engineering",
    author: "Aarav Nair",
    date: "2026-03-18",
    image: "media/svc-engineering.jpg",
    body: [
      {
        paragraphs: [
          "Every engineer has a list of tools they would like to use on a real project. Most of them are good tools. Very few of them are the right choice for a system someone else will maintain for the next seven years.",
        ],
      },
      {
        heading: "Who pays for novelty",
        paragraphs: [
          "The cost of an unfamiliar technology is not paid by the team that chooses it. That team is motivated and has time to learn. It is paid by the engineer hired two years later, who has to fix something at night using documentation written for early adopters.",
          "So we default to well-understood databases, mainstream languages and managed infrastructure. We will use something newer when it removes a real problem that the familiar option cannot, and we write down why.",
        ],
      },
      {
        heading: "Where we spend novelty instead",
        paragraphs: [
          "Being conservative with foundations leaves room to be ambitious where it shows: the interface, the data model, the experience of using the product. That is where a client can actually see the difference.",
        ],
      },
      {
        heading: "What to ask",
        paragraphs: [
          "When a studio proposes an architecture, ask what happens when their team leaves. If the answer involves a specialist who is hard to hire, you are being sold something that will be expensive later.",
        ],
      },
    ],
  },
];

export const postBySlug = (slug: string) => POSTS.find((p) => p.slug === slug);

export const readingTime = (post: Post) => {
  const words = post.body
    .flatMap((s) => s.paragraphs)
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
};

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* =========================================================================
 * Careers
 * ========================================================================= */

export const CAREERS_EMAIL = "careers@arijentek.com"; // TODO: confirm

export const WORKING_HERE = [
  {
    title: "Senior work, early.",
    body: "There is no layer of the org that keeps you away from clients or decisions. You will present your own work.",
  },
  {
    title: "One team, not silos.",
    body: "Designers sit with engineers. Everyone is expected to understand the product, not just their slice of it.",
  },
  {
    title: "We protect focus.",
    body: "Few meetings, long stretches of maker time, and a real limit on how many projects run at once.",
  },
  {
    title: "We invest in you staying good.",
    body: "Time and budget for learning are part of the job, not a perk you have to justify.",
  },
];

/** PLACEHOLDER — policy details must be confirmed before publishing. */
export const WORK_FACTS = [
  { k: "Where", v: "Hybrid, from London or Bengaluru. Two studio days a week." },
  { k: "Learning", v: "Ten days and a set budget each year, spent as you choose." },
  { k: "Projects", v: "No more than two at a time, usually one." },
  { k: "Pay", v: "Salary bands are shared in the first call, for every role." },
];

/**
 * PLACEHOLDER — invented benefits. Replace with the real package, and only
 * list what every employee actually gets.
 */
export const BENEFITS = [
  { title: "Private health cover", body: "For you and your dependants, from your first day." },
  { title: "Learning budget", body: "Ten days and a set amount each year, spent on what you choose." },
  { title: "Flexible hours", body: "Core hours for collaboration; the rest of the day is yours to arrange." },
  { title: "Equipment of your choice", body: "A laptop and setup budget, refreshed every three years." },
  { title: "Paid time off", body: "Generous leave plus public holidays, and a studio-wide break at year end." },
  { title: "Parental leave", body: "Paid leave for every new parent, however your family arrives." },
];

/**
 * Where job applications send. Applications carry a CV file, so this takes a
 * multipart FormData POST, not JSON. Without it, the form opens the visitor's
 * email app and asks them to attach the CV themselves.
 */
export const CAREERS_ENDPOINT = import.meta.env.VITE_CAREERS_ENDPOINT as string | undefined;

export const roleBySlug = (slug: string) => ROLES.find((r) => r.slug === slug);

export const HIRING_STEPS = [
  {
    title: "A short call",
    body: "Thirty minutes to understand what you are looking for, and whether we can offer it.",
  },
  {
    title: "Your past work",
    body: "A conversation about work you have done, walking through the decisions you made and why.",
  },
  {
    title: "A paid work sample",
    body: "A pairing session or short paid exercise on a realistic problem. No unpaid take-homes that take a weekend.",
  },
  {
    title: "Meet the team",
    body: "A final conversation with the people you would work with, followed by an offer within a week.",
  },
];

/** PLACEHOLDER — invented openings. */
export const ROLES = [
  {
    slug: "senior-product-designer",
    title: "Senior Product Designer",
    team: "Digital Experiences",
    location: "London, hybrid",
    type: "Full-time",
    summary:
      "Lead research and interface design on complex products, working in the same cycle as the engineers who build them.",
    doing: [
      "Run research with users and turn it into decisions a team can act on",
      "Design interfaces and systems, and prototype the hard parts",
      "Work through technical constraints with engineers as they appear",
      "Present your own work to clients",
    ],
    looking: [
      "Several years designing digital products that shipped and were used",
      "Comfort with ambiguity, and with being wrong in front of a client",
      "Enough understanding of front-end development to have useful arguments about it",
    ],
  },
  {
    slug: "senior-full-stack-engineer",
    title: "Senior Full-stack Engineer",
    team: "Software and Platform",
    location: "Bengaluru, hybrid",
    type: "Full-time",
    summary:
      "Design and build platforms that other teams will run for years, from data model to interface.",
    doing: [
      "Own architecture decisions on your engagements, and write them down",
      "Build across the stack in TypeScript and Python",
      "Pair with designers on the parts where the interface and the system meet",
      "Prepare systems for handover: tests, runbooks, documentation",
    ],
    looking: [
      "Production experience with relational databases and cloud infrastructure",
      "A preference for simple systems, and the judgement to know when simple is not enough",
      "Clear written communication",
    ],
  },
  {
    slug: "real-time-3d-developer",
    title: "Real-time 3D Developer",
    team: "3D and Creative",
    location: "Remote, UK or India time zones",
    type: "Full-time",
    summary:
      "Build interactive 3D for the web that looks right and runs well on ordinary devices.",
    doing: [
      "Build scenes and configurators with Three.js and React Three Fiber",
      "Work with 3D artists on materials, optimization and loading strategy",
      "Profile and fix performance on mid-range phones",
    ],
    looking: [
      "Shipped real-time 3D work in a browser",
      "Strong fundamentals in rendering and performance",
      "Interest in the product around the scene, not only the scene",
    ],
  },
];

/* =========================================================================
 * Contact
 * ========================================================================= */

export const TIMELINES = ["Exploring", "Next quarter", "Already underway", "Urgent"];

export const BUDGETS = [
  "Under $25k",
  "$25k–$75k",
  "$75k–$200k",
  "$200k+",
  "Not sure yet",
];

export const NEXT_STEPS = [
  "You send the form.",
  "We read it and reply within two business days, either with questions or a proposed call.",
  "If it looks like a fit, we schedule a 30-minute call to understand the project properly.",
  "If we move forward, the first step is a paid discovery phase.",
];

/** PLACEHOLDER — answers must be confirmed against how the studio works. */
export const FAQ = [
  {
    q: "What size of project do you take on?",
    a: "Most engagements run from three to nine months with a team of three to six people. We also take on short advisory work and discovery on its own.",
  },
  {
    q: "Do you work with early-stage companies?",
    a: "Yes, when there is a clear problem and someone who can make decisions. We are less useful for work that is still at the idea stage with no users to talk to.",
  },
  {
    q: "Who owns the work?",
    a: "You do. Intellectual property in the work we produce for you transfers to you on payment, including source code, designs and documentation.",
  },
  {
    q: "Will you sign an NDA?",
    a: "Yes. We usually sign one before discovery starts, and earlier if you need to share something sensitive in the first call.",
  },
  {
    q: "Can you work with our existing team?",
    a: "Often that is the best arrangement. We can lead the work, join a team you already have, or advise it without building anything ourselves.",
  },
  {
    q: "What happens after launch?",
    a: "We agree a support arrangement sized to how much the system will keep changing: retained time, maintenance, or a clean handover to your team.",
  },
];

/* =========================================================================
 * Legal
 * ========================================================================= */

export type LegalDoc = {
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
};

/**
 * PLACEHOLDER — drafted as a starting point, not legal advice. Both documents
 * must be reviewed by a lawyer against the studio's real entity, processors
 * and jurisdictions before launch.
 */
export const PRIVACY: LegalDoc = {
  title: "Privacy Policy",
  updated: "2026-09-17",
  intro:
    "This policy explains what personal information Arijentek collects through this website, why, and what you can ask us to do with it.",
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        "Arijentek is the controller of personal information collected through this website. You can reach us about privacy at privacy@arijentek.com.",
      ],
    },
    {
      heading: "What we collect",
      paragraphs: [
        "When you contact us, we collect what you choose to send: your name, email address, company, and the details of your enquiry.",
        "When you apply for a role, we collect the information and work you send us.",
        "If you subscribe to our notes, we collect your email address.",
        "We do not use advertising trackers. If we use analytics, it is configured not to identify individual visitors.",
      ],
    },
    {
      heading: "Why we use it",
      paragraphs: [
        "We use enquiry details to reply to you and, if we work together, to run the engagement. Our legal basis is our legitimate interest in responding to people who contact us, or taking steps at your request before entering a contract.",
        "We use applications only to assess them for the role you applied for, unless you agree to us keeping them for future roles.",
        "We use subscription emails only to send the notes you asked for, based on your consent. Every email includes a one-click unsubscribe.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        "Enquiries that do not lead to work are deleted after twelve months. Unsuccessful applications are deleted after six months unless you ask us to keep them longer. Subscription details are deleted when you unsubscribe.",
      ],
    },
    {
      heading: "Who we share it with",
      paragraphs: [
        "We do not sell personal information. We share it only with the service providers that help us run the studio, such as email and form hosting, under contracts that require them to protect it.",
        "Some of those providers may process information outside your country. Where that happens we rely on appropriate safeguards, such as standard contractual clauses.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You can ask us for a copy of your information, to correct it, to delete it, or to stop using it. Email privacy@arijentek.com and we will respond within one month.",
        "You also have the right to complain to your local data protection authority.",
      ],
    },
    {
      heading: "Changes",
      paragraphs: [
        "If we change this policy we will update the date at the top of this page.",
      ],
    },
  ],
};

export const TERMS: LegalDoc = {
  title: "Terms of Use",
  updated: "2026-09-17",
  intro:
    "These terms cover your use of this website. Work we do for clients is governed by a separate written agreement, not by these terms.",
  sections: [
    {
      heading: "Using this website",
      paragraphs: [
        "You may browse this website and share links to it. You may not use it in a way that is unlawful, that harms the website, or that interferes with anyone else's use of it.",
      ],
    },
    {
      heading: "Our content",
      paragraphs: [
        "The text, design, images and code on this website belong to Arijentek or to the people who licensed them to us. You may not reproduce them for commercial use without our permission.",
        "Project names and descriptions are shown with our clients' permission and remain subject to their rights.",
      ],
    },
    {
      heading: "Information on this website",
      paragraphs: [
        "We try to keep the information here accurate, but it is general information about the studio and not an offer or advice. Nothing on this website forms a contract.",
      ],
    },
    {
      heading: "Links to other websites",
      paragraphs: [
        "Where we link to other websites, we are not responsible for their content or how they handle your information.",
      ],
    },
    {
      heading: "Liability",
      paragraphs: [
        "We provide this website as it is. To the extent the law allows, we are not liable for any loss arising from your use of it. Nothing in these terms limits liability that cannot be limited by law.",
      ],
    },
    {
      heading: "Governing law",
      paragraphs: [
        "These terms are governed by the laws of England and Wales, and the courts of England and Wales have jurisdiction over any dispute about them.",
      ],
    },
  ],
};
