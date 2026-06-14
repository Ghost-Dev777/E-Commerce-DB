const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    default: nanoid,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, 'نام دسته بندی الزامی است'],
    trim: true,
  },
  subcategories: [{
    type: String,
    ref: 'SubCategory',
  }],
  hasBrandSubcategories: {
    type: Boolean,
    default: false,
  },
  route: {
    type: String,
    required: [true, 'مسیر دسته بندی الزامی است'],
    unique: true,
    trim: true,
  },
  imageUrl: {
    type: String,
    required: [true, 'تصویر دسته بندی الزامی است'],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

categorySchema.pre('remove', async function(next) {
  await this.model('SubCategory').deleteMany({ categoryId: this._id });
  next();
});

module.exports = mongoose.model('Category', categorySchema);