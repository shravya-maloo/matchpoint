"use client";

import { useEffect, useRef, useState } from "react";

type Ball = {
  id: number;
  size: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
};

const REPEL_RADIUS = 130;
const REPEL_STRENGTH = 55;
const EASE = 0.12;

export default function TennisBalls({ count = 8 }: { count?: number }) {
  const [balls, setBalls] = useState<Ball[] | null>(null);
  const outerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const visualRefs = useRef<(HTMLDivElement | null)[]>([]);
  const offsets = useRef<{ x: number; y: number }[]>([]);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Generated client-side so server and client markup match (avoids a
    // hydration mismatch from random values computed at module load).
    setBalls(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 22 + Math.random() * 30,
        // Keep clear of the header/nav zone (roughly the top quarter of the
        // viewport) so a drifting ball never sits on top of a tab button —
        // it's decorative, but pointer-events:none doesn't help legibility.
        top: 24 + Math.random() * 72,
        left: Math.random() * 92,
        duration: 11 + Math.random() * 14,
        delay: -Math.random() * 20,
        opacity: 0.4 + Math.random() * 0.35,
      }))
    );
  }, [count]);

  useEffect(() => {
    if (!balls) return;
    offsets.current = balls.map(() => ({ x: 0, y: 0 }));

    function onMove(e: PointerEvent) {
      pointer.current = { x: e.clientX, y: e.clientY };
    }
    function onLeave() {
      pointer.current = null;
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);

    function tick() {
      outerRefs.current.forEach((outer, i) => {
        const visual = visualRefs.current[i];
        if (!outer || !visual) return;

        const rect = outer.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let targetX = 0;
        let targetY = 0;

        if (pointer.current) {
          const dx = cx - pointer.current.x;
          const dy = cy - pointer.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_STRENGTH;
            targetX = (dx / dist) * force;
            targetY = (dy / dist) * force;
          }
        }

        const off = offsets.current[i];
        off.x += (targetX - off.x) * EASE;
        off.y += (targetY - off.y) * EASE;
        visual.style.transform = `translate(${off.x.toFixed(1)}px, ${off.y.toFixed(1)}px)`;
      });
      rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [balls]);

  if (!balls) return null;

  return (
    <div aria-hidden="true">
      {balls.map((b, i) => (
        <div
          key={b.id}
          ref={(el) => {
            outerRefs.current[i] = el;
          }}
          className="tennis-ball-drift"
          style={{
            width: b.size,
            height: b.size,
            top: `${b.top}%`,
            left: `${b.left}%`,
            opacity: b.opacity,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        >
          <div
            ref={(el) => {
              visualRefs.current[i] = el;
            }}
            className="tennis-ball-visual"
          >
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <defs>
                <radialGradient id={`ballGrad${b.id}`} cx="35%" cy="30%" r="75%">
                  <stop offset="0%" stopColor="#eaffa0" />
                  <stop offset="55%" stopColor="var(--accent)" />
                  <stop offset="100%" stopColor="var(--accent-dark)" />
                </radialGradient>
              </defs>
              <circle cx="50" cy="50" r="47" fill={`url(#ballGrad${b.id})`} />
              <path
                d="M 24 6 C 50 26, 50 74, 24 94"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="4"
                fill="none"
              />
              <path
                d="M 76 6 C 50 26, 50 74, 76 94"
                stroke="rgba(255,255,255,0.65)"
                strokeWidth="4"
                fill="none"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
