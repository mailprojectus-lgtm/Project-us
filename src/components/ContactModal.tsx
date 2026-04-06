"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
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
                background: "#FFFDF9",
                borderRadius: "36px",
                border: "3px solid rgba(95,75,46,0.22)",
                boxShadow: "0 8px 48px rgba(95,75,46,0.14), 0 2px 8px rgba(0,0,0,0.06)",
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

              <h2
                className="font-mclaren"
                style={{
                  fontSize: "clamp(22px, 3vw, 34px)",
                  color: "var(--color-brown)",
                  lineHeight: 1.2,
                  marginBottom: "clamp(8px, 1.5vh, 14px)",
                }}
              >
                Want to<br />reach us?
              </h2>
              <p
                className="font-walter"
                style={{
                  fontSize: "clamp(13px, 1.4vw, 17px)",
                  color: "var(--color-gray)",
                  lineHeight: 1.6,
                  marginBottom: "clamp(24px, 3.5vh, 36px)",
                }}
              >
                Drop us a message about anything — we read every one.
              </p>

              {/* Email CTA — warm filled, no outline ring */}
              <motion.a
                href="mailto:mail.project.us+chat@gmail.com"
                className="font-mclaren"
                style={{
                  display: "inline-block",
                  fontSize: "clamp(14px, 1.5vw, 18px)",
                  color: "#FFFDF9",
                  background: "var(--color-brown)",
                  borderRadius: "55px",
                  padding: "13px 44px",
                  textDecoration: "none",
                  boxShadow: "0 4px 18px rgba(95,75,46,0.28)",
                }}
                whileHover={{ scale: 1.04, boxShadow: "0 6px 24px rgba(95,75,46,0.36)" }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
              >
                Send us a message
              </motion.a>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
