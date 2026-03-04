const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

process.env.MONGODB_URI = "mongodb+srv://cybal_admin:boni8338@cybal-capital.zqksvbe.mongodb.net/cybal_capital?retryWrites=true&w=majority&appName=cybal-capital";
process.env.JWT_SECRET = "cybalcapital_secret_key_2026";
process.env.JWT_EXPIRE = "7d";
process.env.PORT = "5000";
process.env.CLIENT_URL = "http://localhost:5173"
const app = express();

// ── Middleware ────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api/", limiter);

// ── Database ──────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => { console.error("❌ MongoDB error:", err.message); process.exit(1); });

// ── Routes ────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/enquiries",  require("./routes/enquiries"));
app.use("/api/admin",      require("./routes/admin"));

// ── Health check ─────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok", message: "Cybal Capital API running" }));

// ── Error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));