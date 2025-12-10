import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ALWAYS use absolute path inside /server/data
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Fully absolute DB path
const dbPath = path.join(dataDir, "farmbarn.db");
console.log("📦 USING DATABASE:", dbPath);

const db = new Database(dbPath);

// ---------- CORE SCHEMA ----------
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE,
  slug TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category_id INTEGER,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  species TEXT DEFAULT '',
  price_cents INTEGER DEFAULT 0,
  image_url TEXT DEFAULT '',
  in_stock INTEGER DEFAULT 1,
  special_offer INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  items_json TEXT,
  address_json TEXT,
  delivery_method TEXT DEFAULT 'collect',
  total_cents INTEGER,
  status TEXT DEFAULT 'placed',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS species (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE,
  label TEXT,
  icon TEXT DEFAULT ''
);
`);

// ---------- SAFE MIGRATIONS (NO ALTER TABLE CATEGORIES!) ----------
try { db.prepare("ALTER TABLE items ADD COLUMN image_url TEXT DEFAULT ''").run(); } catch {}
try { db.prepare("ALTER TABLE items ADD COLUMN species TEXT DEFAULT ''").run(); } catch {}

// ---------- FIX EXISTING CATEGORY SLUGS ----------
const catRows = db.prepare("SELECT id,name,slug FROM categories").all();

for (const c of catRows) {
  if (!c.slug || c.slug.trim() === "") {
    const slug = c.name.toLowerCase().trim().replace(/\s+/g, "-");
    db.prepare("UPDATE categories SET slug=? WHERE id=?").run(slug, c.id);
    console.log(`🔧 Updated category slug: ${c.name} → ${slug}`);
  }
}

// ---------- SEED DEFAULT DATA ----------
export function seedIfNeeded() {
  const count = db.prepare("SELECT COUNT(*) AS c FROM items").get().c;
  if (count > 0) return;

  console.log("🐾 Seeding Pawlina categories & items...");

  db.exec("DELETE FROM categories;");

  const insertCat = db.prepare("INSERT INTO categories (name,slug) VALUES (?,?)");

  const cats = {
    Accessories: insertCat.run("Accessories", "accessories").lastInsertRowid,
    "Natural Chews": insertCat.run("Natural Chews", "natural-chews").lastInsertRowid,
    Supplements: insertCat.run("Supplements", "supplements").lastInsertRowid,
    Treats: insertCat.run("Treats", "treats").lastInsertRowid,
  };

  const insertItem = db.prepare(`
    INSERT INTO items (category_id, name, description, species, price_cents, image_url, in_stock, special_offer)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    insertItem.run(cats.Accessories, "Dog Collar", "Durable collar.", "dog", 1299, "/images/dog_collar.jpg", 1, 0);
    insertItem.run(cats["Natural Chews"], "Beef Chew Bone", "Chew bone.", "dog", 799, "/images/dog_chew.jpg", 1, 1);

    insertItem.run(cats.Accessories, "Cat Collar", "Soft collar.", "cat", 899, "/images/cat_collar.jpg", 1, 0);
    insertItem.run(cats.Treats, "Salmon Treats", "Tasty treats.", "cat", 499, "/images/cat_treats.jpg", 1, 1);
  });

  tx();

  console.log("✅ Seed complete!");
}

// ---------- BASE SPECIES ----------
const baseSpecies = [
  { slug: "dog", label: "Dogs", icon: "🐶" },
  { slug: "cat", label: "Cats", icon: "🐱" },
];

for (const s of baseSpecies) {
  try {
    db.prepare("INSERT INTO species (slug, label, icon) VALUES (?, ?, ?)").run(s.slug, s.label, s.icon);
  } catch {}
}

export default db;
