import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import templeBar from "../assets/pubs/temple-bar.jpg";
import brazenHead from "../assets/pubs/brazen-head.jpg";
import longHall from "../assets/pubs/long-hall.jpg";
import odonoghues from "../assets/pubs/odonoghues.jpg";
import stagsHead from "../assets/pubs/stags-head.jpg";
import PubCard from "../components/PubCard";

const pubImages = {
  1: templeBar,
  2: brazenHead,
  3: longHall,
  4: odonoghues,
  5: stagsHead,
};

function Favourites() {
  const [favourites, setFavourites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingFavouriteId, setUpdatingFavouriteId] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavourites = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3000/api/favourites",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Could not load favourites");
        }

        const data = await response.json();
        setFavourites(data);
      } catch (error) {
        console.error("Error loading favourites:", error);
        setError("We could not load your favourite pubs.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavourites();
  }, [navigate]);

  const handleRemoveFavourite = async (pubId) => {
    const token = localStorage.getItem("token");
    const numericPubId = Number(pubId);

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setUpdatingFavouriteId(numericPubId);

      const response = await fetch(
        `http://localhost:3000/api/favourites/${numericPubId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Could not remove this favourite."
        );
      }

      setFavourites((currentFavourites) =>
        currentFavourites.filter(
          (favourite) => Number(favourite.pub_id) !== numericPubId
        )
      );
    } catch (error) {
      console.error("Error removing favourite:", error);
      setError("We could not remove this favourite pub.");
    } finally {
      setUpdatingFavouriteId(null);
    }
  };

  if (isLoading) {
    return (
      <main className="favourites-page">
        <p>Loading your favourites...</p>
      </main>
    );
  }

  return (
    <main className="favourites-page">
      <section className="favourites-header">
        <h1>My Favourite Pubs</h1>
        <p>Your saved pubs, all in one place.</p>
      </section>

      {error && <p className="favourites-error">{error}</p>}

      {!error && favourites.length === 0 && (
        <section className="empty-favourites">
          <h2>No favourites yet</h2>

          <p>You have not added any favourite pubs yet.</p>

          <Link to="/" className="browse-pubs-button">
            Browse pubs
          </Link>
        </section>
      )}

      {favourites.length > 0 && (
        <section className="pub-grid">
          {favourites.map((pub) => (
            <PubCard
              key={pub.pub_id}
              pub={pub}
              image={pubImages[pub.pub_id]}
              isFavourite={true}
              isUpdating={
                updatingFavouriteId === Number(pub.pub_id)
              }
              onFavouriteClick={handleRemoveFavourite}
            />
          ))}
        </section>
      )}
    </main>
  );
}

export default Favourites;