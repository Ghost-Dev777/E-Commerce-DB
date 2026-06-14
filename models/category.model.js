import mongoose from "mongoose";
import slugify from "slugify";

const filterSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String },
    type: {
      type: String,
      enum: ["checkbox", "range", "radio"],
      default: "checkbox",
    },
    options: [String],
  },
  { _id: false },
);

const categorySchema = new mongoose.Schema(
  {
    name: {
      fa: {
        type: String,
        required: true,
        trim: true,
      },
      en: {
        type: String,
        trim: true,
      },
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    icon: {
      type: String,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    order: {
      type: Number,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    filters: [filterSchema],

    isBrandSeparated: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
categorySchema.virtual("subcategories", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "parentCategory",
});

categorySchema.virtual("subcategories", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "parentCategory",
});

categorySchema.pre("save", function () {
  if (this.isModified("name")) {
    const text = this.name.en || this.name.fa;
    this.slug = slugify(text, { lower: true, strict: true });
  }
  next();
});

export default mongoose.model("Category", categorySchema);
