"use client";

import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Image from "next/image";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  pastProjects: { name: string; description: string; url: string }[];
  handsImage: string;
  bodyImage: string;
}

export interface TeamMascotProps {
  member: TeamMember;
  onReveal: (member: TeamMember) => void;
  /** px from screen bottom to bottom edge of hands image */
  handsBottom: number;
  handsW: number;
  handsH: number;
  /** px from screen bottom to bottom edge of body image (can be negative) */
  bodyBottom: number;
  bodyW: number;
  bodyH: number;
  /** Bob idle amplitude in px */
  bobIdleY?: number;
  /** Bob idle cycle duration in seconds */
  bobIdleT?: number;
  /** Bob hover amplitude in px */
  bobHoverY?: number;
  /** Bob hover cycle duration in seconds */
  bobHoverT?: number;
}

export default function TeamMascot({
  member,
  onReveal,
  handsBottom,
  handsW,
  handsH,
  bodyBottom,
  bodyW,
  bodyH,
  bobIdleY  = 10,
  bobIdleT  = 2,
  bobHoverY = 16,
  bobHoverT = 1,
}: TeamMascotProps) {
  const [hovered, setHovered]       = useState(false);
  const [busy, setBusy]             = useState(false);
  const [bodyErr, setBodyErr]       = useState(false);
  const [handsErr, setHandsErr]     = useState(false);

  const bodyControls  = useAnimation();
  const handsControls = useAnimation();

  // Container spans from 0 up to the tallest visible element
  const visibleBody  = bodyBottom + bodyH;   // may be smaller if bodyBottom < 0
  const visibleHands = handsBottom + handsH;
  const containerH   = Math.max(visibleBody, visibleHands, 0) + 20;
  const containerW   = Math.max(handsW, bodyW) + 10;

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    setHovered(false);

    // Hands fade out quickly; body bounces up a tiny bit then drops off-screen
    handsControls.start({ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } });
    await bodyControls.start({
      y: [0, -14, 420],
      transition: {
        duration: 0.62,
        times: [0, 0.14, 1],
        ease: ["easeOut", "easeIn"],
      },
    });

    onReveal(member);

    // Silently reset so mascots look normal when profile closes
    bodyControls.set({ y: 0 });
    handsControls.set({ opacity: 1 });
    setBusy(false);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => !busy && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        width: containerW,
        height: containerH,
        cursor: busy ? "default" : "pointer",
        userSelect: "none",
        flexShrink: 0,
      }}
    >
      {/* ── Body / head ─────────────────────────────── z-index 2 */}
      <motion.div
        animate={bodyControls}
        style={{
          position: "absolute",
          bottom: bodyBottom,
          left: "50%",
          x: "-50%",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Bob animation wrapper */}
        <motion.div
          animate={
            busy
              ? { y: 0 }
              : hovered
              ? { y: [0, -bobHoverY, 0], transition: { duration: bobHoverT, repeat: Infinity, ease: "easeInOut" } }
              : { y: [0, -bobIdleY, 0], transition: { duration: bobIdleT,  repeat: Infinity, ease: "easeInOut" } }
          }
          style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          {bodyErr ? (
            <div style={{ width: bodyW * 0.7, height: bodyW * 0.7, borderRadius: "50%", background: "var(--color-brown)" }} />
          ) : (
            <Image
              src={member.bodyImage}
              alt={member.name}
              width={bodyW}
              height={bodyH}
              style={{ objectFit: "contain", display: "block" }}
              onError={() => setBodyErr(true)}
            />
          )}
          <p className="font-mclaren text-center" style={{ fontSize: 11, color: "var(--color-brown)", marginTop: 3, whiteSpace: "nowrap" }}>
            {member.name}
          </p>
        </motion.div>
      </motion.div>

      {/* ── Hands ───────────────────────────────────── z-index 4 */}
      <motion.div
        animate={handsControls}
        style={{
          position: "absolute",
          bottom: handsBottom,
          left: "50%",
          x: "-50%",
          zIndex: 4,
        }}
      >
        {handsErr ? (
          <div style={{ display: "flex", gap: 26, justifyContent: "center" }}>
            {[0, 1].map((i) => (
              <div key={i} style={{ width: handsW * 0.27, height: handsH, borderRadius: "10px 10px 5px 5px", background: "var(--color-brown)" }} />
            ))}
          </div>
        ) : (
          <Image
            src={member.handsImage}
            alt=""
            width={handsW}
            height={handsH}
            style={{ objectFit: "contain", display: "block" }}
            onError={() => setHandsErr(true)}
          />
        )}
      </motion.div>
    </div>
  );
}
