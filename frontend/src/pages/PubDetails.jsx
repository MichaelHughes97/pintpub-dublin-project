import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function PubDetails() {
// Get the pub ID from the URL
  const { id } = useParams();

// Store pub details
  const [pub, setPub] = useState(null);
  
// Fetch pub information from the backend
  useEffect(() => {
    fetch(`http://localhost:3000/api/pubs/${id}`)
      .then((response) => response.json())
      .then((data) => setPub(data))
      .catch((error) => console.error(error));
  }, [id]);

  if (!pub) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1>{pub.name}</h1>

      <p>{pub.address}</p>

      <p>{pub.description}</p>

      <Link to="/">← Back to all pubs</Link>
    </div>
  );
}

export default PubDetails;