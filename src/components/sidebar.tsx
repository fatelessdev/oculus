"use client";

import { Library, Sparkles, ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export type View = "library" | "curator";

interface SidebarProps {
    activeView: View;
    onViewChange: (view: View) => void;
    collapsed: boolean;
    onToggleCollapse: () => void;
}

export function Sidebar({ activeView, onViewChange, collapsed, onToggleCollapse }: SidebarProps) {
    return (
        <aside
            className={cn(
                "border-r border-border flex flex-col bg-muted/30 z-20 transition-all duration-200 relative",
                collapsed ? "w-16" : "w-64"
            )}
        >
            {/* Header */}
            <div
                className={cn(
                    "h-14 flex items-center border-b border-border",
                    collapsed ? "justify-center" : "justify-start px-6"
                )}
            >
                <Logo collapsed={collapsed} />
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={onToggleCollapse}
                className="absolute -right-3 top-12 w-6 h-6 bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 transition-all z-30"
            >
                {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1.5">
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 h-11 transition-all rounded-none",
                        activeView === "library"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        collapsed ? "justify-center px-0" : "px-4"
                    )}
                    onClick={() => onViewChange("library")}
                    title="Library"
                >
                    <Library size={20} />
                    {!collapsed && (
                        <span className="font-semibold text-sm tracking-tight">Library</span>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    className={cn(
                        "w-full justify-start gap-3 h-11 transition-all rounded-none",
                        activeView === "curator"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        collapsed ? "justify-center px-0" : "px-4"
                    )}
                    onClick={() => onViewChange("curator")}
                    title="AI Assistant"
                >
                    <Sparkles size={20} />
                    {!collapsed && (
                        <span className="font-semibold text-sm tracking-tight">Assistant</span>
                    )}
                </Button>
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-border">
                <div
                    className={cn(
                        "flex items-center gap-3 p-3 bg-muted/50 transition-all cursor-pointer hover:bg-muted",
                        collapsed ? "justify-center px-0" : ""
                    )}
                >
                    <div className="w-8 h-8 bg-muted-foreground text-background flex items-center justify-center shrink-0">
                        <User size={16} />
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                                Personal Space
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                                Beta v2.0
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
