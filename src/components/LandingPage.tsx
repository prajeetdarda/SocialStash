"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const DEMO_CARDS = [
  { title: "Cheesy Garlic Naan Recipe", platform: "Instagram", type: "Reel", author: "@tryit.toronto", summary: "A cooking tutorial showing how to make cheesy garlic naan from scratch — crispy outside, soft inside.", topics: ["cooking", "recipe"] },
  { title: "How I Built an AI App in a Weekend", platform: "YouTube", type: "Video", author: "@fireship", summary: "A developer walks through building a full-stack AI-powered app from scratch using Next.js and Claude.", topics: ["programming", "AI"] },
  { title: "The Future of Web Development", platform: "X", type: "Tweet", author: "@raaboringdev", summary: "The biggest shifts in web dev for 2026 — AI-assisted coding to edge-first architectures.", topics: ["web dev", "tech"] },
  { title: "Best Hidden Cafés in Tokyo", platform: "Reddit", type: "Thread", author: "u/tokyoexplorer", summary: "A comprehensive guide to Tokyo's most hidden and aesthetic cafés with photo reviews.", topics: ["travel", "food"] },
  { title: "Understanding Vector Databases", platform: "YouTube", type: "Video", author: "@thecodingtrain", summary: "Deep dive into how vector databases work, from embeddings to similarity search.", topics: ["database", "AI"] },
  { title: "Minimalist Apartment Tour", platform: "TikTok", type: "Reel", author: "@minimalistliving", summary: "A beautifully designed 500 sqft apartment using Scandinavian minimalist principles.", topics: ["design", "lifestyle"] },
  { title: "Why Rust is Taking Over", platform: "X", type: "Thread", author: "@rustlang_daily", summary: "Why major tech companies are migrating critical infrastructure from C++ to Rust.", topics: ["rust", "programming"] },
  { title: "Homemade Pasta from Scratch", platform: "Instagram", type: "Post", author: "@pastagrannies", summary: "Making fresh tagliatelle with a classic bolognese from an Italian grandmother.", topics: ["cooking", "italian"] },
  { title: "The Psychology of Productivity", platform: "YouTube", type: "Video", author: "@aliabdaal", summary: "Science-backed techniques for deep work, time blocking, and overcoming procrastination.", topics: ["productivity", "science"] },
  { title: "Street Photography Tips", platform: "Reddit", type: "Thread", author: "u/streetshooter", summary: "Pro tips for capturing candid moments in urban settings — composition and timing.", topics: ["photography", "art"] },
  { title: "GraphQL vs REST in 2026", platform: "X", type: "Tweet", author: "@graphqlweekly", summary: "When to use GraphQL vs REST APIs with real-world performance benchmarks.", topics: ["API", "backend"] },
  { title: "30-Day Fitness Challenge", platform: "TikTok", type: "Reel", author: "@fitcoach_sam", summary: "A progressive bodyweight workout plan — zero equipment, perfect for beginners.", topics: ["fitness", "health"] },
];

const COL_A = DEMO_CARDS.slice(0, 6);
const COL_B = DEMO_CARDS.slice(6, 12);
const COL_C = [...DEMO_CARDS.slice(3, 6), ...DEMO_CARDS.slice(9, 12)];
const COL_D = [...DEMO_CARDS.slice(0, 3), ...DEMO_CARDS.slice(6, 9)];
const COL_E = [...DEMO_CARDS.slice(2, 5), ...DEMO_CARDS.slice(8, 11)];
const COL_F = DEMO_CARDS.slice(0, 6).reverse();

const TYPE_COLORS: Record<string, string> = {
  Reel: "bg-violet-500/25 text-violet-300",
  Video: "bg-red-500/25 text-red-300",
  Tweet: "bg-zinc-500/25 text-zinc-300",
  Thread: "bg-orange-500/25 text-orange-300",
  Post: "bg-sky-500/25 text-sky-300",
};

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "text-pink-400",
  YouTube: "text-red-400",
  X: "text-white/60",
  Reddit: "text-orange-400",
  TikTok: "text-white/60",
};

const TOPIC_BG: Record<string, string> = {
  cooking: "bg-orange-500/20 text-orange-300", recipe: "bg-amber-500/20 text-amber-300",
  programming: "bg-violet-500/20 text-violet-300", AI: "bg-purple-500/20 text-purple-300",
  "web dev": "bg-indigo-500/20 text-indigo-300", tech: "bg-cyan-500/20 text-cyan-300",
  travel: "bg-sky-500/20 text-sky-300", food: "bg-orange-500/20 text-orange-300",
  database: "bg-emerald-500/20 text-emerald-300", design: "bg-pink-500/20 text-pink-300",
  lifestyle: "bg-rose-500/20 text-rose-300", rust: "bg-orange-500/20 text-orange-300",
  italian: "bg-amber-500/20 text-amber-300", productivity: "bg-blue-500/20 text-blue-300",
  science: "bg-teal-500/20 text-teal-300", photography: "bg-fuchsia-500/20 text-fuchsia-300",
  art: "bg-pink-500/20 text-pink-300", API: "bg-indigo-500/20 text-indigo-300",
  backend: "bg-zinc-500/20 text-zinc-300", fitness: "bg-green-500/20 text-green-300",
  health: "bg-emerald-500/20 text-emerald-300",
};

function DemoCard({ card }: { card: (typeof DEMO_CARDS)[0] }) {
  return (
    <div className="w-[280px] shrink-0 rounded-2xl bg-white/[0.06] border border-white/[0.08] p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${TYPE_COLORS[card.type] || ""}`}>
          {card.type}
        </span>
        <span className={`text-[10px] font-medium ${PLATFORM_COLORS[card.platform] || "text-zinc-400"}`}>
          {card.platform}
        </span>
      </div>
      <h3 className="text-[13px] font-semibold text-white/70 leading-snug mb-1 line-clamp-1">
        {card.title}
      </h3>
      <p className="text-[10px] text-white/25 mb-2">{card.author}</p>
      <p className="text-[11px] leading-relaxed text-white/35 line-clamp-2 mb-3">
        {card.summary}
      </p>
      <div className="flex gap-1.5">
        {card.topics.map((t) => (
          <span key={t} className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${TOPIC_BG[t] || "bg-zinc-500/20 text-zinc-400"}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function InfiniteColumn({
  cards,
  direction,
  speed,
}: {
  cards: (typeof DEMO_CARDS)[number][];
  direction: "up" | "down";
  speed: number;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const posRef = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const singleSetHeight = el.scrollHeight / 3;

    if (direction === "down") {
      posRef.current = -singleSetHeight;
    }

    const step = () => {
      if (direction === "up") {
        posRef.current -= speed;
        if (posRef.current <= -singleSetHeight) {
          posRef.current += singleSetHeight;
        }
      } else {
        posRef.current += speed;
        if (posRef.current >= 0) {
          posRef.current -= singleSetHeight;
        }
      }
      el.style.transform = `translateY(${posRef.current}px)`;
      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [direction, speed]);

  const tripled = [...cards, ...cards, ...cards];

  return (
    <div className="overflow-hidden h-[120vh]">
      <div ref={scrollRef} className="flex flex-col gap-4 will-change-transform">
        {tripled.map((card, i) => (
          <DemoCard key={i} card={card} />
        ))}
      </div>
    </div>
  );
}

const FEATURES = [
  "AI-Powered Analysis",
  "Semantic Search",
  "Multi-Platform",
  "Instant Save",
];

export default function LandingPage() {
  return (
    <div className="relative h-screen bg-[#0c0e16] overflow-hidden flex flex-col">
      {/* ── Sign In ── */}
      <div className="relative z-30 flex items-center justify-end px-6 py-4">
        <Link
          href="/sign-in"
          className="px-5 py-2 rounded-xl bg-white/[0.08] border border-white/[0.12] text-sm font-medium text-white/80 backdrop-blur-md hover:bg-white/[0.14] hover:text-white transition-all duration-200"
        >
          Sign In
        </Link>
      </div>

      {/* ── Background: infinite scrolling card columns ── */}
      <div
        className="absolute inset-0 z-0 flex items-start justify-center gap-5 -rotate-6 scale-[1.2] pointer-events-none select-none"
        style={{ opacity: 0.55 }}
        aria-hidden="true"
      >
        <InfiniteColumn cards={COL_A} direction="up" speed={0.3} />
        <div className="hidden sm:block">
          <InfiniteColumn cards={COL_B} direction="down" speed={0.25} />
        </div>
        <InfiniteColumn cards={COL_C} direction="up" speed={0.4} />
        <div className="hidden md:block">
          <InfiniteColumn cards={COL_D} direction="down" speed={0.3} />
        </div>
        <div className="hidden lg:block">
          <InfiniteColumn cards={COL_E} direction="up" speed={0.2} />
        </div>
        <div className="hidden xl:block">
          <InfiniteColumn cards={COL_F} direction="down" speed={0.35} />
        </div>
      </div>

      {/* ── Dark vignette — strong center fade so hero is readable ── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 50%, rgba(12,14,22,0.95) 0%, rgba(12,14,22,0.85) 30%, rgba(12,14,22,0.5) 60%, rgba(12,14,22,0.15) 100%),
            linear-gradient(to bottom, rgba(12,14,22,0.6) 0%, transparent 15%, transparent 85%, rgba(12,14,22,0.6) 100%)
          `,
        }}
      />

      {/* ── Hero content ── */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6">
        {/* Badge */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.12] backdrop-blur-md mb-8"
          style={{
            background: "rgba(255,255,255,0.05)",
            animation: "fade-in-up 0.7s ease-out forwards",
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" style={{ animation: "pulse-glow 3s ease-in-out infinite" }} />
          <span className="text-sm font-medium text-white/70 tracking-wide">
            AI-Powered Content Stash
          </span>
        </div>

        {/* Title */}
        <h1 className="text-center leading-[0.9] mb-6" style={{ animation: "fade-in-up 0.8s ease-out 0.1s forwards", opacity: 0 }}>
          <span className="block text-7xl sm:text-8xl md:text-[9rem] font-extrabold tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
            Social
          </span>
          <span
            className="block text-7xl sm:text-8xl md:text-[9rem] font-extrabold tracking-tighter bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(to right, #a78bfa, #d946ef, #ec4899)" }}
          >
            Stash
          </span>
        </h1>

        {/* Tagline */}
        <p
          className="text-center text-lg sm:text-xl text-white/55 mb-8 leading-relaxed"
          style={{ animation: "fade-in-up 0.8s ease-out 0.2s forwards", opacity: 0 }}
        >
          Your Doomscroll stash — save anything, find everything.{" "}
          <span className="font-bold text-violet-400">Always.</span>
        </p>

        {/* Subtitle */}
        <p
          className="text-center text-sm sm:text-base text-white/40 max-w-md mb-10 leading-relaxed"
          style={{ animation: "fade-in-up 0.8s ease-out 0.4s forwards", opacity: 0 }}
        >
          Paste any link — AI analyzes, categorizes, and makes it searchable.
        </p>

        {/* CTA */}
        <div style={{ animation: "fade-in-up 0.8s ease-out 0.5s forwards", opacity: 0 }} className="mb-14">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white text-lg font-bold transition-all duration-300 hover:shadow-2xl hover:shadow-fuchsia-500/25 hover:scale-105 active:scale-100"
            style={{ backgroundImage: "linear-gradient(135deg, #7c3aed, #d946ef, #ec4899)" }}
          >
            Get Started Free
          </Link>
        </div>

        {/* Feature nav */}
        <div
          className="flex flex-wrap justify-center gap-4 sm:gap-8"
          style={{ animation: "fade-in-up 0.8s ease-out 0.65s forwards", opacity: 0 }}
        >
          {FEATURES.map((f, i) => (
            <span key={f} className="flex items-center gap-3 text-sm text-white/40 font-medium tracking-wide">
              {i > 0 && <span className="w-1 h-1 rounded-full bg-white/20" />}
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-20 flex flex-col items-center gap-2 pb-6">
        <p className="text-xs text-white/30">
          SocialStash — AI is the engine, you&apos;re the curator.
        </p>
        <div className="flex items-center gap-3 text-xs text-white/25">
          <span>Built by Prajeet Darda</span>
          <span className="text-white/15">&middot;</span>
          <a href="https://github.com/prajeetdarda" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">GitHub</a>
          <span className="text-white/15">&middot;</span>
          <a href="https://linkedin.com/in/prajeetdarda" target="_blank" rel="noopener noreferrer" className="hover:text-white/50 transition-colors">LinkedIn</a>
        </div>
      </div>
    </div>
  );
}
