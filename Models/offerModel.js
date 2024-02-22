const mongoose = require("mongoose");

const OfferSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startingDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: true,
  },
});

module.exports = mongoose.model("offer", OfferSchema);
