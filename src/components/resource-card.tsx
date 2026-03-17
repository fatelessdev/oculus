"use client";

import Image from "next/image";
import { Youtube, Twitter, FileText, ExternalLink, Trash2, Github, BookOpen, Globe } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

// Resource type matching database schema
type Resource = {
    id: string;
    url: string;
    title: string;
    sourceType: string | null;
    category: string | null;
    summary: string | null;
    keywords: string[] | null;
    whySaved: string | null;
    priority: string | null;
    imageUrl: string | null;
    createdAt: string;
    status: string | null;
};

const sourceIcons: Record<string, typeof Youtube> = {
    youtube_video: Youtube,
    youtube_channel: Youtube,
    youtube_playlist: Youtube,
    tweet: Twitter,
    github: Github,
    paper: BookOpen,
    article: FileText,
    website: Globe,
};

const categoryColors: Record<string, string> = {
    learning: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    reference: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    tool: "bg-green-500/10 text-green-400 border-green-500/20",
    inspiration: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    content: "bg-orange-500/10 text-orange-400 border-orange-500/20",
};

interface ResourceCardProps {
    resource: Resource;
    onDelete?: (id: string) => void;
}

export function ResourceCard({ resource, onDelete }: ResourceCardProps) {
    const Icon = sourceIcons[resource.sourceType || "website"] || Globe;
    const isProcessing = resource.status === "pending" || resource.status === "processing";

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onDelete) {
            onDelete(resource.id);
        }
    };

    return (
        <div className="break-inside-avoid mb-4 group relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 rounded-none overflow-hidden transition-all duration-200 flex flex-col shadow-sm hover:shadow-md hover:-translate-y-0.5">
            {/* Processing Overlay */}
            {isProcessing && (
                <div className="absolute inset-0 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm z-20 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-gray-500">Processing...</p>
                    </div>
                </div>
            )}

            {/* Delete Button - appears on hover */}
            <button
                onClick={handleDelete}
                className="absolute top-2 right-2 z-30 p-2 bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-700 rounded-none opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-800"
                title="Delete"
            >
                <Trash2 size={14} className="text-gray-400 hover:text-red-500" />
            </button>

            {/* Image Section */}
            {resource.imageUrl && (
                <div className="relative h-40 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-900 via-transparent to-transparent z-10" />
                    <Image
                        src={resource.imageUrl}
                        alt={resource.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}

            <div className="p-4 flex flex-col gap-3">
                {/* Header: Icon + Category */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gray-100 dark:bg-zinc-800 rounded-none">
                            <Icon size={12} className="text-gray-500 dark:text-zinc-400" />
                        </div>
                        {resource.category && (
                            <span className={cn(
                                "px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide border rounded-none",
                                categoryColors[resource.category] || categoryColors.reference
                            )}>
                                {resource.category}
                            </span>
                        )}
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                        {formatDate(resource.createdAt)}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-medium text-sm leading-snug text-gray-900 dark:text-zinc-100 line-clamp-2">
                    {resource.title}
                </h3>

                {/* URL */}
                <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 truncate flex items-center gap-1 transition-colors"
                >
                    <ExternalLink size={10} />
                    {(() => {
                        try {
                            return new URL(resource.url).hostname;
                        } catch {
                            return resource.url;
                        }
                    })()}
                </a>

                {/* Summary */}
                {resource.summary && (
                    <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                        {resource.summary}
                    </p>
                )}

                {/* Keywords */}
                {resource.keywords && resource.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {resource.keywords.slice(0, 4).map((kw, i) => (
                            <span
                                key={i}
                                className="px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-[10px] text-gray-600 dark:text-zinc-400 rounded-none"
                            >
                                {kw}
                            </span>
                        ))}
                        {resource.keywords.length > 4 && (
                            <span className="px-1.5 py-0.5 text-[10px] text-gray-400">
                                +{resource.keywords.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
