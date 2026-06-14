import mongoose from "mongoose";
import slugify from "slugify";



const subcategorySchema = new mongoose.Schema(
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

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
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
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

subcategorySchema.pre("save", function() {
  if (!this.isModified("name")) return;
  
  const base = this.name.en || this.name.fa;
  this.slug = slugify(base, {
    lower: true,
    strict: true,
    trim: true
  });
});

subcategorySchema.pre("findOneAndUpdate", function() {
  const update = this.getUpdate();
  
  if ((update.name || update.$set?.name) && !update.slug && !update.$set?.slug) {
    const nameObj = update.name || update.$set?.name;
    const base = nameObj.en || nameObj.fa;
    const newSlug = slugify(base, {
      lower: true,
      strict: true,
      trim: true
    });
    
    if (update.$set) {
      update.$set.slug = newSlug;
    } else {
      update.slug = newSlug;
    }
  }
});

export default mongoose.model("Subcategory", subcategorySchema);
