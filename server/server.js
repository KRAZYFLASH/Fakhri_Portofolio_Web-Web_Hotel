import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from '@clerk/express';
import clerkWebhooks from "./controllers/clerkWebhooks.js";
import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// ✅ Buat express app LEBIH AWAL
const app = express();

connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Clerk Middleware, akan ambil dari process.env
app.use(clerkMiddleware());

// Clerk Webhooks route
app.use("/api/clerk", clerkWebhooks);

// API routes
app.get('/', (req, res) => res.send("API is Working poli"));
app.use('/api/user', userRouter);
app.use('/api/hotels', hotelRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/bookings', bookingRouter);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect MongoDB:", err.message);
    process.exit(1);
  }
};

startServer();
