"use client";

import { useRef, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ResourceCard } from "@/components/resource-card";

export function CuratorView() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [localInput, setLocalInput] = useState("");

    // In @ai-sdk/react (ai package v4+), useChat returns sendMessage and status
    const { messages, sendMessage, status, error } = useChat({
        transport: new DefaultChatTransport({
            api: "/api/chat",
        }),
    });

    const isLoading = status === 'submitted' || status === 'streaming';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, status]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = localInput.trim();
        if (!text || isLoading) return;

        setLocalInput("");
        try {
            await sendMessage({ text });
        } catch (err) {
            console.error("Failed to send message:", err);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-background text-foreground transition-colors duration-300">
            <div
                className="flex-1 overflow-y-auto px-6 md:px-20 py-8 scroll-smooth"
                ref={scrollRef}
            >
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Welcome message */}
                    {messages.length === 0 && (
                        <div className="text-center py-16 space-y-6 animate-fade-in">
                            <div className="w-12 h-12 bg-muted flex items-center justify-center mx-auto">
                                <Sparkles className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-lg font-medium text-foreground">
                                    Oculus Assistant
                                </h2>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Search your saved links, get recommendations, or tell me about your goals.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((m: any) => (
                        <div
                            key={m.id}
                            className={cn(
                                "flex gap-4 animate-slide-up",
                                m.role === "user" ? "flex-row-reverse" : ""
                            )}
                        >
                            <div
                                className={cn(
                                    "w-8 h-8 flex items-center justify-center shrink-0",
                                    m.role === "assistant"
                                        ? "bg-muted"
                                        : "bg-primary text-primary-foreground"
                                )}
                            >
                                {m.role === "assistant" ? (
                                    <Sparkles size={14} className="text-muted-foreground" />
                                ) : (
                                    <div className="w-2 h-2 bg-current rounded-full" />
                                )}
                            </div>
                            <div
                                className={cn(
                                    "max-w-[85%] space-y-2",
                                    m.role === "user" ? "items-end flex flex-col" : ""
                                )}
                            >
                                {/* Message Parts */}
                                {m.parts.map((part: any, idx: number) => {
                                    if (part.type === "text") {
                                        return (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "p-4 rounded-sm",
                                                    m.role === "assistant"
                                                        ? "bg-muted border border-border text-foreground"
                                                        : "bg-primary text-primary-foreground font-medium"
                                                )}
                                            >
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    className="space-y-3 text-sm leading-relaxed"
                                                    components={{
                                                        p: ({ children }) => {
                                                            const onlyChild = Array.isArray(children) && children.length === 1 ? children[0] : null;
                                                            // Avoid wrapping block-level content like code blocks inside <p>
                                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                            // @ts-ignore
                                                            if (onlyChild?.type === "pre") {
                                                                return <>{children}</>;
                                                            }
                                                            return <p className="text-sm leading-relaxed">{children}</p>;
                                                        },
                                                        pre: ({ children }) => (
                                                            <pre className="bg-background border border-border rounded-md p-3 overflow-x-auto text-sm leading-relaxed">
                                                                {children}
                                                            </pre>
                                                        ),
                                                        strong: ({ children }) => (
                                                            <strong className="font-semibold">{children}</strong>
                                                        ),
                                                        em: ({ children }) => (
                                                            <em className="italic">{children}</em>
                                                        ),
                                                        a: ({ children, href }) => (
                                                            <a
                                                                href={href}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="underline underline-offset-2 decoration-border hover:text-primary"
                                                            >
                                                                {children}
                                                            </a>
                                                        ),
                                                        ul: ({ children }) => (
                                                            <ul className="list-disc pl-5 space-y-2">{children}</ul>
                                                        ),
                                                        ol: ({ children }) => (
                                                            <ol className="list-decimal pl-5 space-y-2">{children}</ol>
                                                        ),
                                                        li: ({ children }) => (
                                                            <li className="text-sm leading-relaxed">{children}</li>
                                                        ),
                                                        code({ inline, className, children, ...props }) {
                                                            if (inline) {
                                                                return (
                                                                    <code className="rounded bg-muted px-1.5 py-0.5 text-[13px] font-mono">
                                                                        {children}
                                                                    </code>
                                                                );
                                                            }

                                                            return (
                                                                <code
                                                                    {...props}
                                                                    className={cn("text-xs leading-6 font-mono", className)}
                                                                >
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        blockquote: ({ children }) => (
                                                            <blockquote className="border-l-2 border-border pl-3 text-sm text-muted-foreground">
                                                                {children}
                                                            </blockquote>
                                                        ),
                                                        hr: () => <hr className="border-border my-2" />,
                                                    }}
                                                >
                                                    {part.text}
                                                </ReactMarkdown>
                                            </div>
                                        );
                                    }

                                    if (part.type === "tool-searchLibrary") {
                                        if (part.state === "output-available") {
                                            const result = part.output;
                                            if (result.found && result.resources?.length > 0) {
                                                return (
                                                    <div key={idx} className="w-full mt-2">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            {result.resources.map((res: any, resIdx: number) => {
                                                                const normalizedResource = {
                                                                    ...res,
                                                                    id: `search-${idx}-${resIdx}`,
                                                                    createdAt: new Date().toISOString(),
                                                                    status: 'processed',
                                                                    whySaved: null,
                                                                    priority: null,
                                                                    imageUrl: null,
                                                                    summary: res.summary || null,
                                                                    keywords: Array.isArray(res.keywords) ? res.keywords : res.keywords ? [res.keywords] : []
                                                                };
                                                                return (
                                                                    <div key={resIdx} className="scale-95 origin-top-left transition-transform hover:scale-100">
                                                                        <ResourceCard resource={normalizedResource} />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        }
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Thinking indicator */}
                    {isLoading && (
                        <div className="flex gap-4 animate-slide-up">
                            <div className="w-8 h-8 bg-muted flex items-center justify-center">
                                <Sparkles size={14} className="text-muted-foreground animate-pulse" />
                            </div>
                            <div className="p-4 bg-muted border border-border">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error message */}
                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 text-destructive">
                            <AlertCircle size={16} />
                            <span className="text-sm">{error.message}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-4 md:p-6 border-t border-border bg-muted/30">
                <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto relative">
                    <Input
                        value={localInput}
                        onChange={(e) => setLocalInput(e.target.value)}
                        placeholder="Search links, ask questions, or share context..."
                        className="pr-12 bg-background border-border focus:border-ring h-12 text-sm rounded-none shadow-sm"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground rounded-none"
                        disabled={!localInput.trim() || isLoading}
                    >
                        <ArrowRight size={18} />
                    </Button>
                </form>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-muted-foreground font-mono">
                        Oculus v2.0 • AI-powered link manager
                    </span>
                </div>
            </div>
        </div>
    );
}
