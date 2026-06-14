import express from "express";
import {
  getFilters,
  createFilter,
  updateFilter,
  deleteFilter,
} from "../controllers/filter.controller.js";

const router = express.Router();

router.get("/", getFilters);
router.post("/", createFilter);
router.put("/:id", updateFilter);
router.delete("/:id", deleteFilter);

export default router;