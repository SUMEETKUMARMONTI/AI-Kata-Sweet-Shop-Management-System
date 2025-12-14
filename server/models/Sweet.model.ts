import mongoose from "mongoose";

const SweetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const SweetModel = mongoose.model("Sweet", SweetSchema);
