import Filter from "../models/Filter.model.js";

export const getFilters = async (req, res) => {
  try {
    const { category } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    const filters = await Filter.find(query)
      .sort({ sortOrder: 1 })
      .lean();

    res.json({
      success: true,
      data: filters,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "خطا در دریافت فیلترها",
      error: error.message,
    });
  }
};


export const createFilter = async (req, res) => {
  try {
    const { category, key, label, type, source, sortOrder } = req.body;

    const filter = await Filter.create({
      category,
      key,
      label,
      type,
      source,
      sortOrder,
    });

    res.status(201).json(filter);
  } catch (error) {
    res.status(500).json({
      message: "خطا در ایجاد فیلتر",
      error: error.message,
    });
  }
};


export const updateFilter = async (req, res) => {
  try {
    const filter = await Filter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!filter) {
      return res.status(404).json({ message: "فیلتر پیدا نشد" });
    }

    res.json(filter);
  } catch (error) {
    res.status(500).json({
      message: "خطا در ویرایش فیلتر",
      error: error.message,
    });
  }
};

export const deleteFilter = async (req, res) => {
  try {
    const filter = await Filter.findByIdAndDelete(req.params.id);

    if (!filter) {
      return res.status(404).json({ message: "فیلتر پیدا نشد" });
    }

    res.json({ message: "فیلتر حذف شد" });
  } catch (error) {
    res.status(500).json({
      message: "خطا در حذف فیلتر",
      error: error.message,
    });
  }
};
