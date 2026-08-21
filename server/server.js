require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const artisanRoutes = require("./routes/artisanRoutes");
const authRoutes = require("./routes/authRoutes");
const cooperativeRoutes = require("./routes/cooperativeRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "Server running" });
});

app.use("/api/artisans", artisanRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cooperatives", cooperativeRoutes);
app.use("/api/passports", require("./routes/passportRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
