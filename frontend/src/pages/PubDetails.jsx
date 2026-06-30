import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function PubDetails() {
  // Get the pub ID from the URL
  const { id } = useParams();

  // Store pub details and drinks from the API
  const [pub, setPub] = useState(null);
  const [drinks, setDrinks] = useState([]);

  useEffect(() => {
    // Fetch selected pub details
    fetch(`http://localhost:3000/api/pubs/${id}`)
      .then((response) => response.json())
      .then((data) => setPub(data))
      .catch((error) => console.error(error));

    // Fetch drinks available in this pub
    fetch(`http://localhost:3000/api/pubs/${id}/drinks`)
      .then((response) => response.json())
      .then((data) => setDrinks(data))
      .catch((error) => console.error(error));
  }, [id]);

  if (!pub) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1>{pub.name}</h1>

      <p>{pub.address}</p>
      <p>{pub.description}</p>

      <h2>Drinks</h2>

      <ul>
        {drinks.map((drink, index) => (
          <li key={index}>
            {drink.drink_name} - €{drink.price}
          </li>
        ))}
      </ul>

      <Link to="/">← Back to all pubs</Link>
    </div>
  );
}

export default PubDetails;