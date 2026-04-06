"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ProjectPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
}

export default function ProjectPanel({
  isOpen,
  onClose,
  title,
  description,
  ctaLabel,
  ctaUrl,
}: ProjectPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-40 flex flex-col justify-center"
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              width: "clamp(280px, 32vw, 440px)",
              background: "var(--color-white)",
              borderRadius: "55px 0 0 55px",
              border: "5px solid #3D211D",
              borderRight: "none",
              boxShadow: "-14px 14px 4px rgba(0,0,0,0.4)",
              padding: "clamp(32px, 4vw, 52px) clamp(24px, 3.2vw, 44px)",
            }}
          >
            <button
              onClick={onClose}
              className="absolute font-mclaren text-2xl leading-none"
              style={{
                top: 20,
                right: 24,
                color: "var(--color-gray)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
              aria-label="Close panel"
            >
              ×
            </button>

            <h2
              className="font-mclaren mb-5"
              style={{ fontSize: "clamp(28px, 3.2vw, 46px)", color: "var(--color-brown)" }}
            >
              {title}
            </h2>

            <p
              className="font-walter mb-8 leading-relaxed"
              style={{ fontSize: "clamp(13px, 1.3vw, 17px)", color: "var(--color-gray)" }}
            >
              {description}
            </p>

            <a
              href={ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mclaren inline-block text-center"
              style={{
                fontSize: "clamp(13px, 1.3vw, 17px)",
                color: "var(--color-brown)",
                border: "2px solid var(--color-brown)",
                borderRadius: "55px",
                padding: "10px 28px",
                background: "transparent",
                textDecoration: "none",
                transition: "transform 0.12s ease",
              }}
              onMouseDown={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(0.95)"; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.transform = "scale(1)"; }}
            >
              {ctaLabel}
            </a>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
