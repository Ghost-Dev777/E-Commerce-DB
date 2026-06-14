import mongoose from "mongoose";

const { Schema } = mongoose;

const BannerSchema = new Schema(
  {
    image: {
      type: String,
      required: [true, "تصویر بنر الزامی است"],
      trim: true,
    },

    mobileImage: {
      type: String,
      default: null,
      trim: true,
    },

    positionId: {
      type: String,
      required: [true, "شناسه جایگاه الزامی است"],
      enum: ["banner-1", "banner-2", "banner-3", "banner-4", "banner-5"],
    },

    link: {
      type: {
        type: String,
        required: true,
        enum: ["product", "category", "subcategory", "brand", "collection", "external"],
      },

      products: [
        {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
      ],

      category: {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },

      subcategory: {
        type: Schema.Types.ObjectId,
        ref: "Subcategory",
      },

      brand: {
        type: String,
        trim: true,
      },

      url: {
        type: String,
        trim: true,
      },
    },

    startDate: {
      type: Date,
      required: [true, "تاریخ شروع الزامی است"],
      index: true,
    },

    endDate: {
      type: Date,
      required: [true, "تاریخ پایان الزامی است"],
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },

    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


BannerSchema.index(
  { positionId: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

BannerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

BannerSchema.virtual("ctr").get(function () {
  if (this.impressions === 0) return 0;
  return Number(((this.clicks / this.impressions) * 100).toFixed(2));
});

BannerSchema.path("endDate").validate(function (value) {
  return value > this.startDate;
}, "تاریخ پایان باید بعد از تاریخ شروع باشد");


BannerSchema.pre("validate", function (next) {
  const { type, products, category, subcategory, brand, url } = this.link || {};
  
  switch (type) {
    case 'product':
      if (!products || products.length === 0) {
        return next(new Error('برای بنر محصول، حداقل یک محصول الزامی است'));
      }
      if (category || subcategory || brand || url) {
        return next(new Error('برای بنر محصول، فقط فیلد products مجاز است'));
      }
      break;
      
    case 'category':
      if (!category) {
        return next(new Error('برای بنر دسته‌بندی، فیلد category الزامی است'));
      }
      if (products?.length || subcategory || brand || url) {
        return next(new Error('برای بنر دسته‌بندی، فقط فیلد category مجاز است'));
      }
      break;
      
    case 'subcategory':
      if (!subcategory) {
        return next(new Error('برای بنر زیردسته، فیلد subcategory الزامی است'));
      }
      if (products?.length || category || brand || url) {
        return next(new Error('برای بنر زیردسته، فقط فیلد subcategory مجاز است'));
      }
      break;
      
    case 'brand':
      if (!brand) {
        return next(new Error('برای بنر برند، فیلد brand الزامی است'));
      }
      if (products?.length || category || subcategory || url) {
        return next(new Error('برای بنر برند، فقط فیلد brand مجاز است'));
      }
      break;
      
    case 'external':
      if (!url) {
        return next(new Error('برای بنر خارجی، فیلد url الزامی است'));
      }
      try {
        const parsedUrl = new URL(url);
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          return next(new Error('فقط پروتکل http و https مجاز است'));
        }
      } catch (e) {
        return next(new Error('فرمت URL نامعتبر است'));
      }
      if (products?.length || category || subcategory || brand) {
        return next(new Error('برای بنر خارجی، فقط فیلد url مجاز است'));
      }
      break;
      
    case 'collection':
      if (!url) {
        return next(new Error("برای لینک external یا collection باید url مشخص شود"));
      }
      break;
      
    default:
      return next(new Error('نوع لینک نامعتبر است'));
  }
  
});

export default mongoose.model("Banner", BannerSchema);
