import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"],
    display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "Oculus | Personal Link Manager",
    description:
        "Save and organize your links with AI-powered categorization and semantic search",
    keywords: [
        "Link Manager",
        "Bookmarks",
        "AI",
        "Semantic Search",
        "Personal Knowledge",
    ],
    authors: [{ name: "Oculus" }],
    icons: {
        icon: "/icon.svg",
        apple: "/apple-icon.svg",
    },
    openGraph: {
        title: "Oculus | Personal Link Manager",
        description: "Save and organize your links with AI",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${inter.variable} ${jetbrainsMono.variable} font-mono antialiased`}
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
