const express = require("express");
const router = express.Router();

const {
  getAllPubs,
  getPubById,
  getPubDrinks,
  getPubFacilities,
  getPubReviews
} = require("../controllers/pubController");

// Route to get all pubs
router.get("/", getAllPubs);

// Route to get drinks for a specific pub
router.get("/:id/drinks", getPubDrinks);

// Route to get facilities for a specific pub
router.get("/:id/facilities", getPubFacilities);

// Route to get reviews for a specific pub
router.get("/:id/reviews", getPubReviews);

// Route to get a pub by ID
router.get("/:id", getPubById);

module.exports = router;