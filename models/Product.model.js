import mongoose from "mongoose";
import { nanoid } from "nanoid";
import moment from "jalali-moment";

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      default: nanoid,
      unique: true,
      index: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      index: true,
    },
    title: {
      type: String,
      required: [true, "عنوان محصول الزامی است"],
      trim: true,
    },
    colors: [
      {
        type: String,
        trim: true,
      },
    ],
    stock: {
      type: Number,
      required: [true, "موجودی محصول الزامی است"],
      min: [0, "موجودی نمی‌تواند منفی باشد"],
      default: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, "امتیاز نمی‌تواند منفی باشد"],
      max: [5, "امتیاز نمی‌تواند بیشتر از 5 باشد"],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    fastShipping: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        type: [String],
        validate: {
          validator: (v) => v.length > 0 && v.length <= 10,
        },
        required: [true, "حداقل یک لینک عکس الزامی است"],
      },
    ],
    description: {
      type: String,
      trim: true,
    },
    hasDiscount: {
      type: Boolean,
      default: false,
    },
    oldPrice: {
      type: Number,
      default: null,
    },
    price: {
      type: Number,
      required: [true, "قیمت محصول الزامی است"],
      min: [0, "قیمت نمی‌تواند منفی باشد"],
    },

    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "شناسه زیردسته الزامی است"],
      ref: "Subcategory",
      index: true,
    },
    saleEndAt: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          if (value && value < new Date()) {
            return false;
          }
          return true;
        },
        message: "تاریخ پایان تخفیف نامعتبر است",
      },
    },

    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    brand: { type: String, index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual("isExpired").get(function () {
  return this.saleEndAt && this.saleEndAt < new Date();
});

productSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    const SubCategory = mongoose.model("SubCategory");
    await SubCategory.updateMany(
      { products: this._id },
      { $pull: { products: this._id } },
    );
    next();
  },
);
productSchema.virtual("saleEndAtJalali").get(function () {
  if (!this.saleEndAt) return null;
  return moment(this.saleEndAt).locale("fa").format("YYYY/MM/DD HH:mm");
});

productSchema.index({ hasDiscount: 1, saleEndAt: 1 });
productSchema.index({ subCategoryId: 1, stock: 1 });
productSchema.index({ brand: 1, subCategoryId: 1 });

export default mongoose.model("Product", productSchema);
