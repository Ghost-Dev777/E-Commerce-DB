import Product from "../models/Product.model.js";
import SubCategory from "../models/subcategory.model.js";
import Category from "../models/category.model.js";

const buildMongoQuery = (queryParams = {}) => {
  const {
    minPrice,
    maxPrice,
    hasDiscount,
    fastShipping,
    minRating,
    inStock,
    brand,
    page,
    limit,
    sort,
    ...dynamicFilters
  } = queryParams;

  const query = {
    isActive: true,
  };

  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
  }

  if (inStock === "true") {
    query.stock = { $gt: 0 };
  }

  if (hasDiscount === "true") {
    query.discount = { $gt: 0 };
  }

  if (fastShipping === "true") {
    query.fastShipping = true;
  }

  if (minRating) {
    query.rating = { $gte: Number(minRating) };
  }

  if (brand) {
    query["attributes.brand"] = brand;
  }

  Object.entries(dynamicFilters).forEach(([key, value]) => {
    if (!value) return;

    if (Array.isArray(value)) {
      query[`attributes.${key}`] = { $in: value };
    } else {
      query[`attributes.${key}`] = value;
    }
  });

  return query;
};

class ProductService {
  buildFilters(queryParams = {}) {
    return buildMongoQuery(queryParams);
  }

  async create(data) {
    return await Product.create(data);
  }

  async findById(id) {
    return await Product.findById(id);
  }

  async update(id, data) {
    if (data.saleEndAt || data.saleEndAt_shamsi) {
      const now = new Date();
      const newEndDate = data.saleEndAt ? new Date(data.saleEndAt) : null;

      if (newEndDate && newEndDate > now) {
        data.hasDiscount = true;

        const currentProduct = await Product.findById(id);
        if (currentProduct && !currentProduct.oldPrice) {
          data.oldPrice = currentProduct.price;
        }
      }
    }

    return await Product.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async delete(id) {
    const result = await Product.deleteOne({ _id: id });
    if (result.deletedCount === 0) return null;
    return { message: "Product deleted" };
  }

  async list({ page = 1, limit = 12, filters = {}, sort = "-createdAt" }) {
    page = Number(page) || 1;
    limit = Number(limit) || 12;
    const skip = (page - 1) * limit;

    const statsPipeline = [
      { $match: filters },
      {
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          allColors: { $push: "$colors" },
        },
      },
    ];
    const [statsResult] = await Product.aggregate(statsPipeline);

    const uniqueColors = statsResult
      ? [...new Set(statsResult.allColors.flat())].filter(Boolean)
      : [];

    const products = await Product.find(filters)
      .populate("subCategoryId", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Product.countDocuments(filters);

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
      meta: {
        priceRange: {
          min: statsResult?.minPrice || 0,
          max: statsResult?.maxPrice || 0,
        },
        colors: uniqueColors,
      },
    };
  }

  async discounted() {
    return await Product.find({
      hasDiscount: true,
      stock: { $gt: 0 },
    })
      .populate("subCategoryId", "name slug")
      .select("-__v")
      .lean();
  }

  async dealOfDay() {
    const now = new Date();
    return await Product.find({
      hasDiscount: true,
      stock: { $gt: 0 },
      saleEndAt: { $exists: true, $ne: null, $gt: now },
    })
      .sort({ discount: -1 })
      .limit(10)
      .populate("subCategoryId", "name slug")
      .select("-__v")
      .lean();
  }

  async getBySubcategoryId(subcategoryId) {
    if (!subcategoryId) throw new Error("subcategoryId is required");

    return await Product.find({
      subCategoryId: subcategoryId,
      stock: { $gt: 0 },
    })
      .populate("subCategoryId", "name slug")
      .select("-__v")
      .lean();
  }

  async findBySubCategorySlug(
    slug,
    { page = 1, limit = 12, sort = "-createdAt", ...queryParams } = {},
  ) {
    const sub = await SubCategory.findOne({ slug }).select("_id");
    if (!sub) {
      return {
        items: [],
        total: 0,
        page,
        limit,
      };
    }
    const dynamicFilters = buildMongoQuery(queryParams);
    const filters = {
      ...dynamicFilters,
      subCategoryId: sub._id,
    };

    return this.list({
      page,
      limit,
      filters,
      sort,
    });
  }

  async findByCategorySlug(
    slug,
    { page = 1, limit = 12, sort = "-createdAt", ...queryParams } = {},
  ) {
    const cat = await Category.findOne({ slug }).select("_id");

    if (!cat) {
      return {
        items: [],
        total: 0,
        page,
        limit,
      };
    }

    const subs = await SubCategory.find({
      parentCategory: cat._id,
    }).select("_id");

    const ids = subs.map((s) => s._id);

    const dynamicFilters = buildMongoQuery(queryParams);

    const filters = {
      ...dynamicFilters,
      subCategoryId: { $in: ids },
    };

    return this.list({
      page,
      limit,
      filters,
      sort,
    });
  }

  async findByBrand(
    brand,
    { page = 1, limit = 12, sort = "-createdAt", ...queryParams } = {},
  ) {
    const dynamicFilters = buildMongoQuery(queryParams);

    const filters = {
      ...dynamicFilters,
      "attributes.brand": brand.toLowerCase(),
    };

    return this.list({
      page,
      limit,
      filters,
      sort,
    });
  }

  async findByIds(ids = []) {
    return Product.find({ _id: { $in: ids } }).populate(
      "subCategoryId",
      "name slug",
    );
  }

  async newest(days = 7) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    return Product.find({ createdAt: { $gte: from } }).sort({ createdAt: -1 });
  }
}

export default new ProductService();
