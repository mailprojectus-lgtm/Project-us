"use client";

import { useState, useRef } from "react";
import { motion, useSpring } from "framer-motion";

interface ProjectCardProps {
  title: string;
  onClick: () => void;
  align?: "left" | "right";
}

export default function ProjectCard({ title, onClick, align = "left" }: ProjectCardProps) {
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  // 3-D tilt springs
  const rotX = useSpring(0, { stiffness: 380, damping: 28 });
  const rotY = useSpring(0, { stiffness: 380, damping: 28 });
  const shadowX = useSpring(14, { stiffness: 380, damping: 28 });
  const shadowY = useSpring(14, { stiffness: 380, damping: 28 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotX.set(-dy * 8);
    rotY.set(dx * 8);
    shadowX.set(14 - dx * 6);
    shadowY.set(14 - dy * 6);
  };

  const handleMouseLeave = () => {
    rotX.set(0);
    rotY.set(0);
    shadowX.set(14);
    shadowY.set(14);
    setHovered(false);
  };

  return (
    <div
      className={`flex ${align === "right" ? "justify-end" : "justify-start"} relative z-10`}
      style={{
        paddingLeft:  align === "left"  ? "clamp(20px, 8%, 100px)" : 0,
        paddingRight: align === "right" ? "clamp(20px, 8%, 100px)" : 0,
      }}
    >
      <motion.button
        ref={cardRef}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => { setPressed(false); }}
        className="font-mclaren"
        style={{
          fontSize:     "clamp(17px, 2.2vw, 30px)",
          color:        "var(--color-brown)",
          background:   "var(--color-white)",
          border:       "4px solid #3D211D",
          borderRadius: "55px",
          padding:      "clamp(10px, 1.2vw, 16px) clamp(20px, 2.8vw, 38px)",
          cursor:       "pointer",
          display:      "block",
          whiteSpace:   "nowrap",
          transformStyle: "preserve-3d",
          perspective:  600,
          rotateX: rotX,
          rotateY: rotY,
          scale: pressed ? 0.95 : hovered ? 1.04 : 1,
          boxShadow: pressed
            ? "4px 4px 2px rgba(0,0,0,0.25)"
            : `var(--shadow-x, 14px) var(--shadow-y, 14px) 4px rgba(0,0,0,0.35)`,
        } as React.CSSProperties}
        transition={{ scale: { type: "spring", stiffness: 500, damping: 28 } }}
      >
        {/* Gloss highlight – subtle top edge shine */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute", inset: 0, borderRadius: "55px",
            background: "linear-gradient(160deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)",
            pointerEvents: "none",
          }}
        />
        {title}
      </motion.button>
    </div>
  );
}
