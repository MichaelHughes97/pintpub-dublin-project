import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import templeBar from "../assets/pubs/temple-bar.jpg";
import brazenHead from "../assets/pubs/brazen-head.jpg";
import longHall from "../assets/pubs/long-hall.jpg";
import odonoghues from "../assets/pubs/odonoghues.jpg";
import stagsHead from "../assets/pubs/stags-head.jpg";

function PubDetails() {
  const { id } = useParams();

  const [pub, setPub] = useState(null);
  const [drinks, setDrinks] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Current atmosphere information
const [atmosphere, setAtmosphere] = useState(null);
// Atmosphere report form values
const [selectedAtmosphere, setSelectedAtmosphere] = useState("");
const [submittingAtmosphere, setSubmittingAtmosphere] = useState(false);
const [atmosphereMessage, setAtmosphereMessage] = useState("");
const [atmosphereError, setAtmosphereError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review form values
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);

  const token = localStorage.getItem("token");

  // Read the user saved when they logged in
  let loggedInUser = null;

  try {
    const savedUser = localStorage.getItem("user");
    loggedInUser = savedUser ? JSON.parse(savedUser) : null;
  } catch {
    loggedInUser = null;
  }

  const isLoggedIn = Boolean(token && loggedInUser);

  const pubImages = {
    1: templeBar,
    2: brazenHead,
    3: longHall,
    4: odonoghues,
    5: stagsHead,
  };

  // Find whether the logged-in user has already reviewed this pub
  const userReview = loggedInUser
    ? reviews.find(
        (review) => Number(review.user_id) === Number(loggedInUser.user_id),
      )
    : null;

  // Load reviews again after a review is added or updated
  const loadReviews = async () => {
    const response = await fetch(
      `http://localhost:3000/api/pubs/${id}/reviews`,
    );

    if (!response.ok) {
      throw new Error("Unable to retrieve reviews.");
    }

    const reviewsData = await response.json();
    setReviews(reviewsData);
  };

  // Load the latest atmosphere information
const loadAtmosphere = async () => {
  const response = await fetch(
    `http://localhost:3000/api/atmosphere/${id}`,
  );

  if (!response.ok) {
    throw new Error("Unable to retrieve atmosphere information.");
  }

  const atmosphereData = await response.json();
  setAtmosphere(atmosphereData);
};

  useEffect(() => {
    async function loadPubDetails() {
      try {
        setLoading(true);
        setError("");

        const [
  pubResponse,
  drinksResponse,
  facilitiesResponse,
  reviewsResponse,
  atmosphereResponse,
] = await Promise.all([
  fetch(`http://localhost:3000/api/pubs/${id}`),
  fetch(`http://localhost:3000/api/pubs/${id}/drinks`),
  fetch(`http://localhost:3000/api/pubs/${id}/facilities`),
  fetch(`http://localhost:3000/api/pubs/${id}/reviews`),
  fetch(`http://localhost:3000/api/atmosphere/${id}`),
]);

       if (
  !pubResponse.ok ||
  !drinksResponse.ok ||
  !facilitiesResponse.ok ||
  !reviewsResponse.ok ||
  !atmosphereResponse.ok
) {
          throw new Error("Unable to retrieve the pub details.");
        }

        const pubData = await pubResponse.json();
        const drinksData = await drinksResponse.json();
        const facilitiesData = await facilitiesResponse.json();
        const reviewsData = await reviewsResponse.json();
        const atmosphereData = await atmosphereResponse.json();

        setPub(pubData);
        setDrinks(drinksData);
        setFacilities(facilitiesData);
        setReviews(reviewsData);
        setAtmosphere(atmosphereData);
      } catch (requestError) {
        console.error(requestError);
        setError("The pub details could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadPubDetails();
  }, [id]);

  // Calculate the average rating for this pub
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + Number(review.rating), 0) /
        reviews.length
      : null;

  // Open the form with the current review values
  const handleEditReview = (review) => {
    setEditingReviewId(review.review_id);
    setRating(Number(review.rating));
    setComment(review.comment);
    setReviewMessage("");
    setReviewError("");

    // Wait for the form to appear before scrolling to it
    setTimeout(() => {
      document.getElementById("review-form-section")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };

  // Close the edit form without saving changes
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setRating(0);
    setComment("");
    setReviewMessage("");
    setReviewError("");
  };

  // Create a new review or update an existing one
  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    setReviewMessage("");
    setReviewError("");

    if (rating === 0) {
      setReviewError("Please choose a rating.");
      return;
    }

    if (!comment.trim()) {
      setReviewError("Please enter a comment.");
      return;
    }

    try {
      setSubmittingReview(true);

      const isEditing = Boolean(editingReviewId);

      const url = isEditing
        ? `http://localhost:3000/api/reviews/${editingReviewId}`
        : "http://localhost:3000/api/reviews";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pub_id: Number(id),
          rating,
          comment: comment.trim(),
        }),
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `The backend returned an invalid response (${response.status}).`,
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            (isEditing
              ? "Unable to update the review."
              : "Unable to submit the review."),
        );
      }

      setReviewMessage(
        isEditing
          ? "Your review was updated successfully."
          : "Your review was submitted successfully.",
      );

      setEditingReviewId(null);
      setRating(0);
      setComment("");

      // Refresh reviews without reloading the page
      await loadReviews();
    } catch (submitError) {
      console.error(submitError);
      setReviewError(submitError.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Submit or update the user's atmosphere report
const handleAtmosphereSubmit = async (event) => {
  event.preventDefault();

  setAtmosphereMessage("");
  setAtmosphereError("");

  if (!selectedAtmosphere) {
    setAtmosphereError("Please select the current atmosphere.");
    return;
  }

  try {
    setSubmittingAtmosphere(true);

    const response = await fetch(
      "http://localhost:3000/api/atmosphere",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          pub_id: Number(id),
          atmosphere_level: selectedAtmosphere,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to submit atmosphere report.",
      );
    }

    setAtmosphereMessage(data.message);
    setSelectedAtmosphere("");

    // Refresh the atmosphere without reloading the page
    await loadAtmosphere();
  } catch (error) {
    console.error(error);
    setAtmosphereError(error.message);
  } finally {
    setSubmittingAtmosphere(false);
  }
};

  if (loading) {
    return <p className="details-message">Loading pub details...</p>;
  }

  if (error) {
    return (
      <div className="details-message">
        <p>{error}</p>

        <Link className="back-link" to="/">
          Back to all pubs
        </Link>
      </div>
    );
  }

  if (!pub) {
    return <p className="details-message">Pub not found.</p>;
  }

  return (
    <main className="pub-details-page">
      <article className="details-card">
        <div className="details-image-container">
          {pubImages[Number(id)] ? (
            <img
              src={pubImages[Number(id)]}
              alt={`Exterior of ${pub.name}`}
              className="details-image"
            />
          ) : (
            <div className="details-image-placeholder">Photo coming soon</div>
          )}
        </div>

        <div className="details-content">
          <header className="details-header">
            <h1>{pub.name}</h1>

            <p className="details-address">{pub.address}</p>

            <p className="details-rating">
              {averageRating !== null ? (
                <>
                  {"★".repeat(Math.round(averageRating))}
                  {"☆".repeat(5 - Math.round(averageRating))}{" "}
                  <strong>{averageRating.toFixed(1)}</strong> ({reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"})
                </>
              ) : (
                "No ratings yet"
              )}
            </p>

            <a
              className="maps-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                pub.address,
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Google Maps
            </a>
          </header>

          <section className="details-section">
            <h2>About</h2>
            <p>{pub.description}</p>
          </section>

          <section className="details-section">
            <h2>Opening Hours</h2>
            <p>{pub.opening_hours || "Opening hours unavailable."}</p>
          </section>

          <section className="details-section">
  <h2>Current Atmosphere</h2>

  {atmosphere && atmosphere.atmosphere ? (
    <>
      <h3 className="current-atmosphere">
  {atmosphere.atmosphere}
</h3>

      <p>
        Based on {atmosphere.report_count} recent{" "}
        {atmosphere.report_count === 1 ? "report" : "reports"}
      </p>

      <ul className="facility-list">
        <li>Quiet: {atmosphere.breakdown.Quiet}</li>
        <li>Moderate: {atmosphere.breakdown.Moderate}</li>
        <li>Busy: {atmosphere.breakdown.Busy}</li>
        <li>Very Busy: {atmosphere.breakdown["Very Busy"]}</li>
      </ul>
    </>
  ) : (
    <p>No recent atmosphere reports are available.</p>
  )}
</section>

<hr />

<h3>How busy is it right now?</h3>

{isLoggedIn ? (
  <form
  className="atmosphere-form"
  onSubmit={handleAtmosphereSubmit}
>
  <div className="atmosphere-options">
    {[
      "Quiet",
      "Moderate",
      "Busy",
      "Very Busy",
    ].map((level) => (
      <button
        key={level}
        type="button"
        className={
          selectedAtmosphere === level
            ? "atmosphere-option selected"
            : "atmosphere-option"
        }
        onClick={() => setSelectedAtmosphere(level)}
      >
        {level}
      </button>
    ))}
  </div>

  {atmosphereError && (
    <p className="form-error">{atmosphereError}</p>
  )}

  {atmosphereMessage && (
    <p className="form-success">{atmosphereMessage}</p>
  )}

  <button
    type="submit"
    className="submit-review-button"
    disabled={submittingAtmosphere}
  >
    {submittingAtmosphere
      ? "Submitting..."
      : "Submit Report"}
  </button>
</form>
) : (
  <p>
    Please <Link to="/login">log in</Link> to submit an atmosphere report.
  </p>
)}
          <section className="details-section">
            <h2>Drinks</h2>

            {drinks.length > 0 ? (
              <div className="details-list">
                {drinks.map((drink, index) => (
                  <div className="drink-row" key={drink.drink_id || index}>
                    <span>{drink.drink_name}</span>
                    <span>€{Number(drink.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No drink information is available.</p>
            )}
          </section>

          <section className="details-section">
            <h2>Facilities</h2>

            {facilities.length > 0 ? (
              <ul className="facility-list">
                {facilities.map((facility, index) => (
                  <li key={facility.facility_id || index}>
                    {facility.facility_name}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No facility information is available.</p>
            )}
          </section>

          {/* Show the form when adding or editing a review */}
          {(!userReview || editingReviewId) && (
            <section
              id="review-form-section"
              className="details-section review-form-section"
            >
              <h2>{editingReviewId ? "Edit Your Review" : "Write a Review"}</h2>

              {isLoggedIn ? (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <div className="rating-input">
                    <p>Your rating</p>

                    <div
                      className="star-buttons"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeRating = hoverRating || rating;

                        return (
                          <button
                            key={star}
                            type="button"
                            className={
                              star <= activeRating
                                ? "star-button selected"
                                : "star-button"
                            }
                            onMouseEnter={() => setHoverRating(star)}
                            onClick={() => setRating(star)}
                            aria-label={`${star} star rating`}
                          >
                            ★
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <label htmlFor="review-comment">Your comment</label>

                  <textarea
                    id="review-comment"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Share your experience at this pub..."
                    rows="5"
                    maxLength="500"
                  />

                  <p className="character-count">{comment.length}/500</p>

                  {reviewError && <p className="form-error">{reviewError}</p>}

                  <div className="review-form-buttons">
                    <button
                      className="submit-review-button"
                      type="submit"
                      disabled={submittingReview}
                    >
                      {submittingReview
                        ? editingReviewId
                          ? "Updating..."
                          : "Submitting..."
                        : editingReviewId
                          ? "Update Review"
                          : "Submit Review"}
                    </button>

                    {editingReviewId && (
                      <button
                        className="cancel-edit-button"
                        type="button"
                        onClick={handleCancelEdit}
                        disabled={submittingReview}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <p>
                  Please <Link to="/login">log in</Link> to write a review.
                </p>
              )}
            </section>
          )}

          {/* Keep success messages visible after the form closes */}
          {reviewMessage && <p className="form-success">{reviewMessage}</p>}

          <section className="details-section">
            <h2>Reviews</h2>

            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review, index) => {
                  const isOwnReview =
                    loggedInUser &&
                    Number(review.user_id) === Number(loggedInUser.user_id);

                  return (
                    <article
                      className="review-card"
                      key={review.review_id || index}
                    >
                      <p className="review-author">
                        {review.first_name} {review.last_name}
                        {isOwnReview && (
                          <span className="own-review-label">
                            {" "}
                            (Your review)
                          </span>
                        )}
                      </p>

                      <p className="review-stars">
                        {"★".repeat(Number(review.rating))}
                        {"☆".repeat(5 - Number(review.rating))}{" "}
                        <strong>{Number(review.rating).toFixed(1)}</strong>
                      </p>

                      <p>{review.comment}</p>

                      {review.review_date && (
                        <p className="review-date">
                          Reviewed on{" "}
                          {new Date(review.review_date).toLocaleDateString(
                            "en-GB",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </p>
                      )}

                      {isOwnReview && (
                        <button
                          type="button"
                          className="edit-review-button"
                          onClick={() => handleEditReview(review)}
                        >
                          Edit Review
                        </button>
                      )}
                    </article>
                  );
                })}
              </div>
            ) : (
              <p>No reviews have been added yet.</p>
            )}
          </section>

          <Link className="back-link" to="/">
            Back to all pubs
          </Link>
        </div>
      </article>
    </main>
  );
}

export default PubDetails;
