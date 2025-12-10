import React from "react";
import { motion } from "framer-motion";

export default function CinematicStarRating({ value = 5, size = 42 }) {
  const stars = Array.from({ length: value });

  return (
    <div className="flex items-center gap-2">
      {stars.map((_, i) => (
        <motion.div
          key={i}
          className="relative cursor-pointer"
          whileHover={{ scale: 1.25, rotate: 5 }}
          whileTap={{ scale: 0.85 }}
        >
          {/* Star */}
          <motion.div
            className="text-transparent bg-clip-text font-black select-none"
            style={{
              fontSize: size,
              backgroundImage:
                "linear-gradient(135deg, #ffeaba 0%, #e4c27a 40%, #b88c3d 70%, #fff3cb 100%)",
              filter:
                "drop-shadow(0px 0px 6px rgba(255,240,200,0.7)) drop-shadow(0px 0px 12px rgba(255,200,120,0.3))",
            }}
            animate={{
              opacity: [1, 0.92, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            ★
          </motion.div>

          {/* Sparkle burst */}
          {[...Array(6)].map((_, j) => (
            <motion.div
              key={j}
              className="absolute rounded-full bg-[#ffefc3]"
              style={{
                width: 4,
                height: 4,
                top: size / 2,
                left: size / 2,
              }}
              initial={{ opacity: 0 }}
              whileHover={{
                opacity: [0, 1, 0],
                x: [0, (Math.random() - 0.5) * 36],
                y: [0, (Math.random() - 0.5) * 36],
                scale: [0.3, 1.2, 0],
              }}
              transition={{
                duration: 0.55,
                ease: "easeOut",
              }}
            />
          ))}
        </motion.div>
      ))}
    </div>
  );
}
