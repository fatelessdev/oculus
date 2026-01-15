"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
    collapsed?: boolean;
}

export function Logo({ collapsed = false }: LogoProps) {
    return (
        <div
            className={cn(
                "flex items-center",
                collapsed ? "justify-center gap-0" : "gap-2"
            )}
        >
            {/* Simple geometric eye icon */}
            <div className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="w-5 h-5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                >
                    <circle cx="12" cy="12" r="3" />
                    <path
                        d="M12 5C7 5 3 9 2 12c1 3 5 7 10 7s9-4 10-7c-1-3-5-7-10-7z"
                    />
                </svg>
            </div>
            {!collapsed && (
                <span className="font-bold text-lg tracking-tight text-foreground">
                    Oculus
                </span>
            )}
        </div>
    );
}
