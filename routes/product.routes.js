import express from 'express';
import * as productController from "../controllers/product.controller.js";

const router = express.Router();
router.get("/newest", productController.getNewestProducts);
router.post("/by-ids", productController.getProductsByIds);
router.get("/brand/:brand", productController.getProductsByBrand);
router.get("/category/:slug", productController.getProductsByCategorySlug);
router.get("/subcategory/:slug", productController.getProductsBySubCategorySlug);

router.post('/', productController.createProduct);
router.get('/', productController.listProducts);
router.get('/discounts', productController.discountedProducts);
router.get('/deal-of-day', productController.dealOfDayProducts);

router.get('/subcategory/:subcategoryId', productController.getProductsBySubcategory);
router.get('/', productController.getProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;
