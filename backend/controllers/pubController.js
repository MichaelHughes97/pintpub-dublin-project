const db = require("../config/db");

// Get all pubs from the database
const getAllPubs = (req, res) => {
  const sql = "SELECT * FROM pubs";

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error retrieving pubs"
      });
    }

    res.json(results);
  });
};

// Get a single pub using its ID
const getPubById = (req, res) => {
  const pubId = req.params.id;

  const sql = "SELECT * FROM pubs WHERE pub_id = ?";

  db.query(sql, [pubId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error retrieving pub"
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        message: "Pub not found"
      });
    }

    res.json(results[0]);
  });
};

// Get all drinks available in a specific pub
const getPubDrinks = (req, res) => {
  const pubId = req.params.id;

  const sql = `
    SELECT
      d.drink_name,
      pdp.price
    FROM pub_drink_prices pdp
    JOIN drinks d ON pdp.drink_id = d.drink_id
    WHERE pdp.pub_id = ?
  `;

  db.query(sql, [pubId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error retrieving drinks"
      });
    }

    res.json(results);
  });
};

// Get all facilities available in a specific pub
const getPubFacilities = (req, res) => {
  const pubId = req.params.id;

  const sql = `
    SELECT
      f.facility_name
    FROM pub_facilities pf
    JOIN facilities f ON pf.facility_id = f.facility_id
    WHERE pf.pub_id = ?
  `;

  db.query(sql, [pubId], (err, results) => {
    if (err) {
      return res.status(500).json({
        message: "Error retrieving facilities"
      });
    }

    res.json(results);
  });
};

// Get reviews for a specific pub
const getPubReviews = (req, res) => {
  const pubId = req.params.id;

  // Join the users table so the reviewer's name can be displayed
  const sql = `
    SELECT
      r.review_id,
      r.rating,
      r.user_id,
      r.comment,
      r.review_date,
      u.first_name,
      u.last_name
    FROM reviews r
    JOIN users u ON r.user_id = u.user_id
    WHERE r.pub_id = ?
    ORDER BY r.review_date DESC
  `;

  db.query(sql, [pubId], (err, results) => {
    if (err) {
      console.error("Review retrieval error:", err);

      return res.status(500).json({
        message: "Error retrieving reviews",
      });
    }

    res.json(results);
  });
};

module.exports = {
  getAllPubs,
  getPubById,
  getPubDrinks,
  getPubFacilities,
  getPubReviews
};