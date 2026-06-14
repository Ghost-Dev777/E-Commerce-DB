import Banner from "../models/Banner.model.js";

class BannerService {
  async getActiveBanners() {
    const now = new Date();

    const banners = await Banner.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate(
        "link.products",
        "productId title slug price images brand hasDiscount oldPrice",
      )
      .populate("link.category", "name slug")
      .populate("link.subcategory", "name slug")
      .sort({ positionId: 1 })
      .lean();

    return banners;
  }

  async createBanner(data) {
    const existing = await Banner.findOne({
      positionId: data.positionId,
      isActive: true,
    });

    if (existing) {
      throw new Error(`در این جایگاه قبلاً یک بنر فعال وجود دارد`);
    }

    return await Banner.create(data);
  }

  async updateBanner(id, data) {
    const banner = await Banner.findById(id);

    if (!banner) throw new Error("بنر یافت نشد");

    const allowedFields = [
      "image",
      "mobileImage",
      "positionId",
      "link",
      "startDate",
      "endDate",
      "isActive",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });

    // ✅ بررسی conflict برای positionId
    if (updates.positionId && updates.positionId !== banner.positionId) {
      const conflict = await Banner.findOne({
        positionId: updates.positionId,
        isActive: true,
        _id: { $ne: id },
      });
      if (conflict) {
        throw new Error("در این جایگاه یک بنر فعال دیگر وجود دارد");
      }
    }

    Object.assign(banner, updates);
    await banner.save();

    return await banner.populate([
      { path: "link.products", select: "productId title slug price images" },
      { path: "link.category", select: "name slug" },
      { path: "link.subcategory", select: "name slug" },
    ]);
  }

  async deleteBanner(id) {
    const banner = await Banner.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true },
    );

    if (!banner) throw new Error("بنر یافت نشد");

    return banner;
  }

  async recordImpression(id) {
    const banner = await Banner.findOneAndUpdate(
      { _id: id, isActive: true },
      { $inc: { impressions: 1 } },
      { new: true },
    );

    if (!banner) throw new Error("بنر فعال یافت نشد");

    return banner;
  }

  async recordClick(id) {
    const banner = await Banner.findOneAndUpdate(
      { _id: id, isActive: true },
      { $inc: { clicks: 1 } },
      { new: true },
    );

    if (!banner) throw new Error("بنر فعال یافت نشد");

    return banner;
  }

  async getAnalytics() {
    const banners = await Banner.find()
      .select("positionId impressions clicks startDate endDate isActive")
      .sort({ positionId: 1 })
      .lean();

    return banners.map((b) => ({
      ...b,
      ctr: b.impressions
        ? Number(((b.clicks / b.impressions) * 100).toFixed(2))
        : 0,
    }));
  }

  async getAllBanners() {
    return await Banner.find()
      .populate("link.products", "productId title slug")
      .populate("link.category", "name slug")
      .populate("link.subcategory", "name slug")
      .sort({ positionId: 1 });
  }
}

export default new BannerService();
