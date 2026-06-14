import bannerService from "../services/Banner.service.js";

class BannerController {
  async getActiveBanners(req, res) {
    try {
      const banners = await bannerService.getActiveBanners();

      res.status(200).json({
        success: true,
        count: banners.length,
        data: banners,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "خطا در دریافت بنرها",
        error: error.message,
      });
    }
  }

  async createBanner(req, res) {
    try {
      const banner = await bannerService.createBanner(req.body);

      res.status(201).json({
        success: true,
        message: "بنر با موفقیت ایجاد شد",
        data: banner,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "خطا در ایجاد بنر",
        error: error.message,
      });
    }
  }

  async updateBanner(req, res) {
    try {
      const banner = await bannerService.updateBanner(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: "بنر ویرایش شد",
        data: banner,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: "خطا در ویرایش بنر",
        error: error.message,
      });
    }
  }

  async deleteBanner(req, res) {
    try {
      const banner = await bannerService.deleteBanner(req.params.id);

      res.status(200).json({
        success: true,
        message: "بنر غیرفعال شد",
        data: banner,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: "بنر یافت نشد",
        error: error.message,
      });
    }
  }

  async recordImpression(req, res) {
    try {
      await bannerService.recordImpression(req.params.id);

      res.json({ success: true });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async recordClick(req, res) {
    try {
      await bannerService.recordClick(req.params.id);

      res.json({ success: true });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAnalytics(req, res) {
    try {
      const data = await bannerService.getAnalytics();

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "خطا در دریافت آمار",
        error: error.message,
      });
    }
  }

  async getAllBanners(req, res) {
    try {
      const banners = await bannerService.getAllBanners();

      res.json({
        success: true,
        count: banners.length,
        data: banners,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "خطا در دریافت بنرها",
        error: error.message,
      });
    }
  }
}

export default new BannerController();