const express = require("express");
const router = express.Router();
const Category = require("../models/Category.model");

router.post("/", async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().populate("subcategories");
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (res, req) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "subcategories",
    );
    if (!category) {
      return res.status(404).json({ message: "دسته بندی یافت نشد" });
    }
    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if(!updatedCategory){
        return res.status(404).json({message:'دسته بندی یافت نشد'});
    }

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({message:error.message});
  }
});

router.delete('/:id',async (req,res)=>{
    try {
        const category=await Category.findById(req.params.id);
        if(!category){
            return res.status(404).json({message:'دسته بندی یافت نشد'});
        }
        await category.remove();
    } catch (error) {
        res.status(500).json({message:error.message});
    }
})

module.exports=router;