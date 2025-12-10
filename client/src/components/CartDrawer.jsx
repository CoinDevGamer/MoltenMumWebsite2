import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkout } from "../lib/api.js";

export default function CartDrawer({
  open,
  onClose,
  cart,
  setCart,
  totalCents,
  delivery,
  user,
  onRequireAddress,
  setDelivery,
  push,
}) {
  if (!open) return null;

  const updateQty = (id, d) =>
    setCart((c) =>
      c.map((x) =>
        x.id === id ? { ...x, qty: Math.max(1, x.qty + d) } : x
      )
    );

  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));

  const deliveryWarn = delivery === "deliver" && totalCents < 500;

  /* ------------------------------------------------------------
     CHECKOUT — with SNAPSHOT saved for Success page
  ------------------------------------------------------------ */
  const handleCheckout = async () => {
    if (!user) {
      push("⚠️ Please sign in before placing an order.");
      onRequireAddress();
      return;
    }

    const { name, address_line1, city, postcode, country } = user || {};

    if (!name || !address_line1 || !city || !postcode || !country) {
      push("⚠️ Please complete your address first.");
      onRequireAddress();
      return;
    }

    if (delivery === "deliver" && totalCents < 2000) {
      push("⚠️ Delivery requires a minimum order of £20.");
      return;
    }

    if (cart.length !== 1) {
      push("⚠️ Only one item can be checked out at a time.");
      return;
    }

    try {
      const snapshotItems = cart.map((i) => ({
        id: i.id,
        name: i.name,
        price_cents: i.price_cents,
        qty: i.qty,
      }));

      const pending = {
        items: snapshotItems,
        delivery_method: delivery,
        total_cents: totalCents,
        created_at: Date.now(),
      };

      localStorage.setItem("pendingOrder", JSON.stringify(pending));

      const stripeItems = cart.map((i) => ({
        id: i.id,
        qty: i.qty,
      }));

      const session = await Checkout.createSession({
        items: stripeItems,
        delivery_method: delivery,
      });

      if (session?.url) {
        window.location.href = session.url;
      } else {
        push("❌ Checkout failed. Try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      push(
        err.response?.data?.error ||
          "❌ Could not create checkout session."
      );
    }
  };

  const checkoutDisabled =
    (delivery === "deliver" && totalCents < 2000) || cart.length === 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* DRAWER */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="
              fixed right-0 top-0 h-full w-full sm:w-[440px]
              bg-gradient-to-b from-[#f9ecce] to-[#f3d7a6]
              shadow-[0_0_60px_rgba(0,0,0,0.35)]
              z-[9999] p-5 overflow-y-auto
              border-l border-[#d9b980]/40
            "
            onClick={(e) => e.stopPropagation()}
          >
            {/* GOLD BAR */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#d1b06b] via-[#f7e6b5] to-[#d1b06b] shadow"></div>

            {/* HEADER */}
            <div className="flex items-center justify-between mb-6 pt-3">
              <div className="text-3xl font-extrabold text-[#4d331e] drop-shadow-sm flex items-center gap-2">
                🛒 Your Basket
              </div>
              <button className="text-3xl hover:scale-125 transition" onClick={onClose}>
                ✕
              </button>
            </div>

            {/* ITEMS */}
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1 pb-4">
              {cart.length === 0 && (
                <div className="text-black/60 text-center py-20 text-xl font-medium">
                  Your basket is empty.
                </div>
              )}

              {cart.map((i) => (
                <motion.div
                  key={i.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  className="
                    bg-[#fffaf1] rounded-2xl border border-[#ead7b1]
                    shadow-lg p-4 transition relative
                    hover:shadow-[0_8px_28px_rgba(0,0,0,0.15)]
                  "
                >
                  <div className="absolute -top-2 -left-2 text-amber-300 opacity-30 text-4xl rotate-[-20deg]">
                    🐾
                  </div>

                  <div className="font-bold text-xl text-[#3c2614] tracking-tight">
                    {i.name}
                  </div>

                  <div className="flex items-center gap-4 mt-4">
                    <button
                      className="w-8 h-8 rounded-lg bg-[#d4b07a] text-white font-bold shadow hover:brightness-110"
                      onClick={() => updateQty(i.id, -1)}
                    >
                      -
                    </button>

                    <span className="w-8 text-center font-semibold text-lg text-[#3c2614]">
                      {i.qty}
                    </span>

                    <button
                      className="w-8 h-8 rounded-lg bg-[#d4b07a] text-white font-bold shadow hover:brightness-110"
                      onClick={() => updateQty(i.id, 1)}
                    >
                      +
                    </button>

                    <div className="flex-1" />

                    <div className="font-extrabold text-lg text-[#3c2614]">
                      £{((i.price_cents * i.qty) / 100).toFixed(2)}
                    </div>

                    <button
                      className="text-red-600 text-sm hover:text-red-800"
                      onClick={() => remove(i.id)}
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* -------------------------------------------------------------
                 PERFECTLY PROPORTIONAL DELIVERY SELECTOR
            ------------------------------------------------------------- */}
            <div className="mt-6">
              <div className="text-sm font-semibold text-[#3c2614] mb-2 flex items-center gap-1">
                Delivery method <span className="text-sm">🐾</span>
              </div>

              <div
                className="
                  relative flex bg-gradient-to-r from-[#f5e4bd] to-[#e4c88a]
                  rounded-3xl p-1 shadow-inner border border-[#d4b07a]/60
                "
              >
                {/* SLIDING PILL */}
                <motion.div
                  className="
                    absolute top-[4px] bottom-[4px]
                    w-[49%]
                    rounded-2xl bg-[#fffdf9]
                    shadow-[0_4px_12px_rgba(0,0,0,0.15)]
                    border border-[#e3d7b8]
                  "
                  animate={{
                    x: delivery === "collect" ? 0 : "100%",
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 22,
                  }}
                />

                <div className="flex w-full relative z-10">
                  <button
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(10);
                      setDelivery("collect");
                    }}
                    className="flex-1 py-2.5 text-center"
                  >
                    <span
                      className={
                        "font-bold flex items-center justify-center gap-2 transition " +
                        (delivery === "collect"
                          ? "text-[#3c2614]"
                          : "text-[#3c2614]/50")
                      }
                    >
                      🏬 Collect
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(10);
                      setDelivery("deliver");
                    }}
                    className="flex-1 py-2.5 text-center"
                  >
                    <span
                      className={
                        "font-bold flex items-center justify-center gap-2 transition " +
                        (delivery === "deliver"
                          ? "text-[#3c2614]"
                          : "text-[#3c2614]/50")
                      }
                    >
                      🚚 Deliver
                    </span>
                  </button>
                </div>
              </div>

              {delivery === "deliver" && totalCents < 2000 && (
                <div className="text-red-600 text-sm mt-2 font-semibold">
                  ⚠️ Delivery requires a minimum order of <b>£20</b>.
                </div>
              )}
            </div>

            {/* FOOTER */}
            <div className="mt-6 bg-[#fff8e8] border border-[#e2c798] rounded-2xl p-5 shadow-inner space-y-3">
              <div className="text-sm text-black/70">
                Delivery: <b>{delivery}</b>
              </div>

              <div className="flex items-center justify-between mt-1">
                <div className="text-3xl font-extrabold text-[#3c2614]">
                  £{(totalCents / 100).toFixed(2)}
                </div>

                <motion.button
                  disabled={checkoutDisabled}
                  onClick={handleCheckout}
                  whileHover={!checkoutDisabled ? { scale: 1.05 } : {}}
                  whileTap={!checkoutDisabled ? { scale: 0.9 } : {}}
                  className={`
                    relative px-6 py-3 text-lg font-bold rounded-xl
                    border shadow-lg transition
                    ${
                      checkoutDisabled
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "text-white bg-gradient-to-b from-[#e5c78a] to-[#b99753] border-[#f2e2b7] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)]"
                    }
                  `}
                >
                  <span
                    className="
                      absolute inset-0 rounded-xl bg-gradient-to-r
                      from-transparent via-white/40 to-transparent
                      translate-x-[-120%] hover:translate-x-[120%]
                      transition duration-[800ms]
                    "
                  />
                  <span className="relative">Checkout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
