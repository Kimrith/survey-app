"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, MoveUp, MoveDown, CheckSquare, Circle, FileText } from "lucide-react";

interface OptionBuilder {
  id: string;
  optionText: string;
}

interface QuestionBuilder {
  id: string;
  questionText: string;
  type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT";
  options: OptionBuilder[];
}

export default function NewSurveyBuilderPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [questions, setQuestions] = useState<QuestionBuilder[]>([
    {
      id: "q-1",
      questionText: "",
      type: "SINGLE_CHOICE",
      options: [
        { id: "o-1", optionText: "Strongly Support" },
        { id: "o-2", optionText: "Oppose" },
      ],
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        questionText: "",
        type: "SINGLE_CHOICE",
        options: [
          { id: `o-${Date.now()}-1`, optionText: "Option 1" },
          { id: `o-${Date.now()}-2`, optionText: "Option 2" },
        ],
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert("At least one question is required for a survey.");
      return;
    }
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveQuestion = (index: number, direction: "UP" | "DOWN") => {
    const targetIdx = direction === "UP" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= questions.length) return;

    setQuestions((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIdx];
      updated[targetIdx] = temp;
      return updated;
    });
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, questionText: text } : q))
    );
  };

  const handleQuestionTypeChange = (index: number, type: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TEXT") => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === index ? { ...q, type } : q))
    );
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          options: [...q.options, { id: `o-${Date.now()}`, optionText: `Option ${q.options.length + 1}` }],
        };
      })
    );
  };

  const handleOptionTextChange = (qIndex: number, oIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const updatedOpts = q.options.map((opt, oIdx) =>
          oIdx === oIndex ? { ...opt, optionText: text } : opt
        );
        return { ...q, options: updatedOpts };
      })
    );
  };

  const handleRemoveOption = (qIndex: number, oIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        if (q.options.length <= 2) {
          alert("Choice questions require at least 2 options.");
          return q;
        }
        return { ...q, options: q.options.filter((_, oIdx) => oIdx !== oIndex) };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Survey title is required.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].questionText.trim()) {
        setErrorMsg(`Question #${i + 1} text cannot be empty.`);
        return;
      }
    }

    setSaving(true);

    const payload = {
      title,
      description,
      status,
      questions: questions.map((q) => ({
        questionText: q.questionText,
        type: q.type,
        options: q.type === "TEXT" ? [] : q.options.map((o) => ({ optionText: o.optionText })),
      })),
    };

    try {
      const token = session?.accessToken;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await fetch("http://localhost:8081/api/admin/surveys", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      router.push("/admin/dashboard");
    } catch {
      router.push("/admin/dashboard");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-xs uppercase font-mono text-zinc-400">
            Survey Builder
          </span>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-red-950/60 border border-red-900 text-red-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Survey Metadata Section */}
          <div className="card-minimal rounded-xl p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-semibold text-zinc-100">Survey Metadata</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Survey Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Municipal Water Quality Survey 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Survey Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide background context and objectives for citizens..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Initial Status
                </label>
                <div className="flex items-center gap-4 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="DRAFT"
                      checked={status === "DRAFT"}
                      onChange={() => setStatus("DRAFT")}
                      className="accent-zinc-100"
                    />
                    <span className="text-zinc-300">Draft (Private)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="PUBLISHED"
                      checked={status === "PUBLISHED"}
                      onChange={() => setStatus("PUBLISHED")}
                      className="accent-zinc-100"
                    />
                    <span className="text-zinc-100 font-semibold">Publish Immediately</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Questions Builder List */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">Dynamic Questions ({questions.length})</h2>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-secondary text-xs"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {questions.map((question, qIdx) => (
              <div
                key={question.id}
                className="card-minimal rounded-xl p-6 space-y-5 bg-zinc-900/60"
              >
                {/* Question Header & Order Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-200 text-xs font-mono font-semibold border border-zinc-700">
                      Q{qIdx + 1}
                    </span>
                    <span className="text-xs text-zinc-400 font-medium">Question Config</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={qIdx === 0}
                      onClick={() => handleMoveQuestion(qIdx, "UP")}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 border border-zinc-700"
                      title="Move Up"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={qIdx === questions.length - 1}
                      onClick={() => handleMoveQuestion(qIdx, "DOWN")}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-zinc-100 disabled:opacity-30 border border-zinc-700"
                      title="Move Down"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(qIdx)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-700 ml-2"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question Text & Type Selector */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Question Prompt</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. How satisfied are you with water pressure?"
                      value={question.questionText}
                      onChange={(e) => handleQuestionTextChange(qIdx, e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Response Type</label>
                    <select
                      value={question.type}
                      onChange={(e) => handleQuestionTypeChange(qIdx, e.target.value as any)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-100 focus:outline-none focus:border-zinc-600"
                    >
                      <option value="SINGLE_CHOICE">Single Choice (Radio)</option>
                      <option value="MULTIPLE_CHOICE">Multiple Choice (Checkboxes)</option>
                      <option value="TEXT">Text Answer (Written)</option>
                    </select>
                  </div>
                </div>

                {/* Dynamic Options for Choice Types */}
                {question.type !== "TEXT" && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-400">Options</span>
                      <button
                        type="button"
                        onClick={() => handleAddOption(qIdx)}
                        className="text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Option
                      </button>
                    </div>

                    <div className="space-y-2">
                      {question.options.map((opt, oIdx) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <input
                            type="text"
                            required
                            value={opt.optionText}
                            onChange={(e) => handleOptionTextChange(qIdx, oIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-zinc-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIdx, oIdx)}
                            className="p-1.5 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 rounded-lg btn-secondary text-xs"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-lg btn-primary text-xs font-semibold disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Survey</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
