import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function PubDetails() {
  // Get the pub ID from the URL
  const { id } = useParams();

  // Store pub details and drinks from the API
  const [pub, setPub] = useState(null);
  const [drinks, setDrinks] = useState([]);

  //Facilities variable 
  const [facilities, setFacilities] = useState([]);

  //Reviews variable 
  const [reviews, setReviews] = useState([]);

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

     // Fetch facilities available in this pub
    fetch(`http://localhost:3000/api/pubs/${id}/facilities`)
     .then((response) => response.json())
     .then((data) => setFacilities(data))
     .catch((error) => console.error(error)); 

     // Fetch reviews for this pub
fetch(`http://localhost:3000/api/pubs/${id}/reviews`)
  .then((response) => response.json())
  .then((data) => setReviews(data))
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

      <div>
        {drinks.map((drink, index) => (
          <p key={index}>
            {drink.drink_name} - €{drink.price}
          </p>
        ))}
      </div>

      <h2>Facilities</h2>

      <div>
        {facilities.map((facility, index) => (
          <p key={index}>
            ✓ {facility.facility_name}
          </p>
        ))}
      </div>

      <h2>Reviews</h2>

    <div>
     {reviews.map((review, index) => (
    <p key={index}>
      {"★".repeat(review.rating)} {review.comment}
    </p>
  ))}
    </div>

      <Link to="/">← Back to all pubs</Link>
    </div>
  );
}

export default PubDetails;