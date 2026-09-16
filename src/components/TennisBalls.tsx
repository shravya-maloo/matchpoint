"use client";

import { useEffect, useState } from "react";

type Ball = {
  id: number;
  size: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
};

export default function TennisBalls({ count = 7 }: { count?: number }) {
  const [balls, setBalls] = useState<Ball[] | null>(null);

  useEffect(() => {
    // Generated client-side so server and client markup match (avoids a
    // hydration mismatch from random values computed at module load).
    setBalls(
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 22 + Math.random() * 34,
        top: Math.random() * 90,
        left: Math.random() * 94,
        duration: 10 + Math.random() * 14,
        delay: -Math.random() * 20,
        opacity: 0.15 + Math.random() * 0.25,
      }))
    );
  }, [count]);

  if (!balls) return null;

  return (
    <div aria-hidden="true">
      {balls.map((b) => (
        <div
          key={b.id}
          className="tennis-ball"
          style={{
            width: b.size,
            height: b.size,
            top: `${b.top}%`,
            left: `${b.left}%`,
            opacity: b.opacity,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
