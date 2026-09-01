require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { uploadsRoot } = require("./middleware/uploadMiddleware");

const artisanRoutes = require("./routes/artisanRoutes");
const authRoutes = require("./routes/authRoutes");
const cooperativeRoutes = require("./routes/cooperativeRoutes");

connectDB();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "8mb" }));
app.use("/uploads", express.static(uploadsRoot));

app.get("/api/health", (req, res) => {
  res.json({ status: "Server running" });
});

app.use("/api/artisans", artisanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cooperatives", cooperativeRoutes);
app.use("/api/passports", require("./routes/passportRoutes"));

if (process.env.NODE_ENV === "production" && process.env.SERVE_CLIENT === "true") {
  const clientDist = path.join(__dirname, "../client/dist");
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
