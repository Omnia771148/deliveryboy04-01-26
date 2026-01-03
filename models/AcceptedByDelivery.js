import mongoose from "mongoose";

// Reuse the same schemas for consistency
const ItemSchema = new mongoose.Schema({
  itemId: String,
  name: String,
  price: Number,
  quantity: Number,
});

const LocationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,
  mapUrl: String,
});

const AcceptedByDeliverySchema = new mongoose.Schema(
  {
    originalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcceptedOrder",
      required: true,
    },

    orderId: String,
    deliveryBoyId: String,

    userId: String,
    restaurantId: String,

    items: [ItemSchema], // Changed from Array to ItemSchema
    totalCount: Number,
    totalPrice: Number,
    gst: Number,           // Added
    deliveryCharge: Number, // Added
    grandTotal: Number,    // Added
    aa: String,           // Added

    location: LocationSchema, // Added

    paymentStatus: {
      type: String,
      default: "Pending",
    },
    razorpayOrderId: String, // Added
    razorpayPaymentId: String, // Added

    orderDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      default: "Accepted by Delivery",
    },

    acceptedAt: {
      type: Date,
      default: Date.now,
    },

    // Additional fields from AcceptedOrder
    rest: String,           // Added
    rejectedBy: {           // Added
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.AcceptedByDelivery ||
  mongoose.model("AcceptedByDelivery", AcceptedByDeliverySchema);