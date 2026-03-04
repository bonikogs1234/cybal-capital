const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  type:        { type: String, enum: ["House", "Apartment", "Villa", "Penthouse", "Townhouse", "Mansion", "Studio", "Loft"], required: true },
  status:      { type: String, enum: ["For Sale", "Sold", "Under Offer"], default: "For Sale" },
  tag:         { type: String, enum: ["Featured", "Exclusive", "New", "Luxury", "Hot Deal"], default: "New" },

  location: {
    address:       { type: String, required: true },
    neighbourhood: { type: String, required: true },
  },

  details: {
    beds:  { type: Number, required: true },
    baths: { type: Number, required: true },
    sqft:  { type: Number, required: true },
  },

  features:   [String],

  images: [{
    url:       { type: String },
    public_id: { type: String },
  }],

  agent:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  views:      { type: Number, default: 0 },
  isActive:   { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },

}, { timestamps: true });

propertySchema.index({ title: "text", "location.address": "text", "location.neighbourhood": "text" });

module.exports = mongoose.model("Property", propertySchema);