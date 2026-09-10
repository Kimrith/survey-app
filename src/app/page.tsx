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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Banner Section: "What's New" Announcement Carousel */}
        <section className="relative overflow-hidden rounded-3xl glass-card p-6 md:p-8 border border-indigo-500/20 shadow-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/50">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                <Megaphone className="w-3.5 h-3.5" />
                <span>What's New</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>

              {announcements.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    {announcements[activeAnnouncementIdx]?.title}
                  </h2>
                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {announcements[activeAnnouncementIdx]?.content}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
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
                <div className="flex items-center gap-1.5 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
                  {announcements.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveAnnouncementIdx(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        activeAnnouncementIdx === idx
                          ? "bg-indigo-500 w-6"
                          : "bg-slate-700 hover:bg-slate-500"
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
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Active Public Surveys</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                  {filteredSurveys.length} Available
                </span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
                Cast your vote and provide feedback on city utilities, energy programs, and community infrastructure.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterStatus === "ALL"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All Surveys
              </button>
              <button
                onClick={() => setFilterStatus("NEW")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterStatus === "NEW"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Need Response
              </button>
              <button
                onClick={() => setFilterStatus("COMPLETED")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  filterStatus === "COMPLETED"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search surveys by keyword or topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Survey Card Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <ListFilter className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-semibold text-slate-300">No surveys found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
                    className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between border border-slate-800/80 bg-slate-900/70"
                  >
                    <div className="space-y-4">
                      {/* Status Badges */}
                      <div className="flex items-center justify-between">
                        {isClosed ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-700">
                            <Lock className="w-3 h-3" /> Closed
                          </span>
                        ) : isSubmitted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/30">
                            <Clock className="w-3 h-3" /> Open
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {survey.responseCount || 0} responses
                        </span>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors line-clamp-2">
                          {survey.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                          {survey.description}
                        </p>
                      </div>
                    </div>

                    {/* Footer Info & Action */}
                    <div className="pt-6 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {survey.questions?.length || 0} Questions
                      </span>

                      {isClosed ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed"
                        >
                          Closed
                        </button>
                      ) : isSubmitted ? (
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                        >
                          <span>View Entry</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <Link
                          href={`/surveys/${survey.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-btn text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
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
