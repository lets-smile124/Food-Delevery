import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Store Manager",
    },
    email: {
      type: String,
      default: "ankitanone12@gmail.com",
    },
    phone: {
      type: String,
      default: "+91 9519296779",
    },
    role: {
      type: String,
      default: "Super Admin",
    },
    avatar: {
      type: String,
      default: "",
    },
    restaurantName: {
      type: String,
      default: "Tomato - Handcrafted Flavors",
    },
    tagline: {
      type: String,
      default: "Serving happiness, one delicious bite at a time.",
    },
    storeAddress: {
      type: String,
      default: "Main Culinary Boulevard, Food City",
    },
    supportEmail: {
      type: String,
      default: "ankitanone12@gmail.com",
    },
    supportPhone: {
      type: String,
      default: "+91 9519296779",
    },
    deliveryTime: {
      type: String,
      default: "30 Mins",
    },
    deliveryFee: {
      type: Number,
      default: 2,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { minimize: false }
);

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);

export default adminModel;

