import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Catalog, Admin as AdminApi, Species as SpeciesApi } from "../lib/api";

const woodBtn =
  "px-4 py-2 rounded-plank text-white font-semibold shadow-rivet border border-black/30 bg-[linear-gradient(#a94f31,#7e3b20)] transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed";
const ghostBtn =
  "px-3 py-2 rounded-md border text-sm hover:bg-black/5 transition disabled:opacity-40 disabled:cursor-not-allowed";
const chip =
  "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border";
const chipGreen = chip + " bg-[#dcfce7] border-[#bbf7d0]";
const chipRed = chip + " bg-[#fee2e2] border-[#fecaca]";
const chipAmber = chip + " bg-[#fef3c7] border-[#fde68a]";

const imgSrc = (it) => {
  const u = it?.image || it?.image_url;
  if (!u) return "/images/placeholder.jpg";
  if (u.startsWith("/uploads")) return `http://localhost:4000${u}`;
  return u;
};

export default function AdminPanel() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  // 🐾 species state
  const [speciesList, setSpeciesList] = useState([]);
  const [speciesTab, setSpeciesTab] = useState(""); // slug, e.g. "dog"

  const [filter, setFilter] = useState("all"); // all | in | out | special
  const [saving, setSaving] = useState(false);
  const [changed, setChanged] = useState(new Map()); // id -> edited item

  // modals
  const [showEdit, setShowEdit] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({
    species: "",
    category_id: "",
    name: "",
    description: "",
    price_cents: 0,
    image: "",
    in_stock: 1,
    special_offer: 0,
  });

  // category manager
  const [newCategory, setNewCategory] = useState("");
  const [catBusy, setCatBusy] = useState(false);

  // species manager
  const [newSpeciesName, setNewSpeciesName] = useState("");
  const [newSpeciesIcon, setNewSpeciesIcon] = useState("🐾");
  const [speciesBusy, setSpeciesBusy] = useState(false);

  // ===== LOADERS =====
  const loadCategories = async () => {
    try {
      const cats = await Catalog.categories();
      setCategories(cats);
    } catch (err) {
      console.error("❌ Failed to load categories:", err);
      alert("Failed to load categories from server.");
    }
  };

  const loadSpecies = async () => {
    try {
      const list = await SpeciesApi.list();
      setSpeciesList(list);
      // if no tab yet, pick first
      if (!speciesTab && list.length) {
        setSpeciesTab(list[0].slug);
      }
    } catch (err) {
      console.error("❌ Failed to load species:", err);
      alert("Failed to load species from server.");
    }
  };

  const loadItems = async () => {
    if (!speciesTab) return; // wait until we know which species is active
    try {
      const list = await Catalog.items({
        species: speciesTab,
        sort: "new",
      });
      setItems(list);
    } catch (err) {
      console.error("❌ Failed to load items:", err);
      alert("Failed to load items from server.");
    }
  };

  useEffect(() => {
    loadCategories();
    loadSpecies();
  }, []);

  useEffect(() => {
    loadItems();
  }, [speciesTab]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (filter === "in") return !!it.in_stock;
      if (filter === "out") return !it.in_stock;
      if (filter === "special") return !!it.special_offer;
      return true;
    });
  }, [items, filter]);

  // ===== HELPERS FOR ITEMS =====
  const markChanged = (upd) => {
    setItems((list) =>
      list.map((x) => (x.id === upd.id ? { ...x, ...upd } : x))
    );

    setChanged((m) => {
      const copy = new Map(m);
      const original = items.find((x) => x.id === upd.id) || {};
      const merged = { ...original, ...(m.get(upd.id) || {}), ...upd };
      copy.set(upd.id, merged);
      return copy;
    });
  };

  const toggleStock = (row) =>
    markChanged({ id: row.id, in_stock: row.in_stock ? 0 : 1 });

  const toggleSpecial = (row) =>
    markChanged({ id: row.id, special_offer: row.special_offer ? 0 : 1 });

  const onField = (row, key, val) => markChanged({ id: row.id, [key]: val });

  const saveAll = async () => {
    if (changed.size === 0) return;
    setSaving(true);
    try {
      for (const [, it] of changed) {
        const imageVal = it.image || it.image_url || "";
        await AdminApi.upsertItem({
          id: it.id,
          species: it.species || speciesTab,
          category_id: it.category_id,
          name: it.name,
          description: it.description || "",
          price_cents: Number(it.price_cents) || 0,
          image: imageVal,
          image_url: imageVal,
          in_stock: it.in_stock ? 1 : 0,
          special_offer: it.special_offer ? 1 : 0,
        });
      }
      setChanged(new Map());
      await loadItems();
      alert("✅ Changes saved.");
    } catch (err) {
      console.error("❌ Failed to save items:", err);
      alert("Failed to save some items. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const softDelete = (row) => {
    if (!window.confirm(`Soft-remove "${row.name}" from catalogue?`)) return;
    markChanged({ id: row.id, in_stock: 0, special_offer: 0 });
  };

  const hardDelete = async (row) => {
    if (
      !window.confirm(
        `This will permanently delete "${row.name}". This cannot be undone. Continue?`
      )
    )
      return;
    try {
      await AdminApi.deleteItem(row.id);
      await loadItems();
      alert("🗑️ Item deleted.");
    } catch (err) {
      console.error("❌ Failed to delete item:", err);
      alert("Failed to delete item.");
    }
  };

  const openAdd = () => {
    const firstCat = categories[0]?.id || "";
    setDraft({
      species: speciesTab || "dog",
      category_id: firstCat,
      name: "",
      description: "",
      price_cents: 0,
      image: "",
      in_stock: 1,
      special_offer: 0,
    });
    setShowAdd(true);
  };

  const createItem = async () => {
    if (!draft.name.trim()) {
      alert("Name is required.");
      return;
    }
    if (!draft.category_id) {
      alert("Category is required.");
      return;
    }
    const priceCents = Math.round(Number(draft.price_cents || 0) * 100);
    const imgVal = draft.image || "";
    try {
      await AdminApi.upsertItem({
        species: draft.species || speciesTab || "dog",
        category_id: draft.category_id,
        name: draft.name.trim(),
        description: draft.description || "",
        price_cents: priceCents,
        image_url: imgVal,
        in_stock: draft.in_stock ? 1 : 0,
        special_offer: draft.special_offer ? 1 : 0,
      });
      setShowAdd(false);
      await loadItems();
      alert("✅ Item created.");
    } catch (err) {
      console.error("❌ Failed to create item:", err);
      alert("Failed to create item.");
    }
  };

  const openEdit = (row) => {
    setEditingItem({
      ...row,
      price_display: (Number(row.price_cents) / 100).toFixed(2),
      image: row.image || row.image_url || "",
    });
    setShowEdit(true);
  };

  const saveEdit = async () => {
    if (!editingItem) return;
    const priceCents = Math.round(
      Number(editingItem.price_display || 0) * 100
    );
    const imgVal = editingItem.image || "";
    try {
      await AdminApi.upsertItem({
        id: editingItem.id,
        species: editingItem.species || speciesTab || "dog",
        category_id: editingItem.category_id,
        name: editingItem.name.trim(),
        description: editingItem.description || "",
        price_cents: priceCents,
        image_url: imgVal,
        in_stock: editingItem.in_stock ? 1 : 0,
        special_offer: editingItem.special_offer ? 1 : 0,
      });
      setShowEdit(false);
      setEditingItem(null);
      await loadItems();
      alert("✅ Item updated.");
    } catch (err) {
      console.error("❌ Failed to update item:", err);
      alert("Failed to update item.");
    }
  };

  const onUploadToDraft = async (file, setter) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch("http://localhost:4000/api/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setter((prev) => ({ ...prev, image: data.url }));
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("Failed to upload image.");
    }
  };

  // ===== CATEGORY MANAGER =====
  const normalisedCategories = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        nameLower: c.name.toLowerCase(),
      })),
    [categories]
  );

  const isDuplicateCategory = newCategory.trim()
    ? normalisedCategories.some(
        (c) => c.nameLower === newCategory.trim().toLowerCase()
      )
    : false;

  const createCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    if (isDuplicateCategory) {
      alert("❌ Category already exists.");
      return;
    }
    setCatBusy(true);
    try {
      await AdminApi.createCategory({ name });
      setNewCategory("");
      await loadCategories();
      alert("✅ Category created.");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        "Failed to create category. Check console.";
      console.error("❌ Category create error:", err);
      alert(msg);
    } finally {
      setCatBusy(false);
    }
  };

  const deleteCategory = async (cat) => {
    if (
      !window.confirm(
        `Delete category "${cat.name}"?\nYou must move/delete its items first or this may fail.`
      )
    )
      return;
    try {
      await AdminApi.deleteCategory(cat.id);
      await loadCategories();
      alert("🗑️ Category deleted (if it had no items).");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        "Failed to delete category. Check console.";
      console.error("❌ Category delete error:", err);
      alert(msg);
    }
  };

  // ===== SPECIES MANAGER =====
  const createSpecies = async () => {
    const label = newSpeciesName.trim();
    if (!label) return;
    setSpeciesBusy(true);
    try {
      await AdminApi.createSpecies({
        label,
        icon: newSpeciesIcon || "",
      });
      setNewSpeciesName("");
      setNewSpeciesIcon("🐾");
      await loadSpecies();
      alert("✅ Species created.");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        "Failed to create species. Check console.";
      console.error("❌ Species create error:", err);
      alert(msg);
    } finally {
      setSpeciesBusy(false);
    }
  };

  const deleteSpecies = async (sp) => {
    if (
      !window.confirm(
        `Delete species "${sp.label}"?\nYou must delete its items first.`
      )
    )
      return;
    try {
      await AdminApi.deleteSpecies(sp.id);
      await loadSpecies();
      // if we deleted currently active species, reset tab
      if (speciesTab === sp.slug) {
        setSpeciesTab(
          (prev) =>
            SpeciesApi.list()[0]?.slug || "" // fallback, but realistically loadSpecies will handle it
        );
      }
      alert("🗑️ Species deleted (if it had no items).");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        "Failed to delete species. Check console.";
      console.error("❌ Species delete error:", err);
      alert(msg);
    }
  };

  // ===== RENDER =====
  return (
    <div className="space-y-6 p-4">
      {/* Header actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="bg-wood rounded-plank px-4 py-2 text-lg font-bold flex items-center gap-2">
          <span>🪵 Admin • Inventory</span>
          {speciesTab && (
            <span className="text-xs text-black/70">
              (
              {speciesList.find((s) => s.slug === speciesTab)?.label ||
                speciesTab}
              )
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {speciesList.map((sp) => (
            <button
              key={sp.id}
              className={`${ghostBtn} ${
                speciesTab === sp.slug ? "ring-2 ring-barn-rust" : ""
              }`}
              onClick={() => setSpeciesTab(sp.slug)}
            >
              <span className="mr-1">{sp.icon || "🐾"}</span>
              {sp.label}
            </button>
          ))}

          <select
            className="input-etched"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            title="Filter"
          >
            <option value="all">All</option>
            <option value="in">In stock</option>
            <option value="out">Out of stock</option>
            <option value="special">Special offers</option>
          </select>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={woodBtn}
            onClick={openAdd}
          >
            ➕ Add Item
          </motion.button>

          <motion.button
            whileHover={{ scale: changed.size ? 1.03 : 1 }}
            whileTap={{ scale: changed.size ? 0.97 : 1 }}
            disabled={!changed.size || saving}
            className={woodBtn}
            onClick={saveAll}
          >
            💾 Save Changes {changed.size ? `(${changed.size})` : ""}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[3fr,1fr] gap-6">
        {/* TABLE */}
        <div className="overflow-x-auto border rounded-plank bg-barn-parchment">
          <table className="w-full text-sm">
            <thead className="bg-[#efe4d2] text-left">
              <tr>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Species</th>
                <th className="p-3">Price (£)</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Special</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {filtered.map((row) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="border-t hover:bg-black/5 transition"
                  >
                    <td className="p-3">
                      <button
                        onClick={() => openEdit(row)}
                        className="focus:outline-none"
                        title="Click to edit"
                      >
                        <img
                          src={imgSrc(row)}
                          alt={row.name}
                          className="w-16 h-12 rounded-md border object-cover bg-[#ddd]"
                        />
                      </button>
                    </td>

                    <td className="p-3 align-top">
                      <input
                        className="input-etched"
                        value={row.name || ""}
                        onChange={(e) =>
                          onField(row, "name", e.target.value)
                        }
                      />
                    </td>

                    <td className="p-3 align-top">
                      <select
                        className="input-etched"
                        value={row.category_id || ""}
                        onChange={(e) =>
                          onField(row, "category_id", Number(e.target.value))
                        }
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 align-top">
                      <select
                        className="input-etched"
                        value={row.species || speciesTab}
                        onChange={(e) =>
                          onField(row, "species", e.target.value)
                        }
                      >
                        {speciesList.map((sp) => (
                          <option key={sp.id} value={sp.slug}>
                            {sp.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="p-3 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="input-etched w-24"
                        value={(Number(row.price_cents) / 100).toFixed(2)}
                        onChange={(e) =>
                          onField(
                            row,
                            "price_cents",
                            Math.round(Number(e.target.value || 0) * 100)
                          )
                        }
                      />
                    </td>

                    <td className="p-3 align-top">
                      {row.in_stock ? (
                        <span className={chipGreen}>In stock</span>
                      ) : (
                        <span className={chipRed}>Out of stock</span>
                      )}
                      <button
                        className={`${ghostBtn} ml-2`}
                        onClick={() => toggleStock(row)}
                        title="Toggle stock"
                      >
                        Toggle
                      </button>
                    </td>

                    <td className="p-3 align-top">
                      {row.special_offer ? (
                        <span className={chipAmber}>Special</span>
                      ) : (
                        <span className="text-xs text-black/60">—</span>
                      )}
                      <button
                        className={`${ghostBtn} ml-2`}
                        onClick={() => toggleSpecial(row)}
                        title="Toggle special"
                      >
                        Toggle
                      </button>
                    </td>

                    <td className="p-3 text-right align-top space-x-2">
                      <button
                        className={ghostBtn}
                        onClick={() => openEdit(row)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className={ghostBtn}
                        onClick={() => softDelete(row)}
                      >
                        Remove (soft)
                      </button>
                      <button
                        className={`${ghostBtn} text-red-700 border-red-400`}
                        onClick={() => hardDelete(row)}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-6 text-center text-black/60">
              No items match your filter.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: species + categories */}
        <div className="space-y-4">
          {/* Species manager */}
          <div className="border rounded-plank bg-barn-parchment p-4 space-y-3">
            <div className="font-bold text-lg flex items-center gap-2">
              🐾 Species
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {speciesList.map((sp) => (
                <div
                  key={sp.id}
                  className={`flex items-center justify-between rounded-md px-3 py-2 border cursor-pointer ${
                    speciesTab === sp.slug
                      ? "bg-amber-100 border-amber-300"
                      : "bg-white/70"
                  }`}
                  onClick={() => setSpeciesTab(sp.slug)}
                >
                  <div className="flex items-center gap-2">
                    <span>{sp.icon || "🐾"}</span>
                    <span className="text-sm font-medium">{sp.label}</span>
                    <span className="text-xs text-black/50">/{sp.slug}</span>
                  </div>
                  <button
                    className="text-xs text-red-700 hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSpecies(sp);
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {speciesList.length === 0 && (
                <div className="text-xs text-black/60">
                  No species yet – add one below.
                </div>
              )}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="text-sm font-semibold">Add new species</div>
              <input
                className="input-etched"
                placeholder="e.g. Fish"
                value={newSpeciesName}
                onChange={(e) => setNewSpeciesName(e.target.value)}
              />
              <input
                className="input-etched"
                placeholder="Icon (emoji), e.g. 🐟"
                value={newSpeciesIcon}
                onChange={(e) => setNewSpeciesIcon(e.target.value)}
              />
              <button
                className={woodBtn}
                disabled={!newSpeciesName.trim() || speciesBusy}
                onClick={createSpecies}
              >
                ➕ Create Species
              </button>
            </div>
          </div>

          {/* Category manager */}
          <div className="border rounded-plank bg-barn-parchment p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-lg flex items-center gap-2">
                📂 Categories
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between bg-white/70 rounded-md px-3 py-2 border"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{c.name}</span>
                  </div>
                  <button
                    className="text-xs text-red-700 hover:underline"
                    onClick={() => deleteCategory(c)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {categories.length === 0 && (
                <div className="text-xs text-black/60">
                  No categories yet – create one below.
                </div>
              )}
            </div>

            <div className="border-t pt-3 space-y-2">
              <div className="text-sm font-semibold">Add new category</div>
              <input
                className={`input-etched ${
                  isDuplicateCategory ? "border-red-500" : ""
                }`}
                placeholder="e.g. Natural Chews, Treats"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              {isDuplicateCategory && (
                <div className="text-xs text-red-600">
                  This name already exists.
                </div>
              )}
              <button
                className={woodBtn}
                disabled={!newCategory.trim() || isDuplicateCategory || catBusy}
                onClick={createCategory}
              >
                ➕ Create Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add item modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-barn-parchment rounded-plank border shadow-xl w-full max-w-xl p-5 space-y-3">
            <div className="text-lg font-bold">Add New Item</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2">
                <div className="text-xs mb-1">Name</div>
                <input
                  className="input-etched"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </label>
              <label>
                <div className="text-xs mb-1">Species</div>
                <select
                  className="input-etched"
                  value={draft.species || speciesTab}
                  onChange={(e) =>
                    setDraft({ ...draft, species: e.target.value })
                  }
                >
                  {speciesList.map((sp) => (
                    <option key={sp.id} value={sp.slug}>
                      {sp.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <div className="text-xs mb-1">Category</div>
                <select
                  className="input-etched"
                  value={draft.category_id}
                  onChange={(e) =>
                    setDraft({ ...draft, category_id: Number(e.target.value) })
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="col-span-2">
                <div className="text-xs mb-1">Description</div>
                <textarea
                  className="input-etched"
                  rows={3}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft({ ...draft, description: e.target.value })
                  }
                />
              </label>
              <label>
                <div className="text-xs mb-1">Price (£)</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-etched"
                  value={draft.price_cents}
                  onChange={(e) =>
                    setDraft({ ...draft, price_cents: e.target.value })
                  }
                />
              </label>
              <label>
                <div className="text-xs mb-1">Upload Image</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onUploadToDraft(e.target.files[0], setDraft)
                  }
                />
              </label>
              <label className="col-span-2">
                <div className="text-xs mb-1">Image URL</div>
                <input
                  className="input-etched"
                  value={draft.image}
                  onChange={(e) =>
                    setDraft({ ...draft, image: e.target.value })
                  }
                />
              </label>
              {draft.image && (
                <div className="col-span-2">
                  <div className="text-xs mb-1">Preview:</div>
                  <img
                    src={imgSrc(draft)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border shadow"
                  />
                </div>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!draft.in_stock}
                  onChange={(e) =>
                    setDraft({ ...draft, in_stock: e.target.checked ? 1 : 0 })
                  }
                />
                In stock
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!draft.special_offer}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      special_offer: e.target.checked ? 1 : 0,
                    })
                  }
                />
                Special offer
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button className={ghostBtn} onClick={() => setShowAdd(false)}>
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={woodBtn}
                onClick={createItem}
              >
                Create
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Edit item modal */}
      {showEdit && editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-barn-parchment rounded-plank border shadow-xl w-full max-w-xl p-5 space-y-3">
            <div className="text-lg font-bold">Edit Item</div>
            <div className="grid grid-cols-2 gap-3">
              <label className="col-span-2">
                <div className="text-xs mb-1">Name</div>
                <input
                  className="input-etched"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                />
              </label>
              <label>
                <div className="text-xs mb-1">Species</div>
                <select
                  className="input-etched"
                  value={editingItem.species || speciesTab}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      species: e.target.value,
                    })
                  }
                >
                  {speciesList.map((sp) => (
                    <option key={sp.id} value={sp.slug}>
                      {sp.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <div className="text-xs mb-1">Category</div>
                <select
                  className="input-etched"
                  value={editingItem.category_id}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      category_id: Number(e.target.value),
                    })
                  }
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="col-span-2">
                <div className="text-xs mb-1">Description</div>
                <textarea
                  className="input-etched"
                  rows={3}
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                <div className="text-xs mb-1">Price (£)</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-etched"
                  value={editingItem.price_display}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      price_display: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                <div className="text-xs mb-1">Upload Image</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onUploadToDraft(e.target.files[0], setEditingItem)
                  }
                />
              </label>
              <label className="col-span-2">
                <div className="text-xs mb-1">Image URL</div>
                <input
                  className="input-etched"
                  value={editingItem.image || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      image: e.target.value,
                    })
                  }
                />
              </label>
              {editingItem.image && (
                <div className="col-span-2">
                  <div className="text-xs mb-1">Preview:</div>
                  <img
                    src={imgSrc(editingItem)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-md border shadow"
                  />
                </div>
              )}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!editingItem.in_stock}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      in_stock: e.target.checked ? 1 : 0,
                    })
                  }
                />
                In stock
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!editingItem.special_offer}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      special_offer: e.target.checked ? 1 : 0,
                    })
                  }
                />
                Special offer
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                className={ghostBtn}
                onClick={() => {
                  setShowEdit(false);
                  setEditingItem(null);
                }}
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={woodBtn}
                onClick={saveEdit}
              >
                Save
              </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
