"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Link from "next/link";
import { Megaphone, Search, CheckCircle2, Clock, Lock, Sparkles, ChevronRight, MessageSquare, ListFilter, ArrowRight } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  creatorUsername: string;
}

interface Question {
  id: string;
  questionText: string;
  type: string;
}

interface Survey {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  createdAt: string;
  creatorUsername: string;
  questions: Question[];
  hasSubmitted?: boolean;
  responseCount?: number;
}

export default function HomeFeed() {
  const { data: session } = useSession();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [activeAnnouncementIdx, setActiveAnnouncementIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "NEW" | "COMPLETED">("ALL");
  const [loading, setLoading] = useState(true);

  // Demo Fallback Data for instant visual excellence if backend API is cold or starting up
  const fallbackAnnouncements: Announcement[] = [
    {
      id: "a1",
      title: "Utility Bill Survey 2026 launched for all citizens",
      content: "Please participate in our annual municipal utility tariff and clean energy survey. Your feedback directly impacts city budget allocations.",
      createdAt: new Date().toISOString(),
      creatorUsername: "City Administration",
    },
    {
      id: "a2",
      title: "Water Service Upgrades in Western District",
      content: "Maintenance scheduled for Sept 15th - 18th. Community consultation survey is now open for public feedback.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      creatorUsername: "Public Works",
    },
  ];

  const fallbackSurveys: Survey[] = [
    {
      id: "s1",
      title: "Public Clean Energy & Solar Tariff Survey",
      description: "Evaluating citizen demand for municipal rooftop solar subsidies and smart grid meter rollouts across districts.",
      status: "PUBLISHED",
      createdAt: new Date().toISOString(),
      creatorUsername: "Admin",
      questions: [
        { id: "q1", questionText: "Would you support a 5% clean energy credit?", type: "SINGLE_CHOICE" },
        { id: "q2", questionText: "Which utility services require urgent modernization?", type: "MULTIPLE_CHOICE" },
      ],
      hasSubmitted: false,
      responseCount: 142,
    },
    {
      id: "s2",
      title: "Digital Utility Billing Feedback 2026",
      description: "Help us streamline your monthly water and power e-invoicing dashboard.",
      status: "PUBLISHED",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      creatorUsername: "Admin",
      questions: [
        { id: "q3", questionText: "How satisfied are you with online billing portal speed?", type: "SINGLE_CHOICE" },
      ],
      hasSubmitted: true,
      responseCount: 89,
    },
    {
      id: "s3",
      title: "Municipal Waste & Recycling Schedule Review",
      description: "Proposed bi-weekly compost collection and automated recycling bin distribution.",
      status: "CLOSED",
      createdAt: new Date(Date.now() - 604800000).toISOString(),
      creatorUsername: "Sanitation Dept",
      questions: [
        { id: "q4", questionText: "What bin size is optimal for your household?", type: "SINGLE_CHOICE" },
      ],
      hasSubmitted: false,
      responseCount: 310,
    },
  ];

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const token = session?.accessToken;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

        const [annRes, surRes] = await Promise.allSettled([
          fetch("http://localhost:8081/api/announcements", { headers }).then((r) => r.json()),
          fetch("http://localhost:8081/api/surveys", { headers }).then((r) => r.json()),
        ]);

        if (annRes.status === "fulfilled" && Array.isArray(annRes.value) && annRes.value.length > 0) {
          setAnnouncements(annRes.value);
        } else {
          setAnnouncements(fallbackAnnouncements);
        }

        if (surRes.status === "fulfilled" && surRes.value?.content) {
          setSurveys(surRes.value.content);
        } else {
          setSurveys(fallbackSurveys);
        }
      } catch {
        setAnnouncements(fallbackAnnouncements);
        setSurveys(fallbackSurveys);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session]);

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.title.toLowerCase().includes(search.toLowerCase()) ||
      survey.description.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "NEW") return !survey.hasSubmitted && survey.status === "PUBLISHED";
    if (filterStatus === "COMPLETED") return survey.hasSubmitted;
    return true;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Banner Section: "What's New" Announcement Carousel */}
        <section className="relative overflow-hidden rounded-2xl card-minimal p-6 md:p-8 border border-zinc-800 bg-zinc-900/60">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-mono font-medium">
                <Megaphone className="w-3.5 h-3.5 text-zinc-400" />
                <span>ANNOUNCEMENT</span>
              </div>

              {announcements.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 tracking-tight">
                    {announcements[activeAnnouncementIdx]?.title}
                  </h2>
                  <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                    {announcements[activeAnnouncementIdx]?.content}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-500 pt-1">
                    <span>By {announcements[activeAnnouncementIdx]?.creatorUsername}</span>
                    <span>•</span>
                    <span>
                      {new Date(announcements[activeAnnouncementIdx]?.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Carousel Navigator Controls */}
            {announcements.length > 1 && (
              <div className="flex md:flex-col items-center justify-end gap-2">
                <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-lg border border-zinc-800">
                  {announcements.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveAnnouncementIdx(idx)}
                      className={`h-2 rounded-full transition-all ${
                        activeAnnouncementIdx === idx
                          ? "bg-zinc-100 w-5"
                          : "bg-zinc-700 w-2 hover:bg-zinc-500"
                      }`}
                      aria-label={`Announcement slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Active Surveys Section */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2.5">
                <span>Active Public Surveys</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-medium">
                  {filteredSurveys.length}
                </span>
              </h2>
              <p className="text-zinc-400 text-xs mt-1">
                Cast your vote and provide feedback on city utilities, energy programs, and community infrastructure.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterStatus === "ALL"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All Surveys
              </button>
              <button
                onClick={() => setFilterStatus("NEW")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterStatus === "NEW"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Need Response
              </button>
              <button
                onClick={() => setFilterStatus("COMPLETED")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterStatus === "COMPLETED"
                    ? "bg-zinc-800 text-zinc-100 border border-zinc-700"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search surveys by keyword or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
            />
          </div>

          {/* Survey Card Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-60 rounded-xl bg-zinc-900 animate-pulse border border-zinc-800" />
              ))}
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="card-minimal rounded-2xl p-12 text-center space-y-3">
              <ListFilter className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="text-base font-semibold text-zinc-300">No surveys found</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No active public surveys match your current search query or filter status.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSurveys.map((survey) => {
                const isClosed = survey.status === "CLOSED";
                const isSubmitted = survey.hasSubmitted;

                return (
                  <div
                    key={survey.id}
                    className="card-minimal card-minimal-hover rounded-xl p-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Status Badges */}
                      <div className="flex items-center justify-between">
                        {isClosed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-400 text-[11px] font-mono border border-zinc-700">
                            <Lock className="w-3 h-3" /> CLOSED
                          </span>
                        ) : isSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 text-[11px] font-mono border border-zinc-700">
                            <CheckCircle2 className="w-3 h-3 text-zinc-400" /> COMPLETED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 text-[11px] font-mono border border-zinc-700">
                            <Clock className="w-3 h-3 text-zinc-400" /> OPEN
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-500 font-mono flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {survey.responseCount || 0}
                        </span>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="font-semibold text-base text-zinc-100 line-clamp-2">
                          {survey.title}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-2 line-clamp-3 leading-relaxed">
                          {survey.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info & Action */}
                    <div className="pt-5 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {survey.questions?.length || 0} Questions
                      </span>

                      {isClosed ? (
                        <button
                          disabled
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 text-zinc-600 text-xs font-medium cursor-not-allowed border border-zinc-800"
                        >
                          Closed
                        </button>
                      ) : isSubmitted ? (
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-colors"
                        >
                          <span>View Entry</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg btn-primary text-xs font-semibold"
                        >
                          <span>Take Survey</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
