import { shamsiToGregorian } from '../utils/dataHelper.js';

export const convertShamsiDates = (req, res, next) => {
  try {
    if (req.body.saleEndAt_shamsi) {
      const gregorianDate = shamsiToGregorian(req.body.saleEndAt_shamsi);
      
      if (!gregorianDate) {
        return res.status(400).json({
          success: false,
          message: 'فرمت تاریخ شمسی نامعتبر است',
        });
      }

      req.body.saleEndAt = gregorianDate;
      delete req.body.saleEndAt_shamsi;
    }

    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'خطا در تبدیل تاریخ شمسی',
      error: error.message,
    });
  }
};
