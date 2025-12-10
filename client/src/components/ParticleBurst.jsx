import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ParticleBurst({ x, y, onDone }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // generate 12 gold particles
    const arr = Array.from({ length: 12 }).map(() => ({
      id: Math.random(),
      size: Math.random() * 8 + 6,
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 55 + 30,
      opacity: 1,
    }));

    setParticles(arr);

    // remove after animation ends
    const t = setTimeout(onDone, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        pointerEvents: "none",
        zIndex: 999999,
      }}
    >
      {particles.map((p) => {
        const dx = Math.cos(p.angle) * p.distance;
        const dy = Math.sin(p.angle) * p.distance;

        return (
          <motion.div
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: dx, y: dy, opacity: 0, scale: 0.2 }}
            transition={{
              duration: 0.6,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, #ffedc0 0%, #d4a047 40%, #b8842f 100%)",
              boxShadow: "0 0 6px rgba(255,215,130,0.8)",
            }}
          />
        );
      })}
    </div>
  );
}
