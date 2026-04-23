"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { UserButton } from "@clerk/nextjs";
import { FREE_SAVE_LIMIT } from "@/lib/constants";

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

const EXAMPLE_DATA: SavedItem[] = [
  {
    id: "example-1",
    source_url: "https://www.instagram.com/reel/example",
    platform: "instagram",
    content_type: "reel",
    title: "Cheesy Garlic Naan Recipe",
    summary:
      "A cooking tutorial showing how to make cheesy garlic naan from scratch — crispy on the outside, soft and gooey inside.",
    topics: ["cooking", "indian food", "recipe"],
    author: "tryit.toronto",
    language: "en",
    created_at: new Date().toISOString(),
  },
  {
    id: "example-2",
    source_url: "https://www.youtube.com/watch?v=example",
    platform: "youtube",
    content_type: "video",
    title: "How I Built an AI App in a Weekend",
    summary:
      "A developer walks through building a full-stack AI-powered app from scratch using Next.js, Supabase, and Claude.",
    topics: ["programming", "AI", "tutorial"],
    author: "fireship",
    language: "en",
    created_at: new Date().toISOString(),
  },
  {
    id: "example-3",
    source_url: "https://x.com/example/status/123",
    platform: "twitter",
    content_type: "tweet",
    title: "The Future of Web Development",
    summary:
      "A thread breaking down the biggest shifts in web dev for 2026 — from AI-assisted coding to edge-first architectures.",
    topics: ["web development", "technology", "programming"],
    author: "raaboringdev",
    language: "en",
    created_at: new Date().toISOString(),
  },
];

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

const PLATFORM_CONFIG: Record<
  Platform,
  { icon: string; color: string; label: string }
> = {
  instagram: {
    icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
    color: "text-pink-500 dark:text-pink-400",
    label: "Instagram",
  },
  youtube: {
    icon: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
    color: "text-red-500",
    label: "YouTube",
  },
  tiktok: {
    icon: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
    color: "text-gray-800 dark:text-zinc-100",
    label: "TikTok",
  },
  twitter: {
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    color: "text-gray-800 dark:text-zinc-100",
    label: "X",
  },
  reddit: {
    icon: "M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z",
    color: "text-orange-500",
    label: "Reddit",
  },
  web: {
    icon: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
    color: "text-gray-500 dark:text-zinc-400",
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
    color: "bg-sky-200/70 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
    label: "Post",
  },
  reel: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
      </svg>
    ),
    color: "bg-violet-200/70 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    label: "Reel",
  },
  video: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.84A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.27l9.344-5.891a1.5 1.5 0 000-2.538L6.3 2.841z" />
      </svg>
    ),
    color: "bg-red-200/70 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    label: "Video",
  },
  tweet: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M7.5 8.25h9M7.5 12h9m-9 3.75h5.25" />
      </svg>
    ),
    color: "bg-slate-200/70 text-slate-700 dark:bg-zinc-500/10 dark:text-zinc-300",
    label: "Tweet",
  },
  thread: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M7.5 8.25h9M7.5 12h9m-9 3.75h5.25" />
      </svg>
    ),
    color: "bg-orange-200/70 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
    label: "Thread",
  },
  article: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <path strokeLinecap="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: "bg-slate-200/70 text-slate-600 dark:bg-zinc-500/10 dark:text-zinc-400",
    label: "Article",
  },
  unknown: {
    icon: (
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
      </svg>
    ),
    color: "bg-slate-200/70 text-slate-500 dark:bg-zinc-500/10 dark:text-zinc-500",
    label: "Link",
  },
};

const TOPIC_COLORS: Record<string, string> = {
  cooking: "bg-orange-200/70 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  "indian food": "bg-amber-200/70 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  recipe: "bg-orange-200/70 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400",
  productivity: "bg-blue-200/70 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  minimalism: "bg-slate-200/70 text-slate-700 dark:bg-zinc-500/10 dark:text-zinc-400",
  tech: "bg-cyan-200/70 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  technology: "bg-cyan-200/70 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
  programming: "bg-violet-200/70 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  "web development": "bg-violet-200/70 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  travel: "bg-sky-200/70 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  music: "bg-pink-200/70 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400",
  space: "bg-indigo-200/70 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  "mental health": "bg-teal-200/70 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  mindfulness: "bg-teal-200/70 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400",
  entertainment: "bg-yellow-200/70 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  humor: "bg-yellow-200/70 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
  data: "bg-emerald-200/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  tutorial: "bg-blue-200/70 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  AI: "bg-purple-200/70 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
};
function topicColor(topic: string): string {
  return TOPIC_COLORS[topic] || "bg-slate-200/70 text-slate-600 dark:bg-zinc-800/80 dark:text-zinc-400";
}

type FilterType = "all" | Platform;

function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--surface)] border border-[var(--surface-border)] text-[var(--muted)] hover:text-[var(--foreground)] hover:scale-110 transition-all duration-200"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      )}
    </button>
  );
}

function ContentCard({
  item,
  isExample = false,
  onDelete,
}: {
  item: SavedItem;
  isExample?: boolean;
  onDelete?: (id: string) => void;
}) {
  const platform = PLATFORM_CONFIG[item.platform];
  const ctype = CONTENT_TYPE_CONFIG[item.content_type];
  const cardRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current || !glowRef.current || isExample) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    glowRef.current.style.opacity = "1";
    glowRef.current.style.background = `radial-gradient(250px circle at ${x}px ${y}px, rgba(139,92,246,0.15), rgba(99,102,241,0.08) 40%, transparent 70%)`;
  }, [isExample]);

  const handleMouseLeave = useCallback(() => {
    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-5 transition-all duration-300 overflow-hidden ${
        isExample
          ? "opacity-60 cursor-default"
          : "hover:border-violet-300/50 dark:hover:border-violet-500/30 hover:shadow-xl hover:shadow-violet-500/10 dark:hover:shadow-violet-500/5 hover:-translate-y-1.5 hover:scale-[1.02]"
      }`}
    >
      {!isExample && (
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 z-0 rounded-2xl opacity-0 transition-opacity duration-300"
        />
      )}

      {isExample && (
        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-zinc-800/90 border border-dashed border-gray-300 dark:border-zinc-600/50 text-[10px] font-medium text-gray-400 dark:text-zinc-500 uppercase tracking-wider z-10">
          Example
        </span>
      )}
      <a
        href={isExample ? undefined : item.source_url}
        target={isExample ? undefined : "_blank"}
        rel={isExample ? undefined : "noopener noreferrer"}
        className={`relative z-10 ${isExample ? "cursor-default" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${ctype.color}`}
          >
            {ctype.icon}
            {ctype.label}
          </span>
          <svg
            className={`w-3 h-3 ${platform.color}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d={platform.icon} />
          </svg>
          <span className="ml-auto text-[11px] text-[var(--muted-light)]">
            {timeAgo(item.created_at)}
          </span>
        </div>

        <h3 className="text-[15px] font-semibold text-[var(--foreground)] leading-snug mb-1 line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-300">
          {item.title}
        </h3>

        <p className="text-xs text-[var(--muted)] mb-3">
          {item.platform === "reddit" ? item.author : `@${item.author}`}
        </p>

        <p className="text-[13px] leading-relaxed text-[var(--muted)] line-clamp-3 mb-4">
          {item.summary}
        </p>
      </a>

      <div className="relative z-10 flex items-end justify-between mt-auto gap-2">
        <div className="flex flex-wrap gap-1.5">
          {item.topics.slice(0, 3).map((topic) => (
            <span
              key={topic}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${topicColor(topic)}`}
            >
              {topic}
            </span>
          ))}
          {item.topics.length > 3 && (
            <span className="px-2 py-0.5 rounded-md text-[var(--muted-light)] text-[11px] font-medium">
              +{item.topics.length - 3}
            </span>
          )}
        </div>
        {/* TODO: re-enable delete button when ready */}
        {false && !isExample && onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(item.id);
            }}
            className="shrink-0 w-7 h-7 rounded-lg bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:border-red-500/30 dark:hover:text-red-400 text-[var(--muted)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-5">
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

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [items, setItems] = useState<SavedItem[]>([]);
  const [searchResults, setSearchResults] = useState<SavedItem[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const hasRealData = isLoaded && items.length > 0;

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/auth/sync", { method: "POST" });
      const data = await res.json();
      if (data.items) {
        setItems(data.items);
        if (data.items.length >= FREE_SAVE_LIMIT) setLimitReached(true);
      }
      setIsLoaded(true);
    }
    init();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setSearchResults(null);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(search)}`);
        const data = await res.json();
        if (data.items) setSearchResults(data.items);
      } catch {
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [search]);

  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Instagram", value: "instagram" },
    { label: "YouTube", value: "youtube" },
    { label: "TikTok", value: "tiktok" },
    { label: "X", value: "twitter" },
    { label: "Reddit", value: "reddit" },
    { label: "Web", value: "web" },
  ];

  const displayItems = searchResults ?? (hasRealData ? items : EXAMPLE_DATA);
  const showingExamples = isLoaded && !hasRealData && !searchResults;
  const filtered = useMemo(() => {
    return displayItems.filter((item) => {
      if (filter !== "all" && item.platform !== filter) return false;
      return true;
    });
  }, [displayItems, filter]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url || limitReached) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "limit_reached") {
        setLimitReached(true);
      } else if (res.ok && data.analysis) {
        const bookmarksRes = await fetch("/api/bookmarks");
        const bookmarksData = await bookmarksRes.json();
        if (bookmarksData.items) setItems(bookmarksData.items);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
      setUrl("");
    }
  }

  async function handleDelete(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    const res = await fetch(`/api/bookmarks/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const bookmarksRes = await fetch("/api/bookmarks");
      const bookmarksData = await bookmarksRes.json();
      if (bookmarksData.items) setItems(bookmarksData.items);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--background)] via-[var(--background)] to-violet-50/30 dark:to-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--header-border)] bg-[var(--header-bg)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="w-20" />
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 via-indigo-500 to-purple-600 dark:from-violet-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              SocialStash
            </h1>
            <p className="text-sm md:text-base text-[var(--muted)] mt-1.5 font-medium">
              Your Doomscroll stash, save anything, find everything.{" "}
              <span className="text-violet-600 dark:text-violet-400 font-bold">Always</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton
              showName={false}
              appearance={{
                elements: {
                  userButtonPopoverActionButton__manageAccount: {
                    display: "none",
                  },
                },
              }}
            />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Limit banner */}
        {limitReached && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-500/10 dark:to-indigo-500/10 border border-violet-200 dark:border-violet-500/20">
            <p className="text-sm font-medium text-[var(--foreground)] mb-1">
              You&apos;ve hit the free limit of {FREE_SAVE_LIMIT} saves
            </p>
            <p className="text-xs text-[var(--muted)]">
              Thanks for trying SocialStash! We&apos;re working on a full version with unlimited saves, collections, and more. Stay tuned.
            </p>
          </div>
        )}

        {/* URL Input */}
        <form onSubmit={handleAdd} className="mb-8">
          <div className={`flex gap-3 p-1.5 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] shadow-sm hover:shadow-md hover:border-violet-200/50 dark:hover:border-violet-500/20 transition-all duration-300 ${limitReached ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex-1 flex items-center gap-3 pl-4">
              <svg
                className="w-4 h-4 text-[var(--muted-light)] shrink-0"
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
                placeholder={limitReached ? "Free limit reached" : "Paste any URL to analyze..."}
                disabled={limitReached}
                className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--muted-light)] outline-none py-2"
              />
            </div>
            <button
              type="submit"
              disabled={isAnalyzing || !url || limitReached}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-lg hover:shadow-violet-500/25 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
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

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] hover:border-violet-200/50 dark:hover:border-violet-500/20 transition-all duration-300">
            <svg
              className="w-4 h-4 text-[var(--muted-light)] shrink-0"
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
              placeholder={isSearching ? "Searching..." : "Search by title, topic, author..."}
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] placeholder-[var(--muted-light)] outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-[var(--muted-light)] hover:text-[var(--foreground)] transition-colors"
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

          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface)] border border-[var(--surface-border)] overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  filter === f.value
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card)]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-[var(--muted)]">
            {showingExamples
              ? "Here's what your stash could look like \u2014 paste a URL above to get started!"
              : `${filtered.length} item${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!isLoaded && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
          {isAnalyzing && <SkeletonCard />}
          {isLoaded && filtered.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              isExample={showingExamples}
              onDelete={showingExamples ? undefined : handleDelete}
            />
          ))}
        </div>

        {/* Empty state */}
        {isLoaded && filtered.length === 0 && !isAnalyzing && !showingExamples && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--surface)] border border-[var(--surface-border)] flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-[var(--muted-light)]"
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
            <p className="text-sm text-[var(--muted)] mb-1">No results found</p>
            <p className="text-xs text-[var(--muted-light)]">
              Try a different search term or filter
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto">
        <div className="h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />
        <div className="bg-violet-50/40 dark:bg-transparent">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 mb-12">
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-6">
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-5 text-center">
                  On the Roadmap
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { icon: "M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3", accent: "bg-violet-200/70 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400", title: "Mobile App", desc: "Share from any app, analyzed in background" },
                    { icon: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3", accent: "bg-indigo-200/70 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400", title: "Browser Extension", desc: "One-click save while browsing" },
                    { icon: "M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z", accent: "bg-sky-200/70 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400", title: "Collections", desc: "Folders to organize your stash" },
                    { icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z", accent: "bg-pink-200/70 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400", title: "Find Similar", desc: "Discover related saves across platforms" },
                    { icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", accent: "bg-amber-200/70 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400", title: "Pro Plan", desc: "Unlimited saves, priority analysis" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl hover:bg-[var(--surface)] transition-colors duration-200">
                      <span className={`mt-0.5 w-7 h-7 rounded-lg ${item.accent} flex items-center justify-center shrink-0`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </span>
                      <div>
                        <p className="text-[13px] font-medium text-[var(--foreground)]">{item.title}</p>
                        <p className="text-[11px] text-[var(--muted)]">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-[var(--card)] border border-[var(--card-border)] p-5">
                <p className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-4 text-center">
                  Powered By
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { name: "Next.js", color: "bg-gray-200/70 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200" },
                    { name: "React", color: "bg-sky-200/70 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400" },
                    { name: "Tailwind CSS", color: "bg-cyan-200/70 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400" },
                    { name: "Supabase", color: "bg-emerald-200/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
                    { name: "pgvector", color: "bg-emerald-200/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" },
                    { name: "Claude AI", color: "bg-orange-200/70 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300" },
                    { name: "OpenAI", color: "bg-gray-200/70 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200" },
                    { name: "Clerk", color: "bg-violet-200/70 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400" },
                    { name: "Apify", color: "bg-teal-200/70 text-teal-700 dark:bg-teal-500/10 dark:text-teal-400" },
                    { name: "Vercel", color: "bg-gray-200/70 text-gray-700 dark:bg-zinc-800 dark:text-zinc-200" },
                  ].map((tech) => (
                    <span key={tech.name} className={`px-3 py-1.5 rounded-lg text-xs font-medium text-center ${tech.color} border border-[var(--surface-border)]`}>
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-[var(--surface-border)] flex items-center justify-center gap-4">
              <span className="text-[11px] text-[var(--muted-light)]">Built by Prajeet Darda</span>
              <span className="text-[var(--surface-border)]">|</span>
              <div className="flex items-center gap-2.5">
                <a href="https://www.linkedin.com/in/prajeet-darda" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-light)] hover:text-violet-500 transition-colors duration-200" aria-label="LinkedIn">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
                <a href="https://github.com/prajeetdarda/SocialStash" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-light)] hover:text-violet-500 transition-colors duration-200" aria-label="GitHub">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                </a>
                <a href="https://prajeetdarda.github.io/" target="_blank" rel="noopener noreferrer" className="text-[var(--muted-light)] hover:text-violet-500 transition-colors duration-200" aria-label="Portfolio">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
