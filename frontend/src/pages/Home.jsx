// Import React hooks and Link component
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
// Store pubs from the API
  const [pubs, setPubs] = useState([]);
  
 // Fetch pubs when the component loads
  useEffect(() => {
    fetch("http://localhost:3000/api/pubs")
      .then((response) => response.json())
      .then((data) => setPubs(data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h1>PintPoint Dublin 🍺</h1>
        {/*Display all pubs*/}
      {pubs.map((pub) => (
        <div key={pub.pub_id}>
          <h2>{pub.name}</h2>
          <p>{pub.address}</p>
          <p>{pub.description}</p>
        {/* Link to the pub details page*/}
          <Link to={`/pubs/${pub.pub_id}`}>View details</Link>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default Home;