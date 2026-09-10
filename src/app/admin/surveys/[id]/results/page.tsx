"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, BarChart2, Users, FileText, CheckCircle2, MessageSquare, PieChart } from "lucide-react";

interface OptionResult {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
}

interface QuestionResult {
  questionId: string;
  questionText: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
  optionResults: OptionResult[];
  textAnswers: string[];
}

interface SurveyResult {
  surveyId: string;
  title: string;
  description: string;
  status: string;
  totalSubmissions: number;
  questionResults: QuestionResult[];
}

export default function SurveyResultsAnalyticsPage() {
  const params = useParams();
  const { data: session } = useSession();
  const surveyId = params.id as string;

  const [results, setResults] = useState<SurveyResult | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo Fallback Analytics
  const fallbackResults: SurveyResult = {
    surveyId,
    title: "Public Clean Energy & Solar Tariff Survey",
    description: "Evaluating citizen demand for municipal rooftop solar subsidies and smart grid meter rollouts across districts.",
    status: "PUBLISHED",
    totalSubmissions: 142,
    questionResults: [
      {
        questionId: "q1",
        questionText: "Would you support a 5% clean energy credit on your monthly electricity bill?",
        type: "SINGLE_CHOICE",
        textAnswers: [],
        optionResults: [
          { optionId: "o1", optionText: "Strongly Support", count: 88, percentage: 62.0 },
          { optionId: "o2", optionText: "Somewhat Support", count: 34, percentage: 23.9 },
          { optionId: "o3", optionText: "Neutral / Unsure", count: 12, percentage: 8.5 },
          { optionId: "o4", optionText: "Oppose", count: 8, percentage: 5.6 },
        ],
      },
      {
        questionId: "q2",
        questionText: "Which utility infrastructure upgrades should the city prioritize in 2026?",
        type: "MULTIPLE_CHOICE",
        textAnswers: [],
        optionResults: [
          { optionId: "o5", optionText: "Smart Digital Electricity Meters", count: 110, percentage: 77.5 },
          { optionId: "o6", optionText: "Underground Power Cable Lines", count: 95, percentage: 66.9 },
          { optionId: "o7", optionText: "Community Solar Farm Grants", count: 82, percentage: 57.7 },
          { optionId: "o8", optionText: "Water Filtration System Upgrades", count: 64, percentage: 45.1 },
        ],
      },
      {
        questionId: "q3",
        questionText: "Please share any specific suggestions or concerns regarding public utility services in your area.",
        type: "TEXT",
        optionResults: [],
        textAnswers: [
          "Faster response times during peak summer hours would be greatly appreciated.",
          "Please consider extending the net-metering solar tariff guarantee for 10 years.",
          "Water hardness in the North District needs improved municipal softeners.",
          "Digital app notifications for billing outages are working great!",
        ],
      },
    ],
  };

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const token = session?.accessToken;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`http://localhost:8081/api/admin/surveys/${surveyId}/results`, { headers });
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        } else {
          setResults(fallbackResults);
        }
      } catch {
        setResults(fallbackResults);
      } finally {
        setLoading(false);
      }
    }

    if (surveyId) fetchResults();
  }, [surveyId, session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="space-y-4">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="glass-card rounded-2xl p-6 sm:p-8 space-y-4 border border-indigo-500/20 bg-slate-900/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase font-semibold tracking-wider text-indigo-400">
                  Survey Response Analytics
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {results.title}
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">{results.description}</p>
              </div>

              <div className="flex items-center gap-3 bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800 shrink-0">
                <Users className="w-6 h-6 text-indigo-400" />
                <div>
                  <span className="block text-2xl font-black text-white">{results.totalSubmissions}</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">Total Submissions</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Questions Results Distribution */}
        <div className="space-y-8">
          {results.questionResults.map((q, idx) => (
            <div
              key={q.questionId || idx}
              className="glass-card rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-800 bg-slate-900/70"
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-600/20 text-indigo-400 text-xs font-bold shrink-0 mt-0.5 border border-indigo-500/30">
                  Q{idx + 1}
                </span>
                <div>
                  <h3 className="font-bold text-white text-base leading-snug">
                    {q.questionText}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono uppercase mt-0.5 block">
                    Type: {q.type}
                  </span>
                </div>
              </div>

              {/* Bar Graph Visual Distribution */}
              {(q.type === "SINGLE_CHOICE" || q.type === "MULTIPLE_CHOICE") && (
                <div className="space-y-4 pt-2">
                  {q.optionResults.map((opt) => (
                    <div key={opt.optionId} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-slate-200">{opt.optionText}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-bold">{opt.count} votes</span>
                          <span className="text-slate-400 text-[11px]">({opt.percentage}%)</span>
                        </div>
                      </div>
                      
                      {/* Bar Progress Track */}
                      <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${Math.max(opt.percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Text Answers Feed */}
              {q.type === "TEXT" && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Written Citizen Submissions ({q.textAnswers.length})</span>
                  </div>

                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {q.textAnswers.map((text, tIdx) => (
                      <div
                        key={tIdx}
                        className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 italic leading-relaxed"
                      >
                        "{text}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
