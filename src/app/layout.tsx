import type { Metadata } from "next";
import "./globals.css";
import GrainOverlay from "@/components/GrainOverlay";
import ThemeToggle from "@/components/ThemeToggle";
import VantaBackground from "@/components/VantaBackground";

export const metadata: Metadata = {
  title: "Project US",
  description: "What if there was a team of skilled people that worked and focused only on what truly matters: the people, the connection, us.",
  openGraph: {
    title: "Project US",
    description: "A team building what truly matters.",
    url: "https://project-for.us",
    siteName: "Project US",
  },
};

// Runs before React hydration to prevent theme flash
const themeScript = `(function(){var t=localStorage.getItem('theme'),d=window.matchMedia('(prefers-color-scheme:dark)').matches;if(t==='dark'||(t!=='light'&&d)){document.documentElement.classList.add('dark');}else if(t==='light'){document.documentElement.classList.add('light');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <VantaBackground />
        <GrainOverlay />
        {children}
        <ThemeToggle />
      </body>
    </html>
  );
}
