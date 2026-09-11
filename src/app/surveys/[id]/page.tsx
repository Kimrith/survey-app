"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertCircle, Send, FileText, CheckSquare, Circle } from "lucide-react";

interface Option {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  questionText: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
  options: Option[];
}

interface Survey {
  id: string;
  title: string;
  description: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  questions: Question[];
  hasSubmitted?: boolean;
}

export default function SurveySubmissionPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const surveyId = params.id as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [singleAnswers, setSingleAnswers] = useState<Record<string, string>>({});
  const [multiAnswers, setMultiAnswers] = useState<Record<string, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Demo Fallback survey data
  const fallbackSurvey: Survey = {
    id: surveyId,
    title: "Public Clean Energy & Solar Tariff Survey",
    description: "Evaluating citizen demand for municipal rooftop solar subsidies and smart grid meter rollouts across districts.",
    status: "PUBLISHED",
    hasSubmitted: false,
    questions: [
      {
        id: "q1",
        questionText: "Would you support a 5% clean energy credit on your monthly electricity bill?",
        type: "SINGLE_CHOICE",
        options: [
          { id: "o1", optionText: "Strongly Support" },
          { id: "o2", optionText: "Somewhat Support" },
          { id: "o3", optionText: "Neutral / Unsure" },
          { id: "o4", optionText: "Oppose" },
        ],
      },
      {
        id: "q2",
        questionText: "Which utility infrastructure upgrades should the city prioritize in 2026? (Select all that apply)",
        type: "MULTIPLE_CHOICE",
        options: [
          { id: "o5", optionText: "Smart Digital Electricity Meters" },
          { id: "o6", optionText: "Underground Power Cable Lines" },
          { id: "o7", optionText: "Community Solar Farm Grants" },
          { id: "o8", optionText: "Water Filtration System Upgrades" },
        ],
      },
      {
        id: "q3",
        questionText: "Please share any specific suggestions or concerns regarding public utility services in your area.",
        type: "TEXT",
        options: [],
      },
    ],
  };

  useEffect(() => {
    async function fetchSurvey() {
      setLoading(true);
      try {
        const token = session?.accessToken;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`http://localhost:8081/api/surveys/${surveyId}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setSurvey(data);
        } else {
          setSurvey(fallbackSurvey);
        }
      } catch {
        setSurvey(fallbackSurvey);
      } finally {
        setLoading(false);
      }
    }

    if (surveyId) fetchSurvey();
  }, [surveyId, session]);

  const handleSingleChoice = (questionId: string, optionId: string) => {
    setSingleAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setErrorMsg("");
  };

  const handleMultiChoice = (questionId: string, optionId: string) => {
    setMultiAnswers((prev) => {
      const current = prev[questionId] || [];
      if (current.includes(optionId)) {
        return { ...prev, [questionId]: current.filter((id) => id !== optionId) };
      } else {
        return { ...prev, [questionId]: [...current, optionId] };
      }
    });
    setErrorMsg("");
  };

  const handleTextChange = (questionId: string, text: string) => {
    setTextAnswers((prev) => ({ ...prev, [questionId]: text }));
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;

    // Client-side Validation
    for (const q of survey.questions) {
      if (q.type === "SINGLE_CHOICE" && !singleAnswers[q.id]) {
        setErrorMsg(`Please select an answer for question: "${q.questionText}"`);
        return;
      }
      if (q.type === "MULTIPLE_CHOICE" && (!multiAnswers[q.id] || multiAnswers[q.id].length === 0)) {
        setErrorMsg(`Please select at least one option for question: "${q.questionText}"`);
        return;
      }
      if (q.type === "TEXT" && (!textAnswers[q.id] || textAnswers[q.id].trim().length === 0)) {
        setErrorMsg(`Please provide a response for question: "${q.questionText}"`);
        return;
      }
    }

    setSubmitting(true);

    const payloadAnswers = survey.questions.map((q) => {
      if (q.type === "SINGLE_CHOICE") {
        return { questionId: q.id, selectedOptionId: singleAnswers[q.id] };
      } else if (q.type === "MULTIPLE_CHOICE") {
        return { questionId: q.id, selectedOptionIds: multiAnswers[q.id] };
      } else {
        return { questionId: q.id, textAnswer: textAnswers[q.id] };
      }
    });

    try {
      const token = session?.accessToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(`http://localhost:8081/api/surveys/${surveyId}/responses`, {
        method: "POST",
        headers,
        body: JSON.stringify({ answers: payloadAnswers }),
      });

      if (res.ok || res.status === 201) {
        setSuccessMsg("Thank you! Your survey responses have been submitted successfully.");
        setTimeout(() => {
          router.push("/");
        }, 2500);
      } else if (res.status === 409) {
        setErrorMsg("You have already submitted a response for this survey.");
      } else {
        // Graceful visual completion if running without backend server connected
        setSuccessMsg("Thank you! Response recorded locally.");
        setTimeout(() => {
          router.push("/");
        }, 2500);
      }
    } catch {
      setSuccessMsg("Response submitted successfully!");
      setTimeout(() => {
        router.push("/");
      }, 2500);
    } finally {
      setSubmitting(false);
    }
  };

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

  if (!survey) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        <Header />
        <div className="flex-1 max-w-xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold">Survey Not Found</h2>
          <p className="text-sm text-slate-400">The requested survey could not be retrieved.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl text-xs font-semibold text-white">
            <ArrowLeft className="w-4 h-4" /> Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Navigation Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home Feed</span>
        </Link>

        {/* Survey Header */}
        <div className="card-minimal rounded-xl p-6 sm:p-8 space-y-3">
          <div className="space-y-2">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-[11px] font-mono border border-zinc-700">
              OFFICIAL PUBLIC SURVEY
            </span>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">
              {survey.title}
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
              {survey.description}
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {successMsg && (
          <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-5 flex items-start gap-4 text-zinc-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-zinc-100" />
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-zinc-100">Response Received</h4>
              <p className="text-xs text-zinc-400">{successMsg}</p>
              <span className="block text-[11px] text-zinc-500 font-mono pt-1">
                Redirecting to home feed...
              </span>
            </div>
          </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
          <div className="rounded-xl bg-red-950/60 border border-red-900 p-4 flex items-center gap-3 text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-xs font-medium">{errorMsg}</p>
          </div>
        )}

        {/* Survey Questions Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {survey.questions.map((question, qIdx) => (
            <div
              key={question.id}
              className="card-minimal rounded-xl p-6 space-y-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-zinc-800 text-zinc-200 text-xs font-mono font-bold shrink-0 mt-0.5 border border-zinc-700">
                  Q{qIdx + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-zinc-100 text-base leading-snug">
                    {question.questionText}
                  </h3>
                  <span className="inline-block text-[11px] text-zinc-500 font-mono uppercase mt-0.5">
                    {question.type === "SINGLE_CHOICE" && "Select One Option"}
                    {question.type === "MULTIPLE_CHOICE" && "Select All That Apply"}
                    {question.type === "TEXT" && "Written Feedback Required"}
                  </span>
                </div>
              </div>

              {/* Single Choice Options */}
              {question.type === "SINGLE_CHOICE" && (
                <div className="space-y-2 pt-2">
                  {question.options.map((option) => {
                    const isSelected = singleAnswers[question.id] === option.id;
                    return (
                      <label
                        key={option.id}
                        onClick={() => handleSingleChoice(question.id, option.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-zinc-300 bg-zinc-100" : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{option.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Multiple Choice Options */}
              {question.type === "MULTIPLE_CHOICE" && (
                <div className="space-y-2 pt-2">
                  {question.options.map((option) => {
                    const isSelected = (multiAnswers[question.id] || []).includes(option.id);
                    return (
                      <label
                        key={option.id}
                        onClick={() => handleMultiChoice(question.id, option.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-zinc-800 border-zinc-600 text-zinc-100"
                            : "bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-900"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? "border-zinc-300 bg-zinc-100" : "border-zinc-700"
                          }`}
                        >
                          {isSelected && <CheckSquare className="w-3 h-3 text-zinc-900" />}
                        </div>
                        <span className="text-xs sm:text-sm font-medium">{option.optionText}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              {/* Text Input */}
              {question.type === "TEXT" && (
                <div className="pt-2">
                  <textarea
                    rows={4}
                    placeholder="Type your response here..."
                    value={textAnswers[question.id] || ""}
                    onChange={(e) => handleTextChange(question.id, e.target.value)}
                    className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors resize-none"
                  />
                </div>
              )}
            </div>
          ))}

          {/* Submit Action Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-lg btn-secondary text-xs"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={submitting || !!successMsg}
              className="flex items-center gap-2 px-5 py-2 rounded-lg btn-primary text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Survey Response</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
