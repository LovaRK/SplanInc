const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "store.json");
const ADMIN_KEY = process.env.ADMIN_KEY || "";

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initial = {
      leads: [],
      newsletter: [],
      meta: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
  }
}

function readStore() {
  ensureStore();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeStore(store) {
  store.meta.updatedAt = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2));
}

function cleanText(value) {
  return String(value || "").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  if (!phone) return true;
  return /^[+()\-\s\d]{7,20}$/.test(phone);
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "splan-platform-api",
    time: new Date().toISOString(),
  });
});

app.post("/api/leads", (req, res) => {
  const name = cleanText(req.body.name);
  const email = cleanText(req.body.email).toLowerCase();
  const company = cleanText(req.body.company);
  const role = cleanText(req.body.role);
  const phone = cleanText(req.body.phone);
  const interest = cleanText(req.body.interest);
  const message = cleanText(req.body.message);

  const attribution = {
    utm_source: cleanText(req.body.utm_source),
    utm_medium: cleanText(req.body.utm_medium),
    utm_campaign: cleanText(req.body.utm_campaign),
    referrer: cleanText(req.body.referrer),
  };

  if (!name || name.length < 2) {
    return res.status(400).json({ ok: false, error: "Valid name is required" });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Valid email is required" });
  }
  if (!company) {
    return res.status(400).json({ ok: false, error: "Company is required" });
  }
  if (!isValidPhone(phone)) {
    return res.status(400).json({ ok: false, error: "Phone format is invalid" });
  }
  if (!message || message.length < 10) {
    return res
      .status(400)
      .json({ ok: false, error: "Message should be at least 10 characters" });
  }

  const store = readStore();
  const entry = {
    id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    company,
    role,
    phone,
    interest,
    message,
    attribution,
    createdAt: new Date().toISOString(),
    source: "website-contact-form",
  };

  store.leads.unshift(entry);
  writeStore(store);

  return res.status(201).json({
    ok: true,
    message: "Request submitted successfully",
    leadId: entry.id,
  });
});

app.post("/api/newsletter", (req, res) => {
  const email = cleanText(req.body.email).toLowerCase();

  if (!isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: "Valid email is required" });
  }

  const store = readStore();
  const exists = store.newsletter.some((item) => item.email === email);

  if (exists) {
    return res.json({ ok: true, message: "Already subscribed" });
  }

  store.newsletter.unshift({
    id: `news_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    createdAt: new Date().toISOString(),
  });
  writeStore(store);

  return res.status(201).json({ ok: true, message: "Subscribed successfully" });
});

app.get("/api/leads", (req, res) => {
  if (!ADMIN_KEY) {
    return res
      .status(503)
      .json({ ok: false, error: "Set ADMIN_KEY env var to enable this endpoint" });
  }

  const key = req.header("x-admin-key");
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const store = readStore();
  return res.json({
    ok: true,
    count: store.leads.length,
    leads: store.leads,
  });
});

const pageMap = {
  "/": "index.html",
  "/about": "about.html",
  "/services": "services.html",
  "/solutions": "solutions.html",
  "/industries": "industries.html",
  "/ai-for-oracle": "ai-for-oracle.html",
  "/contact": "contact.html",

  // Legacy routes kept as aliases for compatibility
  "/enterprise-ai": "ai-for-oracle.html",
  "/workspace": "services.html",
  "/visitor-intelligence": "services.html",
  "/oracle-cloud": "solutions.html",
  "/resources": "solutions.html",
  "/why-splan": "about.html",
};

Object.entries(pageMap).forEach(([routePath, file]) => {
  app.get(routePath, (_req, res) => {
    res.sendFile(path.join(__dirname, "public", file));
  });
});

app.get("*", (_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  ensureStore();
  console.log(`Splan platform running on http://localhost:${PORT}`);
});
