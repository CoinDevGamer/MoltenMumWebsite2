import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Catalog } from "../../lib/api";

const categoryName = "Supplements";
const species = "dog";

const imgSrc = (u) =>
  u?.startsWith("/uploads")
    ? `http://localhost:4000${u}`
    : u || "/images/placeholder.jpg";

function Card({ it }) {
  const inStock = !!it.in_stock;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-xl border bg-[#fff9f3] shadow hover:shadow-lg transition p-4 flex flex-col"
    >
      <img
        src={imgSrc(it.image)}
        alt={it.name}
        className="h-40 w-full object-cover rounded-md"
      />
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span
          className={`px-2 py-0.5 rounded ${
            inStock ? "bg-green-600 text-white" : "bg-red-600 text-white"
          }`}
        >
          {inStock ? "In stock" : "Out of stock"}
        </span>
        {it.special_offer ? (
          <span className="px-2 py-0.5 rounded bg-amber-500 text-white">
            Special
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 font-semibold text-lg">{it.name}</h3>
      <p className="text-sm text-gray-700 flex-1">{it.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="font-bold text-lg">
          £{(it.price_cents / 100).toFixed(2)}
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => window.addToCart?.(it)}
          disabled={!inStock}
          className={`px-3 py-2 rounded-lg text-white ${
            inStock
              ? "bg-[#7b4b2d] hover:brightness-110"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          🛒 Add
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function DogsAccessories() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // ✅ Filter by category name and species directly
        const list = await Catalog.items({
          species,
          category: categoryName,
          sort: "new",
        });
        setItems(list);
      } catch (err) {
        console.error("❌ Failed to fetch dog accessories:", err);
      }
    })();
  }, []);

  return (
    <div className="px-8 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold inline-block px-6 py-3 rounded-xl bg-[#6f3e22] text-white shadow">
          🐶 Dog • {categoryName}
        </h1>
        <p className="mt-3 text-gray-700">
          Leads, toys & barn-chic essentials.
        </p>
      </div>

      {items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <Card key={it.id} it={it} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No items yet.</p>
      )}
    </div>
  );
}
