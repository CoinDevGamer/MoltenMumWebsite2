import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Orders as OrdersApi } from "../lib/api";

export default function Orders({ open, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  // Fetch orders when opened
  useEffect(() => {
    if (open) {
      OrdersApi.list()
        .then((data) => {
          const parsed = data.map((o) => ({
            ...o,
            items: o.items_json ? JSON.parse(o.items_json) : [],
            address: o.address_json ? JSON.parse(o.address_json) : {},
          }));
          setOrders(parsed);
        })
        .catch(() => setOrders([]));
    }
  }, [open]);

  // Cancel order
  const cancel = async (id) => {
    setLoadingId(id);
    await OrdersApi.cancel(id);
    setOrders((o) =>
      o.map((x) => (x.id === id ? { ...x, status: "cancelled" } : x))
    );
    setLoadingId(null);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* DARK BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
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
            transition={{ type: "tween", duration: 0.35 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[520px] bg-barn-parchment shadow-2xl z-50 p-5 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl font-extrabold text-[#3b2415] flex items-center gap-2">
                📦 My Orders
              </div>
              <button
                onClick={onClose}
                className="text-2xl hover:scale-110 transition"
              >
                ✕
              </button>
            </div>

            {/* EMPTY STATE */}
            {orders.length === 0 && (
              <div className="text-black/60 text-center py-10 text-lg">
                No orders yet.
              </div>
            )}

            {/* ORDER LIST */}
            <div className="space-y-5">
              {orders.map((o) => (
                <motion.div
                  key={o.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl p-4 shadow-md border relative overflow-hidden transition 
                    ${
                      o.status === "cancelled"
                        ? "opacity-60 bg-gray-200/70"
                        : "bg-white hover:shadow-xl hover:-translate-y-1"
                    }
                  `}
                >
                  {/* CANCELLED LABEL */}
                  {o.status === "cancelled" && (
                    <div className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-1 rounded-full shadow">
                      Cancelled
                    </div>
                  )}

                  {/* HEADER */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-lg flex items-center gap-2">
                        Order #{o.id}
                      </div>
                      <div className="text-sm text-black/70">
                        📅 {new Date(o.created_at).toLocaleString()}
                      </div>
                      <div className="text-sm mt-1">
                        🚚 Delivery: <b>{o.delivery_method}</b>
                      </div>

                      {/* ADDRESS */}
                      {o.address && (
                        <div className="text-xs text-black/70 mt-2 leading-tight">
                          📍 {o.address.address_line1 || ""}{" "}
                          {o.address.address_line2 || ""}, {o.address.city || ""}
                          , {o.address.postcode || ""},{" "}
                          {o.address.country || ""}
                        </div>
                      )}
                    </div>

                    {/* CANCEL BUTTON */}
                    {o.status === "placed" && (
                      <button
                        onClick={() => cancel(o.id)}
                        disabled={loadingId === o.id}
                        className={`btn-rivet mt-1 relative overflow-hidden transition-all ${
                          loadingId === o.id
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-red-600 hover:text-white"
                        }`}
                      >
                        {/* shimmer effect */}
                        <span
                          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-150%] ${
                            loadingId !== o.id
                              ? "hover:translate-x-[150%] transition-all duration-700"
                              : ""
                          }`}
                        ></span>

                        <span className="relative">
                          {loadingId === o.id ? "Cancelling…" : "Cancel"}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* ITEMS */}
                  <ul className="mt-3 border-t pt-3 border-black/10 space-y-1 text-sm">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span>🐾</span>
                        {i.qty} × {i.name}
                      </li>
                    ))}
                  </ul>

                  {/* TOTAL */}
                  <div className="mt-4 text-right font-bold text-lg text-[#3b2415]">
                    💷 £{(o.total_cents / 100).toFixed(2)}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
