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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pubImages = {
    1: templeBar,
    2: brazenHead,
    3: longHall,
    4: odonoghues,
    5: stagsHead,
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
        ] = await Promise.all([
          fetch(`http://localhost:3000/api/pubs/${id}`),
          fetch(`http://localhost:3000/api/pubs/${id}/drinks`),
          fetch(`http://localhost:3000/api/pubs/${id}/facilities`),
          fetch(`http://localhost:3000/api/pubs/${id}/reviews`),
        ]);

        if (
          !pubResponse.ok ||
          !drinksResponse.ok ||
          !facilitiesResponse.ok ||
          !reviewsResponse.ok
        ) {
          throw new Error("Unable to retrieve the pub details.");
        }

        const pubData = await pubResponse.json();
        const drinksData = await drinksResponse.json();
        const facilitiesData = await facilitiesResponse.json();
        const reviewsData = await reviewsResponse.json();

        setPub(pubData);
        setDrinks(drinksData);
        setFacilities(facilitiesData);
        setReviews(reviewsData);
      } catch (requestError) {
        console.error(requestError);
        setError("The pub details could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadPubDetails();
  }, [id]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) => total + Number(review.rating),
          0
        ) / reviews.length
      : null;

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
            <div className="details-image-placeholder">
              Photo coming soon
            </div>
          )}
        </div>

        <div className="details-content">
          <header className="details-header">
            <h1>{pub.name}</h1>

            <p className="details-address">{pub.address}</p>

            <p className="details-rating">
              {averageRating !== null
                ? `Rating: ${averageRating.toFixed(1)} / 5`
                : "No ratings yet"}
            </p>

            <a
              className="maps-link"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                pub.address
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

          <section className="details-section">
            <h2>Reviews</h2>

            {reviews.length > 0 ? (
              <div className="reviews-list">
                {reviews.map((review, index) => (
                  <article
                    className="review-card"
                    key={review.review_id || index}
                  >
                    <p className="review-stars">
                      {"★".repeat(Number(review.rating))}
                      {"☆".repeat(5 - Number(review.rating))}
                    </p>

                    <p>{review.comment}</p>

                    {review.review_date && (
                      <p className="review-date">
                        {new Date(review.review_date).toLocaleDateString()}
                      </p>
                    )}
                  </article>
                ))}
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