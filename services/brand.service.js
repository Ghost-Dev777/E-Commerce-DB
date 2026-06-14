import Brand from "../models/Brand.model.js";
import Product from "../models/Product.model.js";

export const createBrand = (data) => Brand.create(data);

export const getAllBrands = () => Brand.find().sort({ order: 1 }).lean();

export const updateBrand = (id, data) =>
  Brand.findByIdAndUpdate(id, data, { new: true });

export const deleteBrand = (id) => Brand.findByIdAndDelete(id);

export const getFeaturedBrands = () =>
  Brand.find({ isFeatured: true, isActive: true }).sort({ order: 1 }).lean();

export const getBrandBySlug = (slug) =>
  Brand.findOne({ slug, isActive: true }).lean();

export const syncBrandsFromProducts = async () => {
  const names = await Product.distinct("attributes.brand");

  const report = { createdBrands: 0, matchedBrands: 0, updatedProducts: 0 };

  for (const name of names) {
    if (!name) continue;

    let brand = await Brand.findOne({ name });

    if (!brand) {
      brand = await Brand.create({ name });
      report.createdBrands++;
    } else {
      report.matchedBrands++;
    }

    const res = await Product.updateMany(
      {
        $or: [{ brand: name }, { "attributes.brand": name }],
      },
      { $set: { brandId: brand._id } },
    );

    report.updatedProducts += res.modifiedCount || res.nModified || 0;
  }

  return report;
};

export const updateAllBrandCounts = async () => {
  const brands = await Brand.find();

  for (const brand of brands) {
    const count = await Product.countDocuments({ brandId: brand._id });

    brand.productCount = count;
    await brand.save();
  }

  return { success: true };
};
