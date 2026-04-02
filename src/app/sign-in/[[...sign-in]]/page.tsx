"use client";

import { SignIn } from "@clerk/nextjs";

const DEMO_CARDS = [
  { title: "Cheesy Garlic Naan Recipe", platform: "Instagram", type: "Reel", author: "@tryit.toronto", summary: "A cooking tutorial showing how to make cheesy garlic naan from scratch.", topics: ["cooking", "recipe"] },
  { title: "How I Built an AI App in a Weekend", platform: "YouTube", type: "Video", author: "@fireship", summary: "Building a full-stack AI-powered app from scratch using Next.js and Claude.", topics: ["programming", "AI"] },
  { title: "The Future of Web Development", platform: "X", type: "Tweet", author: "@raaboringdev", summary: "The biggest shifts in web dev for 2026 — AI-assisted coding to edge-first architectures.", topics: ["web dev", "tech"] },
  { title: "Best Hidden Cafés in Tokyo", platform: "Reddit", type: "Thread", author: "u/tokyoexplorer", summary: "A comprehensive guide to Tokyo's most hidden and aesthetic cafés.", topics: ["travel", "food"] },
  { title: "Understanding Vector Databases", platform: "YouTube", type: "Video", author: "@thecodingtrain", summary: "Deep dive into how vector databases work, from embeddings to similarity search.", topics: ["database", "AI"] },
  { title: "Minimalist Apartment Tour", platform: "TikTok", type: "Reel", author: "@minimalistliving", summary: "A beautifully designed 500 sqft apartment using Scandinavian principles.", topics: ["design", "lifestyle"] },
];

const COL_A = DEMO_CARDS.slice(0, 4);
const COL_B = DEMO_CARDS.slice(2, 6);
const COL_C = [...DEMO_CARDS.slice(0, 3)].reverse();

const TYPE_COLORS: Record<string, string> = {
  Reel: "bg-violet-500/20 text-violet-300",
  Video: "bg-red-500/20 text-red-300",
  Tweet: "bg-zinc-500/20 text-zinc-300",
  Thread: "bg-orange-500/20 text-orange-300",
};
const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "text-pink-400",
  YouTube: "text-red-400",
  X: "text-white/70",
  Reddit: "text-orange-400",
  TikTok: "text-white/70",
};
const TOPIC_BG: Record<string, string> = {
  cooking: "bg-orange-500/15 text-orange-300",
  recipe: "bg-amber-500/15 text-amber-300",
  programming: "bg-violet-500/15 text-violet-300",
  AI: "bg-purple-500/15 text-purple-300",
  "web dev": "bg-indigo-500/15 text-indigo-300",
  tech: "bg-cyan-500/15 text-cyan-300",
  travel: "bg-sky-500/15 text-sky-300",
  food: "bg-orange-500/15 text-orange-300",
  database: "bg-emerald-500/15 text-emerald-300",
  design: "bg-pink-500/15 text-pink-300",
  lifestyle: "bg-rose-500/15 text-rose-300",
};

function DemoCard({ card }: { card: (typeof DEMO_CARDS)[0] }) {
  return (
    <div className="w-64 shrink-0 rounded-2xl bg-white/[0.05] border border-white/[0.07] p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${TYPE_COLORS[card.type] || ""}`}>{card.type}</span>
        <span className={`text-[10px] font-medium ${PLATFORM_COLORS[card.platform] || "text-zinc-400"}`}>{card.platform}</span>
      </div>
      <h3 className="text-[13px] font-semibold text-white/70 leading-snug mb-1 line-clamp-1">{card.title}</h3>
      <p className="text-[10px] text-white/25 mb-2">{card.author}</p>
      <p className="text-[11px] leading-relaxed text-white/30 line-clamp-2 mb-3">{card.summary}</p>
      <div className="flex gap-1.5">
        {card.topics.map((t) => (
          <span key={t} className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${TOPIC_BG[t] || "bg-zinc-500/15 text-zinc-400"}`}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function MarqueeColumn({ cards, direction, offset = 0 }: { cards: typeof DEMO_CARDS; direction: "up" | "down"; offset?: number }) {
  const cls = direction === "up" ? "marquee-up" : "marquee-down";
  return (
    <div className="overflow-hidden h-screen" style={{ marginTop: offset }}>
      <div className={`flex flex-col gap-4 ${cls}`}>
        {[0, 1].map((copy) =>
          cards.map((card, i) => <DemoCard key={`${copy}-${i}`} card={card} />)
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="relative min-h-screen bg-[#0c0e16] overflow-hidden flex items-center justify-center">
      {/* Background scrolling cards */}
      <div className="absolute inset-0 flex items-start justify-center gap-5 opacity-35 -rotate-6 scale-110 pointer-events-none" aria-hidden="true">
        <MarqueeColumn cards={COL_A} direction="up" offset={-100} />
        <div className="hidden md:block"><MarqueeColumn cards={COL_B} direction="down" offset={-250} /></div>
        <MarqueeColumn cards={COL_C} direction="up" offset={-50} />
        <div className="hidden lg:block"><MarqueeColumn cards={COL_A} direction="down" offset={-350} /></div>
        <div className="hidden md:block"><MarqueeColumn cards={COL_B} direction="up" offset={-180} /></div>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,14,22,0.55)_10%,rgba(12,14,22,0.85)_50%,#0c0e16_80%)] pointer-events-none" />

      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px] animate-pulse-glow pointer-events-none" />

      {/* Sign-in form */}
      <div className="relative z-10 flex flex-col items-center px-6 py-8">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
          SocialStash
        </h1>
        <p className="text-sm text-white/40 mb-6">Sign in to your stash</p>
        <SignIn forceRedirectUrl="/" signUpUrl="/sign-up" />
      </div>
    </div>
  );
}
