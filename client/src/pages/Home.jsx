import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import CinematicStarRating from "../components/CinematicStarRating";

export default function Home() {
  return (
    <div className="w-full bg-[#f3eee4] overflow-hidden">

      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden select-none">
        <motion.div
          className="absolute inset-0 opacity-[0.55]"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{
            backgroundImage: "linear-gradient(135deg, #6b442a 0%, #7f5435 40%, #6b442a 100%)",
            backgroundSize: "200% 200%",
          }}
        />

        <motion.div
          className="absolute inset-0 opacity-[0.45]"
          style={{
            background:
              "radial-gradient(circle at 25% 20%, rgba(255,228,175,0.35), transparent 60%), radial-gradient(circle at 75% 80%, rgba(255,208,145,0.35), transparent 60%)",
          }}
        />

        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.2), transparent 70%)",
          }}
        />

        {Array.from({ length: 55 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-[#ffe0ad] rounded-full"
            style={{
              width: Math.random() * 14 + 6,
              height: Math.random() * 14 + 6,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.18,
              filter: "blur(2px)",
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0.15, 0.4, 0.15],
            }}
            transition={{
              duration: 4 + Math.random() * 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}

        <motion.div
          className="relative text-center text-white max-w-4xl px-6 z-10"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <motion.h1
            className="text-7xl font-serif font-bold leading-tight drop-shadow-[0_0_30px_rgba(255,235,200,0.25)]"
            animate={{ scale: [1, 1.015, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            Natural Treats
            <span className="block text-transparent bg-clip-text bg-gradient-to-br from-[#ffe9c8] to-[#f3d49b]">
              For Pets You Treasure
            </span>
          </motion.h1>

          <motion.p
            className="mt-8 text-xl text-[#f9efdf] max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 1 }}
          >
            Premium natural pet treats, crafted with care and delivered locally in Grange-over-Sands.
          </motion.p>

          <motion.div
            className="mt-14 flex justify-center gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            <Link
              to="/dogs/chews"
              className="px-12 py-4 rounded-xl font-semibold text-[#654424] bg-gradient-to-b from-[#fbe3b8] to-[#e3c28c] border border-[#f4dfb6] shadow-2xl hover:scale-110 hover:shadow-[0_0_35px_rgba(255,215,150,0.5)] transition-all"
            >
              🐶 Shop Dogs
            </Link>

            <Link
              to="/cats/chews"
              className="px-12 py-4 rounded-xl font-semibold text-[#f0e5d4] bg-[#4a2f1a] border border-[#b99a71] shadow-2xl hover:scale-110 hover:shadow-[0_0_35px_rgba(255,210,150,0.4)] transition-all"
            >
              🐱 Shop Cats
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <section className="py-28 bg-[#f3eee4]">
        <h2 className="text-center text-6xl font-serif font-bold text-[#3b2414] mb-20 tracking-wide">
          Loved By Local Pet Owners
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 px-12">
          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-[#fffaf3] p-14 rounded-3xl shadow-xl border border-[#e6d5c2] hover:border-[#d8b67e] transition-all"
          >
            <h3 className="text-4xl font-serif text-[#3b2414] font-bold mb-6">
              4.9 Google Rating
            </h3>
            <CinematicStarRating value={5} size={52} />
            <p className="mt-6 text-gray-700 text-lg">
              Exceptional feedback from the Grange community.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04 }}
            className="bg-[#fffaf3] p-14 rounded-3xl shadow-xl border border-[#e6d5c2] hover:border-[#d8b67e] transition-all"
          >
            <h3 className="text-4xl font-serif text-[#3b2414] font-bold mb-6">
              5.0 Facebook Rating
            </h3>
            <CinematicStarRating value={5} size={52} />
            <p className="mt-6 text-gray-700 text-lg">
              Over 380 followers and a perfect reputation.
            </p>
          </motion.div>
        </div>
      </section>

      <h2 className="text-center text-6xl font-serif mt-4 mb-20 text-[#3b2414] tracking-wide">
        <span className="px-10 py-4 rounded-xl bg-gradient-to-br from-[#f0dfc0] to-[#e1c79a] text-transparent bg-clip-text">
          Why Choose Us
        </span>
      </h2>

      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20 px-12 pb-28">
        {[
          { title: "Local Delivery", desc: "Reliable delivery straight to your home." },
          { title: "Natural Ingredients", desc: "Only clean, healthy, natural treats." },
          { title: "Loved By Locals", desc: "A trusted favourite in Grange-over-Sands." },
        ].map((f, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -12, scale: 1.03 }}
            className="rounded-2xl bg-[#fffaf3] p-14 shadow-xl border border-[#e8d8c1] hover:border-[#d9b67f] transition-all cursor-default"
          >
            <h3 className="text-3xl font-bold text-[#3b2414] mb-4">{f.title}</h3>
            <p className="text-gray-700 text-lg">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <h2 className="text-center text-6xl font-serif text-[#3b2414] mb-14">
        Customer Reviews
      </h2>

      <section className="py-20 px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
        {[
          "Incredible quality and unmatched service every time.",
          "My dog is obsessed.. these treats are next level!",
          "A beautiful local business with heart and outstanding products.",
        ].map((quote, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.06 }}
            className="bg-[#fffaf5] shadow-xl rounded-2xl p-12 border border-[#eadbc7] hover:border-[#d9b67f] transition-all cursor-default"
          >
            <p className="italic text-gray-700 text-lg">“{quote}”</p>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
