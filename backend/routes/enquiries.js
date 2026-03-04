const express = require("express");
const router = express.Router();
const Enquiry = require("../models/Enquiry");
const { protect, adminOnly } = require("../middleware/auth");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

// POST /api/enquiries — public
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, interest, message, propertyId } = req.body;
    const enquiry = await Enquiry.create({ name, email, phone, interest, message, property: propertyId || null });

    // Email notification (non-fatal)
    try {
      await transporter.sendMail({
        from: `"Cybal Capital" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: `New Enquiry: ${interest} — ${name}`,
        html: `<h2>New Enquiry</h2><p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p><p><b>Phone:</b> ${phone||"N/A"}</p><p><b>Interest:</b> ${interest}</p><p><b>Message:</b> ${message}</p>`,
      });
      await transporter.sendMail({
        from: `"Cybal Capital Limited" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Thank you for your enquiry — Cybal Capital",
        html: `<h2>Dear ${name},</h2><p>Thank you for reaching out. One of our consultants will be in touch within 24 hours.</p><p><b>Your message:</b> "${message}"</p><br/><p>Warm regards,<br/>Cybal Capital Team</p>`,
      });
    } catch (mailErr) {
      console.error("Email error (non-fatal):", mailErr.message);
    }

    res.status(201).json({ success: true, message: "Enquiry submitted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/enquiries — admin only
router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { status } : {};
    const total = await Enquiry.countDocuments(query);
    const enquiries = await Enquiry.find(query)
      .populate("property", "title price")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, total, enquiries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/enquiries/:id/status — admin only
router.put("/:id/status", protect, adminOnly, async (req, res) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json({ success: true, enquiry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;