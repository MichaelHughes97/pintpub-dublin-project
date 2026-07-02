// Import React hooks and Link component
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
// Store pubs from the API
  const [pubs, setPubs] = useState([]);

// Store search text typed by the user
const [searchTerm, setSearchTerm] = useState("");

 // Fetch pubs when the component loads
  useEffect(() => {
    fetch("http://localhost:3000/api/pubs")
      .then((response) => response.json())
      .then((data) => setPubs(data))
      .catch((error) => console.error(error));
  }, []);

    // Filter pubs by name
const filteredPubs = pubs.filter((pub) =>
  pub.name.toLowerCase().includes(searchTerm.toLowerCase())
);
  return (
    <div>
      <h1>PintPoint Dublin </h1>

      <input
  type="text"
  placeholder="Search pubs..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
    />
        {/*Display all pubs*/}
      {filteredPubs.map((pub) => (
        <div key={pub.pub_id} className="pub-card">
          <h2 className="pub-name">{pub.name}</h2>
          <p>{pub.address}</p>
          <p>{pub.description}</p>
        {/* Link to the pub details page*/}
          <Link className="details-button" to={`/pubs/${pub.pub_id}`}>
        View Details
          </Link>

          
        </div>
      ))}
    </div>
  );
}

export default Home;