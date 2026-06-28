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

module.exports = {
  getAllPubs
};