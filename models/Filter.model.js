import mongoose from "mongoose";

const filterSchema = new mongoose.Schema(
  {
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    key: { type: String, required: true },
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["checkbox", "range", "select"],
      default: "checkbox",
    },
    options: [
      {
        label: String,
        value: String,
      },
    ],
    source: {
      type: String,
      enum: ["manual", "auto"],
      default: "auto",
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Filter", filterSchema);
