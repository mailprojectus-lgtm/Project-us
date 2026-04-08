"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import Image from "next/image";
import NavBar from "@/components/NavBar";
import ContactModal from "@/components/ContactModal";
import TeamProfile from "@/components/TeamProfile";
import { andrea } from "@/data/team/andrea";
import { vanja } from "@/data/team/vanja";
import { squeak } from "@/data/projects/squeak";
import { bilion } from "@/data/projects/bilion";

// ─────────────────────────────────────────────────────────────────────────────
// MASCOT POSITIONING — all values in px, measured from the screen bottom.
//
//   BAR_HEIGHT      height of the ledge (always visible)
//   HANDS_BOTTOM    bottom edge of hands image from screen bottom
//   HANDS_W / H     rendered size of hands image
//   BODY_BOTTOM     bottom edge of body image from screen bottom (negative = extends below)
//   BODY_W / H      rendered size of body image
//   MASCOT_GAP      horizontal gap between the two mascots
//
// BOB ANIMATION
//   BOB_IDLE_Y / T    idle bob: amplitude px / cycle seconds
//   BOB_HOVER_Y / T   hover bob: amplitude px / cycle seconds
// ─────────────────────────────────────────────────────────────────────────────
const BAR_HEIGHT    = 12;
const HANDS_BOTTOM  = 6;
const HANDS_W       = 110;
const HANDS_H       = 55;
const BODY_BOTTOM   = -50;
const BODY_W        = 90;
const BODY_H        = 150;
const MASCOT_GAP    = 80;

const BOB_IDLE_Y    = 5;
const BOB_IDLE_T    = 2;
const BOB_HOVER_Y   = 6;
const BOB_HOVER_T   = 1;
// ─────────────────────────────────────────────────────────────────────────────

const NAME_H      = 20;
const CONTAINER_W = Math.max(HANDS_W, BODY_W) + 10;

const mascotVisibleH = Math.max(
  BODY_BOTTOM + BODY_H + NAME_H,
  HANDS_BOTTOM + HANDS_H,
  BAR_HEIGHT
) + 24;

type ActivePanel = "squeak" | "bilion" | null;
type TeamMember = typeof andrea;

// ── Bob animate helper ────────────────────────────────────────────────────────
function bobAnim(hovered: boolean, busy: boolean) {
  if (busy) return { y: 0 };
  if (hovered)
    return { y: [0, -BOB_HOVER_Y, 0] as number[], transition: { duration: BOB_HOVER_T, repeat: Infinity, ease: "easeInOut" as const } };
  return { y: [0, -BOB_IDLE_Y, 0] as number[], transition: { duration: BOB_IDLE_T, repeat: Infinity, ease: "easeInOut" as const } };
}

// ── Label float animation (each item gets a slightly different feel) ──────────
function labelFloat(index: number) {
  return {
    animate: { y: [0, -(3 + index * 1.5), 0, (1 + index * 0.5), 0] as number[] },
    transition: {
      duration: 3.6 + index * 0.9,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay: index * 1.1,
    },
  };
}

export default function Home() {
  // ── Intro sequence ─────────────────────────────────────────────────────────
  const [introPhase, setIntroPhase] = useState<0 | 1 | 2>(0);
  const [revealing,  setRevealing]  = useState(false);
  const [revealed,   setRevealed]   = useState(false);
  const [squeakOn, setSqueakOn]     = useState(false);
  const [bilionOn, setBilionOn]     = useState(false);
  const [nextOn,   setNextOn]       = useState(false);
  const revealingRef                = useRef(false); // prevents double-fire
  const [isMobile,  setIsMobile]   = useState(false);

  // ── Intro title: sequence entry-slide then float ───────────────────────────
  const introTitleAnim = useAnimation();
  useEffect(() => {
    (async () => {
      await introTitleAnim.start({
        opacity: 1, y: 0,
        transition: { duration: 0.88, ease: [0.25, 0, 0.35, 1] },
      });
      introTitleAnim.start({
        y: [0, -5, 0],
        transition: { duration: 5.5, repeat: Infinity, ease: "easeInOut" },
      });
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Modals / panels ────────────────────────────────────────────────────────
  const [contactOpen,   setContactOpen]   = useState(false);
  const [activePanel,   setActivePanel]   = useState<ActivePanel>(null);
  const [activeProfile, setActiveProfile] = useState<TeamMember | null>(null);

  // ── Mascot animation controls ──────────────────────────────────────────────
  const andreBodyAnim  = useAnimation();
  const andreHandsAnim = useAnimation();
  const vanjaBodyAnim  = useAnimation();
  const vanjaHandsAnim = useAnimation();

  const [andreHovered, setAndreHovered] = useState(false);
  const [vanjaHovered, setVanjaHovered] = useState(false);
  const [andreBusy,    setAndreBusy]    = useState(false);
  const [vanjaBusy,    setVanjaBusy]    = useState(false);

  // ── Image error states ─────────────────────────────────────────────────────
  const [imgErr, setImgErr] = useState({ andreBody: false, andreHands: false, vanjaBody: false, vanjaHands: false });
  const markErr = (key: keyof typeof imgErr) => setImgErr(prev => ({ ...prev, [key]: true }));

  // ── Mobile detection ───────────────────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Auto-advance intro ─────────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase(1), 1050);
    const t2 = setTimeout(() => setIntroPhase(2), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Reveal handler — 3-stage choreography ────────────────────────────────
  const handleReveal = async () => {
    if (revealed || revealingRef.current) return;
    revealingRef.current = true;

    // Stage 1 — title fades out together with everything else on page 1
    introTitleAnim.start({
      opacity: 0,
      y: -20,
      transition: { duration: 0.48, ease: [0.4, 0, 1, 1] },
    });

    // Stage 2 — 150 ms later, subtitle + arrow begin their stagger-exit
    await new Promise<void>(r => setTimeout(r, 150));
    setRevealing(true);

    // Stage 3 — clean beat after page 1 is fully gone, then page 2 fades in
    await new Promise<void>(r => setTimeout(r, 700));
    setRevealed(true);
    setTimeout(() => setSqueakOn(true),   680);
    setTimeout(() => setBilionOn(true),  1080);
    setTimeout(() => setNextOn(true),    1480);
  };

  // ── Mascot click ───────────────────────────────────────────────────────────
  async function handleMascotClick(
    member: TeamMember,
    bodyAnim: ReturnType<typeof useAnimation>,
    handsAnim: ReturnType<typeof useAnimation>,
    setBusy: (v: boolean) => void
  ) {
    setBusy(true);
    handsAnim.start({ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } });
    await bodyAnim.start({
      y: [0, -14, 440],
      transition: { duration: 0.62, times: [0, 0.14, 1], ease: ["easeOut", "easeIn"] },
    });
    setActiveProfile(member);
  }

  // ── Mobile-aware derived values ────────────────────────────────────────────
  const effectiveGap = isMobile ? 44 : MASCOT_GAP;
  const activeProjectData = activePanel
    ? [{ id: "squeak" as const, data: squeak }, { id: "bilion" as const, data: bilion }]
        .find(p => p.id === activePanel)?.data ?? null
    : null;

  return (
    <main
      style={{
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        paddingTop: 68,
        paddingBottom: mascotVisibleH,
        background: "transparent",
        position: "relative",
      }}
    >
      <NavBar onContactClick={() => setContactOpen(true)} revealed={revealed} />

      {/* ── Shared content area ─────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>

        {/* ── INTRO ─────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {!revealed && (
            <motion.div
              key="intro"
              style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                paddingTop: "clamp(80px, 14vh, 140px)",
              }}
            >
              {/* Title */}
              <motion.h1
                layout
                className="font-mclaren"
                style={{ fontSize: "clamp(38px, 5.5vw, 76px)", color: "var(--color-brown)", lineHeight: 1 }}
                initial={{ opacity: 0, y: 20 }}
                animate={introTitleAnim}
                transition={{ layout: { type: "spring", stiffness: 55, damping: 18 } }}
              >
                Project us
              </motion.h1>

              {/* Subtitle */}
              <AnimatePresence>
                {introPhase >= 1 && !revealing && (
                  <motion.p
                    layout
                    key="sub"
                    className="font-walter text-center"
                    style={{
                      fontSize: "clamp(13px, 1.7vw, 20px)",
                      color: "var(--color-gray)",
                      maxWidth: "min(540px, 80vw)",
                      marginTop: "clamp(22px, 4vh, 42px)",
                      lineHeight: 1.55,
                    }}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={{
                      hidden: {},
                      visible: {},
                      exit: { transition: { staggerChildren: 0.016, staggerDirection: -1 } },
                    }}
                    transition={{ layout: { type: "spring", stiffness: 55, damping: 18 } }}
                  >
                    {[
                      "What if there was a team of skilled people that",
                      "worked and focused only on what truly matters:",
                      "the people, the connection, us.",
                    ].map((line, li) => {
                      // cumulative word counts: line0=10, line1=8, line2=5
                      const offsets = [0, 10, 18];
                      const offset = offsets[li] ?? 0;
                      return (
                        <span key={li} style={{ display: "block" }}>
                          {line.split(" ").map((word, i) => (
                            <motion.span
                              key={i}
                              style={{ display: "inline-block", marginRight: "0.28em", overflow: "hidden" }}
                              variants={{
                                hidden: { opacity: 0, y: 10, filter: "blur(6px)" },
                                visible: { opacity: 1, y: 0, filter: "blur(0px)" },
                                exit: { opacity: 0, y: -8, filter: "blur(5px)", transition: { duration: 0.26, ease: [0.4, 0, 1, 1] } },
                              }}
                              transition={{ duration: 0.44, delay: (offset + i) * 0.030 + 0.15, ease: [0.25, 0, 0.35, 1] }}
                            >
                              {word}
                            </motion.span>
                          ))}
                        </span>
                      );
                    })}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Arrow */}
              <motion.button
                onClick={handleReveal}
                aria-label="Explore"
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{
                  opacity: revealing ? 0 : introPhase >= 2 ? 1 : 0,
                  scale: revealing ? 0.88 : introPhase >= 2 ? 1 : 0.75,
                  y: revealing ? -12 : introPhase >= 2 ? [0, -4, 0] : 0,
                  filter: revealing ? "blur(6px)" : "blur(0px)",
                }}
                whileHover={introPhase >= 2 && !revealing ? { scale: 1.1 } : {}}
                whileTap={introPhase >= 2 && !revealing ? { scale: 0.92 } : {}}
                transition={{
                  opacity: { duration: revealing ? 0.38 : 0.42, ease: "easeOut" },
                  scale: { duration: 0.42, ease: "easeOut" },
                  y: revealing
                    ? { duration: 0.38, ease: "easeOut" }
                    : { duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                  filter: { duration: 0.38, ease: "easeOut" },
                }}
                style={{
                  marginTop: "clamp(28px, 4.5vh, 52px)",
                  width: 52, height: 52,
                  borderRadius: "50%",
                  border: revealing ? "2px solid transparent" : "2px solid var(--color-brown)",
                  background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: introPhase >= 2 && !revealing ? "pointer" : "default",
                  color: revealing ? "var(--color-spine)" : "var(--color-brown)",
                  flexShrink: 0,
                  pointerEvents: introPhase >= 2 && !revealing ? "auto" : "none",
                  transition: "border-color 0.38s ease, color 0.38s ease",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3.5 6.5L9 12l5.5-5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── REVEALED ──────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {revealed && (
            <motion.div
              key="revealed"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              {/* Compact title */}
              <motion.h1
                className="font-mclaren"
                style={{
                  fontSize: "clamp(22px, 3vw, 42px)",
                  color: "var(--color-brown)",
                  lineHeight: 1,
                  flexShrink: 0,
                  marginTop: "clamp(8px, 1.5vh, 14px)",
                }}
              >
                Project us
              </motion.h1>

              {/* Spine container — line + arrowhead + exclamation */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "clamp(16px, 3vh, 28px)" }}>
                {/* Line */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 48, damping: 14, delay: 0.08 }}
                  style={{
                    flex: 1,
                    width: 1.5,
                    background: "var(--color-spine)",
                    borderRadius: "2px 2px 0 0",
                    transformOrigin: "top center",
                  }}
                />
                {/* Arrowhead */}
                <motion.svg
                  width="9" height="6" viewBox="0 0 9 6" fill="none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55, duration: 0.35 }}
                >
                  <path d="M0 0L4.5 6L9 0" style={{ fill: "var(--color-spine)" }} />
                </motion.svg>
                {/* ? mark */}
                <motion.span
                  className="font-mclaren"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.72, duration: 0.4 }}
                  style={{
                    fontSize: "clamp(12px, 1.3vw, 17px)",
                    color: "var(--color-spine)",
                    letterSpacing: "0.04em",
                    marginTop: 5,
                    lineHeight: 1,
                  }}
                >
                  next?
                </motion.span>
              </div>

              {/* Click-away overlay — closes active panel when clicking outside */}
              {activePanel !== null && (
                <div
                  onClick={() => setActivePanel(null)}
                  style={{ position: "absolute", inset: 0, zIndex: 19, cursor: "default" }}
                />
              )}

              {/* Project items — centered over the spine */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "clamp(18px, 3.5vh, 36px)", pointerEvents: "none" }}>
                {([
                  { id: "squeak" as const, label: "01. Squeak",        visible: squeakOn, data: squeak, side: "left"  as const },
                  { id: "bilion" as const, label: "02. Bilion Contest", visible: bilionOn, data: bilion, side: "right" as const },
                ]).map((item, index) => (
                  <AnimatePresence key={item.label}>
                    {item.visible && (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: 1,
                          x: index === 1 ? (activePanel === "squeak" ? 10 : 0) : 0,
                        }}
                        transition={{
                          opacity: { duration: 0.45 },
                          x: { type: "spring", stiffness: 320, damping: 28 },
                        }}
                      >
                        {/* Float wrapper — gentle continuous bob */}
                        <motion.div
                          style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "auto", zIndex: 21 }}
                          animate={labelFloat(index).animate}
                          transition={labelFloat(index).transition}
                        >
                          {/* Label button */}
                          <motion.button
                            onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
                            className="font-mclaren project-label-btn"
                            animate={{
                              scale: activePanel === item.id
                                ? 1.07
                                : activePanel !== null
                                  ? 0.91
                                  : 1,
                            }}
                            whileTap={{ y: [0, -4, 3, -3, 2, 0], transition: { duration: 0.28 } }}
                            transition={{ type: "spring", stiffness: 340, damping: 22 }}
                            style={{
                              background: "transparent",
                              border: "none",
                              textDecoration: "none",
                              fontSize: "clamp(12px, 1.3vw, 17px)",
                              color: activePanel !== null && activePanel !== item.id
                                ? "var(--color-spine-dim)"
                                : "var(--color-brown)",
                              cursor: "pointer",
                              letterSpacing: "0.04em",
                              padding: "0 5px",
                              fontWeight: activePanel === item.id ? 700 : 400,
                              transition: "color 0.35s ease, background-color 0.35s ease",
                            }}
                          >
                            {item.label}
                          </motion.button>

                          {/* Floating dashed bubble — desktop only (mobile uses centered overlay) */}
                          <AnimatePresence>
                            {!isMobile && activePanel === item.id && (
                              <motion.div
                                style={{
                                  position: "absolute",
                                  ...(item.side === "left"
                                    ? { right: "calc(100% + 18px)" }
                                    : { left:  "calc(100% + 18px)" }),
                                  top: "50%",
                                  translateY: "-50%",
                                  width: 252,
                                  background: "var(--color-white)",
                                  border: "1.5px dashed var(--color-spine)",
                                  borderRadius: 18,
                                  padding: "13px 15px 14px",
                                  zIndex: 22,
                                  pointerEvents: "auto",
                                }}
                                initial={{ opacity: 0, scale: 0.84, x: item.side === "left" ? 14 : -14 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{    opacity: 0, scale: 0.84, x: item.side === "left" ? 14 : -14 }}
                                transition={{ type: "spring", stiffness: 320, damping: 22 }}
                              >
                                {/* Connector dot — outside the float, stays fixed on the border */}
                                <div style={{
                                  position: "absolute",
                                  top: "50%",
                                  transform: "translateY(-50%)",
                                  ...(item.side === "left" ? { right: -6 } : { left: -6 }),
                                  width: 8, height: 8,
                                  borderRadius: "50%",
                                  background: "var(--color-white)",
                                  border: "1.5px dashed var(--color-spine)",
                                }} />

                                {/* Inner float for the bubble content */}
                                <motion.div
                                  animate={{ y: [0, -2.5, 0, 1.5, 0] }}
                                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                                >

                                  {/* Title row + visit link */}
                                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 8 }}>
                                    <p className="font-mclaren" style={{ fontSize: "clamp(12px, 1.3vw, 17px)", color: "var(--color-brown)", lineHeight: 1.2 }}>
                                      {item.data.title}
                                    </p>
                                    <a
                                      href={item.data.ctaUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mclaren"
                                      style={{
                                        fontSize: 11,
                                        color: "var(--color-brown)",
                                        textDecoration: "none",
                                        borderBottom: "1px solid var(--color-spine)",
                                        paddingBottom: 1,
                                        opacity: 0.55,
                                        flexShrink: 0,
                                        transition: "opacity 0.15s ease",
                                        marginTop: 2,
                                      }}
                                      onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
                                      onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.55")}
                                    >
                                      visit →
                                    </a>
                                  </div>
                                  <p className="font-walter" style={{ fontSize: "clamp(11px, 1.1vw, 14px)", color: "var(--color-gray)", lineHeight: 1.5 }}>
                                    {item.data.description}
                                  </p>
                                </motion.div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          GRAY BAR — always visible (z-index: 32)
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: BAR_HEIGHT,
          background: "var(--color-bar)",
          zIndex: 32,
          transition: "background 0.35s ease",
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          BODY LAYER — z-index 30
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              height: mascotVisibleH,
              zIndex: 30,
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div
              style={{
                position: "absolute", bottom: 0, left: "50%",
                transform: "translateX(-50%)",
                display: "flex", gap: effectiveGap,
                pointerEvents: "auto",
              }}
            >
              {/* ── Andrea body ── */}
              <div style={{ position: "relative", width: CONTAINER_W, height: mascotVisibleH }}>
                <motion.div
                  animate={andreBodyAnim}
                  onClick={() => !andreBusy && handleMascotClick(andrea, andreBodyAnim, andreHandsAnim, setAndreBusy)}
                  onMouseEnter={() => !andreBusy && setAndreHovered(true)}
                  onMouseLeave={() => setAndreHovered(false)}
                  style={{ position: "absolute", bottom: BODY_BOTTOM, left: "50%", x: "-50%", cursor: "pointer", zIndex: 1 }}
                >
                  <motion.div
                    animate={bobAnim(andreHovered, andreBusy)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                  >
                    <p className="font-mclaren" style={{ fontSize: 11, color: "var(--color-brown)", marginBottom: 3, whiteSpace: "nowrap" }}>
                      {andrea.name}
                    </p>
                    {imgErr.andreBody ? (
                      <div style={{ width: BODY_W * 0.7, height: BODY_W * 0.7, borderRadius: "50%", background: "var(--color-brown)" }} />
                    ) : (
                      <Image src={andrea.bodyImage} alt={andrea.name} width={BODY_W} height={BODY_H}
                        style={{ objectFit: "contain", display: "block" }}
                        onError={() => markErr("andreBody")} />
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* ── Vanja body ── */}
              <div style={{ position: "relative", width: CONTAINER_W, height: mascotVisibleH }}>
                <motion.div
                  animate={vanjaBodyAnim}
                  onClick={() => !vanjaBusy && handleMascotClick(vanja, vanjaBodyAnim, vanjaHandsAnim, setVanjaBusy)}
                  onMouseEnter={() => !vanjaBusy && setVanjaHovered(true)}
                  onMouseLeave={() => setVanjaHovered(false)}
                  style={{ position: "absolute", bottom: BODY_BOTTOM, left: "50%", x: "-50%", cursor: "pointer", zIndex: 1 }}
                >
                  <motion.div
                    animate={bobAnim(vanjaHovered, vanjaBusy)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
                  >
                    <p className="font-mclaren" style={{ fontSize: 11, color: "var(--color-brown)", marginBottom: 3, whiteSpace: "nowrap" }}>
                      {vanja.name}
                    </p>
                    {imgErr.vanjaBody ? (
                      <div style={{ width: BODY_W * 0.7, height: BODY_W * 0.7, borderRadius: "50%", background: "var(--color-brown)" }} />
                    ) : (
                      <Image src={vanja.bodyImage} alt={vanja.name} width={BODY_W} height={BODY_H}
                        style={{ objectFit: "contain", display: "block" }}
                        onError={() => markErr("vanjaBody")} />
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          HANDS LAYER — z-index 34 (above bar)
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            style={{
              position: "fixed", bottom: 0, left: 0, right: 0,
              height: mascotVisibleH,
              zIndex: 34,
              pointerEvents: "none",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div
              style={{
                position: "absolute", bottom: 0, left: "50%",
                transform: "translateX(-50%)",
                display: "flex", gap: effectiveGap,
              }}
            >
              {/* ── Andrea hands ── */}
              <div style={{ position: "relative", width: CONTAINER_W, height: mascotVisibleH }}>
                <motion.div
                  animate={andreHandsAnim}
                  style={{ position: "absolute", bottom: HANDS_BOTTOM, left: "50%", x: "-50%" }}
                >
                  {imgErr.andreHands ? (
                    <div style={{ display: "flex", gap: 26 }}>
                      {[0, 1].map(i => <div key={i} style={{ width: HANDS_W * 0.27, height: HANDS_H, borderRadius: "10px 10px 5px 5px", background: "var(--color-brown)" }} />)}
                    </div>
                  ) : (
                    <Image src={andrea.handsImage} alt="" width={HANDS_W} height={HANDS_H}
                      unoptimized
                      style={{ objectFit: "contain", display: "block" }}
                      onError={() => markErr("andreHands")} />
                  )}
                </motion.div>
              </div>

              {/* ── Vanja hands ── */}
              <div style={{ position: "relative", width: CONTAINER_W, height: mascotVisibleH }}>
                <motion.div
                  animate={vanjaHandsAnim}
                  style={{ position: "absolute", bottom: HANDS_BOTTOM, left: "50%", x: "-50%" }}
                >
                  {imgErr.vanjaHands ? (
                    <div style={{ display: "flex", gap: 26 }}>
                      {[0, 1].map(i => <div key={i} style={{ width: HANDS_W * 0.27, height: HANDS_H, borderRadius: "10px 10px 5px 5px", background: "var(--color-brown)" }} />)}
                    </div>
                  ) : (
                    <Image src={vanja.handsImage} alt="" width={HANDS_W} height={HANDS_H}
                      unoptimized
                      style={{ objectFit: "contain", display: "block" }}
                      onError={() => markErr("vanjaHands")} />
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile project info overlay ──────────────────────────────────────── */}
      <AnimatePresence>
        {isMobile && activePanel !== null && activeProjectData && (
          <div
            style={{
              position: "fixed", inset: 0,
              zIndex: 42,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 28px",
              pointerEvents: "none",
            }}
          >
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, scale: 0.88, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 18 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              style={{
                position: "relative",
                background: "var(--color-white)",
                border: "1.5px dashed var(--color-spine)",
                borderRadius: 22,
                padding: "20px 20px 22px",
                width: "min(300px, 100%)",
                pointerEvents: "auto",
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close */}
              <button
                onClick={() => setActivePanel(null)}
                aria-label="Close"
                style={{
                  position: "absolute", top: 12, right: 14,
                  width: 26, height: 26,
                  border: "none", background: "none",
                  cursor: "pointer",
                  color: "var(--color-gray)",
                  fontSize: 20, lineHeight: 1,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ×
              </button>

              {/* Title + visit */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 10, paddingRight: 20 }}>
                <p className="font-mclaren" style={{ fontSize: 16, color: "var(--color-brown)", lineHeight: 1.2 }}>
                  {activeProjectData.title}
                </p>
                <a
                  href={activeProjectData.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mclaren"
                  style={{
                    fontSize: 11,
                    color: "var(--color-brown)",
                    textDecoration: "none",
                    borderBottom: "1px solid var(--color-spine)",
                    paddingBottom: 1,
                    opacity: 0.55,
                    flexShrink: 0,
                    marginTop: 3,
                  }}
                >
                  visit →
                </a>
              </div>

              {/* Description */}
              <p className="font-walter" style={{ fontSize: 13, color: "var(--color-gray)", lineHeight: 1.55 }}>
                {activeProjectData.description}
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
      <TeamProfile
        member={activeProfile}
        onClose={() => {
          if (activeProfile?.id === "andrea") {
            andreBodyAnim.start({ y: 0, transition: { duration: 0.5, ease: "easeOut" } });
            andreHandsAnim.start({ opacity: 1, transition: { duration: 0.3 } });
            setAndreBusy(false);
          } else if (activeProfile?.id === "vanja") {
            vanjaBodyAnim.start({ y: 0, transition: { duration: 0.5, ease: "easeOut" } });
            vanjaHandsAnim.start({ opacity: 1, transition: { duration: 0.3 } });
            setVanjaBusy(false);
          }
          setActiveProfile(null);
        }}
      />
    </main>
  );
}
