const productRoutes = require("./routes/productRoutes");   // ADD THIS
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");   // ADD THIS

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("ShopEZ Backend Running");
});

app.use("/api/auth", authRoutes);   // ADD THIS
app.use("/api/products", productRoutes);   // ADD THIS

const PORT = process.env.PORT || 5000;

connectDB();
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});