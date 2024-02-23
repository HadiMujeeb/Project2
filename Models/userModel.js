const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_admin: {
    type: Number,
    required: true,
  },
  is_Verified: {
    type: Number,
    default: 0,
  },
  isBlocked: {
    type: Boolean,
    default: true,
  },
  token: {
    type: String,
    default: "",
  },
  mobile: {
    type: Number,
    required: true,
  },
  addresses: [
    {
      name: {
        type: String,
      },
      mobile: {
        type: Number,
      },
      pincode: {
        type: Number,
      },
      address: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      landmark: {
        type: String,
      },
      
    }
  ],
  wallet: {
    type: Number,
    default: 0,
  },
  wallet_history: [
    {
      date: {
        type: Date,
      },
      amount: {
        type: Number,
      },
      description: {
        type: String,
      },
      paymentMethod: {
        type: String,
      },

    },
  ],
});

module.exports = mongoose.model("User", userSchema);
