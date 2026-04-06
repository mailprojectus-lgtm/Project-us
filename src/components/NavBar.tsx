"use client";

import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

interface NavBarProps {
  onContactClick: () => void;
  revealed: boolean;
}

export default function NavBar({ onContactClick, revealed }: NavBarProps) {
  // ── Magnetic pull on the Contacts button ──────────────────────────────────
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 18 });
  const sy = useSpring(my, { stiffness: 220, damping: 18 });

  const handleMagnetMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    mx.set((e.clientX - cx) * 0.32);
    my.set((e.clientY - cy) * 0.32);
  };
  const handleMagnetLeave = () => { mx.set(0); my.set(0); };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between pointer-events-none" style={{ padding: "28px 40px" }}>
      {/* Social icons */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            className="flex items-center gap-4 pointer-events-auto"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <span title="TikTok (coming soon)" style={{ cursor: "not-allowed", opacity: 0.55 }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.28 6.28 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V9.05a8.16 8.16 0 0 0 4.77 1.52V7.13a4.85 4.85 0 0 1-1-.44z" fill="#7C7C7C" />
              </svg>
            </span>
            <span title="Instagram (coming soon)" style={{ cursor: "not-allowed", opacity: 0.55 }}>
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="#7C7C7C" strokeWidth="2" />
                <circle cx="12" cy="12" r="4.5" stroke="#7C7C7C" strokeWidth="2" />
                <circle cx="17.5" cy="6.5" r="1" fill="#7C7C7C" />
              </svg>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {!revealed && <div />}

      {/* Contacts button — magnetic pull */}
      <AnimatePresence>
        {revealed && (
          <motion.button
            onClick={onContactClick}
            onMouseMove={handleMagnetMove}
            onMouseLeave={handleMagnetLeave}
            className="pointer-events-auto font-mclaren"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            style={{
              x: sx,
              y: sy,
              color: "var(--color-brown)",
              border: "none",
              background: "transparent",
              padding: 0,
              fontSize: "clamp(13px, 1.3vw, 16px)",
              cursor: "pointer",
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
          >
            Contacts
          </motion.button>
        )}
      </AnimatePresence>
    </nav>
  );
}
