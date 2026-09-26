import appEn from "./app-en";
import type { Dict } from "./ru";

const en: Dict = {
  meta: {
    title: "Unilight — get into your dream university without fear",
    description:
      "An AI platform for high school students: a personal development roadmap, matched olympiads and competitions, gap analysis for universities, a portfolio and an AI mentor.",
  },
  nav: { platform: "Platform", how: "How it works", pricing: "Pricing", faq: "FAQ" },
  auth: { login: "Log in", signup: "Sign up", cabinet: "My dashboard" },
  intro: { start: "Start the journey", replay: "Replay", replayAria: "Replay the animation" },
  loader: { text: "Opening your dashboard" },
  hero: {
    eyebrow: "Unilight · EdTech platform",
    title: "Get into your dream university",
    accent: "without fear",
    text: "AI builds your personal development roadmap: it finds opportunities, shows what you are missing for your chosen universities and guides you all the way to admission.",
    create: "Create an account",
    cabinet: "Go to dashboard",
    see: "See the platform",
    haveAccount: "Already have an account?",
  },
  orbit: {
    center: "6 in 1",
    centerText: "admission tools in one place",
    items: ["Goals", "Plan", "Essays", "Olympiads", "IELTS · SAT", "Projects", "Grants", "Summer schools", "Hackathons", "Portfolio", "Offer"],
  },
  pillars: [
    ["Where you are now", "Skills, grades, languages and achievements in one profile that grows with you."],
    ["Where you want to be", "A university, country and major with real requirements and real chances."],
    ["What to do next", "A clear next step every week instead of chaos from a hundred competitions."],
  ],
  how: {
    eyebrow: "— How it works",
    title: "Four steps from a questionnaire to an offer",
    steps: [
      { title: "Tell us about yourself", text: "One questionnaire or a CV upload, plus an MBTI test. Interests, subjects, achievements, activities." },
      { title: "Choose a goal", text: "Country, universities, major — with real requirements and deadlines." },
      { title: "Get your roadmap", text: "AI compares you with the requirements, shows the gaps and lays out a week-by-week plan." },
      { title: "Go without fear", text: "Competitions, projects and exams on schedule, while achievements collect into your portfolio." },
    ],
  },
  platform: {
    eyebrow: "— Platform",
    title: "Take a look inside",
    text: "Six tools that work together and know everything they need about you.",
    example: "example",
    tabs: [
      { label: "Roadmap", hint: "A weekly plan up to admission" },
      { label: "Opportunities", hint: "Olympiads and schools for your profile" },
      { label: "Gap analysis", hint: "What you need for your target university" },
      { label: "AI mentor", hint: "Remembers you and answers honestly" },
      { label: "Portfolio", hint: "All achievements in one place" },
      { label: "Deadlines", hint: "We remind you when it is time to start" },
    ],
    roadmap: {
      goal: "Goal: Mechanical Engineering · Germany · 2027",
      steps: [
        ["Bring German up to B2", "by March"],
        ["Research project on renewable energy", "by May"],
        ["Engineering competition for students", "deadline April 15"],
        ["Summer engineering school in Germany", "apply by May 1"],
        ["IELTS 7.0", "take in September"],
      ],
    },
    opportunities: {
      match: "match",
      deadline: "Deadline",
      items: [
        ["AI hackathon for high school students", "Hackathon", "Oct 12"],
        ["National physics olympiad", "Olympiad", "Nov 3"],
        ["Engineering summer school", "Summer school", "Feb 1"],
        ["Young researchers conference", "Conference", "Dec 20"],
      ],
    },
    gap: {
      title: "You vs requirements: ETH Zürich · Mechanical Engineering",
      rows: ["English (IELTS)", "GPA", "Olympiads and competitions", "Research projects", "Extracurriculars"],
    },
    mentor: [
      "I built a Python bot for my school. What next to strengthen my Computer Science portfolio?",
      "Great — I remember you already know Python and basic SQL. The next step is a project with real users: put the bot on GitHub, get 50+ users and measure the result. In parallel, apply to the school hackathon by October 12 — that closes the “team projects” gap in your gap analysis.",
      "What ideas do you have for a research project?",
    ],
    portfolio: {
      items: [
        ["Regional physics olympiad prize winner", "Achievement"],
        ["Telegram timetable bot for my school", "Project · GitHub"],
        ["IELTS 6.5", "Certificate"],
        ["Charity foundation volunteer, 120 hours", "Activity"],
      ],
      note: "AI sorts your uploaded files and builds an application portfolio from them.",
    },
    calendar: {
      ai: "AI",
      items: [
        ["Oct 12", "Hackathon — application", "Time to build a team"],
        ["Nov 3", "Physics olympiad — qualifying round", "Start solving past problems"],
        ["Nov 15", "IELTS — exam registration", ""],
        ["Feb 1", "Summer school — motivation letter", "Better to start the draft now"],
      ],
    },
  },
  why: {
    eyebrow: "— Why Unilight",
    title: "One place instead of a dozen tabs",
    text: "Applying abroad means hundreds of small decisions and deadlines. When information is scattered, the most important things get lost in the noise.",
    before: "The usual way",
    after: "With Unilight",
    beforeItems: [
      "A dozen Telegram channels where an important olympiad drowns among ads",
      "ChatGPT, which you have to remind every time who you are and where you are applying",
      "Twenty tabs of university websites with different requirements",
      "A deadline spreadsheet you forget to update",
      "You hear about a competition after applications have closed",
    ],
    afterItems: [
      "One profile: grades, exams, projects and goals — all in one place",
      "An AI mentor that remembers you and draws on the experience of real admits",
      "Opportunities matched to your grade, interests and chosen universities",
      "Reminders arrive when it is time to start preparing, not on the last day",
      "Every achievement goes straight into your application portfolio",
    ],
  },
  pricing: {
    eyebrow: "— Pricing",
    title: "Choose your plan",
    text: "Every plan includes full access. The longer the term, the cheaper each day of preparation.",
    recommended: "Recommended",
    perDay: "/ day",
    save: "Save",
    tryAll: "To try everything",
    choose: "Choose",
    includes: "Every plan includes",
    note: "The crossed-out price is what the same term would cost with monthly payments. Cancel any time. During the beta all features are free.",
    plans: {
      month: { label: "1 month", note: "Billed every month" },
      quarter: { label: "3 months", note: "For serious preparation for the application season" },
      year: { label: "12 months", note: "The full cycle: from choosing a major to an offer" },
    },
    features: [
      "An AI mentor that remembers your profile and progress",
      "A personal roadmap and gap analysis for your chosen universities",
      "Matched olympiads, competitions, hackathons and summer schools",
      "A university database with requirements, grants and deadlines",
      "An application portfolio and a deadline calendar",
      "Real admitted students’ experience in the mentor’s answers",
    ],
  },
  alumni: {
    eyebrow: "— For admitted students",
    title: "Already studying abroad? Share your experience",
    text: "Honest stories — what worked, what went wrong, even rejections — help students more than any guide. The Unilight AI mentor relies on exactly these.",
    cta: "Share your story",
  },
  faq: {
    title: "Frequently asked questions",
    text: "An honest look at how Unilight works and what to expect from it.",
    items: [
      {
        q: "How is Unilight different from ChatGPT and free Telegram channels?",
        a: [
          "ChatGPT knows a lot, but nothing about you: every conversation starts from scratch and the advice stays generic. Channels give a stream of opportunities, but don’t say which ones you need and when to start.",
          "Unilight connects all of this into one system:",
          {
            list: [
              "the mentor sees your profile, goals, gaps and plan — and never asks the same thing twice;",
              "answers rely on our database: university requirements, current opportunities and honest admission stories;",
              "everything you do is saved: your plan, deadlines and portfolio grow with you.",
            ],
          },
        ],
      },
      {
        q: "How far can I trust AI advice?",
        a: [
          "We deliberately set up the mentor to be honest rather than motivating at any cost. If your goal is a university with a 4% acceptance rate, it will say plainly that it is a reach, explain what profile is really needed and suggest a balanced list: reach, target and safety.",
          "Every answer based on our database links to its source. But AI can make mistakes, so we always recommend checking specific deadlines, amounts and requirements on the official university or program website — the mentor reminds you of this itself.",
        ],
      },
      {
        q: "I’m in 11th grade — is it too late? And in 8th — too early?",
        a: [
          "Neither too late nor too early — only the strategy changes.",
          {
            list: [
              "**Grades 8–9:** the best time to find your direction and start a long story — a project, research, an olympiad path. Depth over 3–4 years makes an application stand out most.",
              "**Grade 10:** exams (IELTS, SAT), first serious results, summer schools.",
              "**Grade 11:** priorities and deadlines. The platform helps you pick universities with real chances, not miss application dates and turn what you already have into a strong portfolio.",
            ],
          },
        ],
      },
      {
        q: "I don’t know where I want to apply yet. Can the platform help?",
        a: [
          "Yes, that is a normal starting point. In the questionnaire you mark your interests and favourite subjects and take a personality test — based on them the platform suggests majors and countries to start with.",
          "Then it is best to try things in practice: the mentor will pick small projects and competitions in 2–3 areas you are curious about. In a couple of months it becomes clear what you really enjoy — and the roadmap is built around that.",
        ],
      },
      {
        q: "Can I study abroad for free if my family can’t pay for it?",
        a: [
          "Yes, but you need to prepare for it separately. The main routes:",
          {
            list: [
              "government scholarships of other countries — for example Hungary, Korea, Turkey, China;",
              "financial aid from US universities, which can cover the full cost but is highly competitive;",
              "grants from European and Asian universities and Kazakhstani programs.",
            ],
          },
          "Mark in your profile that you need a full grant — university matching and your plan will take it into account from the start, not when it is too late.",
        ],
      },
      {
        q: "What happens to my data?",
        a: [
          "Only you can see your profile: access to each student’s data is restricted at the database level. We don’t sell data or use it for advertising. The AI mentor receives only what it needs to answer.",
          "You can ask us to delete your account and all data at any time. More in the [[privacy policy]].",
        ],
      },
      {
        q: "How does the subscription work and can I cancel it?",
        a: [
          "All plans give the same full access — only the term differs. Longer plans are better value: for 3 months you pay a little more than for one, and a year costs several times less than paying monthly.",
          "You can cancel at any time — access stays until the end of the paid period. During the beta all features are free.",
        ],
      },
    ],
  },
  footer: {
    about: "An EdTech platform that guides students to admission at universities abroad — without fear.",
    platform: "Platform",
    share: "Share your experience",
    privacy: "Privacy policy",
    terms: "Terms of use",
  },
  cabinet: {
    nav: [
      ["Roadmap", "Roadmap"],
      ["Opportunities", "Opportunities"],
      ["Universities", "Universities"],
      ["AI mentor", "Mentor"],
      ["Gap analysis", "Gap analysis"],
      ["Portfolio", "Portfolio"],
      ["Deadlines", "Deadlines"],
      ["My profile", "Profile"],
    ],
    more: "More",
    logout: "Log out",
    beta: "Beta: opportunity data is for demonstration, university programs are being added.",
    note: "This section is in Russian for now — translation in progress.",
    hello: "Hi, {name}!",
    pages: {
      dashboard: "Your roadmap: where you are now, where you are heading and what to do next.",
      opportunities: ["Opportunities", "Olympiads, hackathons, competitions, summer schools and research, sorted by how well they fit you."],
      universities: ["Universities", "Every university in the world with filters, programs and requirements. Add 3–5 to your goals — your roadmap is built around them."],
      mentor: ["AI mentor", "Remembers what you can already do and helps you move in your chosen direction."],
      gap: ["Gap analysis", "Your profile compared with a university’s requirements: what you already have and what to improve."],
      portfolio: ["Portfolio", "All diplomas, projects, certificates and activities in one place. Your application portfolio is built from here."],
      calendar: ["Deadlines", "Competitions from your plan, exams and university applications. We remind you not only of the deadline but of when to start preparing."],
    },
    uniTabs: ["All universities", "Matched to my profile"],
    gate: {
      loginTitle: "Log in to your account",
      loginText: "Your profile, plan and portfolio are saved to your account and available on any device.",
      profileTitle: "Tell us about yourself first",
      profileText: "The platform builds your roadmap, matches opportunities and runs the gap analysis based on your profile.",
      fillProfile: "Fill in the questionnaire",
    },
  },
  app: appEn,
  login: {
    title: "Welcome",
    subtitle: "Your account keeps your profile, plan and portfolio — on any device.",
    tabLogin: "Log in",
    tabSignup: "Sign up",
    google: "Continue with Google",
    apple: "Continue with Apple",
    orEmail: "or with email",
    name: "Name",
    namePlaceholder: "What should we call you",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    wait: "Please wait…",
    submitLogin: "Log in",
    submitSignup: "Create account",
    submitForgot: "Send link",
    back: "← Back to log in",
    forgotTitle: "Reset password",
    forgotText: "Enter your account email — we’ll send you a link to set a new password.",
    checkMail: "Check your email",
    resetSent: "If an account with {email} exists, we have sent a link to set a new password. The email may land in Spam.",
    confirmSent: "We sent an email to {email}. Follow the link in it to confirm your account, then log in.",
    toLogin: "Back to log in",
    agree: ["By creating an account you agree to the", "terms", "and", "privacy policy", "."],
    profileKept: "The questionnaire you have already filled in will be saved to your account.",
  },
};

export default en;
