import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },
    houseNo: {
      type: String,
      default: "",
    },
    street: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    state: {
      type: String,
      default: "",
    },
    pincode: {
      type: String,
      default: "",
    },
    landmark: {
      type: String,
      default: "",
    },
    instructions: {
      type: String,
      default: "",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const preferencesSchema = new mongoose.Schema(
  {
    dietaryType: {
      type: String,
      enum: ["All", "Veg", "Non-Veg"],
      default: "All",
    },
    dietaryRestrictions: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    orderUpdates: {
      type: Boolean,
      default: true,
    },
    promotionalOffers: {
      type: Boolean,
      default: true,
    },
    preferredLanguage: {
      type: String,
      default: "English",
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    dob: {
      type: String,
      default: "",
    },

    avatar: {
      type: String,
      default: "",
    },

    isEmailVerified: {
      type: Boolean,
      default: true,
    },

    // Legacy address string retained for backward compatibility
    address: {
      type: String,
      default: "",
    },

    // Multiple delivery addresses list
    addresses: {
      type: [addressSchema],
      default: [],
    },

    // User preferences
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },

    cartData: {
      type: Object,
      default: {},
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);

const userModel =
  mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
