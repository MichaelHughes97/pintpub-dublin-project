const express = require("express");
const router = express.Router();

const { getAllPubs, getPubById } = require("../controllers/pubController");

// Route to get all pubs
router.get("/", getAllPubs);

// Route to get a pub by ID
router.get("/:id", getPubById);

module.exports = router;