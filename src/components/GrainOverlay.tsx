"use client";

import { useEffect } from "react";

export default function GrainOverlay() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    const SIZE = 180;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d")!;

    // Pre-generate several grain frames for variety
    const frames: string[] = [];
    for (let f = 0; f < 6; f++) {
      const img = ctx.createImageData(SIZE, SIZE);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 40;
      }
      ctx.putImageData(img, 0, 0);
      frames.push(canvas.toDataURL());
    }

    const overlay = document.getElementById("grain-overlay") as HTMLElement | null;
    if (!overlay) return;

    let frame = 0;
    let lastTick = 0;
    let animId: number;

    const tick = (ts: number) => {
      if (ts - lastTick > 80) {
        lastTick = ts;
        frame = (frame + 1) % frames.length;
        overlay.style.backgroundImage = `url(${frames[frame]})`;
        // Randomise offset so it never looks static
        overlay.style.backgroundPosition = `${(Math.random() * SIZE) | 0}px ${(Math.random() * SIZE) | 0}px`;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div
      id="grain-overlay"
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9990,
        backgroundRepeat: "repeat",
        backgroundSize: "180px 180px",
        opacity: 0.038,
        mixBlendMode: "multiply",
      }}
    />
  );
}
