import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { startDiscountExpiryJob } from "./utils/discountExpiry.js";

//Routes
import categoryRoutes from "./routes/category.routes.js";
import subCategoryRoutes from "./routes/subcategory.routes.js";
import productRoutes from "./routes/product.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import brandRoutes from "./routes/brand.routes.js";
import filterRoutes from "./routes/filter.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

//API routes
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/filters", filterRoutes);

//Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

//error middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  console.error("Stack:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "خطای سرور",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    startDiscountExpiryJob();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

startServer();
