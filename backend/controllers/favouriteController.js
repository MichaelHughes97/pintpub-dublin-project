const db = require("../config/db");

// Get all favourite pubs for the logged-in user
const getFavourites = (req, res) => {
  const userId = req.user.user_id;

  const sql = `
    SELECT
      f.favourite_id,
      f.pub_id,
      f.created_at,
      p.name,
      p.address,
      p.description,
      p.opening_hours
    FROM favourites f
    JOIN pubs p
      ON f.pub_id = p.pub_id
    WHERE f.user_id = ?
    ORDER BY f.created_at DESC
  `;

  db.query(sql, [userId], (error, results) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Unable to retrieve favourites.",
      });
    }

    res.json(results);
  });
};

// Add a pub to favourites
const addFavourite = (req, res) => {
  const userId = req.user.user_id;
  const { pub_id } = req.body;

  if (!pub_id) {
    return res.status(400).json({
      message: "Pub ID is required.",
    });
  }

  const sql = `
    INSERT INTO favourites (user_id, pub_id)
    VALUES (?, ?)
  `;

  db.query(sql, [userId, pub_id], (error, result) => {
    if (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
          message: "This pub is already in your favourites.",
        });
      }

      console.error(error);

      return res.status(500).json({
        message: "Unable to add this pub to favourites.",
      });
    }

    res.status(201).json({
      message: "Pub added to favourites.",
      favourite_id: result.insertId,
    });
  });
};

// Remove a pub from favourites
const removeFavourite = (req, res) => {
  const userId = req.user.user_id;
  const pubId = req.params.pubId;

  const sql = `
    DELETE FROM favourites
    WHERE user_id = ? AND pub_id = ?
  `;

  db.query(sql, [userId, pubId], (error, result) => {
    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Unable to remove this pub from favourites.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Favourite not found.",
      });
    }

    res.json({
      message: "Pub removed from favourites.",
    });
  });
};

module.exports = {
  getFavourites,
  addFavourite,
  removeFavourite,
};