import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";

function PubCard({
  pub,
  image,
  rating,
  isFavourite = false,
  onFavouriteClick,
  isUpdating = false,
  showFavouriteButton = true,
}) {
  return (
    <article className="pub-card">
      <div className="pub-image-placeholder">
        {image ? (
          <img
            src={image}
            alt={`Exterior of ${pub.name}`}
            className="pub-image"
          />
        ) : (
          "Photo coming soon"
        )}

        {showFavouriteButton && (
          <button
            type="button"
            className={
              isFavourite
                ? "favourite-button favourited"
                : "favourite-button"
            }
            onClick={() => onFavouriteClick(pub.pub_id)}
            disabled={isUpdating}
            aria-label={
              isFavourite
                ? `Remove ${pub.name} from favourites`
                : `Add ${pub.name} to favourites`
            }
            title={
              isFavourite
                ? "Remove from favourites"
                : "Add to favourites"
            }
          >
            {isFavourite ? <FaHeart /> : <FaRegHeart />}
          </button>
        )}
      </div>

      <div className="pub-card-content">
        <h2 className="pub-name">{pub.name}</h2>

        {rating !== undefined && (
          <p className="pub-rating">
            {rating !== null
              ? `Rating: ${rating.toFixed(1)} / 5`
              : "No ratings yet"}
          </p>
        )}

        {pub.address && <p>{pub.address}</p>}

        {pub.description && (
          <p className="pub-description">{pub.description}</p>
        )}

        <Link
          className="details-button"
          to={`/pubs/${pub.pub_id}`}
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

export default PubCard;