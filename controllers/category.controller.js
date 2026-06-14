import Category from "../models/category.model.js";
import Subcategory from "../models/subcategory.model.js";

export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $match: { isActive: true },
      },

      {
        $sort: { order: 1 },
      },

      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "parentCategory",
          as: "subcategories",
          pipeline: [
            {
              $match: { isActive: true },
            },
            {
              $sort: { order: 1 },
            },
            {
              $project: {
                _id: 1,
                name: 1,
                slug: 1,
                image: 1,
              },
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.aggregate([
      {
        $match: { slug, isActive: true },
      },

      {
        $lookup: {
          from: "subcategories",
          localField: "_id",
          foreignField: "parentCategory",
          as: "subcategories",
          pipeline: [
            {
              $match: { isActive: true },
            },
            {
              $sort: { order: 1 },
            },
          ],
        },
      },
    ]);

    if (!category.length) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, isBrandSeparated } = req.body;

    const category = await Category.create({
      name,
      slug,
      description,
      isBrandSeparated,
    });

    return res.status(201).json(category);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create category",
      error: error.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, isBrandSeparated } = req.body;

    const allowedUpdates = {};
    if (name !== undefined) allowedUpdates.name = name;
    if (slug !== undefined) allowedUpdates.slug = slug;
    if (description !== undefined) allowedUpdates.description = description;
    if (isBrandSeparated !== undefined)
      allowedUpdates.isBrandSeparated = isBrandSeparated;

    const category = await Category.findByIdAndUpdate(id, allowedUpdates, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error("Error updating category:", error);
    return res.status(500).json({
      message: "Failed to update category",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await Subcategory.updateMany({ parentCategory: id }, { isActive: false });

    res.json({
      success: true,
      message: "Category deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
