const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true },
  phone:    { type: String, default: "" },
  interest: { type: String, enum: ["Buying", "Selling", "Investment Advisory", "General Enquiry"], default: "General Enquiry" },
  message:  { type: String, required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", default: null },
  status:   { type: String, enum: ["New", "Read", "Replied", "Closed"], default: "New" },
}, { timestamps: true });

module.exports = mongoose.model("Enquiry", enquirySchema);