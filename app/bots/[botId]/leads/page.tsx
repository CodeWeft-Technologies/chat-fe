"use client";
import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";

function B() {
  const env = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (env) return env.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "";
}

type Lead = {
  id: number;
  name: string;
  email: string;
  phone: string;
  details: string;
  status: string;
  created_at: string;
  score: number;
  summary?: string;
  comments?: string;
};

// Simple Icons
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
);

const ChatIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
);

const ReadMore = ({ text, maxLength = 50, onReadMore }: { text?: string; maxLength?: number; onReadMore: (text: string) => void }) => {
  if (!text) return <span className="text-gray-300 italic">-</span>;
  
  if (text.length <= maxLength) {
    return <span className="break-words">{text}</span>;
  }

  return (
    <div className="min-w-0">
      <span className="break-words whitespace-normal">
        {`${text.substring(0, maxLength)}...`}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onReadMore(text);
        }}
        className="ml-1 text-blue-600 hover:text-blue-800 text-xs font-medium inline-flex items-center gap-0.5 hover:underline"
      >
        Read more
      </button>
    </div>
  );
};

export default function LeadsPage({ params }: { params: Promise<{ botId: string }> }) {
  const [org, setOrg] = useState("");
  useEffect(() => { const d = typeof window !== "undefined" ? (localStorage.getItem("orgId") || "") : ""; setOrg(d); }, []);
  const { botId } = usePromise(params as Promise<{ botId: string }>);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSummary, setSelectedSummary] = useState<string | null>(null);
  const [selectedFullText, setSelectedFullText] = useState<{title: string, content: string} | null>(null);

  const updateStatus = async (id: number, status: string) => {
    try {
       const headers: Record<string, string> = { "Content-Type": "application/json" };
       if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
       const res = await fetch(`${B()}/api/leads/${id}/status`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ status, org_id: org })
       });
       if (res.ok) {
          setLeads(leads.map(l => l.id === id ? { ...l, status } : l));
       }
    } catch (e) {
       console.error(e);
       alert("Failed to update status");
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    try {
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
        const res = await fetch(`${B()}/api/leads/${id}?org_id=${encodeURIComponent(org)}`, {
            method: 'DELETE',
            headers
        });
        if (res.ok) {
            setLeads(leads.filter(l => l.id !== id));
        } else {
            alert("Failed to delete lead");
        }
    } catch (e) {
        console.error(e);
        alert("Error deleting lead");
    }
  };

  useEffect(() => {
    if (!org) return;
    setLoading(true);
    (async () => {
      try {
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") { const t = localStorage.getItem("token"); if (t) headers["Authorization"] = `Bearer ${t}`; }
        const r = await fetch(`${B()}/api/leads/${encodeURIComponent(botId)}?org_id=${encodeURIComponent(org)}`, { headers });
        if (r.ok) {
          const data = await r.json();
          setLeads(data);
        }
      } catch (e) {
        console.error("Failed to load leads", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [org, botId]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6">
        <div className="space-y-1">
          <Link 
            href={`/bots/${botId}/config`} 
            className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-2 mb-2 transition-colors font-medium"
          >
            <BackIcon /> Back to Configuration
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leads</h1>
          <p className="text-gray-500">Manage and view captured leads from your chatbot.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
            <RefreshIcon /> Refresh
          </Button>
        </div>
      </div>

      {selectedSummary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedSummary(null)}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                        <span className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ChatIcon /></span>
                        Conversation Summary
                    </h3>
                    <button className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full" onClick={() => setSelectedSummary(null)}>✕</button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 space-y-4 p-4 bg-gray-50/50 rounded-lg border border-gray-100">
                    {selectedSummary.split('\n').map((line, i) => {
                        const colonIndex = line.indexOf(':');
                        if (colonIndex === -1) return null;
                        const role = line.substring(0, colonIndex).trim().toLowerCase();
                        const content = line.substring(colonIndex + 1).trim();
                        const isUser = role === 'user';
                        
                        return (
                            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                    isUser 
                                        ? 'bg-blue-600 text-white rounded-br-none' 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                }`}>
                                    <div className={`text-[10px] uppercase tracking-wider font-semibold mb-1 opacity-70 ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                                        {isUser ? 'User' : 'Bot'}
                                    </div>
                                    <div className="leading-relaxed">{content}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4 flex justify-end shrink-0 pt-2">
                    <Button onClick={() => setSelectedSummary(null)}>Close</Button>
                </div>
            </div>
        </div>
      )}

      {selectedFullText && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedFullText(null)}>
            <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-lg font-bold text-gray-900">
                        {selectedFullText.title}
                    </h3>
                    <button className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full" onClick={() => setSelectedFullText(null)}>✕</button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 p-4 bg-gray-50/50 rounded-lg border border-gray-100 text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedFullText.content}
                </div>
                <div className="mt-4 flex justify-end shrink-0 pt-2">
                    <Button onClick={() => setSelectedFullText(null)}>Close</Button>
                </div>
            </div>
        </div>
      )}

      {loading ? (
        <div className="py-32 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
            <p className="text-gray-500 font-medium">Loading leads...</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-20 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No leads captured yet</h3>
            <p className="text-gray-500 mt-1">When users submit the enquiry form, they will appear here.</p>
        </div>
      ) : (
        <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    Captured Leads
                    <span className="inline-flex items-center justify-center bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {leads.length}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden lg:block w-full">
                    <table className="w-full text-sm text-left table-fixed">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-4 w-[11%]">Date</th>
                                <th className="px-4 py-4 w-[15%]">Name</th>
                                <th className="px-4 py-4 w-[16%]">Contact</th>
                                <th className="px-4 py-4 w-[17%]">Interest Details</th>
                                <th className="px-4 py-4 w-[18%]">Comments</th>
                                <th className="px-4 py-4 w-[6%]">Chat</th>
                                <th className="px-4 py-4 w-[12%]">Status</th>
                                <th className="px-4 py-4 w-[5%]"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leads.map(lead => {
                                const currentStatus = (lead.status || 'new').toLowerCase();
                                return (
                                <tr key={lead.id} className="group hover:bg-blue-50/30 transition-colors">
                                    <td className="px-4 py-4 align-top">
                                        <div className="text-gray-900 font-medium truncate">{new Date(lead.created_at).toLocaleDateString()}</div>
                                        <div className="text-xs text-gray-400 truncate">{new Date(lead.created_at).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-4 py-4 font-medium text-gray-900 align-top">
                                        <div className="flex items-center gap-2 max-w-full">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                                                {lead.name.substring(0,2).toUpperCase()}
                                            </div>
                                            <div className="truncate" title={lead.name}>{lead.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="space-y-1 max-w-full">
                                            <div className="text-gray-900 flex items-start gap-1.5 break-all" title={lead.email}>
                                                <span className="text-gray-400 mt-0.5 shrink-0">✉</span> <span>{lead.email}</span>
                                            </div>
                                            {lead.phone && (
                                                <div className="text-gray-500 text-xs flex items-center gap-1.5 truncate">
                                                    <span className="text-gray-400">📞</span> {lead.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 align-top">
                                        <ReadMore 
                                            text={lead.details} 
                                            maxLength={60} 
                                            onReadMore={(text) => setSelectedFullText({ title: "Interest Details", content: text })}
                                        />
                                    </td>
                                    <td className="px-4 py-4 text-gray-600 align-top">
                                        <ReadMore 
                                            text={lead.comments} 
                                            maxLength={40} 
                                            onReadMore={(text) => setSelectedFullText({ title: "Comments", content: text })}
                                        />
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        {lead.summary ? (
                                            <button 
                                                onClick={() => setSelectedSummary(lead.summary || "")}
                                                className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-700 rounded-md bg-blue-50 hover:bg-blue-100 transition-all active:scale-95"
                                                title="View Conversation"
                                            >
                                                <ChatIcon />
                                            </button>
                                        ) : (
                                            <span className="text-gray-300 flex justify-center"><span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span></span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="relative w-full">
                                            <select 
                                                value={currentStatus}
                                                onChange={(e) => updateStatus(lead.id, e.target.value)}
                                                className={`appearance-none w-full pl-2 pr-6 py-1.5 text-xs border rounded-md font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all truncate ${
                                                    currentStatus === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500' :
                                                    currentStatus === 'contacted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-500' :
                                                    currentStatus === 'qualified' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500' :
                                                    currentStatus === 'converted' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-500' :
                                                    'bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-500'
                                                }`}
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="qualified">Qualified</option>
                                                <option value="converted">Converted</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-500">
                                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-right align-top">
                                        <button 
                                            onClick={() => deleteLead(lead.id)}
                                            className="text-gray-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                                            title="Delete Lead"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </td>
                                </tr>
                            );})}
                        </tbody>
                    </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden space-y-4 p-4">
                    {leads.map(lead => {
                        const currentStatus = (lead.status || 'new').toLowerCase();
                        return (
                            <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                                            {lead.name.substring(0,2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">{lead.name}</div>
                                            <div className="text-xs text-gray-500">{new Date(lead.created_at).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => deleteLead(lead.id)}
                                        className="text-gray-400 hover:text-red-600 p-2 -mr-2"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600 break-all">
                                        <span className="text-gray-400 shrink-0">✉</span> {lead.email}
                                    </div>
                                    {lead.phone && (
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <span className="text-gray-400 shrink-0">📞</span> {lead.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600">
                                    <span className="font-medium text-gray-900 block mb-1">Interest:</span>
                                    <ReadMore 
                                        text={lead.details} 
                                        maxLength={100} 
                                        onReadMore={(text) => setSelectedFullText({ title: "Interest Details", content: text })}
                                    />
                                </div>

                                {lead.comments && (
                                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 mt-2">
                                    <span className="font-medium text-gray-900 block mb-1">Comments:</span>
                                    <ReadMore 
                                        text={lead.comments} 
                                        maxLength={100} 
                                        onReadMore={(text) => setSelectedFullText({ title: "Comments", content: text })}
                                    />
                                </div>
                                )}

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                                    <div className="relative w-[140px]">
                                        <select 
                                            value={currentStatus}
                                            onChange={(e) => updateStatus(lead.id, e.target.value)}
                                            className={`appearance-none w-full pl-3 pr-8 py-1.5 text-xs border rounded-md font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all ${
                                                currentStatus === 'new' ? 'bg-blue-50 text-blue-700 border-blue-200 focus:ring-blue-500' :
                                                currentStatus === 'contacted' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 focus:ring-yellow-500' :
                                                currentStatus === 'qualified' ? 'bg-purple-50 text-purple-700 border-purple-200 focus:ring-purple-500' :
                                                currentStatus === 'converted' ? 'bg-green-50 text-green-700 border-green-200 focus:ring-green-500' :
                                                'bg-gray-50 text-gray-700 border-gray-200 focus:ring-gray-500'
                                            }`}
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="qualified">Qualified</option>
                                            <option value="converted">Converted</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>

                                    {lead.summary ? (
                                        <button 
                                            onClick={() => setSelectedSummary(lead.summary || "")}
                                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium px-2.5 py-1.5 rounded-md bg-blue-50 hover:bg-blue-100 transition-all active:scale-95"
                                        >
                                            <ChatIcon /> View Chat
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400">No chat</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}