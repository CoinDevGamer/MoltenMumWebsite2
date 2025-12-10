import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Catalog } from "../lib/api";

export default function Header({ user, onOrders, onBasket, onAccount }) {
  const [speciesList, setSpeciesList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    Catalog.species().then(setSpeciesList);
    Catalog.categories().then(setCategories);
  }, []);

  const getCatsFor = (slug) =>
    categories.filter((c) => c.species === slug || c.species == null);

  return (
    <header
      className="
        sticky top-0 z-50
        bg-gradient-to-r from-[#3b2415] via-[#4d2e1a] to-[#3b2415]
        border-b border-[#d4b07a]/40 backdrop-blur-xl
        shadow-[0_8px_20px_rgba(0,0,0,0.35)]
      "
    >
      {/* PARTICLES */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#e6c089]"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.12,
              filter: "blur(3px)",
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="w-full px-6 py-3 flex items-center justify-between gap-6">

        {/* BRAND LEFT */}
        <motion.div
          className="flex items-center gap-4 cursor-pointer shrink-0"
          whileHover={{ scale: 1.03 }}
        >
          <motion.img
  src="/images/pawlina-logo.png"
  className="
    w-14 h-14 rounded-full border-2 border-[#d4b07a]
    shadow-[0_0_25px_rgba(212,176,122,0.4)]
    object-contain bg-[#3b2415] p-1
  "
  whileHover={{ rotate: 5, scale: 1.06 }}
  whileTap={{ scale: 0.88, rotate: -10 }}
/>


          <div className="flex flex-col leading-tight select-none">
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#d6b27d] to-[#f6e9c9] drop-shadow-lg tracking-wide font-serif">
              Pawlina’s Pet Shop
            </span>
            <span className="text-sm text-[#f0dcb3] opacity-80">
              Luxury Natural Pet Products
            </span>
          </div>
        </motion.div>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-4 flex-wrap">
          <GoldBtn to="/">🏠 Home</GoldBtn>

          {speciesList.map((s) => (
            <div key={s.slug} className="relative">
              <button
                onClick={() =>
                  setOpenMenu(openMenu === s.slug ? null : s.slug)
                }
                className="px-4 py-2 min-w-[110px]
                  bg-gradient-to-b from-[#d7b179] to-[#b68a55]
                  text-[#3b2415] rounded-xl shadow-lg
                  hover:shadow-amber-300/40 border border-[#e8d1aa]
                  transition-all flex items-center justify-center gap-2
                  relative overflow-hidden"
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-150%] hover:translate-x-[150%] transition-all duration-700" />
                <span className="relative">{s.icon} {s.label} ▼</span>
              </button>

              {/* DROPDOWN */}
              <AnimatePresence>
                {openMenu === s.slug && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: 12, scale: 0.96, filter: "blur(6px)" }}
                    transition={{ duration: 0.18 }}
                    className="
                      absolute left-0 mt-3 w-64
                      bg-gradient-to-br from-[#fff5e3] to-[#f1dfc2]
                      border border-[#d5b27e] shadow-2xl rounded-2xl p-4 z-[999]
                    "
                  >
                    <div className="text-[#5a3a23] font-bold pb-2 border-b border-amber-300/40 uppercase tracking-wide">
                      Shop {s.label}
                    </div>

                    <div className="flex flex-col gap-2 mt-3">
                      {getCatsFor(s.slug).map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/${s.slug}/${cat.slug}`} 
                          className="p-3 rounded-xl bg-[#fdf8ee] hover:bg-[#f6e7c7]
                                     transition-all shadow-sm hover:shadow-md
                                     text-[#4c2d1a] font-medium flex items-center gap-2"
                        >
                          🐾 {cat.name}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          {user?.role === "admin" && <GoldBtn to="/admin">🛠 Admin</GoldBtn>}
        </nav>

        {/* ACTIONS RIGHT */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <RoundGoldBtn icon="📦" label="Orders" onClick={onOrders} />
          <RoundGoldBtn icon="🛒" label="Basket" onClick={onBasket} />
          <RoundGoldBtn icon="👤" label="Account" onClick={onAccount} />
        </div>

        {/* MOBILE ICON */}
        <motion.button
          onClick={() => setMobileOpen(!mobileOpen)}
          whileTap={{ scale: 0.85 }}
          className="md:hidden text-4xl text-[#e7c792]"
        >
          ☰
        </motion.button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-gradient-to-b from-[#4c2e18] to-[#3b2415] p-6 text-[#f7e7c9] border-t border-[#d4b07a]/40 shadow-xl"
          >
            <MobileLink to="/" label="🏠 Home" closeMenu={() => setMobileOpen(false)} />

            {speciesList.map((s) => (
              <div key={s.slug} className="mt-4">
                <div className="text-xl font-bold mb-2 text-[#f2d7a6]">{s.icon} {s.label}</div>

                {getCatsFor(s.slug).map((cat) => (
                  <MobileLink
                    key={cat.id}
                    to={`/${s.slug}/${cat.slug}`} 
                    label={`🐾 ${cat.name}`}
                    closeMenu={() => setMobileOpen(false)}
                  />
                ))}
              </div>
            ))}

            <div className="h-[1px] bg-[#c6a16a] my-4 opacity-60"></div>

            <MobileLink label="📦 Orders" click={onOrders} closeMenu={() => setMobileOpen(false)} />
            <MobileLink label="🛒 Basket" click={onBasket} closeMenu={() => setMobileOpen(false)} />
            <MobileLink label="👤 Account" click={onAccount} closeMenu={() => setMobileOpen(false)} />

            {user?.role === "admin" && (
              <MobileLink to="/admin" label="🛠 Admin" closeMenu={() => setMobileOpen(false)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ----------------------------------------------------------- */
/* COMPONENTS */
/* ----------------------------------------------------------- */

function GoldBtn({ to, children }) {
  return (
    <Link
      to={to}
      className="px-4 py-2 min-w-[110px] text-center flex justify-center items-center
                 rounded-xl bg-gradient-to-b from-[#d7b179] to-[#b68a55]
                 text-[#3b2415] shadow-md hover:shadow-xl
                 border border-[#e8d1aa] transition-all relative overflow-hidden"
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent translate-x-[-150%] hover:translate-x-[150%] transition-all duration-700" />
      <span className="relative">{children}</span>
    </Link>
  );
}

function RoundGoldBtn({ icon, label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      className="px-4 py-2 rounded-full bg-gradient-to-b from-[#d7b179] to-[#b68a55]
                 text-[#3b2415] shadow-lg hover:shadow-amber-300/50 border border-[#ebd2ae]
                 transition-all flex items-center gap-2 relative overflow-hidden"
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/18 to-transparent translate-x-[-150%] hover:translate-x-[150%] transition-all duration-700" />
      <span className="relative">{icon} {label}</span>
    </motion.button>
  );
}

function MobileLink({ to, label, click, closeMenu }) {
  const Element = to ? Link : "button";
  return (
    <Element
      to={to}
      onClick={() => {
        if (click) click();
        if (closeMenu) closeMenu();
      }}
      className="block w-full text-left px-4 py-3 rounded-lg bg-[#5f3a20] hover:bg-[#7a4a29] transition-all shadow-sm mb-2"
    >
      {label}
    </Element>
  );
}
