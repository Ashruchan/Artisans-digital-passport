require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const artisanRoutes = require("./routes/artisanRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "Server running" });
});

app.use("/api/artisans", artisanRoutes);

// Teammates mount their routes below:
// app.use("/api/cooperatives", require("./routes/cooperativeRoutes"));
// app.use("/api/passports", require("./routes/passportRoutes"));
// app.use("/api/auth", require("./routes/authRoutes"));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
