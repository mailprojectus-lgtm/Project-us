import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
