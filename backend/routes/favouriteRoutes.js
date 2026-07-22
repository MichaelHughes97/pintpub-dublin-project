const express = require("express");

const {
  getFavourites,
  addFavourite,
  removeFavourite,
} = require("../controllers/favouriteController");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getFavourites);
router.post("/", authenticateToken, addFavourite);
router.delete("/:pubId", authenticateToken, removeFavourite);

module.exports = router;