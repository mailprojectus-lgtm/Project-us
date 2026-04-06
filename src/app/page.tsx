"use client";

import { useState, useEffect } from "react";
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
//   BAR_HEIGHT      height of the #C2BDBD ledge (always visible)
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

const NAME_H     = 20; // approx height of name label + gap above image
const CONTAINER_W = Math.max(HANDS_W, BODY_W) + 10;

// How high (px above screen bottom) the tallest visible mascot element reaches
const mascotVisibleH = Math.max(
  BODY_BOTTOM + BODY_H + NAME_H,   // body top including name label above
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

export default function Home() {
  // ── Intro sequence ─────────────────────────────────────────────────────────
  const [introPhase, setIntroPhase] = useState<0 | 1 | 2>(0);
  const [revealing,  setRevealing]  = useState(false); // arrow animation phase
  const [revealed,   setRevealed]   = useState(false);
  // Card / label appearances
  const [squeakOn, setSqueakOn]     = useState(false);
  const [bilionOn, setBilionOn]     = useState(false);
  const [nextOn,   setNextOn]       = useState(false);

  // ── Modals / panels ────────────────────────────────────────────────────────
  const [contactOpen,  setContactOpen]  = useState(false);
  const [activePanel,  setActivePanel]  = useState<ActivePanel>(null);
  const [activeProfile, setActiveProfile] = useState<TeamMember | null>(null);

  // ── Mascot animation controls (lifted so body/hands can be in separate z layers) ──
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

  // ── Auto-advance intro ─────────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase(1), 1050);
    const t2 = setTimeout(() => setIntroPhase(2), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // ── Reveal handler ─────────────────────────────────────────────────────────
  // Phase 1 (0–500ms): arrow animates — border fades, color dims
  // Phase 2 (500ms+):  revealed flips — title morphs, spine grows, items appear
  const handleReveal = () => {
    if (revealed || revealing) return;
    setRevealing(true);
    setTimeout(() => {
      setRevealed(true);
      setTimeout(() => setSqueakOn(true),   600);
      setTimeout(() => setBilionOn(true),  1050);
      setTimeout(() => setNextOn(true),    1500);
    }, 500);
  };

  // ── Mascot click ───────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function handleMascotClick(
    member: TeamMember,
    bodyAnim: ReturnType<typeof useAnimation>,
    handsAnim: ReturnType<typeof useAnimation>,
    setBusy: (v: boolean) => void
  ) {
    setBusy(true);
    // Hands fade fast; body bounces up a tiny bit then drops off-screen
    handsAnim.start({ opacity: 0, transition: { duration: 0.15, ease: "easeOut" } });
    await bodyAnim.start({
      y: [0, -14, 440],
      transition: { duration: 0.62, times: [0, 0.14, 1], ease: ["easeOut", "easeIn"] },
    });
    setActiveProfile(member);
    // mascot stays dropped — reset happens when profile is closed
  }


  return (
    <main
      style={{
        height: "100dvh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        paddingTop: 68,
        paddingBottom: mascotVisibleH,
        background: "var(--color-bg)",
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
              {/* Title — layoutId morphs it to compact position on reveal */}
              <motion.h1
                layout
                layoutId="site-title"
                className="font-mclaren"
                style={{ fontSize: "clamp(38px, 5.5vw, 76px)", color: "var(--color-brown)", lineHeight: 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", layout: { type: "spring", stiffness: 55, damping: 18 } }}
              >
                Project US
              </motion.h1>

              {/* Subtitle — exits when revealing starts */}
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
                    transition={{ layout: { type: "spring", stiffness: 55, damping: 18 } }}
                    exit={{ opacity: 0, transition: { duration: 0.22 } }}
                  >
                    {[
                      "What if there was a team of skilled people that worked and focused only on what truly matters:",
                      "the people, the connection, us.",
                    ].map((line, li) => {
                      const offset = li === 0 ? 0 : 15;
                      return (
                        <span key={li} style={{ display: "block" }}>
                          {line.split(" ").map((word, i) => (
                            <motion.span
                              key={i}
                              style={{ display: "inline-block", marginRight: "0.28em", overflow: "hidden" }}
                              initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                              transition={{ duration: 0.38, delay: (offset + i) * 0.028, ease: "easeOut" }}
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

              {/* Arrow — border and color animate when revealing starts, then fades with intro */}
              <motion.button
                onClick={handleReveal}
                aria-label="Explore"
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{
                  opacity: introPhase >= 2 ? 1 : 0,
                  scale: revealing ? 0.88 : introPhase >= 2 ? 1 : 0.75,
                }}
                whileHover={introPhase >= 2 && !revealing ? { scale: 1.1 } : {}}
                whileTap={introPhase >= 2 && !revealing ? { scale: 0.92 } : {}}
                transition={{ duration: 0.35 }}
                style={{
                  marginTop: "clamp(28px, 4.5vh, 52px)",
                  width: 52, height: 52,
                  borderRadius: "50%",
                  border: revealing ? "2px solid transparent" : "2px solid var(--color-brown)",
                  background: "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: introPhase >= 2 && !revealing ? "pointer" : "default",
                  color: revealing ? "rgba(61,33,29,0.28)" : "var(--color-brown)",
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
              style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center" }}
            >
              {/* Compact title — layoutId morphs seamlessly from large intro title */}
              <motion.h1
                layoutId="site-title"
                className="font-mclaren"
                style={{
                  fontSize: "clamp(22px, 3vw, 42px)",
                  color: "var(--color-brown)",
                  lineHeight: 1,
                  flexShrink: 0,
                  paddingTop: "clamp(8px, 1.5vh, 14px)",
                }}
              >
                Project US
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
                    background: "rgba(61,33,29,0.28)",
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
                  <path d="M0 0L4.5 6L9 0" fill="rgba(61,33,29,0.28)" />
                </motion.svg>
                {/* Exclamation mark */}
                <motion.span
                  className="font-mclaren"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.72, duration: 0.4 }}
                  style={{
                    fontSize: "clamp(12px, 1.3vw, 17px)",
                    color: "rgba(61,33,29,0.30)",
                    letterSpacing: "0.04em",
                    marginTop: 5,
                    lineHeight: 1,
                  }}
                >
                  ?
                </motion.span>
              </div>

              {/* Project items — centered over the spine */}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "clamp(6px, 1.2vh, 12px)", pointerEvents: "none" }}>
                {([
                  { id: "squeak" as const, label: "01. Squeak",        visible: squeakOn, data: squeak, side: "left"  as const },
                  { id: "bilion" as const, label: "02. Bilion Contest", visible: bilionOn, data: bilion, side: "right" as const },
                ]).map((item) => (
                  <AnimatePresence key={item.label}>
                    {item.visible && (
                      <motion.div
                        key={item.label}
                        style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "auto", zIndex: 21 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.45 }}
                      >
                        {/* Label button */}
                        <motion.button
                          onClick={() => setActivePanel(activePanel === item.id ? null : item.id)}
                          className="font-mclaren"
                          animate={{
                            scale: activePanel === item.id
                              ? 1.07
                              : activePanel !== null
                                ? 0.91
                                : 1,
                          }}
                          whileTap={{ x: [0, -4, 4, -3, 2, 0], transition: { duration: 0.28 } }}
                          transition={{ type: "spring", stiffness: 340, damping: 22 }}
                          style={{
                            background: "var(--color-bg)",
                            border: "none",
                            fontSize: "clamp(12px, 1.3vw, 17px)",
                            color: activePanel !== null && activePanel !== item.id
                              ? "rgba(61,33,29,0.38)"
                              : "var(--color-brown)",
                            cursor: "pointer",
                            letterSpacing: "0.04em",
                            padding: "0 10px",
                            fontWeight: activePanel === item.id ? 700 : 400,
                            transition: "color 0.2s ease",
                          }}
                        >
                          {item.label}
                        </motion.button>

                        {/* Floating dashed bubble */}
                        <AnimatePresence>
                          {activePanel === item.id && (
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
                                border: "1.5px dashed rgba(61,33,29,0.28)",
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
                              {/* Connector dot — on the bubble border edge, vertically centered */}
                              <div style={{
                                position: "absolute",
                                top: "50%",
                                transform: "translateY(-50%)",
                                ...(item.side === "left" ? { right: -5 } : { left: -5 }),
                                width: 8, height: 8,
                                borderRadius: "50%",
                                background: "var(--color-white)",
                                border: "1.5px dashed rgba(61,33,29,0.28)",
                              }} />

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
                                    borderBottom: "1px solid rgba(61,33,29,0.28)",
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
                          )}
                        </AnimatePresence>
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
          GRAY BAR — always visible, even before reveal (z-index: 32)
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          height: BAR_HEIGHT,
          background: "#C2BDBD",
          zIndex: 32,
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════════
          BODY LAYER — z-index 30 (below bar so bar visually covers body base)
          Clickable. Fades in after reveal.
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
                display: "flex", gap: MASCOT_GAP,
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
          HANDS LAYER — z-index 34 (above bar). Not interactive.
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
                display: "flex", gap: MASCOT_GAP,
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
                      style={{ objectFit: "contain", display: "block" }}
                      onError={() => markErr("vanjaHands")} />
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
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
