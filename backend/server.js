const express = require("express");
const cors = require("cors");

// Import the database connection
require("./config/db");

// Import route files
const pubRoutes = require("./routes/pubRoutes");
const authRoutes = require("./routes/authRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const PORT = 3000;

// Allow the frontend to send requests to the backend
app.use(cors());

// Read JSON data sent in request bodies
app.use(express.json());

// API routes
app.use("/api/pubs", pubRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reviews", reviewRoutes);

// Test route to check that the backend is running
app.get("/", (req, res) => {
  res.send("PintPoint Dublin API is running");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});