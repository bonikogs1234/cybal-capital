const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/properties — list with search & filters
router.get("/", async (req, res) => {
  try {
    const { search, type, status, tag, minPrice, maxPrice, beds, neighbourhood, sort = "-createdAt", page = 1, limit = 12 } = req.query;

    const query = { isActive: true };
    if (search) query.$text = { $search: search };
    if (type) query.type = type;
    if (status) query.status = status;
    if (tag) query.tag = tag;
    if (beds) query["details.beds"] = { $gte: Number(beds) };
    if (neighbourhood) query["location.neighbourhood"] = new RegExp(neighbourhood, "i");
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const total = await Property.countDocuments(query);
    const properties = await Property.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, total, pages: Math.ceil(total / limit), currentPage: Number(page), properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/featured
router.get("/featured", async (req, res) => {
  try {
    const properties = await Property.find({ isActive: true, isFeatured: true }).sort("-createdAt").limit(6);
    res.json({ success: true, properties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/properties/:id
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } }, { new: true });
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/properties — admin only
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const property = await Property.create(req.body);
    res.status(201).json({ success: true, property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/properties/:id — admin only
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!property) return res.status(404).json({ success: false, message: "Property not found" });
    res.json({ success: true, property });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/properties/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await Property.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Property removed" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;