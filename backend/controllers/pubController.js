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

module.exports = {
  getAllPubs,
  getPubById
};