const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require('cors');
const dbConfig = require("./src/config/db");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/users", require('./src/routes/userRoutes'));
app.use("/api/restaurants", require('./src/routes/restaurantRoutes'));
app.use("/api/restaurant/items", require('./src/routes/menuItemRoutes'));
app.use("/api/delivery-partners", require('./src/routes/deliveryPartnerRoutes'));
app.use("/api/orders", require('./src/routes/orderRoutes'));
app.use("/api/orderItems", require('./src/routes/orderItemRoutes'));
app.use("/api/deliveries", require('./src/routes/deliveryRoutes'));


const PORT = process.env.PORT || 5000;
// Connect to the database 
dbConfig()
  .then(() => {
    console.log("Database connected successfully");

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database:", err.message);
  });
