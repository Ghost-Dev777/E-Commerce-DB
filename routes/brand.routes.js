import express from "express";
import * as brandCtrl from "../controllers/brand.controller.js";

const router = express.Router();

router.get("/", brandCtrl.getAllBrands);
router.get("/featured", brandCtrl.getFeaturedBrands);
router.get("/:slug", brandCtrl.getBrandBySlug);

// admin
router.post("/", brandCtrl.createBrand);
router.put("/:id", brandCtrl.updateBrand);
router.delete("/:id", brandCtrl.deleteBrand);

// utilities
router.post("/sync/data", brandCtrl.sync); 
router.post("/sync/counts", brandCtrl.syncCounts);

export default router;
