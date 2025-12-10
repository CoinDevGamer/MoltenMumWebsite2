import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Catalog } from "../lib/api";
import { motion } from "framer-motion";
import ItemCard from "../components/ItemCard.jsx";

// Turn slug into readable text
const pretty = (s) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// Species normalization
const SPECIES_MAP = {
  dogs: "dog",
  dog: "dog",
  cats: "cat",
  cat: "cat",
  birds: "bird",
  bird: "bird",
  "small-pets": "small-pets",
  "small pets": "small-pets",
  smallpets: "small-pets",
};

export default function CategoryPage() {
  const { species, category: slug } = useParams();
  const speciesSlug = SPECIES_MAP[species?.toLowerCase()] || species;

  const categoryTitle = pretty(slug);
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const list = await Catalog.items({
          species: speciesSlug,
          category: slug,
          sort: "new",
        });

        console.log("Loaded items:", list);
        setItems(list);
      } catch (err) {
        console.error("❌ Failed to load items:", err);
      }
    })();
  }, [speciesSlug, slug]);

  return (
    <div className="px-8 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold inline-block px-6 py-3 rounded-xl bg-[#6f3e22] text-white shadow">
          {species.toUpperCase()} • {categoryTitle.toUpperCase()}
        </h1>
      </div>

      {items.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => (
            <motion.div key={it.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <ItemCard item={it} onAdd={() => window.addToCart?.(it)} />
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No items found.</p>
      )}
    </div>
  );
}
