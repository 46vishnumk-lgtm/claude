/**
 * Site content.
 *
 * ============================ PLACEHOLDER ============================
 * Every client name, project, quote, person and number in this file is
 * INVENTED so the design can be judged with real-looking content in it.
 * None of it describes work Arijentek has actually done.
 *
 * Search the codebase for PLACEHOLDER to find every block that has to be
 * replaced with approved material before this site goes anywhere public.
 * =====================================================================
 */

export const STUDIO = {
  name: "Arijentek",
  descriptor: "Design and engineering studio",
  positioning: "Technology, design, and intelligence, built as one system.",
  email: "hello@arijentek.com", // TODO: confirm
  cta: "Start a conversation",
};

/**
 * TODO — the booking link for "Book a call" (Cal.com / Calendly / HubSpot).
 * Empty until the real one exists: every "Book a call" button, and the
 * contact page's "Prefer to talk?" panel, render only when this is set, so
 * no button leads to a placeholder page.
 */
export const BOOKING_URL = "";

/** PLACEHOLDER — invented client names. */
export const CLIENTS = [
  "Northbank",
  "Meridian Health",
  "Kestrel Labs",
  "Orbit Freight",
  "Auralis",
  "Vellum",
  "Pactum",
  "Fielding & Co",
];

/** PLACEHOLDER — invented engagements. */
export const PROJECTS = [
  {
    n: "01",
    name: "Northbank",
    sector: "Fintech",
    engagement: "Platform build",
    year: "2025",
    line: "A lending platform rebuilt around a single source of truth.",
    detail:
      "Eleven internal tools and four spreadsheets became one system. Underwriters see the whole file on one screen, and a decision that took two days takes forty minutes.",
    tags: ["Product design", "Full-stack", "Data"],
    images: ["media/work-01.jpg", "media/work-03.jpg", "media/work-05.jpg"],
  },
  {
    n: "02",
    name: "Meridian Health",
    sector: "Healthcare",
    engagement: "Product design and build",
    year: "2025",
    line: "Patient records a clinician can read in six seconds.",
    detail:
      "We spent three weeks in clinics before we drew anything. The result strips a record to what matters at the point of care and pushes everything else one tap away.",
    tags: ["Research", "Design system", "Accessibility"],
    // work-02 was here and has been pulled: it is a phone home screen full of
    // real third-party app icons, and a wall of other companies' marks inside
    // a case study for an invented client reads as a claim about them.
    images: [
      "media/svc-experience.jpg",
      "media/studio-04.jpg",
      "media/studio-02.jpg",
    ],
  },
  {
    n: "03",
    name: "Kestrel Labs",
    sector: "Applied AI",
    engagement: "SaaS platform",
    year: "2024",
    line: "Research output turned into something a team can act on.",
    detail:
      "Model results were arriving as CSV attachments. We built the platform that ingests, versions, and explains them, with an audit trail the compliance team signs off.",
    tags: ["Platform", "Data pipelines", "Automation"],
    images: [
      "media/svc-engineering.jpg",
      "media/work-06.jpg",
      "media/step-launch.jpg",
    ],
  },
  {
    n: "04",
    name: "Orbit Freight",
    sector: "Logistics",
    engagement: "Digital transformation",
    year: "2024",
    line: "Dispatch moved off spreadsheets and onto a live system.",
    detail:
      "We mapped how a load actually moves through the business, then replaced the two steps that broke most often. The rest followed over nine months, without stopping operations.",
    tags: ["Process mapping", "Internal tools", "Migration"],
    images: [
      "media/svc-transformation.jpg",
      "media/step-evolve.jpg",
      "media/work-05.jpg",
    ],
  },
  {
    n: "05",
    name: "Auralis",
    sector: "Consumer hardware",
    engagement: "3D and creative",
    year: "2023",
    line: "A product configurator that renders in the browser.",
    detail:
      "Photography could not keep up with the number of finishes. We built a real-time configurator instead, using the same materials the factory works from.",
    tags: ["Web 3D", "Visualization", "Motion"],
    images: [
      "media/svc-creative.jpg",
      "media/work-06.jpg",
      "media/work-03.jpg",
    ],
  },
];

export const SERVICES = [
  {
    n: "01",
    title: "Digital Experiences",
    left: "Interface",
    right: "Systems",
    body: "We design the parts of a product people touch, and the system that keeps those parts consistent as the product grows.",
    items: [
      "Product UI/UX",
      "Design systems",
      "Marketing sites",
      "E-commerce",
      "Accessibility",
    ],
    image: "media/svc-experience.jpg",
    slug: "digital-experiences",
    headline: "Make the experience make sense.",
    intro: [
      "We design the parts of a product a person touches, and the system that keeps those parts consistent as the product grows.",
      "We start with research: who uses this, what they are trying to do, and where the current experience gets in their way. We then shape the interface, interaction model, and design system that support the product beyond its first release.",
    ],
    includes: [
      "Product and application UI/UX",
      "Design systems and component libraries",
      "Marketing and brand sites",
      "E-commerce and storefront experiences",
      "Accessibility and usability review",
    ],
    startsWith:
      "A product that has grown past its original design, or a new product that needs its first interface built properly.",
  },
  {
    n: "02",
    title: "Software & Platform",
    left: "Architecture",
    right: "Scale",
    body: "We build the application and the platform under it, with clear architecture, documentation, integrations, and the parts your team needs to maintain.",
    items: [
      "Web and app development",
      "Full-stack architecture",
      "APIs",
      "SaaS",
      "Observability",
    ],
    image: "media/svc-engineering.jpg",
    slug: "software-platform",
    headline: "Build what the experience depends on.",
    intro: [
      "We build the application and the platform underneath it, and we build both to be maintained by someone other than us.",
      "Our engineers work in the same cycle as our designers. We favour boring, well-understood technology, clear documentation, and test coverage on the parts that matter. When we hand a system over, your team can run it.",
    ],
    includes: [
      "Web and application development",
      "Full-stack and backend architecture",
      "API design and third-party integrations",
      "SaaS platform development",
      "Performance and observability",
      "Infrastructure",
    ],
    startsWith:
      "A prototype that needs to become a real product, or a platform that can no longer carry the load the business is putting on it.",
  },
  {
    n: "03",
    title: "3D & Creative",
    left: "Form",
    right: "Motion",
    body: "We create product, spatial, and motion experiences that belong to the same system as the rest of the product, not a separate asset library that drifts out of sync.",
    items: [
      "Product visualization",
      "Architectural 3D",
      "Web 3D",
      "Motion",
      "Creative technology",
    ],
    image: "media/svc-creative.jpg",
    slug: "3d-creative",
    headline: "Make the digital world tangible.",
    intro: [
      "We produce 3D and motion work that belongs to the same system as the rest of the product, not a separate asset library that drifts out of sync.",
      "That can mean product and spatial visualization, interactive 3D on the web, motion design, or creative-technology prototypes.",
    ],
    includes: [
      "Product and packaging visualization",
      "Architectural and spatial 3D",
      "Real-time and web-based 3D",
      "Motion design and animation",
      "Creative technology and prototypes",
    ],
    startsWith:
      "A product or space that needs to be shown before it physically exists, or a brand that wants dimensional work without losing consistency.",
  },
  {
    n: "04",
    title: "Digital Transformation",
    left: "Process",
    right: "Intelligence",
    body: "We modernize the systems an existing business already runs on, replacing the slowest and most fragile parts first.",
    items: [
      "Process modernization",
      "Workflow automation",
      "Data pipelines",
      "Migration",
      "Internal tools",
    ],
    image: "media/svc-transformation.jpg",
    slug: "digital-transformation",
    headline: "Modernize without stopping the business.",
    intro: [
      "We help existing businesses modernize the systems they already run on, without stopping the business to do it.",
      "We start by mapping how work actually moves through the organization, then replace the slowest and most fragile parts first. Automation and data pipelines come in where they remove real manual effort, not because they are on a slide.",
    ],
    includes: [
      "Process mapping and modernization",
      "Workflow automation",
      "Data pipelines and reporting infrastructure",
      "Legacy platform migration",
      "Internal tools and admin systems",
    ],
    startsWith:
      "A team spending its week on manual work that a system should be doing, or a legacy platform that can no longer carry the business.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Discovery",
    body: "A short paid phase, usually one to three weeks. We interview the people who will use and maintain the system, audit what already exists, and come back with a written plan.",
    points: [
      "Interviews with users and maintainers",
      "Audit of code, design, data and vendors",
      "A written plan, and a fixed proposal for the build",
    ],
    image: "media/step-discover.jpg",
  },
  {
    n: "02",
    title: "Design and build",
    body: "Two-week cycles. Design runs slightly ahead of engineering, never in a separate phase. At the end of each cycle you see working software, not a status deck.",
    points: [
      "Reviewable increments every two weeks",
      "One visible backlog, changes in priority expected",
      "Direct access to the people doing the work",
    ],
    // step-build.jpg was here and has been pulled: it is a photograph of a
    // web-scraping script whose baseUrl is literally "https://unsplash.com",
    // legible at the size this plate is rendered.
    image: "media/work-04.jpg",
  },
  {
    n: "03",
    title: "Launch",
    body: "A planned event with a checklist, not a deadline we sprint at. We handle deployment, monitoring, rollback plans, and the first days of production support.",
    points: [
      "Load and security pass before anything goes live",
      "Monitored launch with a rollback plan",
      "Your team trained before the system is theirs",
    ],
    image: "media/step-launch.jpg",
  },
  {
    n: "04",
    title: "Evolve",
    body: "After launch we move to a support arrangement sized to how much the system will keep changing. We recommend the lightest option that actually works.",
    points: [
      "Retained capacity, maintenance, or a clean handover",
      "Measurement and iteration on real usage",
      "No lock-in. Documentation is part of the deliverable",
    ],
    image: "media/step-evolve.jpg",
  },
];

/** PLACEHOLDER — invented figures. Nothing here has been measured. */
export const NUMBERS = [
  {
    v: "60+",
    k: "Products shipped",
    d: "Across fintech, health, logistics and consumer",
  },
  {
    v: "11",
    k: "Years",
    d: "Building systems that stayed in production",
  },
  {
    v: "94%",
    k: "Clients who return",
    d: "Relationships measured in years, not projects",
  },
  {
    v: "4",
    k: "Practices, one team",
    d: "Design, engineering, 3D and transformation",
  },
];

/** PLACEHOLDER — invented quotes from invented people at invented companies. */
export const QUOTES = [
  {
    quote:
      "They spent three weeks in our clinics before drawing a single screen. Nobody had done that before. It shows in the product.",
    name: "Dr. Elena Vasquez",
    role: "Clinical Director, Meridian Health",
    avatar: "media/avatar-02.jpg",
  },
  {
    quote:
      "The handover was the part that surprised me. Documentation, tests, a runbook. Our team took it over in a fortnight.",
    name: "Marcus Okonjo",
    role: "CTO, Northbank",
    avatar: "media/avatar-01.jpg",
  },
  {
    quote:
      "They told us one of the things we asked for was a bad idea, and why. That is worth more than agreeing with us.",
    name: "Priya Raman",
    role: "Head of Product, Kestrel Labs",
    avatar: "media/avatar-04.jpg",
  },
  {
    quote:
      "Nine months of migration and dispatch never went down once. That was the whole brief and they hit it.",
    name: "Tomas Lindqvist",
    role: "Operations Director, Orbit Freight",
    avatar: "media/avatar-03.jpg",
  },
];

// This build is the homepage alone: each link glides to its section of the
// page (components/HomeLinks.tsx).
export const NAV = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Approach", href: "/approach" },
  { label: "Contact", href: "/contact" },
];
