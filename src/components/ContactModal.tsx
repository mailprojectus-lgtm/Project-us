"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMAIL = "mail.project.us+chat@gmail.com";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select the text — unreachable in modern browsers but safe
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(95, 75, 46, 0.18)", backdropFilter: "blur(4px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center px-6 pointer-events-none">
            <motion.div
              className="relative pointer-events-auto"
              initial={{ scale: 0.88, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 12 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              style={{
                background: "var(--color-white)",
                borderRadius: "36px",
                border: "3px solid var(--color-spine)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
                padding: "clamp(36px, 5vw, 56px) clamp(36px, 6vw, 64px)",
                maxWidth: 400,
                width: "100%",
                textAlign: "center",
              }}
            >
              {/* Close */}
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  position: "absolute", top: 18, right: 22,
                  width: 28, height: 28,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "none", background: "none", cursor: "pointer",
                  color: "var(--color-gray)", fontSize: 20, lineHeight: 1,
                }}
              >
                ×
              </button>

              <p
                className="font-walter"
                style={{
                  fontSize: "clamp(13px, 1.4vw, 17px)",
                  color: "var(--color-gray)",
                  lineHeight: 1.6,
                  marginBottom: "clamp(6px, 1vh, 10px)",
                }}
              >
                We read every one.
              </p>

              <h2
                className="font-mclaren"
                style={{
                  fontSize: "clamp(22px, 3vw, 34px)",
                  color: "var(--color-brown)",
                  lineHeight: 1.2,
                  marginBottom: "clamp(24px, 3.5vh, 36px)",
                }}
              >
                Want to<br />reach us?
              </h2>

              {/* Primary CTA — opens Gmail compose in a new tab */}
              <motion.a
                href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(EMAIL)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mclaren"
                title="Open Gmail compose"
                style={{
                  display: "inline-block",
                  fontSize: "clamp(14px, 1.5vw, 18px)",
                  color: "var(--color-bg)",
                  background: "var(--color-brown)",
                  borderRadius: "55px",
                  padding: "13px 44px",
                  textDecoration: "none",
                  boxShadow: "0 4px 18px rgba(95,75,46,0.28)",
                  cursor: "pointer",
                }}
                whileHover={{ scale: 1.04, boxShadow: "0 6px 28px rgba(95,75,46,0.42)" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                Send us a message
              </motion.a>

              {/* Fallback — copy address for desktop webmail users */}
              <div style={{ marginTop: "clamp(18px, 2.5vh, 26px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span
                  className="font-walter"
                  style={{ fontSize: "clamp(11px, 1.1vw, 13px)", color: "var(--color-gray)", opacity: 0.7, letterSpacing: "0.01em" }}
                >
                  {EMAIL}
                </span>
                <motion.button
                  onClick={handleCopy}
                  title="Copy address"
                  className="font-mclaren"
                  whileTap={{ scale: 0.88 }}
                  style={{
                    border: "1px dashed var(--color-spine)",
                    borderRadius: 20,
                    padding: "2px 10px",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: 11,
                    color: copied ? "var(--color-brown)" : "var(--color-gray)",
                    opacity: copied ? 1 : 0.65,
                    transition: "color 0.2s ease, opacity 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {copied ? "copied ✓" : "copy"}
                </motion.button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
