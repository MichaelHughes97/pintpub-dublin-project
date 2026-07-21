const db = require("../config/db");

// Add a new review for a pub
const createReview = (req, res) => {
  const userId = req.user.user_id;
  const { pub_id, rating, comment } = req.body;

  // Check that all fields were sent
  if (!pub_id || !rating || !comment) {
    return res.status(400).json({
      message: "Pub, rating and comment are required.",
    });
  }

  const ratingNumber = Number(rating);

  // Rating must be between 1 and 5
  if (
    !Number.isInteger(ratingNumber) ||
    ratingNumber < 1 ||
    ratingNumber > 5
  ) {
    return res.status(400).json({
      message: "Rating must be a whole number between 1 and 5.",
    });
  }

  const cleanedComment = comment.trim();

  // Do not save an empty comment
  if (cleanedComment.length === 0) {
    return res.status(400).json({
      message: "Please enter a comment.",
    });
  }

  // Check that the pub exists
  const pubSql = `
    SELECT pub_id
    FROM pubs
    WHERE pub_id = ?
  `;

  db.query(pubSql, [pub_id], (pubError, pubs) => {
    if (pubError) {
      console.error("Pub check error:", pubError);

      return res.status(500).json({
        message: "Unable to check the pub.",
      });
    }

    if (pubs.length === 0) {
      return res.status(404).json({
        message: "Pub not found.",
      });
    }

    // Only allow one review per user for each pub
    const existingReviewSql = `
      SELECT review_id
      FROM reviews
      WHERE user_id = ? AND pub_id = ?
    `;

    db.query(
      existingReviewSql,
      [userId, pub_id],
      (reviewError, existingReviews) => {
        if (reviewError) {
          console.error("Review check error:", reviewError);

          return res.status(500).json({
            message: "Unable to check existing reviews.",
          });
        }

        if (existingReviews.length > 0) {
          return res.status(409).json({
            message: "You have already reviewed this pub.",
          });
        }

        // Save the new review
        const insertSql = `
          INSERT INTO reviews
            (user_id, pub_id, rating, comment, review_date)
          VALUES (?, ?, ?, ?, NOW())
        `;

        db.query(
          insertSql,
          [userId, pub_id, ratingNumber, cleanedComment],
          (insertError, result) => {
            if (insertError) {
              console.error("Review insert error:", insertError);

              return res.status(500).json({
                message: "Unable to submit the review.",
              });
            }

            return res.status(201).json({
              message: "Review submitted successfully.",
              review: {
                review_id: result.insertId,
                user_id: userId,
                pub_id: Number(pub_id),
                rating: ratingNumber,
                comment: cleanedComment,
                review_date: new Date(),
              },
            });
          }
        );
      }
    );
  });
};

// Update a review written by the logged-in user
const updateReview = (req, res) => {
  const userId = req.user.user_id;
  const reviewId = req.params.id;
  const { rating, comment } = req.body;

  // Check that the new values were sent
  if (!rating || !comment) {
    return res.status(400).json({
      message: "Rating and comment are required.",
    });
  }

  const ratingNumber = Number(rating);
  const cleanedComment = comment.trim();

  // Keep the rating between 1 and 5
  if (
    !Number.isInteger(ratingNumber) ||
    ratingNumber < 1 ||
    ratingNumber > 5
  ) {
    return res.status(400).json({
      message: "Rating must be a whole number between 1 and 5.",
    });
  }

  if (cleanedComment.length === 0) {
    return res.status(400).json({
      message: "Please enter a comment.",
    });
  }

  // Only update the review if it belongs to the logged-in user
  const sql = `
    UPDATE reviews
    SET rating = ?, comment = ?, review_date = NOW()
    WHERE review_id = ? AND user_id = ?
  `;

  db.query(
    sql,
    [ratingNumber, cleanedComment, reviewId, userId],
    (error, result) => {
      if (error) {
        console.error("Review update error:", error);

        return res.status(500).json({
          message: "Unable to update the review.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Review not found or you are not allowed to edit it.",
        });
      }

      return res.json({
        message: "Review updated successfully.",
      });
    }
  );
};

module.exports = {
  createReview,
  updateReview,
};