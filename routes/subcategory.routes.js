import express from "express";
import {
  getAllSubcategories,
  getSubcategoriesByCategory,
  createSubcategory,
  updateSubcategory,
  getSubcategoryById,
  getSubcategoryFilters,
  deleteSubcategory
} from "../controllers/subCategory.controller.js";

const router = express.Router();

router.get("/", getAllSubcategories);

router.get("/category/:categoryId", getSubcategoriesByCategory);
router.get("/:id", getSubcategoryById);
router.get('/:id/filters', getSubcategoryFilters);
router.post("/", createSubcategory);

router.put("/:id", updateSubcategory);

router.delete("/:id", deleteSubcategory);

export default router;
