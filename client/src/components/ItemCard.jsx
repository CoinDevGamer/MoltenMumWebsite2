import React from "react";
import { motion } from "framer-motion";
import ParticleBurst from "./ParticleBurst";

export default function ItemCard({ item, onAdd }) {
  const [bursts, setBursts] = React.useState([]);

  const img =
    item.image_url?.startsWith("/uploads")
      ? `http://localhost:4000${item.image_url}`
      : item.image_url || "/images/placeholder.jpg";

  // Trigger particle explosion
  const triggerBurst = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    setBursts((prev) => [...prev, { id: Math.random(), x, y }]);
  };

  const handleAdd = (e) => {
    triggerBurst(e);
    onAdd();
  };

  return (
    <>
      <motion.div
        className="
          group relative overflow-hidden rounded-3xl border
          bg-gradient-to-b from-[#fffdf7] to-[#f8e9d2]
          shadow-[0_6px_30px_rgba(0,0,0,0.12)]
          hover:shadow-[0_12px_45px_rgba(0,0,0,0.22)]
          transition-all duration-300
          flex flex-col
        "
        whileHover={{ y: -6, scale: 1.015 }}
        transition={{ type: 'spring', stiffness: 140, damping: 18 }}
      >

        {/* 🌟 GOLD SHINE SWEEP */}
        <div
          className="
            pointer-events-none absolute inset-0 z-10
            opacity-0 group-hover:opacity-100
            transition duration-[900ms] ease-out
            bg-gradient-to-r from-transparent via-white/35 to-transparent
            translate-x-[-150%] group-hover:translate-x-[150%]
          "
          style={{ filter: 'blur(10px)' }}
        />

        {/* IMAGE SECTION */}
        <div
          className="
            relative w-full aspect-[4/3]
            overflow-hidden rounded-t-3xl
            bg-gradient-to-b from-[#fff7eb] to-[#f0dcc0]
            flex items-center justify-center
          "
        >
          <img
            src={img}
            alt={item.name}
            className="
              max-w-full max-h-full object-contain
              transition-all duration-500
              group-hover:scale-[1.12]
              drop-shadow-[0_14px_24px_rgba(0,0,0,0.25)]
            "
          />

          {item.special_offer === 1 && (
            <div
              className="
                absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold
                bg-gradient-to-r from-amber-300 to-yellow-400
                text-[#5c3e18] shadow-md border border-amber-700/20
                animate-pulse
              "
            >
              ⭐ Special
            </div>
          )}

          <div
            className={`
              absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border shadow-sm
              ${
                item.in_stock
                  ? "bg-green-200 border-green-700 text-green-900"
                  : "bg-red-200 border-red-700 text-red-900"
              }
            `}
          >
            {item.in_stock ? "In Stock" : "Out of Stock"}
          </div>
        </div>

        {/* CONTENT */}
        <div className="p-6 flex flex-col flex-1">
          <h2 className="text-lg font-bold text-[#3c2918] tracking-tight">
            {item.name}
          </h2>

          <p className="text-sm text-black/60 mt-1 line-clamp-2 flex-1">
            {item.description}
          </p>

          <div className="mt-4 text-xl font-extrabold text-[#4a2e1d]">
            £{(item.price_cents / 100).toFixed(2)}
          </div>

          {/* BUTTON */}
          <div className="flex justify-end mt-6">
            <motion.button
              onClick={handleAdd}
              disabled={!item.in_stock}
              whileHover={{ scale: item.in_stock ? 1.08 : 1 }}
              whileTap={{ scale: item.in_stock ? 0.94 : 1 }}
              className="
                relative px-5 py-2 rounded-xl font-semibold text-white
                bg-gradient-to-b from-[#e6c389] to-[#b79257]
                border border-[#f5e3b5] shadow-md
                hover:shadow-[0_6px_18px_rgba(0,0,0,0.25)]
                transition-all duration-300
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              Add to Basket

              {/* sweep shine */}
              <span
                className="
                  absolute inset-0 rounded-xl
                  bg-gradient-to-r from-transparent via-white/15 to-transparent
                  opacity-0 group-hover:opacity-70
                  translate-x-[-120%] group-hover:translate-x-[120%]
                  transition duration-[750ms]
                "
              ></span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* PARTICLE EXPLOSIONS */}
      {bursts.map((b) => (
        <ParticleBurst
          key={b.id}
          x={b.x}
          y={b.y}
          onDone={() =>
            setBursts((curr) => curr.filter((x) => x.id !== b.id))
          }
        />
      ))}
    </>
  );
}
