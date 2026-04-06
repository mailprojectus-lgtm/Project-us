"use client";

import { motion } from "framer-motion";

interface JourneyPathProps {
  revealed: boolean;
  /** true once the Squeak card has appeared (triggers segment 2 snap) */
  seg2: boolean;
  /** true once the Bilion card has appeared (triggers segment 3 snap) */
  seg3: boolean;
}

// ── Path data (viewBox 0 0 800 600, preserveAspectRatio="none") ────────────
// Taut = degenerate bezier (straight line between endpoints)
// Curved = the organic S-curve that connects the cards
//
//   Top start:    (400, 0)   — center-top of journey section
//   Squeak:       (200, 150) — 25% left, 25% down
//   Bilion:       (606, 306) — 76% right, 51% down
//   Next?:        (400, 438) — center, 73% down

const S1_TAUT   = "M 400 0 C 400 0 200 150 200 150";
const S1_CURVED = "M 400 0 C 390 52 232 98 200 150";

const S2_TAUT   = "M 200 150 C 200 150 606 306 606 306";
const S2_CURVED = "M 200 150 C 166 204 542 248 606 306";

const S3_TAUT   = "M 606 306 C 606 306 400 438 400 438";
const S3_CURVED = "M 606 306 C 668 362 474 412 400 438";

// Spring: low damping = bouncy rubber-band overshoot and settle
const SNAP = {
  type: "spring" as const,
  stiffness: 48,
  damping: 5.5,
  mass: 1,
};

const STROKE_PROPS = {
  stroke: "#3D211D",
  strokeWidth: 6,
  strokeDasharray: "0.01 20",
  strokeLinecap: "round" as const,
  fill: "none",
};

export default function JourneyPath({ revealed, seg2, seg3 }: JourneyPathProps) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
      >
        {/* ── Segment 1: top → Squeak ──
            Flings into its curved shape the moment reveal starts */}
        <motion.path
          {...STROKE_PROPS}
          initial={{ d: S1_TAUT, opacity: 0 }}
          animate={
            revealed
              ? { d: S1_CURVED, opacity: 1 }
              : { d: S1_TAUT, opacity: 0 }
          }
          transition={{
            d: SNAP,
            opacity: { duration: 0.18 },
          }}
        />

        {/* ── Segment 2: Squeak → Bilion ──
            Snaps into shape once the Squeak card has settled */}
        <motion.path
          {...STROKE_PROPS}
          initial={{ d: S2_TAUT, opacity: 0 }}
          animate={
            seg2
              ? { d: S2_CURVED, opacity: 1 }
              : { d: S2_TAUT, opacity: 0 }
          }
          transition={{
            d: SNAP,
            opacity: { duration: 0.18 },
          }}
        />

        {/* ── Segment 3: Bilion → Next? ──
            Snaps into shape once Bilion card has settled */}
        <motion.path
          {...STROKE_PROPS}
          initial={{ d: S3_TAUT, opacity: 0 }}
          animate={
            seg3
              ? { d: S3_CURVED, opacity: 1 }
              : { d: S3_TAUT, opacity: 0 }
          }
          transition={{
            d: SNAP,
            opacity: { duration: 0.18 },
          }}
        />
      </svg>
    </div>
  );
}
