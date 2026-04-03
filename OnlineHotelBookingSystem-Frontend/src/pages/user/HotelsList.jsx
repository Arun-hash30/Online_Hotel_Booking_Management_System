import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  StarIcon,
  MapPinIcon,
  WifiIcon,
  HomeModernIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";

const HotelsList = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get("https://online-hotel-booking-system-bf2k.onrender.com/hotels/getAll");
      setHotels(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(
    (hotel) =>
      hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hotel.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) =>
      i < rating ? (
        <StarSolidIcon key={i} className="h-5 w-5 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="h-5 w-5 text-gray-300" />
      )
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find Your Perfect Stay
        </h1>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by hotel name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Hotel Cards — NOT wrapped in <Link>, only the button navigates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHotels.map((hotel) => (
          <div
            key={hotel.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
          >
            {/* Image */}
            <div className="relative h-48">
              {hotel.images && hotel.images.length > 0 ? (
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=Hotel+Image";
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                  <HomeModernIcon className="h-16 w-16 text-white opacity-50" />
                </div>
              )}

              {/* Star Rating Badge */}
              <div className="absolute top-4 right-4 bg-white px-2 py-1 rounded-lg shadow">
                <div className="flex items-center">
                  <StarSolidIcon className="h-4 w-4 text-yellow-400" />
                  <span className="ml-1 text-sm font-semibold">
                    {hotel.starRating}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {hotel.name}
              </h3>

              <p className="text-gray-600 mb-3 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-1 text-gray-400 flex-shrink-0" />
                {hotel.address}
              </p>

              <div className="flex items-center mb-3">
                {renderStars(hotel.starRating)}
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {hotel.description}
              </p>

              {/* Bottom Row: Amenity Icons + View Rooms Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <WifiIcon className="h-5 w-5 text-gray-400" title="Free WiFi" />
                  <HomeModernIcon className="h-5 w-5 text-gray-400" title="Room Service" />
                  <BuildingOffice2Icon className="h-5 w-5 text-gray-400" title="Facilities" />
                </div>

                {/* Only this button navigates to rooms */}
                <Link
                  to={`/rooms/${hotel.id}`}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-semibold"
                >
                  View Rooms
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredHotels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No hotels found matching your search.
          </p>
        </div>
      )}
    </div>
  );
};

export default HotelsList;
