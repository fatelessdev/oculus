"use client";

import { Check, Loader2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastStatus = "idle" | "scraping" | "analyzing" | "saved" | "error";

interface IngestionToastProps {
    status: ToastStatus;
    onClose: () => void;
}

const statusConfig: Record<
    ToastStatus,
    { icon: typeof Loader2; label: string; color: string }
> = {
    idle: { icon: Loader2, label: "", color: "" },
    scraping: { icon: Loader2, label: "Fetching content...", color: "text-gray-500" },
    analyzing: { icon: Loader2, label: "AI analyzing...", color: "text-gray-500" },
    saved: { icon: Check, label: "Saved to library", color: "text-green-600" },
    error: { icon: AlertCircle, label: "Failed to save", color: "text-red-500" },
};

export function IngestionToast({ status, onClose }: IngestionToastProps) {
    if (status === "idle") return null;

    const config = statusConfig[status];
    const Icon = config.icon;
    const isLoading = status === "scraping" || status === "analyzing";

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
            <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-lg">
                <Icon
                    size={16}
                    className={cn(
                        config.color,
                        isLoading && "animate-spin"
                    )}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {config.label}
                </span>
                {!isLoading && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-white ml-2"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
        </div>
    );
}
