import app from "./app";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import "./modules/notifications/worker"; // Start the worker

dotenv.config();

const PORT = process.env.PORT || 3000;

// Redis Client (Placeholder setup)

async function startServer() {
  try {
    // Connect to Redis
    //
    // Commented out until Redis is actually running to avoid crash on startup verify

    // Connect to Database (Prisma)
    const prisma = new PrismaClient();
    await prisma.$connect();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
