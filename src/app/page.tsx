"use client";

import { useState, useMemo } from "react";

// ── Types ───────────────────────────────────────────────────────────────────

type Platform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "twitter"
  | "reddit"
  | "web";

type ContentType =
  | "post"
  | "reel"
  | "video"
  | "tweet"
  | "thread"
  | "article"
  | "unknown";

interface SavedItem {
  id: string;
  source_url: string;
  platform: Platform;
  content_type: ContentType;
  title: string;
  summary: string;
  topics: string[];
  author: string;
  language: string;
  created_at: string;
}

// ── Dummy data ──────────────────────────────────────────────────────────────

const DUMMY_DATA: SavedItem[] = [
  {
    id: "1",
    source_url: "https://www.instagram.com/reel/DVKgR_oDCwr/",
    platform: "instagram",
    content_type: "reel",
    title: "Cheesy Garlic Naan Recipe",
    summary:
      "A cooking tutorial where someone learns to make cheesy garlic naan from their mom as part of a 14-day Indian cooking series.",
    topics: ["cooking", "indian food", "recipe"],
    author: "tryit.toronto",
    language: "en",
    created_at: "2026-03-30T10:00:00Z",
  },
  {
    id: "2",
    source_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    platform: "youtube",
    content_type: "video",
    title: "Never Gonna Give You Up",
    summary:
      "The iconic 1987 music video by Rick Astley that became one of the most famous internet memes, known as rickrolling.",
    topics: ["music", "pop", "meme", "classic"],
    author: "Rick Astley",
    language: "en",
    created_at: "2026-03-29T15:30:00Z",
  },
  {
    id: "3",
    source_url: "https://www.tiktok.com/@zachking/video/7478773498880265518",
    platform: "tiktok",
    content_type: "video",
    title: "Mind-Bending Magic Trick",
    summary:
      "Zach King performs a seamless visual illusion that makes everyday objects appear to transform in impossible ways.",
    topics: ["magic", "illusion", "creative", "entertainment"],
    author: "zachking",
    language: "en",
    created_at: "2026-03-28T08:00:00Z",
  },
  {
    id: "4",
    source_url: "https://x.com/elonmusk/status/1861446800666911182",
    platform: "twitter",
    content_type: "tweet",
    title: "SpaceX Starship Update",
    summary:
      "Elon Musk shares an update about the latest Starship development milestones and upcoming test flight schedule.",
    topics: ["space", "spacex", "technology", "engineering"],
    author: "elonmusk",
    language: "en",
    created_at: "2026-03-27T12:00:00Z",
  },
  {
    id: "5",
    source_url:
      "https://www.reddit.com/r/webdev/comments/1jm2k5q/what_is_the_most_overengineered_thing_youve_seen/",
    platform: "reddit",
    content_type: "thread",
    title: "Overengineered Web Dev Stories",
    summary:
      "A popular thread where developers share their most absurd examples of overengineering in web development projects.",
    topics: ["web development", "programming", "humor"],
    author: "r/webdev",
    language: "en",
    created_at: "2026-03-26T18:45:00Z",
  },
  {
    id: "6",
    source_url: "https://www.instagram.com/p/DWTg_Z6DCRO/",
    platform: "instagram",
    content_type: "post",
    title: "Minimal Desk Setup Goals",
    summary:
      "A minimalist workspace setup featuring a clean desk with ambient lighting, mechanical keyboard, and dual monitors.",
    topics: ["productivity", "desk setup", "minimalism"],
    author: "setupinspiration",
    language: "en",
    created_at: "2026-03-25T09:15:00Z",
  },
  {
    id: "7",
    source_url: "https://blog.apify.com/what-is-web-scraping/",
    platform: "web",
    content_type: "article",
    title: "Web Scraping Complete Guide",
    summary:
      "A comprehensive guide explaining what web scraping is, how it works, real-world use cases, and how to get started with data extraction.",
    topics: ["web scraping", "programming", "data", "tutorial"],
    author: "apify.com",
    language: "en",
    created_at: "2026-03-24T20:30:00Z",
  },
  {
    id: "8",
    source_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    platform: "youtube",
    content_type: "video",
    title: "Me at the Zoo",
    summary:
      "The very first video ever uploaded to YouTube, featuring co-founder Jawed Karim at the San Diego Zoo talking about elephants.",
    topics: ["youtube", "history", "internet culture"],
    author: "jawed",
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
      "A guided 5-minute breathing exercise for anxiety relief using the 4-7-8 technique with physiological explanations.",
    topics: ["mental health", "breathing", "mindfulness"],
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

// Platform config: icon SVG path, badge color, label
const PLATFORM_CONFIG: Record<
  Platform,
  { icon: string; color: string; label: string }
> = {
  instagram: {
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    color: "text-pink-400",
    label: "Instagram",
  },
  youtube: {
    icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    color: "text-red-500",
    label: "YouTube",
  },
  tiktok: {
    icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    color: "text-zinc-100",
    label: "TikTok",
  },
  twitter: {
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    color: "text-zinc-100",
    label: "X",
  },
  reddit: {
    icon: "M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z",
    color: "text-orange-500",
    label: "Reddit",
  },
  web: {
    icon: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    color: "text-zinc-400",
    label: "Web",
  },
};

const CONTENT_TYPE_CONFIG: Record<
  ContentType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  post: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" />
      </svg>
    ),
    color: "bg-sky-500/10 text-sky-400",
    label: "Post",
  },
  reel: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
      </svg>
    ),
    color: "bg-violet-500/10 text-violet-400",
    label: "Reel",
  },
  video: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
      </svg>
    ),
    color: "bg-red-500/10 text-red-400",
    label: "Video",
  },
  tweet: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M7.5 8.25h9M7.5 12h9m-9 3.75h5.25" />
      </svg>
    ),
    color: "bg-zinc-500/10 text-zinc-300",
    label: "Tweet",
  },
  thread: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M7.5 8.25h9M7.5 12h9m-9 3.75h5.25" />
      </svg>
    ),
    color: "bg-orange-500/10 text-orange-400",
    label: "Thread",
  },
  article: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: "bg-zinc-500/10 text-zinc-400",
    label: "Article",
  },
  unknown: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    color: "bg-zinc-500/10 text-zinc-500",
    label: "Link",
  },
};

// Topic colors
const TOPIC_COLORS: Record<string, string> = {
  cooking: "bg-orange-500/10 text-orange-400",
  "indian food": "bg-amber-500/10 text-amber-400",
  recipe: "bg-orange-500/10 text-orange-400",
  productivity: "bg-blue-500/10 text-blue-400",
  minimalism: "bg-zinc-500/10 text-zinc-400",
  tech: "bg-cyan-500/10 text-cyan-400",
  technology: "bg-cyan-500/10 text-cyan-400",
  programming: "bg-violet-500/10 text-violet-400",
  "web development": "bg-violet-500/10 text-violet-400",
  travel: "bg-sky-500/10 text-sky-400",
  music: "bg-pink-500/10 text-pink-400",
  space: "bg-indigo-500/10 text-indigo-400",
  "mental health": "bg-teal-500/10 text-teal-400",
  mindfulness: "bg-teal-500/10 text-teal-400",
  entertainment: "bg-yellow-500/10 text-yellow-400",
  humor: "bg-yellow-500/10 text-yellow-400",
  data: "bg-emerald-500/10 text-emerald-400",
  tutorial: "bg-blue-500/10 text-blue-400",
};
function topicColor(topic: string): string {
  return TOPIC_COLORS[topic] || "bg-zinc-800/80 text-zinc-400";
}

// ── Components ───────────────────────────────────────────────────────────────

type FilterType = "all" | Platform;

function ContentCard({ item }: { item: SavedItem }) {
  const platform = PLATFORM_CONFIG[item.platform];
  const ctype = CONTENT_TYPE_CONFIG[item.content_type];

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
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${ctype.color}`}
        >
          {ctype.icon}
          {ctype.label}
        </span>

        {/* Platform icon */}
        <svg
          className={`w-3 h-3 ${platform.color}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d={platform.icon} />
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
      <p className="text-xs text-zinc-500 mb-3">
        {item.platform === "reddit" ? item.author : `@${item.author}`}
      </p>

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
    { label: "Instagram", value: "instagram" },
    { label: "YouTube", value: "youtube" },
    { label: "TikTok", value: "tiktok" },
    { label: "X", value: "twitter" },
    { label: "Reddit", value: "reddit" },
    { label: "Web", value: "web" },
  ];

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (filter !== "all" && item.platform !== filter) return false;
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
                placeholder="Paste any URL to analyze..."
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

          {/* Filter chips — scrollable on mobile */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900/50 border border-zinc-800/40 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
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
