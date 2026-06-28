const express = require("express");
const router = express.Router();

const { getAllPubs } = require("../controllers/pubController");

// Route to get all pubs
router.get("/", getAllPubs);

module.exports = router;