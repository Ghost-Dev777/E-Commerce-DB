import moment from 'jalali-moment';

export const shamsiToGregorian = (shamsiDate) => {
  if (!shamsiDate) return null;
  
  try {
    // فرمت: "1404/03/15 23:59:59" یا "1404/03/15"
    const hasTime = shamsiDate.includes(':');
    const format = hasTime ? 'jYYYY/jMM/jDD HH:mm:ss' : 'jYYYY/jMM/jDD';
    
    const gregorianDate = moment(shamsiDate, format)
      .utcOffset('+03:30')  // ✅ تهران بدون timezone
      .toDate();
    
    return gregorianDate;
  } catch (error) {
    throw new Error('فرمت تاریخ شمسی نامعتبر است');
  }
};

export const gregorianToShamsi = (gregorianDate) => {
  if (!gregorianDate) return null;
  
  try {
    return moment(gregorianDate)
      .utcOffset('+03:30')  // ✅ تهران
      .format('jYYYY/jMM/jDD HH:mm:ss');
  } catch (error) {
    return null;
  }
};

export const getTimeRemaining = (endDate) => {
  if (!endDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: false,
      hasEndDate: false
    };
  }

  try {
    const now = moment().utcOffset('+03:30');
    const end = moment(endDate).utcOffset('+03:30');
    
    const diff = end.diff(now);
    const isExpired = diff <= 0;

    if (isExpired) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        hasEndDate: true
      };
    }

    const duration = moment.duration(diff);
    
    return {
      days: Math.floor(duration.asDays()),
      hours: duration.hours(),
      minutes: duration.minutes(),
      seconds: duration.seconds(),
      isExpired: false,
      hasEndDate: true
    };
  } catch (error) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: false,
      hasEndDate: false
    };
  }
};

export const isFutureDate = (dateString) => {
  if (!dateString) return false;
  
  try {
    const inputDate = moment(dateString, 'jYYYY/jMM/jDD HH:mm:ss')
      .utcOffset('+03:30');
    const now = moment().utcOffset('+03:30');
    
    return inputDate.isAfter(now);
  } catch (error) {
    return false;
  }
};

export const checkAndUpdateDiscount = (product) => {
  const productData = { ...product._doc || product };
  
  if (!productData.saleEndAt) {
    productData.timeRemaining = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: false,
      hasEndDate: false
    };
    return productData;
  }

  const timeRemaining = getTimeRemaining(productData.saleEndAt);
  productData.timeRemaining = timeRemaining;

  if (timeRemaining.isExpired) {
    productData.hasDiscount = false;
  }

  if (productData.saleEndAt) {
    productData.saleEndAt_shamsi = gregorianToShamsi(productData.saleEndAt);
  }

  return productData;
};