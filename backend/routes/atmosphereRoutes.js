const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authMiddleware");
const {
  getPubAtmosphere,
  submitAtmosphereReport,
} = require("../controllers/atmosphereController");

// Get the current Community Atmosphere Index for a pub
router.get("/:pubId", getPubAtmosphere);

// Submit or update an atmosphere report
router.post("/", authenticateToken, submitAtmosphereReport);

module.exports = router;