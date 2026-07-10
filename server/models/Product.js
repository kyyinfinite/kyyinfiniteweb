const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    cpuLimit: { type: Number, required: true, min: 0 },
    ramLimit: { type: Number, required: true, min: 0 },
    diskLimit: { type: Number, required: true, min: 0 },
    eggId: { type: Number, required: true },
    nestId: { type: Number, required: true },
    locationId: { type: Number, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Product || mongoose.model('Product', ProductSchema);
