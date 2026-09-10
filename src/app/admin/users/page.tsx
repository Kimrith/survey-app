"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import { Search, Users, History, FileText, ChevronRight, X, Calendar, Mail, UserCheck } from "lucide-react";

interface AppUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLoginAt: string;
  totalSubmissions: number;
}

interface AnswerDetail {
  questionId: string;
  questionText: string;
  questionType: string;
  selectedOptionId?: string;
  selectedOptionText?: string;
  textAnswer?: string;
}

interface SubmissionDetail {
  responseId: string;
  surveyId: string;
  surveyTitle: string;
  submittedAt: string;
  answers: AnswerDetail[];
}

interface UserHistory {
  userId: string;
  username: string;
  email: string;
  submissions: SubmissionDetail[];
}

export default function UserManagementPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<AppUser[]>([
    {
      id: "u-101-sub-uuid",
      username: "john_citizen",
      email: "john.citizen@utility.org",
      createdAt: new Date(Date.now() - 2592000000).toISOString(),
      lastLoginAt: new Date().toISOString(),
      totalSubmissions: 3,
    },
    {
      id: "u-102-sub-uuid",
      username: "sarah_connor",
      email: "sarah.connor@district7.gov",
      createdAt: new Date(Date.now() - 1296000000).toISOString(),
      lastLoginAt: new Date(Date.now() - 86400000).toISOString(),
      totalSubmissions: 1,
    },
    {
      id: "u-103-sub-uuid",
      username: "alex_murphy",
      email: "alex.murphy@metropolis.org",
      createdAt: new Date(Date.now() - 864000000).toISOString(),
      lastLoginAt: new Date(Date.now() - 172800000).toISOString(),
      totalSubmissions: 4,
    },
  ]);

  const [search, setSearch] = useState("");
  const [selectedUserHistory, setSelectedUserHistory] = useState<UserHistory | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const token = session?.accessToken;
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch("http://localhost:8081/api/admin/users", { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.content) setUsers(data.content);
        }
      } catch {
        // Keeps fallback users
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [session]);

  const handleOpenUserHistory = async (user: AppUser) => {
    try {
      const token = session?.accessToken;
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`http://localhost:8081/api/admin/users/${user.id}/history`, { headers });
      if (res.ok) {
        const historyData = await res.json();
        setSelectedUserHistory(historyData);
      } else {
        setSelectedUserHistory(getFallbackUserHistory(user));
      }
    } catch {
      setSelectedUserHistory(getFallbackUserHistory(user));
    }
    setIsDrawerOpen(true);
  };

  const getFallbackUserHistory = (user: AppUser): UserHistory => ({
    userId: user.id,
    username: user.username,
    email: user.email,
    submissions: [
      {
        responseId: "resp-1",
        surveyId: "s1",
        surveyTitle: "Public Clean Energy & Solar Tariff Survey",
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        answers: [
          {
            questionId: "q1",
            questionText: "Would you support a 5% clean energy credit?",
            questionType: "SINGLE_CHOICE",
            selectedOptionText: "Strongly Support",
          },
          {
            questionId: "q2",
            questionText: "Which utility services require urgent modernization?",
            questionType: "MULTIPLE_CHOICE",
            selectedOptionText: "Smart Digital Electricity Meters",
          },
          {
            questionId: "q3",
            questionText: "Please share any specific suggestions or concerns regarding public utility services in your area.",
            questionType: "TEXT",
            textAnswer: "Faster response times during peak summer hours would be greatly appreciated.",
          },
        ],
      },
    ],
  });

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase font-semibold tracking-wider text-amber-400">
              Admin User Management
            </span>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Synchronized Citizens & Submission Log
            </h1>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/80">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-white">App Users Table</h2>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {filteredUsers.length} Citizens Registered
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Keycloak Subject / User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Total Submissions</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">Last Login</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-slate-100 block text-sm">{user.username}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{user.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {user.email || "No email"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">
                        <FileText className="w-3 h-3" /> {user.totalSubmissions || 0} completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenUserHistory(user)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold border border-indigo-500/30 transition-all"
                      >
                        <History className="w-3.5 h-3.5" />
                        <span>History</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User History Slide-Over Drawer */}
        {isDrawerOpen && selectedUserHistory && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full p-6 sm:p-8 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <span className="text-xs uppercase font-semibold text-indigo-400">Citizen History Log</span>
                  <h3 className="text-xl font-bold text-white">{selectedUserHistory.username}</h3>
                  <span className="text-xs text-slate-400">{selectedUserHistory.email}</span>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {selectedUserHistory.submissions.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400">No survey responses submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedUserHistory.submissions.map((sub, idx) => (
                    <div
                      key={sub.responseId || idx}
                      className="glass-card rounded-2xl p-6 space-y-4 border border-slate-800 bg-slate-950/60"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-white text-sm">{sub.surveyTitle}</h4>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            Submitted: {new Date(sub.submittedAt).toLocaleString()}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold border border-emerald-500/30">
                          Verified
                        </span>
                      </div>

                      <div className="space-y-3 pt-2 border-t border-slate-800/80">
                        {sub.answers.map((ans, aIdx) => (
                          <div key={ans.questionId || aIdx} className="space-y-1 text-xs">
                            <span className="font-semibold text-slate-300 block">
                              Q: {ans.questionText}
                            </span>
                            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300">
                              {ans.selectedOptionText && <span>Option: {ans.selectedOptionText}</span>}
                              {ans.textAnswer && <p className="italic text-slate-200">"{ans.textAnswer}"</p>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
