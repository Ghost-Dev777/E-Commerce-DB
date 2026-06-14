import express from "express";
import bannerController from "../controllers/Banner.controller.js";

const router = express.Router();

router.get("/active", bannerController.getActiveBanners);
router.post("/:id/impression", bannerController.recordImpression);
router.post("/:id/click", bannerController.recordClick);

router.post("/", bannerController.createBanner);
router.put("/:id", bannerController.updateBanner);
router.delete("/:id", bannerController.deleteBanner);
router.get("/analytics", bannerController.getAnalytics);
router.get("/all", bannerController.getAllBanners);

export default router;
