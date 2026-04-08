"use client";

import { useEffect, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VantaEffect = { destroy: () => void; setOptions: (o: Record<string, unknown>) => void };

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    VANTA?: { FOG: (opts: Record<string, unknown>) => VantaEffect };
    THREE?: unknown;
  }
}

// ── Color palettes ─────────────────────────────────────────────────────────────
const LIGHT = {
  highlightColor: 0xfff8f0,   // warm off-white
  midtoneColor:   0xf0d4bc,   // peachy tan
  lowlightColor:  0xe8ddd2,   // muted cream
  baseColor:      0xf5ede3,   // matches --color-bg light
};

const DARK = {
  highlightColor: 0x231610,
  midtoneColor:   0x20140e,
  lowlightColor:  0x1e130c,
  baseColor:      0x1c1208,
};

function getColors() {
  const html = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = html.classList.contains("dark") || (!html.classList.contains("light") && prefersDark);
  return isDark ? DARK : LIGHT;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

export default function VantaBackground() {
  const elRef    = useRef<HTMLDivElement>(null);
  const effectRef = useRef<VantaEffect | null>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Load Three.js first, then Vanta (order is critical)
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.fog.min.js");
        if (!mounted || !elRef.current || !window.VANTA) return;

        effectRef.current = window.VANTA.FOG({
          el: elRef.current,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200,
          minWidth:  200,
          blurFactor: 0.30,
          speed: 2.60,
          zoom:  2.20,
          ...getColors(),
        });
        // Dark mode: hide Vanta so the flat CSS background colour shows instead
        if (elRef.current) {
          elRef.current.style.opacity = getColors() === DARK ? "0" : "1";
        }
      } catch {
        // CDN failed — silent fallback to CSS background
      }
    };

    init();

    // Fade Vanta in/out on theme switch.
    // Dark mode → opacity 0 (flat static bg). Light mode → opacity 1 (fog visible).
    let prevIsDark = getColors() === DARK;
    let fadeTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new MutationObserver(() => {
      const html = document.documentElement;
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const nowIsDark = html.classList.contains("dark") ||
        (!html.classList.contains("light") && prefersDark);
      if (nowIsDark === prevIsDark) return;
      prevIsDark = nowIsDark;
      const el = elRef.current;
      if (!el) return;
      if (fadeTimer) clearTimeout(fadeTimer);
      el.style.transition = "opacity 0.35s ease";
      if (nowIsDark) {
        // Switching to dark: fade out and stay hidden
        el.style.opacity = "0";
      } else {
        // Switching to light: update colours then fade in
        el.style.opacity = "0";
        fadeTimer = setTimeout(() => {
          effectRef.current?.setOptions(getColors());
          el.style.opacity = "1";
        }, 180);
      }
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mounted = false;
      if (fadeTimer) clearTimeout(fadeTimer);
      effectRef.current?.destroy();
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={elRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
