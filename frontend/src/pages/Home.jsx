import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import templeBar from "../assets/pubs/temple-bar.jpg";
import brazenHead from "../assets/pubs/brazen-head.jpg";
import longHall from "../assets/pubs/long-hall.jpg";
import odonoghues from "../assets/pubs/odonoghues.jpg";
import stagsHead from "../assets/pubs/stags-head.jpg";

function Home() {
  const [pubs, setPubs] = useState([]);
  const [ratings, setRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const pubImages = {
    1: templeBar,
    2: brazenHead,
    3: longHall,
    4: odonoghues,
    5: stagsHead,
  };

  useEffect(() => {
    fetch("http://localhost:3000/api/pubs")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to retrieve pubs");
        }

        return response.json();
      })
      .then(async (pubData) => {
        setPubs(pubData);

        const ratingEntries = await Promise.all(
          pubData.map(async (pub) => {
            try {
              const response = await fetch(
                `http://localhost:3000/api/pubs/${pub.pub_id}/reviews`
              );

              if (!response.ok) {
                throw new Error(
                  `Unable to retrieve reviews for ${pub.name}`
                );
              }

              const reviews = await response.json();

              if (reviews.length === 0) {
                return [pub.pub_id, null];
              }

              const totalRating = reviews.reduce(
                (total, review) => total + Number(review.rating),
                0
              );

              const averageRating = totalRating / reviews.length;

              return [pub.pub_id, averageRating];
            } catch (error) {
              console.error(error);
              return [pub.pub_id, null];
            }
          })
        );

        setRatings(Object.fromEntries(ratingEntries));
      })
      .catch((error) => {
        console.error("Unable to load pubs:", error);
      });
  }, []);

  const filteredPubs = pubs.filter((pub) => {
    const matchesSearch = pub.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    let matchesFilter = true;

    if (activeFilter === "top-rated") {
      matchesFilter =
        ratings[pub.pub_id] !== null &&
        ratings[pub.pub_id] !== undefined &&
        ratings[pub.pub_id] >= 4;
    }

    if (activeFilter === "food") {
      matchesFilter = Number(pub.food_available) === 1;
    }

    if (activeFilter === "outdoor") {
      matchesFilter = Number(pub.outdoor_seating) === 1;
    }

    if (activeFilter === "live-music") {
      matchesFilter = Number(pub.live_music) === 1;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="home-page">
      <section className="hero-section">
        <h1>PintPoint Dublin</h1>

        <p className="hero-text">
          Discover Dublin&apos;s best pubs, compare facilities, read reviews
          and plan your perfect night out.
        </p>

        <input
          type="text"
          placeholder="Search pubs..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />

        <div className="filter-buttons">
          <button
            type="button"
            className={activeFilter === "all" ? "active-filter" : ""}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>

          <button
            type="button"
            className={activeFilter === "top-rated" ? "active-filter" : ""}
            onClick={() => setActiveFilter("top-rated")}
          >
            Top Rated
          </button>

          <button
            type="button"
            className={activeFilter === "food" ? "active-filter" : ""}
            onClick={() => setActiveFilter("food")}
          >
            Food Available
          </button>

          <button
            type="button"
            className={activeFilter === "outdoor" ? "active-filter" : ""}
            onClick={() => setActiveFilter("outdoor")}
          >
            Outdoor Seating
          </button>

          <button
            type="button"
            className={activeFilter === "live-music" ? "active-filter" : ""}
            onClick={() => setActiveFilter("live-music")}
          >
            Live Music
          </button>
        </div>
      </section>

      <section className="pub-grid">
        {filteredPubs.map((pub) => (
          <article key={pub.pub_id} className="pub-card">
            <div className="pub-image-placeholder">
              {pubImages[pub.pub_id] ? (
                <img
                  src={pubImages[pub.pub_id]}
                  alt={`Exterior of ${pub.name}`}
                  className="pub-image"
                />
              ) : (
                "Photo coming soon"
              )}
            </div>

            <h2 className="pub-name">{pub.name}</h2>

            <p className="pub-rating">
              {ratings[pub.pub_id] !== null &&
              ratings[pub.pub_id] !== undefined
                ? `Rating: ${ratings[pub.pub_id].toFixed(1)} / 5`
                : "No ratings yet"}
            </p>

            <p>{pub.address}</p>
            <p>{pub.description}</p>

            <Link className="details-button" to={`/pubs/${pub.pub_id}`}>
              View Details
            </Link>
          </article>
        ))}
      </section>

      {filteredPubs.length === 0 && (
        <p className="empty-message">
          No pubs matched your search or selected filter.
        </p>
      )}
    </div>
  );
}

export default Home;