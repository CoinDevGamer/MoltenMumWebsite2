// src/components/Success.jsx
import React, { useEffect, useState } from "react";
import { Orders as OrdersApi } from "../lib/api";
import { motion } from "framer-motion";

export default function Success() {
  const [status, setStatus] = useState("saving"); // saving | ok | fail
  const [summary, setSummary] = useState(null);   // snapshot for display only

  useEffect(() => {
    const raw = localStorage.getItem("pendingOrder");
    if (!raw) {
      setStatus("ok"); // nothing to save (maybe user refreshed)
      return;
    }

    let snapshot;
    try {
      snapshot = JSON.parse(raw);
    } catch {
      console.error("Invalid pendingOrder JSON");
      setStatus("fail");
      return;
    }

    // Keep snapshot so we can show a cute order summary
    setSummary(snapshot);

    OrdersApi.create({
      items: snapshot.items || [],
      total_cents: snapshot.total_cents,
      delivery_method: snapshot.delivery_method || "collect",
    })
      .then(() => {
        setStatus("ok");
        localStorage.removeItem("pendingOrder");
      })
      .catch((err) => {
        console.error("Failed to save order:", err);
        setStatus("fail");
      });
  }, []);

  const isFail = status === "fail";
  const isSaving = status === "saving";
  const isSuccess = status === "ok";

  const orderTime =
    summary?.created_at ? new Date(summary.created_at) : null;
  const formattedTime = orderTime
    ? orderTime.toLocaleString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      })
    : null;

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-[#f9ecce] via-[#f6e3bf] to-[#f3d7a6] px-4 overflow-hidden">
      {/* glowing background blobs */}
      <div className="pointer-events-none absolute -top-32 -left-24 w-72 h-72 bg-[#f0d094]/55 blur-3xl rounded-full" />
      <div className="pointer-events-none absolute bottom-[-80px] right-[-40px] w-80 h-80 bg-[#f7e6c1]/75 blur-3xl rounded-full" />

      {/* floating paw in corner */}
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="pointer-events-none hidden sm:block absolute top-8 right-10 text-4xl opacity-60"
      >
        🐾
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
        className="relative max-w-xl w-full"
      >
        {/* Outer glow frame */}
        <div className="bg-gradient-to-br from-[#f9e2b8] via-[#f2c985] to-[#e0ad5c] p-[1px] rounded-[28px] shadow-[0_22px_70px_rgba(0,0,0,0.35)]">
          <div className="relative bg-[#fffaf1]/98 rounded-[26px] px-6 sm:px-8 py-8 sm:py-10 text-center overflow-hidden">
            {/* top shimmer bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e4bf6b] via-[#fdf2c4] to-[#e4bf6b]" />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                repeat: Infinity,
                duration: 2.7,
                ease: "linear",
              }}
              className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-70"
            />

            {/* soft background paws */}
            <div className="pointer-events-none absolute -top-6 -left-4 text-5xl opacity-10 rotate-[-20deg]">
              🐾
            </div>
            <div className="pointer-events-none absolute -bottom-4 right-1 text-4xl opacity-10 rotate-[15deg]">
              🐾
            </div>

            {/* badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-[#f7e6c1] to-[#f0cd8b] text-[11px] font-semibold text-[#5a3a1f] mb-5 shadow-sm">
              <span>
                {isFail ? "We hit a small bump" : "Your order is in our paws"}
              </span>
              <span>✨</span>
            </div>

            {/* icon circle with subtle pulse + glow */}
            <div className="relative mb-4 flex justify-center">
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              >
                <div className="h-16 w-16 rounded-full bg-[#f7e6c1]/60 blur-xl" />
              </motion.div>

              <motion.div
                animate={
                  isFail
                    ? { scale: [1, 1.04, 1] }
                    : { scale: [1, 1.08, 1] }
                }
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                className={`relative flex h-16 w-16 items-center justify-center rounded-full border-4 ${
                  isFail
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-emerald-400 bg-emerald-50 text-emerald-500"
                }`}
              >
                {isFail ? "⚠️" : "🎉"}
              </motion.div>
            </div>

            {/* title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3c2614] mb-1">
              {isFail ? "Oops, but your money’s safe" : "Payment complete!"}
            </h1>

            {!isFail && (
              <p className="text-sm sm:text-base text-black/60 mb-5">
                We’ve received your payment and your goodies are now being
                tucked into our system.
              </p>
            )}

            {isFail && (
              <p className="text-sm sm:text-base text-red-700 mb-5">
                Your payment reached us, but we couldn’t save the order properly.
              </p>
            )}

            {/* progress tracker (advanced micro UI) */}
            {!isFail && (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 text-[10px] sm:text-[11px] text-black/60 mb-1">
                  <span>Payment</span>
                  <span>•</span>
                  <span>Order saved</span>
                  <span>•</span>
                  <span>Preparing</span>
                </div>
                <div className="relative h-1.5 rounded-full bg-[#f1e0bc] overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#e5c78a] via-[#d6b46a] to-[#b99753]"
                    animate={{
                      width: isSaving ? "50%" : isSuccess ? "100%" : "30%",
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
            )}

            {/* SAVING */}
            {isSaving && (
              <div className="space-y-3">
                <p className="text-sm text-black/80 font-medium">
                  Saving your order details…
                </p>
                <p className="text-xs text-black/60">
                  Just a moment while we tuck everything neatly into place.
                </p>

                <div className="mt-2 flex justify-center">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#d4b07a] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[#d4b07a] animate-bounce [animation-delay:0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-[#d4b07a] animate-bounce [animation-delay:0.3s]" />
                  </div>
                </div>
              </div>
            )}

            {/* SUCCESS */}
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="space-y-5"
              >
                {/* mini confetti row */}
                <div className="flex justify-center gap-1 text-xl">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  >
                    🎊
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                  >
                    🎉
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8 }}
                  >
                    🥳
                  </motion.span>
                </div>

                <p className="text-sm sm:text-base text-black/80">
                  Your order has been safely saved and is now in loving hands.
                </p>
                <p className="text-xs sm:text-sm text-black/60">
                  Our team has been pinged and is getting everything ready for
                  you and your fluffy friend. 🐾
                </p>

                {/* order summary + what happens next */}
                {summary && (
                  <div className="mt-2 grid gap-4 text-left sm:grid-cols-[minmax(0,3fr)_minmax(0,2.1fr)]">
                    {/* Left: item list */}
                    <div className="bg-[#fff5e2] border border-[#ebd3a7] rounded-2xl px-4 py-3 text-xs text-[#3c2614]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold">Order snapshot</span>
                        {formattedTime && (
                          <span className="text-[10px] text-black/50">
                            {formattedTime}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {(summary.items || []).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <span className="truncate">
                              {item.qty} × {item.name}
                            </span>
                            <span className="font-semibold text-[11px]">
                              £{(
                                ((item.price_cents || 0) * item.qty) /
                                100
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-top border-[#e4cda4]/70 flex items-center justify-between text-[11px]">
                        <span className="uppercase tracking-wide text-black/60">
                          Total
                        </span>
                        <span className="font-extrabold">
                          £{((summary.total_cents || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Right: what happens next (timeline style) */}
                    <div className="bg-[#fff9ed] border border-[#f0ddb6] rounded-2xl px-4 py-3 text-[11px] text-[#3c2614] space-y-2">
                      <div className="font-semibold mb-1.5">
                        What happens next
                      </div>

                      <div className="flex gap-2 items-start">
                        <div className="mt-0.5 text-sm">📥</div>
                        <div>
                          <div className="font-medium">We log your order</div>
                          <p className="text-[11px] text-black/60">
                            Everything is linked to your account and stored
                            safely.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 items-start">
                        <div className="mt-0.5 text-sm">👩‍🍳</div>
                        <div>
                          <div className="font-medium">We start preparing</div>
                          <p className="text-[11px] text-black/60">
                            The team gets your items together with extra care
                            (and probably some pet cuddles).
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 items-start">
                        <div className="mt-0.5 text-sm">📦</div>
                        <div>
                          <div className="font-medium">Ready for you</div>
                          <p className="text-[11px] text-black/60">
                            Your goodies are packed and ready for collection or
                            delivery, depending on what you chose.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* temptation: shop more */}
                <div className="pt-2 space-y-3">
                  <div className="text-xs sm:text-sm text-black/60">
                    Feel like spoiling them a little more?
                  </div>
                  <div className="flex flex-wrap justify-center gap-2 text-xs">
                    <a
                      href="/"
                      className="px-3 py-1.5 rounded-full border border-[#e2c392] bg-[#fff8e8] hover:bg-[#f7e2b9] text-[#5a3a1f] font-semibold transition text-[11px] sm:text-xs"
                    >
                      Browse more goodies 🧺
                    </a>
                    <a
                      href="/"
                      className="px-3 py-1.5 rounded-full border border-[#e2c392]/70 bg-white hover:bg-[#fff4dd] text-[#5a3a1f] transition text-[11px] sm:text-xs"
                    >
                      Discover new favourites ⭐
                    </a>
                  </div>

                  <div className="pt-2 flex justify-center">
                    <a
                      href="/"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#e5c78a] to-[#b99753] shadow-md hover:shadow-xl hover:scale-[1.04] active:scale-[0.98] transition-transform"
                    >
                      Continue shopping
                      <span>🛍️</span>
                    </a>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FAIL */}
            {isFail && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="space-y-4"
              >
                <p className="text-sm sm:text-base text-red-700">
                  Your payment is all good, but we couldn’t automatically attach
                  the order in our system.
                </p>
                <p className="text-xs sm:text-sm text-black/60">
                  Please contact us and mention today’s time and what you
                  ordered. We’ll match it on our side and make sure everything
                  is sorted for you.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
