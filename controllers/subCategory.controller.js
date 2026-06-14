import Subcategory from "../models/subcategory.model.js";
import Category from "../models/category.model.js";

export const getAllSubcategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [subcategories, total] = await Promise.all([
      Subcategory.find({ isActive: true })
        .populate("parentCategory", "name slug")
        .sort({ order: 1 })
        .skip(skip)
        .limit(limit),
      Subcategory.countDocuments({ isActive: true }),
    ]);

    return res.json({
      success: true,
      count: subcategories.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: subcategories,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
    });
  }
};

export const getSubcategoriesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // چک کردن وجود دسته‌بندی اصلی
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const subcategories = await Subcategory.find({
      parentCategory: categoryId,
      isActive: true,
    }).sort({ order: 1 });

    return res.json({
      success: true,
      count: subcategories.length,
      data: subcategories,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subcategories",
    });
  }
};

export const getSubcategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.findOne({
      _id: id,
      isActive: true,
    }).populate("parentCategory", "name slug");

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSubcategoryFilters = async (req, res) => {
  try {
    const subCategory = await Subcategory.findById(req.params.id).select(
      "filters name",
    );

    if (!subCategory) {
      return res.status(404).json({
        success: false,
        message: "زیردسته یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: subCategory.name,
        filters: subCategory.filters,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const createSubcategory = async (req, res) => {
  try {
    const { parentCategory } = req.body;

    const categoryExists = await Category.findById(parentCategory);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Parent category not found",
      });
    }

    const subcategory = await Subcategory.create(req.body);

    res.status(201).json({
      success: true,
      data: subcategory,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const existingSubcategory = await Subcategory.findById(id);
    
    if (!existingSubcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found"
      });
    }
    
    if (req.body.parentCategory && req.body.parentCategory !== existingSubcategory.parentCategory.toString()) {
      const categoryExists = await Category.findById(req.body.parentCategory);
      
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Parent category not found"
        });
      }
    }
    
    if (req.body.name) {
      const base = req.body.name.en || req.body.name.fa;
      const newSlug = slugify(base, {
        lower: true,
        strict: true,
        trim: true
      });
      
      const duplicateSlug = await Subcategory.findOne({
        slug: newSlug,
        _id: { $ne: id }
      });
      
      if (duplicateSlug) {
        return res.status(409).json({
          success: false,
          message: "A subcategory with this name already exists"
        });
      }
      
      req.body.slug = newSlug;
    }
    
    const subcategory = await Subcategory.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate("parentCategory", "name slug");

    res.json({
      success: true,
      data: subcategory
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate key error: this subcategory already exists"
      });
    }
    
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;

    const subcategory = await Subcategory.deleteOne({ _id: id });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: "Subcategory not found",
      });
    }

    res.json({
      success: true,
      message: "Subcategory deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
