const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const {
  createReview,
  updateReview,
} = require("../controllers/reviewController");

// Submit a new review
router.post("/", authenticateToken, createReview);

// Edit a review written by the logged-in user
router.put("/:id", authenticateToken, updateReview);

module.exports = router;