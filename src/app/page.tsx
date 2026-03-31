"use client";

import { useState, useMemo } from "react";

// ── Dummy data ──────────────────────────────────────────────────────────────

interface SavedItem {
  id: string;
  source_url: string;
  platform: "instagram";
  content_type: "post" | "reel";
  title: string;
  summary: string;
  topics: string[];
  author: string;
  language: string;
  created_at: string;
}

const DUMMY_DATA: SavedItem[] = [
  {
    id: "1",
    source_url: "https://www.instagram.com/reel/DVKgR_oDCwr/",
    platform: "instagram",
    content_type: "reel",
    title: "Cheesy Garlic Naan Recipe",
    summary:
      "A cooking tutorial where someone learns to make cheesy garlic naan from their mom as part of a 14-day Indian cooking series. The video shows the full recipe process with engaging family dynamics.",
    topics: ["cooking", "indian food", "recipe", "family"],
    author: "tryit.toronto",
    language: "en",
    created_at: "2026-03-30T10:00:00Z",
  },
  {
    id: "2",
    source_url: "https://www.instagram.com/p/DWTg_Z6DCRO/",
    platform: "instagram",
    content_type: "post",
    title: "Minimal Desk Setup Goals",
    summary:
      "A minimalist workspace setup featuring a clean desk with ambient lighting, a mechanical keyboard, and dual monitors. The post emphasizes productivity through aesthetic environment design.",
    topics: ["productivity", "desk setup", "minimalism", "tech"],
    author: "setupinspiration",
    language: "en",
    created_at: "2026-03-29T15:30:00Z",
  },
  {
    id: "3",
    source_url: "https://www.instagram.com/reel/DV1abc123/",
    platform: "instagram",
    content_type: "reel",
    title: "Science-Backed Morning Routine",
    summary:
      "A 60-second morning routine breakdown including cold exposure, journaling, and a protein-packed breakfast. The creator shares science-backed benefits for each habit.",
    topics: ["morning routine", "wellness", "habits", "health"],
    author: "hubermanclips",
    language: "en",
    created_at: "2026-03-28T08:00:00Z",
  },
  {
    id: "4",
    source_url: "https://www.instagram.com/p/DWxyz789/",
    platform: "instagram",
    content_type: "post",
    title: "5 TypeScript Mistakes to Avoid",
    summary:
      "A carousel post explaining 5 common TypeScript mistakes and how to avoid them, with clear code examples and visual comparisons between wrong and right approaches.",
    topics: ["typescript", "programming", "web development", "tips"],
    author: "codewithguillaume",
    language: "en",
    created_at: "2026-03-27T12:00:00Z",
  },
  {
    id: "5",
    source_url: "https://www.instagram.com/reel/DVdef456/",
    platform: "instagram",
    content_type: "reel",
    title: "Mexico City Street Food Tour",
    summary:
      "Street food tour in Mexico City showcasing tacos al pastor, elote, and churros from three iconic vendors. The creator highlights the history behind each dish.",
    topics: ["street food", "mexico", "travel", "food culture"],
    author: "markwiens",
    language: "en",
    created_at: "2026-03-26T18:45:00Z",
  },
  {
    id: "6",
    source_url: "https://www.instagram.com/p/DWghi012/",
    platform: "instagram",
    content_type: "post",
    title: "Compound Interest Explained Simply",
    summary:
      "An infographic breaking down how compound interest works with real dollar amounts over 10, 20, and 30-year periods. Aimed at beginner investors in their 20s.",
    topics: ["personal finance", "investing", "money", "education"],
    author: "financialdiet",
    language: "en",
    created_at: "2026-03-25T09:15:00Z",
  },
  {
    id: "7",
    source_url: "https://www.instagram.com/reel/DVjkl345/",
    platform: "instagram",
    content_type: "reel",
    title: "Oil Painting Time-Lapse",
    summary:
      "A time-lapse of an oil painting being created from start to finish, showing the artist's process of layering colors to create a photorealistic portrait.",
    topics: ["art", "painting", "timelapse", "creative process"],
    author: "artbyzheng",
    language: "en",
    created_at: "2026-03-24T20:30:00Z",
  },
  {
    id: "8",
    source_url: "https://www.instagram.com/p/DWmno678/",
    platform: "instagram",
    content_type: "post",
    title: "Best Note-Taking App Showdown",
    summary:
      "A comparison of three popular note-taking apps (Notion, Obsidian, and Apple Notes) with pros and cons for each based on the creator's year-long experience using all three.",
    topics: ["productivity", "apps", "note-taking", "comparison"],
    author: "keepproductive",
    language: "en",
    created_at: "2026-03-23T14:00:00Z",
  },
  {
    id: "9",
    source_url: "https://www.instagram.com/reel/DVpqr901/",
    platform: "instagram",
    content_type: "reel",
    title: "4-7-8 Breathing for Anxiety",
    summary:
      "A guided 5-minute breathing exercise for anxiety relief using the 4-7-8 technique. The creator explains the physiological reasons why it calms the nervous system.",
    topics: ["mental health", "breathing", "anxiety", "mindfulness"],
    author: "drjuliesmith",
    language: "en",
    created_at: "2026-03-22T07:00:00Z",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

// Topic → accent color mapping for visual variety
const TOPIC_COLORS: Record<string, string> = {
  cooking: "bg-orange-500/10 text-orange-400",
  "indian food": "bg-amber-500/10 text-amber-400",
  recipe: "bg-orange-500/10 text-orange-400",
  productivity: "bg-blue-500/10 text-blue-400",
  minimalism: "bg-zinc-500/10 text-zinc-400",
  tech: "bg-cyan-500/10 text-cyan-400",
  wellness: "bg-emerald-500/10 text-emerald-400",
  health: "bg-emerald-500/10 text-emerald-400",
  programming: "bg-violet-500/10 text-violet-400",
  typescript: "bg-blue-500/10 text-blue-400",
  travel: "bg-sky-500/10 text-sky-400",
  "street food": "bg-orange-500/10 text-orange-400",
  "personal finance": "bg-green-500/10 text-green-400",
  investing: "bg-green-500/10 text-green-400",
  art: "bg-fuchsia-500/10 text-fuchsia-400",
  painting: "bg-fuchsia-500/10 text-fuchsia-400",
  "mental health": "bg-teal-500/10 text-teal-400",
  mindfulness: "bg-teal-500/10 text-teal-400",
};

function topicColor(topic: string): string {
  return TOPIC_COLORS[topic] || "bg-zinc-800/80 text-zinc-400";
}

// ── Components ───────────────────────────────────────────────────────────────

type FilterType = "all" | "post" | "reel";

function ContentCard({ item }: { item: SavedItem }) {
  return (
    <a
      href={item.source_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col rounded-2xl bg-zinc-900/60 border border-zinc-800/60 p-5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900 hover:shadow-2xl hover:shadow-black/20 hover:-translate-y-1"
    >
      {/* Top row: type badge + platform + time */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
            item.content_type === "reel"
              ? "bg-violet-500/10 text-violet-400"
              : "bg-sky-500/10 text-sky-400"
          }`}
        >
          {item.content_type === "reel" ? (
            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
            </svg>
          ) : (
            <svg
              className="w-2.5 h-2.5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          )}
          {item.content_type === "reel" ? "Reel" : "Post"}
        </span>

        {/* Instagram icon */}
        <svg className="w-3 h-3 text-zinc-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>

        <span className="ml-auto text-[11px] text-zinc-600">
          {timeAgo(item.created_at)}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-zinc-100 leading-snug mb-1 line-clamp-1 group-hover:text-white transition-colors">
        {item.title}
      </h3>

      {/* Author */}
      <p className="text-xs text-zinc-500 mb-3">@{item.author}</p>

      {/* Summary */}
      <p className="text-[13px] leading-relaxed text-zinc-400 line-clamp-3 mb-4">
        {item.summary}
      </p>

      {/* Topics */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {item.topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${topicColor(topic)}`}
          >
            {topic}
          </span>
        ))}
        {item.topics.length > 3 && (
          <span className="px-2 py-0.5 rounded-md text-zinc-600 text-[11px] font-medium">
            +{item.topics.length - 3}
          </span>
        )}
      </div>
    </a>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl bg-zinc-900/60 border border-zinc-800/60 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-12 rounded-md skeleton" />
        <div className="h-3 w-3 rounded-full skeleton" />
        <div className="ml-auto h-3 w-10 rounded skeleton" />
      </div>
      <div className="h-5 w-3/4 rounded skeleton mb-1" />
      <div className="h-3 w-20 rounded skeleton mb-3" />
      <div className="space-y-2 mb-4">
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-full rounded skeleton" />
        <div className="h-3 w-3/5 rounded skeleton" />
      </div>
      <div className="flex gap-1.5 mt-auto">
        <div className="h-5 w-14 rounded-md skeleton" />
        <div className="h-5 w-16 rounded-md skeleton" />
        <div className="h-5 w-12 rounded-md skeleton" />
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [items] = useState<SavedItem[]>(DUMMY_DATA);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Posts", value: "post" },
    { label: "Reels", value: "reel" },
  ];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter !== "all" && item.content_type !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.topics.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, filter, search]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setUrl("");
    }, 3000);
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
                />
              </svg>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-zinc-100">
              SaveSense
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-400">
              P
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* ── URL Input ── */}
        <form onSubmit={handleAdd} className="mb-8">
          <div className="flex gap-3 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/60">
            <div className="flex-1 flex items-center gap-3 pl-4">
              <svg
                className="w-4 h-4 text-zinc-600 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                />
              </svg>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste an Instagram URL to analyze..."
                className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 outline-none py-2"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !url}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-3.5 h-3.5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analyzing
                </span>
              ) : (
                "Analyze"
              )}
            </button>
          </div>
        </form>

        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
            <svg
              className="w-4 h-4 text-zinc-600 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, topic, author..."
              className="flex-1 bg-transparent text-sm text-zinc-300 placeholder-zinc-600 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800/40">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                  filter === f.value
                    ? "bg-zinc-800 text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Count ── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-zinc-600">
            {filtered.length} item{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isAnalyzing && <SkeletonCard />}
          {filtered.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>

        {/* ── Empty state ── */}
        {filtered.length === 0 && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-zinc-700"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>
            <p className="text-sm text-zinc-500 mb-1">No results found</p>
            <p className="text-xs text-zinc-700">
              Try a different search term or filter
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
