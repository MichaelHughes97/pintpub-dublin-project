const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Allow requests from the frontend
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Test route to make sure the API is running
app.get("/", (req, res) => {
    res.send("PintPub Dublin API is running");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
