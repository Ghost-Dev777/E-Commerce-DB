import mongoose from "mongoose";

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, index: true },
    logo: { type: String, default: null },
    description: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },

    productCount: { type: Number, default: 0 },

    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

brandSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
});

export default mongoose.model("Brand", brandSchema);
