import cron from 'node-cron';
import Product from '../models/Product.model.js';

export const startDiscountExpiryJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      const now = new Date();
      
      const expiredProducts = await Product.find({
        hasDiscount: true,
        saleEndAt: { $lte: now }
      });
      
      for (const product of expiredProducts) {
        product.hasDiscount = false;
        product.price = product.oldPrice || product.price;
        product.oldPrice = null;
        product.saleEndAt = null;
        await product.save();
      }
      
      console.log(`✅ ${expiredProducts.length} محصول با تخفیف منقضی شده غیرفعال شد`);
      
    } catch (error) {
      console.error('❌ خطا در غیرفعال‌سازی تخفیف‌ها:', error);
    }
  });
  
  console.log('🕐 Cron job برای مدیریت تخفیف‌ها فعال شد');
};
