import productService from "../services/product.service.js";
import { checkAndUpdateDiscount } from "../utils/dataHelper.js";
import Filter from "../models/Filter.model.js";
import Product from "../models/Product.model.js";
import Subcategory from "../models/subcategory.model.js";
import Category from "../models/category.model.js";

const buildAvailableFilters = async ({
  categoryId,
  subCategoryId,
  baseQuery,
  meta,
}) => {
  const filterConditions = [];

  if (categoryId) {
    filterConditions.push({ category: categoryId });
  }

  if (subCategoryId) {
    filterConditions.push({ subCategory: subCategoryId });
  }

  const privateFilters = await Filter.find({
    $or: filterConditions,
  }).lean();

  const privateFiltersWithValues = await Promise.all(
    privateFilters.map(async (filter) => {
      const values = await Product.distinct(
        `attributes.${filter.key}`,
        baseQuery,
      );

      return {
        ...filter,
        values: values.filter(Boolean),
      };
    }),
  );

  return {
    general: meta,
    private: privateFiltersWithValues,
  };
};

export const createProduct = async (req, res) => {
  try {
    const product = await productService.create(req.body);
    const responseData = product.saleEndAt
      ? checkAndUpdateDiscount(product.toObject())
      : product;

    res.status(201).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await productService.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "محصول یافت نشد",
      });
    }

    const productData = checkAndUpdateDiscount(product.toObject());

    res.json({
      success: true,
      data: productData,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategoryId } = req.params;
    const products = await productService.getBySubcategoryId(subcategoryId);
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { page, limit, sort, categoryId, subcategoryId, ...queryParams } =
      req.query;

    const filters = productService.buildFilters(queryParams);

    if (subcategoryId) {
      filters.subCategoryId = subcategoryId;
    } else if (categoryId) {
      const subCategories = await Subcategory.find({
        parentCategory: categoryId,
        isActive: true,
      }).select("_id");

      filters.subCategoryId = { $in: subCategories.map((s) => s._id) };
    }

    const result = await productService.list({
      page,
      limit,
      filters,
      sort,
    });

    const availableFilters = await buildAvailableFilters({
      categoryId,
      subCategoryId: subcategoryId,
      baseQuery: filters,
      meta: result.meta,
    });

    res.json({
      success: true,
      products: result.products.map(checkAndUpdateDiscount),
      total: result.total,
      page: result.page,
      pages: result.pages,
      availableFilters,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const updateProduct = async (req, res) => {
  try {
    const updated = await productService.update(req.params.id, req.body);

    if (!updated) return res.status(404).json({ message: "محصول یافت نشد" });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const deleted = await productService.delete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "محصول یافت نشد" });
    res.json({ message: "محصول حذف شد", deleted });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const listProducts = async (req, res) => {
  try {
    const { page, limit, sort, ...filters } = req.query;

    const result = await productService.list({
      page,
      limit,
      sort,
      filters,
    });

    res.json({
      success: true,
      products: result.products,
      total: result.total,
      page: result.page,
      pages: result.pages,
      meta: result.meta,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const discountedProducts = async (req, res) => {
  try {
    const products = await productService.discounted();
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const dealOfDayProducts = async (req, res) => {
  try {
    const products = await productService.dealOfDay();
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getProductsByCategorySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await productService.findByCategorySlug(slug, req.query);
    const category = await Category.findOne({ slug });
    const subCategories = await Subcategory.find({
      parentCategory: category._id,
      isActive: true,
    }).select("_id");

    const subCategoryIds = subCategories.map((s) => s._id);
    const baseQuery = {
      isActive: true,
      subCategoryId: { $in: subCategoryIds },
    };

    const availableFilters = await buildAvailableFilters({
      categoryId: category._id,
      baseQuery,
      meta: result.meta,
    });

    res.json({
      success: true,
      products: result.products,
      total: result.total,
      page: result.page,
      pages: result.pages,
      availableFilters,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsBySubCategorySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const result = await productService.findBySubCategorySlug(slug, req.query);

    const subCategory = await Subcategory.findOne({ slug });

    const baseQuery = {
      isActive: true,
      subCategoryId: subCategory._id,
    };

    const availableFilters = await buildAvailableFilters({
      categoryId: subCategory.parentCategory,
      subCategoryId: subCategory._id,
      baseQuery,
      meta: result.meta,
    });

    res.json({
      success: true,
      products: result.products,
      total: result.total,
      page: result.page,
      pages: result.pages,
      availableFilters,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsByBrand = async (req, res, next) => {
  try {
    const { brand } = req.params;
    const result = await productService.findByBrand(brand, req.query);

    res.json({
      success: true,
      products: result.products,
      total: result.total,
      page: result.page,
      pages: result.pages,
      meta: result.meta,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductsByIds = async (req, res, next) => {
  try {
    const ids = req.body.ids || req.query.ids?.split(",") || [];
    const products = await productService.findByIds(ids);

    res.json({
      success: true,
      products,
      total: products.length,
    });
  } catch (err) {
    next(err);
  }
};

export const getNewestProducts = async (req, res, next) => {
  try {
    const days = Number(req.query.days || 7);
    const products = await productService.newest(days);

    res.json({
      success: true,
      products,
      total: products.length,
    });
  } catch (err) {
    next(err);
  }
};
