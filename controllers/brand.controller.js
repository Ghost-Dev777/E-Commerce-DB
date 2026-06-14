import * as brandService from "../services/brand.service.js";

export const createBrand = async (req, res) => {
  try {
    const data = await brandService.createBrand(req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAllBrands = async (req, res) => {
  const data = await brandService.getAllBrands();
  res.json({ success: true, data });
};

export const getFeaturedBrands = async (req, res) => {
  const data = await brandService.getFeaturedBrands();
  res.json({ success: true, data });
};

export const getBrandBySlug = async (req, res) => {
  const data = await brandService.getBrandBySlug(req.params.slug);
  res.json({ success: true, data });
};

export const updateBrand = async (req, res) => {
  try {
    const data = await brandService.updateBrand(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteBrand = async (req, res) => {
  await brandService.deleteBrand(req.params.id);
  res.json({ success: true });
};

export const sync = async (req, res) => {
  try {
    const data = await brandService.syncBrandsFromProducts();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const syncCounts = async (req, res) => {
  const data = await brandService.updateAllBrandCounts();
  res.json({ success: true, data });
};
