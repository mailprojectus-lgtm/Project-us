"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  interests?: string[];
  pastProjects: { name: string; description: string; url: string }[];
  handsImage: string;
  bodyImage: string;
}

interface TeamProfileProps {
  member: TeamMember | null;
  onClose: () => void;
}

export default function TeamProfile({ member, onClose }: TeamProfileProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <AnimatePresence>
      {member && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(95,75,46,0.18)", backdropFilter: "blur(4px)" }}
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
                borderRadius: 36,
                border: "3px solid rgba(95,75,46,0.22)",
                boxShadow: "0 8px 48px rgba(95,75,46,0.14), 0 2px 8px rgba(0,0,0,0.06)",
                padding: "clamp(28px,4vw,44px) clamp(28px,5vw,52px)",
                maxWidth: "clamp(320px, 90vw, 500px)",
                width: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
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

              {/* Header: mascot + name/role */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 16 }}>
                <div style={{ flexShrink: 0 }}>
                  {imageError ? (
                    <div style={{ width: 64, height: 80, borderRadius: 12, background: "var(--color-brown)" }} />
                  ) : (
                    <Image
                      src={member.bodyImage}
                      alt={member.name}
                      width={68}
                      height={90}
                      style={{ objectFit: "contain", display: "block" }}
                      onError={() => setImageError(true)}
                    />
                  )}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <h1
                    className="font-mclaren"
                    style={{ fontSize: "clamp(26px,4vw,40px)", color: "var(--color-brown)", lineHeight: 1 }}
                  >
                    {member.name}
                  </h1>
                  <p
                    className="font-mclaren"
                    style={{ fontSize: "clamp(10px,1.1vw,13px)", color: "var(--color-gray)", marginTop: 5, lineHeight: 1.3 }}
                  >
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <p
                className="font-walter"
                style={{
                  fontSize: "clamp(12px,1.2vw,14px)",
                  color: "var(--color-gray)",
                  lineHeight: 1.6,
                  marginBottom: 14,
                  fontStyle: "italic",
                }}
              >
                {member.bio}
              </p>

              {/* Interest pills */}
              {member.interests && member.interests.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                  {member.interests.map(tag => (
                    <span
                      key={tag}
                      className="font-walter"
                      style={{
                        fontSize: 11,
                        color: "var(--color-brown)",
                        border: "1px dashed rgba(61,33,29,0.32)",
                        borderRadius: 20,
                        padding: "3px 11px",
                        opacity: 0.85,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(61,33,29,0.1)", marginBottom: 16 }} />

              {/* Past work label */}
              <p
                className="font-mclaren"
                style={{
                  fontSize: 10,
                  color: "var(--color-gray)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 10,
                  opacity: 0.55,
                }}
              >
                Past work
              </p>

              {/* Project cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {member.pastProjects.map(p => (
                  <div
                    key={p.name}
                    style={{
                      border: "1.5px solid rgba(61,33,29,0.12)",
                      borderRadius: 16,
                      padding: "11px 14px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                      <span
                        className="font-mclaren"
                        style={{ fontSize: "clamp(12px,1.2vw,14px)", color: "var(--color-brown)" }}
                      >
                        {p.name}
                      </span>
                      {p.url && (
                        <a
                          href={p.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mclaren"
                          style={{
                            fontSize: 10,
                            color: "var(--color-brown)",
                            opacity: 0.55,
                            textDecoration: "none",
                            borderBottom: "1px solid rgba(61,33,29,0.28)",
                            paddingBottom: 1,
                            flexShrink: 0,
                            transition: "opacity 0.15s ease",
                          }}
                          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
                          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.55")}
                        >
                          visit →
                        </a>
                      )}
                    </div>
                    <p
                      className="font-walter"
                      style={{ fontSize: "clamp(10px,1vw,12px)", color: "var(--color-gray)", lineHeight: 1.5 }}
                    >
                      {p.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
