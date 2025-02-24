// Load environment variables from .env file
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoute");
const userRoutes = require("./routes/userRoute");
const cartRoutes = require("./routes/cartRoute");
const bookRoutes = require("./routes/bookRoute");
const adminRoutes = require("./routes/adminRoute");


const { checkAuthorize } = require("./middleware/authMiddleware");

const app = express();
const port = process.env.PORT || 9999;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection

mongoose
  .connect(process.env.DB_CONNECTION, { dbName: process.env.DB_NAME })
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Could not connect to the database", err));

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/cart", cartRoutes);
app.use("/book", bookRoutes);
app.use("/admin", adminRoutes);

// Test phân quyền
app.get("/open", (req, res) => {
    res.status(200).json({ message: "Đây là API công khai." });
});
app.get("/admin-only", checkAuthorize(["admin"]), (req, res) => {
    res.status(200).json({ message: "Chào Admin!" });
});
app.get("/user-or-admin", checkAuthorize(["user", "admin"]), (req, res) => {
    res.status(200).json({ message: "Chào User hoặc Admin!" });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
