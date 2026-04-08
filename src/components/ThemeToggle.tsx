"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggle = () => {
    const html = document.documentElement;
    html.classList.add("theme-transitioning");
    setTimeout(() => html.classList.remove("theme-transitioning"), 400);
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      html.classList.add("light");
      localStorage.setItem("theme", "light");
      setDark(false);
    } else {
      html.classList.remove("light");
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setDark(true);
    }
  };

  if (!mounted) return null;

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.9 }}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        position: "fixed",
        bottom: isMobile ? 156 : 24,
        right: 24,
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "1.5px solid var(--color-spine)",
        background: "var(--color-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        zIndex: 9995,
        color: "var(--color-brown)",
        transition: "background 0.35s ease, border-color 0.35s ease, color 0.35s ease",
      }}
    >
      {dark ? (
        /* Sun */
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        /* Moon */
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </motion.button>
  );
}
