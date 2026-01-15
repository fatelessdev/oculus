"use client";

import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { flushSync } from "react-dom";

export const ThemeToggle = ({
    className = "",
}: {
    className?: string;
}) => {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className={cn("h-7 w-7 rounded-full bg-black", className)} />
        );
    }

    const isDark = resolvedTheme === "dark";

    return (
        <button
            type="button"
            className={cn(
                "h-7 w-7 rounded-full transition-all duration-300 active:scale-95",
                isDark ? "bg-black text-white" : "bg-white text-black",
                className,
            )}
            onClick={() => {
                // @ts-ignore
                if (document.startViewTransition) {
                    // @ts-ignore
                    document.startViewTransition(() => {
                        flushSync(() => {
                            setTheme(isDark ? "light" : "dark");
                        });
                    });
                } else {
                    setTheme(isDark ? "light" : "dark");
                }
            }}
            title="Toggle theme"
            aria-label="Toggle theme"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                strokeWidth="0.7"
                stroke="currentColor"
                fill="currentColor"
                strokeLinecap="round"
                viewBox="0 0 32 32"
                className="size-full"
            >
                {/* Bulb Body */}
                <path
                    strokeWidth="0"
                    d="M9.4 9.9c1.8-1.8 4.1-2.7 6.6-2.7 5.1 0 9.3 4.2 9.3 9.3 0 2.3-.8 4.4-2.3 6.1-.7.8-2 2.8-2.5 4.4 0 .2-.2.4-.5.4-.2 0-.4-.2-.4-.5v-.1c.5-1.8 2-3.9 2.7-4.8 1.4-1.5 2.1-3.5 2.1-5.6 0-4.7-3.7-8.5-8.4-8.5-2.3 0-4.4.9-5.9 2.5-1.6 1.6-2.5 3.7-2.5 6 0 2.1.7 4 2.1 5.6.8.9 2.2 2.9 2.7 4.9 0 .2-.1.5-.4.5h-.1c-.2 0-.4-.1-.4-.4-.5-1.7-1.8-3.7-2.5-4.5-1.5-1.7-2.3-3.9-2.3-6.1 0-2.3 1-4.7 2.7-6.5z"
                />
                {/* Filament Base Lines */}
                <path d="M19.8 28.3h-7.6" />
                <path d="M19.8 29.5h-7.6" />
                <path d="M19.8 30.7h-7.6" />

                {/* Inner Filament (Zig Zag) - Appears in Light Mode Only (Off state) */}
                <motion.path
                    animate={{
                        pathLength: isDark ? 0 : 1,
                        opacity: isDark ? 0 : 1,
                    }}
                    transition={{ ease: "easeInOut", duration: 0.35 }}
                    pathLength="1"
                    fill="none"
                    d="M14.6 27.1c0-3.4 0-6.8-.1-10.2-.2-1-1.1-1.7-2-1.7-1.2-.1-2.3 1-2.2 2.3.1 1 .9 1.9 2.1 2h7.2c1.1-.1 2-1 2.1-2 .1-1.2-1-2.3-2.2-2.3-.9 0-1.7.7-2 1.7 0 3.4 0 6.8-.1 10.2"
                />

                {/* Rays / Sparkles - Appears in Dark Mode (On state) */}
                <motion.g
                    animate={{
                        scale: isDark ? 1 : 0.5,
                        opacity: isDark ? 1 : 0,
                    }}
                    transition={{ ease: "easeInOut", duration: 0.35 }}
                >
                    <path pathLength="1" d="M16 6.4V1.3" />
                    <path pathLength="1" d="M26.3 15.8h5.1" />
                    <path pathLength="1" d="m22.6 9 3.7-3.6" />
                    <path pathLength="1" d="M9.4 9 5.7 5.4" />
                    <path pathLength="1" d="M5.7 15.8H.6" />
                </motion.g>
            </svg>
        </button>
    );
};
