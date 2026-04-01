import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import {
  UserGroupIcon,
  WifiIcon,
  TvIcon,
  HomeIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const RoomListPage = () => {
  const { hotelId } = useParams();
  const [rooms, setRooms] = useState([]);
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoomsAndHotel();
  }, [hotelId]);

  const fetchRoomsAndHotel = async () => {
    try {
      const parsedHotelId = parseInt(hotelId, 10);

      const [roomsResponse, hotelsResponse] = await Promise.all([
        axios.get("http://localhost:8080/rooms/getAll"),
        axios.get("http://localhost:8080/hotels/getAll"),
      ]);

      console.log("All rooms from API:", roomsResponse.data);
      console.log("Filtering for hotelId:", parsedHotelId);

      // Number() handles both string "1" and number 1 from API
      const hotelRooms = roomsResponse.data.filter(
        (room) => Number(room.hotelId) === parsedHotelId
      );

      const hotelData = hotelsResponse.data.find(
        (h) => Number(h.id) === parsedHotelId
      );

      console.log("Filtered rooms:", hotelRooms);

      setRooms(hotelRooms);
      setHotel(hotelData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Failed to fetch room details. Please try again later.");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Hotel not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Back Button */}
      <Link
        to="/hotels"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-1" />
        Back to Hotels
      </Link>

      {/* Hotel Header Banner */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <div className="relative h-72">
          {hotel.images && hotel.images.length > 0 ? (
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/1200x400?text=Hotel";
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600" />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-4xl font-bold mb-2">{hotel.name}</h1>
              <p className="text-lg">{hotel.address}</p>
              <div className="flex justify-center mt-3">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`h-6 w-6 ${
                      i < hotel.starRating ? "text-yellow-400" : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rooms Heading */}
      <h2 className="text-3xl font-bold text-gray-900 mb-6">
        Available Rooms
        <span className="ml-3 text-lg font-normal text-gray-500">
          ({rooms.length} {rooms.length === 1 ? "room" : "rooms"} found)
        </span>
      </h2>

      {rooms.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <p className="text-gray-500 text-lg">
            No rooms available at this hotel.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Room Image */}
              <div className="relative h-48">
                {room.images && room.images.length > 0 ? (
                  <img
                    src={room.images[0]}
                    alt={room.type}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Room+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                    <HomeIcon className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                {/* Room Type Badge */}
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  {room.type}
                </div>
              </div>

              {/* Room Content */}
              <div className="p-6">
                {/* Title + Price */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {room.type} Room
                  </h3>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{room.pricePerNight}
                    </p>
                    <p className="text-sm text-gray-500">per night</p>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <UserGroupIcon className="h-5 w-5 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">2 Guests</span>
                  </div>
                  <div className="flex items-center">
                    <WifiIcon className="h-5 w-5 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">Free WiFi</span>
                  </div>
                  <div className="flex items-center">
                    <TvIcon className="h-5 w-5 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">Smart TV</span>
                  </div>
                </div>

                {/* Availability Badge */}
                <div className="mb-5">
                  <span
                    className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                      room.numberAvailable > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {room.numberAvailable > 0
                      ? `${room.numberAvailable} rooms available`
                      : "Not Available"}
                  </span>
                </div>

                {/* Action Button */}
                {room.numberAvailable > 0 ? (
                  <Link
                    to={`/booking/${room.id}`}
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Book Now
                  </Link>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-200 text-gray-400 text-center px-4 py-2 rounded-lg font-semibold cursor-not-allowed"
                  >
                    Not Available
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomListPage;