import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dz7xbn8j2",
  api_key: "182218984366669",
  api_secret: "UxnjdPLWhom3PXmXB99LVu6WD-0",
});


// ✅ DEBUG (KEEP FOR NOW)
console.log("☁️ Cloudinary ENV CHECK:", {
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "MISSING",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});

export default cloudinary;
