"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Sidebar, type View } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ResourceCard } from "@/components/resource-card";
import { CuratorView } from "@/components/curator-view";
import { IngestionToast, type ToastStatus } from "@/components/ingestion-toast";

// Resource type matching database schema
export type Resource = {
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
    updatedAt: string;
    status: string | null;
};

const categories = [
    { id: "all", label: "All" },
    { id: "learning", label: "Learning" },
    { id: "reference", label: "Reference" },
    { id: "tool", label: "Tools" },
    { id: "inspiration", label: "Inspiration" },
    { id: "content", label: "Content" },
];

export default function Home() {
    const [view, setView] = useState<View>("library");
    const [resources, setResources] = useState<Resource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [ingestionStatus, setIngestionStatus] = useState<ToastStatus>("idle");
    const [newLink, setNewLink] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [deletedResource, setDeletedResource] = useState<Resource | null>(null);
    const deleteTimerRef = useRef<number | null>(null);

    // Fetch resources from database
    const fetchResources = useCallback(async () => {
        try {
            const response = await fetch("/api/resources");
            if (response.ok) {
                const data = await response.json();
                setResources(data);
            }
        } catch (error) {
            console.error("Failed to fetch resources:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Load resources on mount
    useEffect(() => {
        fetchResources();
    }, [fetchResources]);

    // Filter resources
    const filteredResources = useMemo(() => {
        return resources.filter((res) => {
            const matchesCategory = activeCategory === "all" || res.category?.toLowerCase() === activeCategory.toLowerCase();
            const matchesSearch = !searchQuery ||
                res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                res.summary?.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [resources, activeCategory, searchQuery]);

    // Handle delete with 5s undo window
    const handleDelete = (id: string) => {
        const resource = resources.find((r) => r.id === id);
        if (!resource) return;

        if (deleteTimerRef.current) {
            window.clearTimeout(deleteTimerRef.current);
            deleteTimerRef.current = null;
        }

        setResources((prev) => prev.filter((r) => r.id !== id));
        setDeletedResource(resource);

        deleteTimerRef.current = window.setTimeout(async () => {
            try {
                const response = await fetch(`/api/resources/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete");
                setDeletedResource(null);
            } catch (error) {
                console.error("Error deleting resource:", error);
                setResources((prev) => [resource, ...prev]);
                setDeletedResource(null);
            } finally {
                deleteTimerRef.current = null;
            }
        }, 5000);
    };

    const handleUndoDelete = async () => {
        if (!deletedResource) return;
        const resource = deletedResource;
        setDeletedResource(null);
        if (deleteTimerRef.current) {
            window.clearTimeout(deleteTimerRef.current);
            deleteTimerRef.current = null;
        }
        setResources((prev) => [resource, ...prev]);
        fetchResources();
    };

    // Clear pending timers on unmount
    useEffect(() => {
        return () => {
            if (deleteTimerRef.current) {
                window.clearTimeout(deleteTimerRef.current);
            }
        };
    }, []);

    const handleAddLink = async () => {
        if (!newLink) return;
        setIngestionStatus("scraping");
        setIsAddModalOpen(false);
        const url = newLink;
        setNewLink("");

        try {
            const response = await fetch("/api/resources", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            if (response.ok) {
                setIngestionStatus("saved");
                fetchResources();
            } else {
                setIngestionStatus("error");
            }
        } catch (error) {
            setIngestionStatus("error");
        }
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden">
            <Sidebar
                activeView={view}
                onViewChange={setView}
                collapsed={sidebarCollapsed}
                onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background border-l border-border transition-colors duration-300">
                <Header
                    view={view}
                    count={filteredResources.length}
                    onAddClick={() => setIsAddModalOpen(true)}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />

                {/* Category Filter Tabs */}
                {view === "library" && (
                    <div className="flex items-center gap-1 px-6 py-3 border-b border-border bg-muted/20 overflow-x-auto no-scrollbar">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-medium transition-all rounded-none border whitespace-nowrap",
                                    activeCategory === cat.id
                                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                        : "bg-transparent text-muted-foreground border-border hover:border-muted-foreground/50 hover:text-foreground"
                                )}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex-1 overflow-hidden relative">
                    {view === "library" ? (
                        <div className="h-full overflow-y-auto p-6 scroll-smooth">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center space-y-4">
                                        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
                                        <p className="text-sm text-muted-foreground">Syncing your library...</p>
                                    </div>
                                </div>
                            ) : filteredResources.length === 0 ? (
                                <div className="flex items-center justify-center h-full w-full">
                                    <div className="text-center space-y-4 max-w-sm w-full px-4">
                                        <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6">
                                            <span className="text-2xl">🔍</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground">
                                            {searchQuery ? "No results found" : "Your library is empty"}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {searchQuery
                                                ? `No links matching "${searchQuery}" in ${activeCategory} category.`
                                                : "Start saving links to build your personal knowledge base."}
                                        </p>
                                        <Button
                                            onClick={() => {
                                                if (searchQuery) setSearchQuery("");
                                                else setIsAddModalOpen(true);
                                            }}
                                            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none px-8"
                                        >
                                            {searchQuery ? "Clear Search" : "Add Your First Link"}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="columns-1 md:columns-2 xl:columns-3 2xl:columns-4 gap-4 pb-20 max-w-[1700px] mx-auto">
                                    {filteredResources.map((res) => (
                                        <ResourceCard
                                            key={res.id}
                                            resource={res}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <CuratorView />
                    )}
                </div>
            </main>

            {/* Add Resource Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 transition-all animate-in fade-in duration-300">
                    <div className="bg-card border border-border w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-bold text-xl text-foreground tracking-tight">
                                    Save Link
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Paste any URL and Oculus will categorize it for you.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="text-muted-foreground hover:text-foreground transition-all p-1.5 hover:bg-muted"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-5">
                            <Input
                                value={newLink}
                                onChange={(e) => setNewLink(e.target.value)}
                                placeholder="https://..."
                                autoFocus
                                className="h-12 text-base bg-muted/30 border-input focus:border-ring"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && newLink) handleAddLink();
                                }}
                            />
                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="text-muted-foreground hover:text-foreground h-10 px-5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddLink}
                                    disabled={!newLink}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 font-medium"
                                >
                                    Save Link
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Undo Delete Snackbar */}
            {deletedResource && (
                <div className="fixed bottom-8 left-1/2 -track-x-1/2 z-50 bg-primary text-primary-foreground px-6 py-4 flex items-center gap-6 shadow-2xl animate-in slide-in-from-bottom-8 duration-300">
                    <span className="text-sm font-medium tracking-wide">
                        Deleted &quot;{deletedResource.title.slice(0, 30)}&quot;
                    </span>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleUndoDelete}
                            className="text-sm font-bold underline hover:no-underline decoration-2 underline-offset-4"
                        >
                            Undo
                        </button>
                        <button
                            onClick={() => setDeletedResource(null)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            <IngestionToast
                status={ingestionStatus}
                onClose={() => setIngestionStatus("idle")}
            />
        </div>
    );
}
