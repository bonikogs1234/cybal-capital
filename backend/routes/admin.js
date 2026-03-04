const express = require("express");
const router = express.Router();
const Property = require("../models/Property");
const User = require("../models/User");
const Enquiry = require("../models/Enquiry");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [totalProperties, activeProperties, soldProperties, totalEnquiries, newEnquiries] = await Promise.all([
      Property.countDocuments({ isActive: true }),
      Property.countDocuments({ isActive: true, status: "For Sale" }),
      Property.countDocuments({ status: "Sold" }),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: "New" }),
    ]);

    const recentEnquiries = await Enquiry.find().sort("-createdAt").limit(5).populate("property", "title");
    const recentProperties = await Property.find({ isActive: true }).sort("-createdAt").limit(5).select("title price status createdAt");

    res.json({ success: true, stats: { totalProperties, activeProperties, soldProperties, totalEnquiries, newEnquiries }, recentEnquiries, recentProperties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/create-admin — create first admin user
router.post("/create-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email already exists" });
    const user = await User.create({ name, email, password, role: "admin" });
    user.password = undefined;
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/properties/:id/feature
router.put("/properties/:id/feature", async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(req.params.id, { isFeatured: req.body.isFeatured }, { new: true });
    res.json({ success: true, property });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;