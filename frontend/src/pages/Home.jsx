import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import templeBar from "../assets/pubs/temple-bar.jpg";
import brazenHead from "../assets/pubs/brazen-head.jpg";
import longHall from "../assets/pubs/long-hall.jpg";
import odonoghues from "../assets/pubs/odonoghues.jpg";
import stagsHead from "../assets/pubs/stags-head.jpg";

function Home() {
  const [pubs, setPubs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/api/pubs")
      .then((response) => response.json())
      .then((data) => setPubs(data))
      .catch((error) => console.error("Unable to load pubs:", error));
  }, []);

  const filteredPubs = pubs.filter((pub) =>
    pub.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pubImages = {
    1: templeBar,
    2: brazenHead,
    3: longHall,
    4: odonoghues,
    5: stagsHead,
  };

  return (
    <div className="home-page">
      <div className="hero-section">
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
      </div>

      <div className="pub-grid">
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
            <p>{pub.address}</p>
            <p>{pub.description}</p>

            <Link className="details-button" to={`/pubs/${pub.pub_id}`}>
              View Details
            </Link>
          </article>
        ))}
      </div>

      {filteredPubs.length === 0 && (
        <p className="empty-message">No pubs matched your search.</p>
      )}
    </div>
  );
}

export default Home;