import rateLimit from 'express-rate-limit';

export const impressionLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 10,             
  message: 'تعداد درخواست‌ها بیش از حد مجاز است',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return `${req.ip}-${req.params.id}`;
  }
});

export const clickLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'تعداد کلیک‌ها بیش از حد مجاز است',
  keyGenerator: (req) => `${req.ip}-${req.params.id}`
});
