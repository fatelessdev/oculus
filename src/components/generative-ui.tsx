"use client";

import { Loader2, Sparkles, Library, Youtube, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type MOCK_CURATED_PATH } from "@/lib/mock-data";

export function ThinkingAccordion({ isOpen }: { isOpen: boolean }) {
    if (!isOpen) return null;
    return (
        <div className="w-full max-w-2xl ml-12 mb-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="rounded-md border border-zinc-800 bg-zinc-950/50 overflow-hidden">
                <div className="px-3 py-2 bg-zinc-900/50 flex items-center gap-2 border-b border-zinc-800/50">
                    <Loader2 size={12} className="animate-spin text-zinc-400" />
                    <span className="text-xs font-mono text-zinc-400">Thought Process</span>
                </div>
                <div className="p-3 text-xs font-mono text-zinc-500 space-y-1">
                    <div className="flex gap-2">
                        <span className="text-zinc-600">›</span>
                        <span>Analyzing user intent: &quot;Curated learning path&quot;</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-zinc-600">›</span>
                        <span>Tool Call: searchLibrary(vector_embedding)</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-zinc-600">›</span>
                        <span>Retrieving 5 relevant fragments from Pinecone</span>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-zinc-600">›</span>
                        <span className="animate-pulse">Synthesizing structure...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function CuratedPathView({ data }: { data: typeof MOCK_CURATED_PATH }) {
    return (
        <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 my-4 shadow-2xl">
            <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-800/50 p-6 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-purple-400">
                        <Sparkles size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest font-mono">
                            Generated Path
                        </span>
                    </div>
                    <Badge
                        variant="outline"
                        className="text-zinc-500 border-zinc-700 bg-zinc-900"
                    >
                        v1.0
                    </Badge>
                </div>
                <h2 className="text-2xl font-bold text-zinc-100">{data.title}</h2>
                <p className="text-zinc-400 mt-2 text-sm">{data.description}</p>
            </div>

            <div className="p-6 relative">
                <div className="absolute left-[43px] top-6 bottom-6 w-px bg-gradient-to-b from-purple-500/50 via-zinc-800 to-zinc-800" />

                <div className="space-y-10">
                    {data.steps.map((step, index) => (
                        <div key={index} className="relative pl-12 group">
                            <div className="absolute left-0 top-1 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 font-mono text-sm z-10 group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors">
                                {index + 1}
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-lg font-medium text-zinc-200">
                                    {step.title}
                                </h4>
                                <p className="text-sm text-zinc-500 italic bg-zinc-900/50 p-3 rounded-lg border border-zinc-800/50">
                                    <span className="font-semibold not-italic text-purple-400/80 mr-2">
                                        Why:
                                    </span>
                                    {step.reasoning}
                                </p>

                                <div className="grid grid-cols-1 gap-3 mt-3">
                                    {step.resources.map((res) => (
                                        <div
                                            key={res.id}
                                            className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg flex items-start gap-3 hover:border-zinc-600 transition-all cursor-pointer group/item"
                                        >
                                            <div className="p-2 bg-zinc-950 rounded-md border border-zinc-800 text-zinc-500 group-hover/item:text-zinc-300">
                                                {res.type === "video" ? (
                                                    <Youtube size={16} />
                                                ) : (
                                                    <FileText size={16} />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-zinc-300 truncate group-hover/item:text-white">
                                                    {res.title}
                                                </div>
                                                <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                    <span className="truncate">
                                                        {res.summary.substring(0, 60)}...
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <ExternalLink size={12} className="text-zinc-500" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 flex justify-end pt-6 border-t border-zinc-800">
                    <Button
                        size="sm"
                        className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                    >
                        <Library size={14} />
                        Save Path
                    </Button>
                </div>
            </div>
        </div>
    );
}
