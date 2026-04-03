import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { StarIcon as StarSolidIcon } from '@heroicons/react/solid';
import { StarIcon } from '@heroicons/react/outline';

const HotelCard = ({ hotel }) => {
  const navigate = useNavigate();

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index}>
        {index < rating ? (
          <StarSolidIcon className="h-5 w-5 text-yellow-400 inline" />
        ) : (
          <StarIcon className="h-5 w-5 text-gray-300 inline" />
        )}
      </span>
    ));
  };

  const handleViewMoreDetails = () => {
    navigate(`/hotels/${hotel.id}/rooms`);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        {hotel.images && hotel.images.length > 0 ? (
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/800x600?text=Hotel+Image';
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-white font-semibold">No Image</span>
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-md">
          <div className="flex items-center">
            {renderStars(hotel.starRating)}
          </div>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{hotel.name}</h3>
        <p className="text-gray-600 text-sm mb-3 flex items-center">
          <svg className="h-4 w-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {hotel.address}
        </p>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{hotel.description}</p>
        <button
          onClick={handleViewMoreDetails}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          View Rooms
        </button>
      </div>
    </div>
  );
};

HotelCard.propTypes = {
  hotel: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    description: PropTypes.string,
    starRating: PropTypes.number,
    images: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

export default HotelCard;
