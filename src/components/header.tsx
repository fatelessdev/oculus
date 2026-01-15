"use client";

import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type View } from "@/components/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
    view: View;
    count: number;
    onAddClick: () => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function Header({ view, count, onAddClick, searchQuery, onSearchChange }: HeaderProps) {
    return (
        <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-background">
            {/* Left: Title */}
            <div className="flex items-center gap-3">
                <h1 className="text-base font-semibold text-foreground">
                    {view === "library" ? "Library" : "Assistant"}
                </h1>
                <span className="text-xs text-muted-foreground font-mono px-2 py-0.5 bg-muted">
                    {count} {view === "library" ? "links" : "chats"}
                </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <ThemeToggle />
                {view === "library" && (
                    <>
                        <div className="relative hidden md:block">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <Input
                                placeholder="Search links..."
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-64 pl-9 h-9 bg-muted/30 border-input focus:border-ring rounded-none text-sm"
                            />
                        </div>
                        <Button
                            onClick={onAddClick}
                            className="gap-2 h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-4"
                        >
                            <Plus size={16} />
                            <span className="hidden sm:inline">Add Link</span>
                        </Button>
                    </>
                )}
            </div>
        </header>
    );
}
